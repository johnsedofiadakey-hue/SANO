import { useEffect, useState, useCallback } from 'react';
import {
  collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export interface HealthPoint { value: number; date: Date }

export interface HealthTrend {
  heartRate: HealthPoint[];
  sleep: HealthPoint[];
  steps: HealthPoint[];
  latestHR: number | null;
  latestSleep: number | null;
  latestSteps: number | null;
}

const EMPTY: HealthTrend = {
  heartRate: [], sleep: [], steps: [],
  latestHR: null, latestSleep: null, latestSteps: null,
};

export function useHealthData() {
  const { user } = useAuthStore();
  const [data, setData] = useState<HealthTrend>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !db) return;
    setLoading(true);
    setError(null);

    try {
      const since = new Date(Date.now() - 14 * 24 * 3600000);
      const q = query(
        collection(db, 'health_events'),
        where('userId', '==', user.uid),
        where('type', 'in', ['heart_rate', 'sleep', 'steps']),
        orderBy('createdAt', 'desc'),
        limit(60),
      );
      const snap = await getDocs(q);

      const heartRate: HealthPoint[] = [];
      const sleep: HealthPoint[] = [];
      const steps: HealthPoint[] = [];

      for (const d of snap.docs) {
        const ev = d.data();
        const date: Date = ev.createdAt?.toDate?.() ?? new Date();
        if (date < since) continue;

        if (ev.type === 'heart_rate' && ev.value?.bpm) {
          heartRate.push({ value: Number(ev.value.bpm), date });
        } else if (ev.type === 'sleep' && ev.value?.hours) {
          sleep.push({ value: Number(ev.value.hours), date });
        } else if (ev.type === 'steps' && ev.value?.count) {
          steps.push({ value: Number(ev.value.count), date });
        }
      }

      // Reverse so oldest → newest for chart rendering
      heartRate.reverse();
      sleep.reverse();
      steps.reverse();

      setData({
        heartRate,
        sleep,
        steps,
        latestHR: heartRate.length ? heartRate[heartRate.length - 1].value : null,
        latestSleep: sleep.length ? sleep[sleep.length - 1].value : null,
        latestSteps: steps.length ? steps[steps.length - 1].value : null,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
