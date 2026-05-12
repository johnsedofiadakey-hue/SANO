import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { CycleLog, CyclePhase, Symptom } from '../types/health';

const STORAGE_KEY = 'sano_cycle';

export function getPhaseForDay(day: number): CyclePhase {
  if (day <= 5)  return 'period';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

export function getSkinForecastForPhase(phase: CyclePhase, cycleDay: number) {
  const base = [
    { offset: 0, level: 0, label: 'Good' },
    { offset: 1, level: 0, label: 'Good' },
    { offset: 2, level: 0, label: 'Good' },
    { offset: 3, level: 0, label: 'Good' },
    { offset: 4, level: 0, label: 'Good' },
    { offset: 5, level: 0, label: 'Good' },
    { offset: 6, level: 0, label: 'Good' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  if (phase === 'luteal' || cycleDay >= 20) {
    return base.map((b, i) => ({
      day: days[(today.getDay() + i) % 7],
      level: [0.55, 0.65, 0.78, 0.8, 0.72, 0.6, 0.4][i],
      label: ['Oily', 'Oily', 'Risk', 'Risk', 'Risk', 'Easing', 'Better'][i],
    }));
  }
  if (phase === 'period') {
    return base.map((b, i) => ({
      day: days[(today.getDay() + i) % 7],
      level: [0.45, 0.35, 0.25, 0.2, 0.2, 0.15, 0.15][i],
      label: ['Sensitive', 'Easing', 'Better', 'Clear', 'Clear', 'Clear', 'Clear'][i],
    }));
  }
  if (phase === 'follicular') {
    return base.map((b, i) => ({
      day: days[(today.getDay() + i) % 7],
      level: [0.1, 0.1, 0.12, 0.15, 0.18, 0.2, 0.22][i],
      label: ['Clear', 'Clear', 'Clear', 'Clear', 'Clear', 'Good', 'Good'][i],
    }));
  }
  // Ovulation
  return base.map((b, i) => ({
    day: days[(today.getDay() + i) % 7],
    level: [0.15, 0.18, 0.25, 0.3, 0.4, 0.5, 0.6][i],
    label: ['Clear', 'Clear', 'Good', 'Good', 'Watch', 'Watch', 'Oily'][i],
  }));
}

interface CycleState {
  logs: CycleLog[];
  currentCycleDay: number | null;
  currentPhase: CyclePhase | null;
  nextPeriodDate: string | null;
  symptoms: Symptom[];
  periodDays: string[];                   // ISO date strings marked as period
  periodStartDate: string | null;         // Most recent period start ISO date

  logPeriodStart: (date: string) => Promise<void>;
  togglePeriodDay: (dateStr: string) => Promise<void>;
  logSymptom: (symptom: Symptom) => void;
  removeSymptom: (symptom: Symptom) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  logs: [],
  currentCycleDay: null,
  currentPhase: null,
  nextPeriodDate: null,
  symptoms: [],
  periodDays: [],
  periodStartDate: null,

  logPeriodStart: async (date) => {
    const log: CycleLog = {
      id: `cycle_${Date.now()}`,
      user_id: 'local',
      period_start: date,
      symptoms: [],
      cycle_day: 1,
      phase: 'period',
      created_at: new Date().toISOString(),
    };

    const startDate = new Date(date);
    const today = new Date();
    const diffMs = today.getTime() - startDate.getTime();
    const cycleDay = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

    const predictedNext = new Date(startDate);
    predictedNext.setDate(predictedNext.getDate() + 28);

    const logs = [log, ...get().logs];
    set({
      logs,
      currentCycleDay: cycleDay,
      currentPhase: getPhaseForDay(cycleDay),
      periodStartDate: date,
      nextPeriodDate: predictedNext.toISOString(),
    });
    await get().persist();
  },

  togglePeriodDay: async (dateStr) => {
    const current = get().periodDays;
    const exists = current.includes(dateStr);
    const updated = exists
      ? current.filter(d => d !== dateStr)
      : [...current, dateStr].sort();

    // Auto-detect period start from consecutive days
    const sorted = [...updated].sort();
    let startDate: string | null = get().periodStartDate;

    if (!exists && sorted.length > 0) {
      // Find earliest date in the marked group
      startDate = sorted[0];
      const startD = new Date(startDate);
      const today = new Date();
      const diffMs = today.getTime() - startD.getTime();
      const cycleDay = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

      const predictedNext = new Date(startD);
      predictedNext.setDate(predictedNext.getDate() + 28);

      set({
        periodDays: updated,
        periodStartDate: startDate,
        currentCycleDay: cycleDay,
        currentPhase: getPhaseForDay(cycleDay),
        nextPeriodDate: predictedNext.toISOString(),
      });
    } else {
      set({ periodDays: updated });
    }

    await get().persist();
  },

  logSymptom: (symptom) => {
    const current = get().symptoms;
    if (!current.includes(symptom)) {
      set({ symptoms: [...current, symptom] });
    }
  },

  removeSymptom: (symptom) => {
    set({ symptoms: get().symptoms.filter(s => s !== symptom) });
  },

  persist: async () => {
    try {
      const { logs, currentCycleDay, currentPhase, periodDays, periodStartDate, nextPeriodDate } = get();
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
        logs, currentCycleDay, currentPhase, periodDays, periodStartDate, nextPeriodDate,
      }));
    } catch (e) {
      console.error('Failed to persist cycle data:', e);
    }
  },

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CycleState>;
        const cycleDay = saved.currentCycleDay ?? null;
        set({
          logs: saved.logs ?? [],
          currentCycleDay: cycleDay,
          currentPhase: cycleDay ? getPhaseForDay(cycleDay) : null,
          periodDays: saved.periodDays ?? [],
          periodStartDate: saved.periodStartDate ?? null,
          nextPeriodDate: saved.nextPeriodDate ?? null,
        });
      }
    } catch (e) {
      console.error('Failed to hydrate cycle data:', e);
    }
  },
}));
