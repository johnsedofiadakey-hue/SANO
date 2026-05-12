import { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import { api } from '../services/api';
import { track } from '../services/analytics';
import { logger } from '../utils/logger';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useScanStore } from '../store/scanStore';
import { useCycleStore } from '../store/cycleStore';
import type { ScanResult } from '../types/scan';

// ─── Constants ───────────────────────────────────────────────────────────────

const QUEUE_KEY = 'sano_event_queue';
const ANON_ID_KEY = 'sano_anon_id';
const LAST_SCAN_KEY = 'sano_last_scan_at';
const MAX_QUEUE_SIZE = 100;

export const EVENTS = {
  SCAN_COMPLETED:          'scan_completed',
  RESULT_VIEWED:           'result_viewed',
  RESULT_SHARED:           'result_shared',
  PRODUCT_CHECKED:         'product_checked',
  ROUTINE_CHECKED:         'routine_checked',
  CYCLE_LOGGED:            'cycle_day_logged',
  SYMPTOM_LOGGED:          'symptom_logged',
  FEATURE_OPENED:          'feature_opened',
  ONBOARDING_STEP:         'onboarding_step_completed',
  APP_OPENED:              'app_session_started',
  CHAT_MESSAGE_SENT:       'chat_message_sent',
  FOUNDATION_SCAN_STARTED: 'foundation_scan_started',
  FOUNDATION_MATCHES_SHOWN:'foundation_matches_shown',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

// ─── Types ───────────────────────────────────────────────────────────────────

interface QueuedEvent {
  type: EventName | 'scan_data';
  payload: Record<string, unknown>;
  queued_at: string;
}

interface ScanDataPayload {
  scan_id: string;
  user_id: string;
  image_hash: string;
  skin_tone: number;
  conditions_detected: unknown[];
  products_in_use: string[];
  days_since_last_scan: number;
  cycle_day: number | null;
  region: string;
  season: 'harmattan' | 'rainy' | 'dry';
  phone_model: string;
  camera_mp: number;
  model_version: string;
  queued_for_label: boolean;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sha256(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

async function uuid(): Promise<string> {
  return Crypto.randomUUID();
}

/**
 * Ghana seasonal calendar:
 * Nov–Feb  → harmattan (dry harmattan winds from Sahara)
 * Mar–Jun  → rainy (first rainy season)
 * Jul–Aug  → dry (little dry season)
 * Sep–Oct  → rainy (second rainy season)
 */
function getGhanaSeason(): 'harmattan' | 'rainy' | 'dry' {
  const month = new Date().getMonth() + 1; // 1–12
  if (month >= 11 || month <= 2) return 'harmattan'; // Nov–Feb
  if (month <= 6) return 'rainy';                    // Mar–Jun
  if (month <= 8) return 'dry';                      // Jul–Aug
  return 'rainy';                                    // Sep–Oct
}

async function getOrCreateAnonId(realUserId?: string | null): Promise<string> {
  // If we have a real user ID, hash it (anonymise it)
  if (realUserId) return sha256(`sano_user_${realUserId}`);

  // Otherwise use a persisted anonymous ID
  let id = await AsyncStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = await sha256(`anon_${Date.now()}_${Math.random()}`);
    await AsyncStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

async function getDaysSinceLastScan(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SCAN_KEY);
    if (!raw) return 0;
    const lastMs = parseInt(raw, 10);
    const diffMs = Date.now() - lastMs;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

async function recordScanTimestamp(): Promise<void> {
  await AsyncStorage.setItem(LAST_SCAN_KEY, Date.now().toString());
}

function getCameraMp(): number {
  // Expo doesn't expose camera megapixels — return a sensible default
  // based on common Android/iOS flagships in Ghana (Tecno, Samsung, iPhone)
  const model = (Device.modelName ?? '').toLowerCase();
  if (model.includes('iphone')) return 12;
  if (model.includes('samsung') || model.includes('s2') || model.includes('s23')) return 50;
  return 13; // Common Tecno/Infinix default
}

// ─── Queue management ─────────────────────────────────────────────────────────

async function enqueue(event: QueuedEvent): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedEvent[] = raw ? (JSON.parse(raw) as QueuedEvent[]) : [];

    queue.push(event);

    // Drop oldest events if queue exceeds max size
    const trimmed = queue.length > MAX_QUEUE_SIZE
      ? queue.slice(queue.length - MAX_QUEUE_SIZE)
      : queue;

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    logger.error('Queue write failed', e);
  }
}

async function flushQueue(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue: QueuedEvent[] = JSON.parse(raw) as QueuedEvent[];
    if (queue.length === 0) return;

    const remaining: QueuedEvent[] = [];
    for (const event of queue) {
      try {
        await api.post('/analytics/events', event);
      } catch {
        remaining.push(event);
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) {
    logger.error('Queue flush failed', e);
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDataCollection() {
  // Read store state at hook call time (closures capture latest values)
  const userId = useAuthStore(s => s.user?.id ?? null);
  const profileStore = useProfileStore.getState();
  const scanStore = useScanStore.getState();
  const cycleStore = useCycleStore.getState();

  // Flush queue whenever app returns to foreground
  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'active') flushQueue().catch(() => {});
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  /**
   * Log a completed scan — builds the full data payload, enqueues it,
   * fires PostHog, and records the scan timestamp for streak tracking.
   */
  const logScan = useCallback(async (imageUri: string, result: ScanResult): Promise<void> => {
    try {
      const [scan_id, user_id, image_hash] = await Promise.all([
        uuid(),
        getOrCreateAnonId(userId),
        sha256(imageUri),
      ]);

      const daysSinceLast = await getDaysSinceLastScan();

      // Derive current products from scan store
      const productsInUse = scanStore.scans.length > 0
        ? (scanStore.scans[0].products_in_use as string[])
        : [];

      // Min confidence across all detected conditions
      const minConfidence = result.conditions.length > 0
        ? Math.min(...result.conditions.map(c => c.confidence))
        : 1;

      const payload: ScanDataPayload = {
        scan_id,
        user_id,
        image_hash,
        skin_tone: result.skin_tone,
        conditions_detected: result.conditions,
        products_in_use: productsInUse,
        days_since_last_scan: daysSinceLast,
        cycle_day: cycleStore.currentCycleDay ?? null,
        region: profileStore.name ? 'Greater Accra' : 'unknown', // TODO: add region to profileStore
        season: getGhanaSeason(),
        phone_model: Device.modelName ?? 'unknown',
        camera_mp: getCameraMp(),
        model_version: result.model_version,
        queued_for_label: minConfidence < 0.75,
        created_at: new Date().toISOString(),
      };

      const event: QueuedEvent = {
        type: 'scan_data',
        payload: payload as unknown as Record<string, unknown>,
        queued_at: new Date().toISOString(),
      };

      await Promise.all([
        enqueue(event),
        recordScanTimestamp(),
      ]);

      // Fire PostHog — silently skips if no key
      track(EVENTS.SCAN_COMPLETED, {
        skin_tone: result.skin_tone,
        condition_count: result.conditions.length,
        model_version: result.model_version,
        queued_for_label: minConfidence < 0.75,
      });

      flushQueue().catch(() => {});
    } catch (e) {
      logger.error('logScan failed', e);
    }
  }, [userId, scanStore, cycleStore, profileStore]);

  /**
   * Log any named event. Fires PostHog and enqueues to backend.
   */
  const logEvent = useCallback(async (
    eventName: EventName,
    properties?: Record<string, string | number | boolean | null>,
  ): Promise<void> => {
    try {
      track(eventName, properties);

      const event: QueuedEvent = {
        type: eventName,
        payload: properties ?? {},
        queued_at: new Date().toISOString(),
      };

      await enqueue(event);
      flushQueue().catch(() => {});
    } catch (e) {
      logger.error('logEvent failed', e);
    }
  }, []);

  return { logScan, logEvent, flushQueue, EVENTS, getGhanaSeason };
}
