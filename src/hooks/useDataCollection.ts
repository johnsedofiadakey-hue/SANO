import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import { track, EVENTS } from '../services/analytics';

const QUEUE_KEY = 'sano_event_queue';
const MAX_QUEUE = 100;

const getGhanaSeason = (): string => {
  const m = new Date().getMonth() + 1;
  if (m >= 11 || m <= 2) return 'harmattan';
  if (m >= 3 && m <= 6) return 'rainy_first';
  if (m >= 7 && m <= 8) return 'dry';
  return 'rainy_second';
};

const hashValue = (value: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);

const buildScanEvent = async (userId: string, scanResult: any, userProfile: any) => ({
  scan_id:             await Crypto.randomUUID(),
  user_id:             await hashValue(userId),      // never store raw user ID
  skin_tone:           scanResult.skinTone ?? null,
  conditions_detected: scanResult.conditions ?? [],
  products_in_use:     userProfile?.routine?.morning?.map((s: any) => s.name) ?? [],
  cycle_day:           userProfile?.cycleDay ?? null,
  region:              userProfile?.region ?? 'Unknown',
  season:              getGhanaSeason(),
  phone_model:         Device.modelName ?? 'Unknown',
  model_version:       scanResult.modelVersion ?? 'v0.1-mock',
  queued_for_label:    (scanResult.confidence ?? 0) < 0.75,
  demo_mode:           process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
  created_at:          new Date().toISOString(),
});

const queueEvent = async (event: object) => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: object[] = raw ? JSON.parse(raw) : [];
    queue.push(event);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch { /* silent fail — queue is best effort */ }
};

const flushQueue = async () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  if (!API_URL) return;
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!queue.length) return;
    const ok = await fetch(`${API_URL}/analytics/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
    }).then(r => r.ok).catch(() => false);
    if (ok) await AsyncStorage.removeItem(QUEUE_KEY);
  } catch { /* retry on next flush */ }
};

export const useDataCollection = () => {

  // Flush on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') flushQueue();
    });
    return () => sub.remove();
  }, []);

  const logScanCompleted = useCallback(async (
    userId: string,
    scanResult: any,
    userProfile?: any
  ) => {
    const event = await buildScanEvent(userId, scanResult, userProfile);
    await queueEvent(event);
    track(EVENTS.SCAN_COMPLETED, {
      condition:  scanResult.conditions?.[0]?.name,
      confidence: scanResult.confidence,
      skin_tone:  scanResult.skinTone,
      region:     userProfile?.region,
    });
    flushQueue(); // fire-and-forget
  }, []);

  const logEvent = useCallback((eventName: string, properties?: any) => {
    track(eventName, properties);
    queueEvent({ type: eventName, properties, created_at: new Date().toISOString() });
  }, []);

  return { logScanCompleted, logEvent, flushQueue };
};
