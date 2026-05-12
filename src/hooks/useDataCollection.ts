import { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import { track } from '../services/analytics';
import { firestoreService } from '../services/firestore';
import { logger } from '../utils/logger';
import { useAuthStore } from '../store/authStore';
import { useScanStore } from '../store/scanStore';
import { useCycleStore } from '../store/cycleStore';
import { DEMO_MODE } from '../config/firebase';
import type { ScanResult } from '../types/scan';

// ── Constants ─────────────────────────────────────────────────────────────────

const QUEUE_KEY      = 'sano_event_queue';
const ANON_ID_KEY    = 'sano_anon_id';
const LAST_SCAN_KEY  = 'sano_last_scan_at';
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface QueuedEvent {
  type: EventName | 'scan_data';
  payload: Record<string, unknown>;
  queued_at: string;
  uid: string | null;
}

// ── Ghana seasonal calendar ───────────────────────────────────────────────────
// Nov–Feb → harmattan | Mar–Jun → rainy (first) | Jul–Aug → dry | Sep–Oct → rainy (second)
export function getGhanaSeason(): 'harmattan' | 'rainy' | 'dry' {
  const month = new Date().getMonth() + 1;
  if (month >= 11 || month <= 2) return 'harmattan';
  if (month <= 6) return 'rainy';
  if (month <= 8) return 'dry';
  return 'rainy';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sha256(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

async function getOrCreateAnonId(uid?: string | null): Promise<string> {
  if (uid) return sha256(`sano_user_${uid}`);
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
    return Math.floor((Date.now() - parseInt(raw, 10)) / 86_400_000);
  } catch {
    return 0;
  }
}

function getCameraMp(): number {
  const model = (Device.modelName ?? '').toLowerCase();
  if (model.includes('iphone')) return 12;
  if (model.includes('samsung') || model.includes('s23') || model.includes('s24')) return 50;
  return 13;
}

// ── Offline queue ─────────────────────────────────────────────────────────────

async function enqueue(event: QueuedEvent): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedEvent[] = raw ? JSON.parse(raw) : [];
    queue.push(event);
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
    const queue: QueuedEvent[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const remaining: QueuedEvent[] = [];
    for (const event of queue) {
      try {
        await firestoreService.logAnalyticsEvent(event.uid, {
          type: event.type,
          data: event.payload,
        });
      } catch {
        remaining.push(event);
      }
    }
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) {
    logger.error('Queue flush failed', e);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDataCollection() {
  const uid = useAuthStore(s => s.user?.uid ?? null);
  const scanStore = useScanStore.getState();
  const cycleStore = useCycleStore.getState();

  // Flush queue to Firestore whenever app foregrounds
  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'active' && !DEMO_MODE) flushQueue().catch(() => {});
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  const logScan = useCallback(async (imageUri: string, result: ScanResult): Promise<void> => {
    try {
      const [anonId, imageHash] = await Promise.all([
        getOrCreateAnonId(uid),
        sha256(imageUri),
      ]);

      const daysSinceLast = await getDaysSinceLastScan();
      const productsInUse = scanStore.scans.length > 0
        ? (scanStore.scans[0].products_in_use as string[])
        : [];

      const minConfidence = result.conditions.length > 0
        ? Math.min(...result.conditions.map(c => c.confidence))
        : 1;

      const payload: Record<string, unknown> = {
        scan_id: result.scan_id,
        user_id: anonId,
        image_hash: imageHash,
        skin_tone: result.skin_tone,
        conditions_detected: result.conditions,
        products_in_use: productsInUse,
        days_since_last_scan: daysSinceLast,
        cycle_day: cycleStore.currentCycleDay ?? null,
        region: 'unknown',
        season: getGhanaSeason(),
        phone_model: Device.modelName ?? 'unknown',
        camera_mp: getCameraMp(),
        model_version: result.model_version,
        queued_for_label: minConfidence < 0.75,
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(LAST_SCAN_KEY, Date.now().toString());

      const event: QueuedEvent = {
        type: 'scan_data',
        payload,
        queued_at: new Date().toISOString(),
        uid,
      };

      await enqueue(event);

      // Fire PostHog — silently skips if no key configured
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
  }, [uid, scanStore, cycleStore]);

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
        uid,
      };

      await enqueue(event);
      flushQueue().catch(() => {});
    } catch (e) {
      logger.error('logEvent failed', e);
    }
  }, [uid]);

  return { logScan, logEvent, flushQueue, EVENTS, getGhanaSeason };
}
