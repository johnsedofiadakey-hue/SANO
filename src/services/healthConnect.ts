import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { firestoreService } from './firestore';

export interface HealthSample {
  value: number;
  unit: string;
  recordedAt: Date;
  source: 'healthkit' | 'health_connect' | 'manual' | 'sano';
}

export interface HealthData {
  heartRate: HealthSample | null;
  sleepHours: HealthSample | null;
  steps: HealthSample | null;
  hydration: HealthSample | null;
}

// ── Conditional native module import ─────────────────────────────────────────
// expo-health / react-native-health-connect may not be installed.
// We try a dynamic require and fall through gracefully if absent.

let NativeHealth: any = null;

try {
  if (Platform.OS === 'ios') {
    NativeHealth = require('react-native-health').default;
  } else if (Platform.OS === 'android') {
    NativeHealth = require('react-native-health-connect').default;
  }
} catch {
  // Native health module not installed — will use Firestore + manual entry
}

const PERMISSIONS_IOS = NativeHealth
  ? [
      NativeHealth.Constants?.Permissions?.HeartRate,
      NativeHealth.Constants?.Permissions?.SleepAnalysis,
      NativeHealth.Constants?.Permissions?.StepCount,
      NativeHealth.Constants?.Permissions?.Water,
    ].filter(Boolean)
  : [];

// ── Service ───────────────────────────────────────────────────────────────────

export const healthConnectService = {

  isAvailable(): boolean {
    return NativeHealth !== null;
  },

  async requestPermissions(): Promise<boolean> {
    if (!NativeHealth) return false;

    try {
      if (Platform.OS === 'ios') {
        const result = await new Promise<boolean>((resolve) => {
          NativeHealth.initHealthKit({ permissions: { read: PERMISSIONS_IOS } }, (err: any) => {
            resolve(!err);
          });
        });
        return result;
      } else {
        const granted = await NativeHealth.requestPermission([
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'Steps' },
        ]);
        return granted.every((g: any) => g.granted);
      }
    } catch {
      return false;
    }
  },

  async getHeartRate(): Promise<HealthSample | null> {
    if (!NativeHealth) return null;

    try {
      const end = new Date();
      const start = new Date(end.getTime() - 7 * 24 * 3600000);

      if (Platform.OS === 'ios') {
        const samples = await new Promise<any[]>((resolve, reject) => {
          NativeHealth.getHeartRateSamples(
            { startDate: start.toISOString(), endDate: end.toISOString(), limit: 1 },
            (err: any, results: any[]) => err ? reject(err) : resolve(results),
          );
        });
        if (!samples.length) return null;
        const s = samples[samples.length - 1];
        return { value: s.value, unit: 'bpm', recordedAt: new Date(s.startDate), source: 'healthkit' };
      } else {
        const records = await NativeHealth.readRecords('HeartRate', {
          timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
        });
        if (!records.length) return null;
        const r = records[records.length - 1];
        return { value: r.measurements[0]?.beatsPerMinute, unit: 'bpm', recordedAt: new Date(r.time), source: 'health_connect' };
      }
    } catch {
      return null;
    }
  },

  async getSleepHours(): Promise<HealthSample | null> {
    if (!NativeHealth) {
      const stored = await SecureStore.getItemAsync('smart_sleep_hours');
      if (!stored) return null;
      return { value: parseFloat(stored), unit: 'hours', recordedAt: new Date(), source: 'manual' };
    }

    try {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 3600000);

      if (Platform.OS === 'ios') {
        const samples = await new Promise<any[]>((resolve, reject) => {
          NativeHealth.getSleepSamples(
            { startDate: start.toISOString(), endDate: end.toISOString() },
            (err: any, results: any[]) => err ? reject(err) : resolve(results),
          );
        });
        const totalMs = samples
          .filter((s: any) => s.value === 'ASLEEP')
          .reduce((acc: number, s: any) => acc + (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()), 0);
        const hrs = totalMs / 3600000;
        if (hrs < 0.5) return null;
        return { value: Math.round(hrs * 10) / 10, unit: 'hours', recordedAt: new Date(), source: 'healthkit' };
      } else {
        const records = await NativeHealth.readRecords('SleepSession', {
          timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
        });
        if (!records.length) return null;
        const r = records[0];
        const hrs = (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 3600000;
        return { value: Math.round(hrs * 10) / 10, unit: 'hours', recordedAt: new Date(r.startTime), source: 'health_connect' };
      }
    } catch {
      return null;
    }
  },

  async getSteps(): Promise<HealthSample | null> {
    if (!NativeHealth) return null;

    try {
      const end = new Date();
      const start = new Date(end);
      start.setHours(0, 0, 0, 0);

      if (Platform.OS === 'ios') {
        const result = await new Promise<number>((resolve, reject) => {
          NativeHealth.getStepCount(
            { date: start.toISOString() },
            (err: any, res: any) => err ? reject(err) : resolve(res.value ?? 0),
          );
        });
        return { value: result, unit: 'steps', recordedAt: new Date(), source: 'healthkit' };
      } else {
        const records = await NativeHealth.readRecords('Steps', {
          timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
        });
        const total = records.reduce((acc: number, r: any) => acc + r.count, 0);
        return { value: total, unit: 'steps', recordedAt: new Date(), source: 'health_connect' };
      }
    } catch {
      return null;
    }
  },

  async syncAll(uid: string): Promise<HealthData> {
    const [heartRate, sleepHours, steps] = await Promise.allSettled([
      this.getHeartRate(),
      this.getSleepHours(),
      this.getSteps(),
    ]);

    const hr = heartRate.status === 'fulfilled' ? heartRate.value : null;
    const sl = sleepHours.status === 'fulfilled' ? sleepHours.value : null;
    const st = steps.status === 'fulfilled' ? steps.value : null;

    // Persist non-null readings to Firestore
    if (hr) {
      await firestoreService.saveHealthEvent(uid, {
        type: 'heart_rate',
        value: { bpm: hr.value },
        device: hr.source,
        confidence: 0.95,
      });
    }
    if (sl) {
      await firestoreService.saveHealthEvent(uid, {
        type: 'sleep',
        value: { hours: sl.value },
        device: sl.source,
        confidence: 0.9,
      });
    }
    if (st) {
      await firestoreService.saveHealthEvent(uid, {
        type: 'steps',
        value: { count: st.value },
        device: st.source,
        confidence: 1.0,
      });
    }

    return { heartRate: hr, sleepHours: sl, steps: st, hydration: null };
  },
};
