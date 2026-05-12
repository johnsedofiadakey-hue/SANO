import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CycleLog, CyclePhase, Symptom } from '../types/health';

const STORAGE_KEY = 'sano_cycle';

function getCurrentPhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5)  return 'period';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

interface CycleState {
  logs: CycleLog[];
  currentCycleDay: number | null;
  currentPhase: CyclePhase | null;
  nextPeriodDate: string | null;
  symptoms: Symptom[];
  logPeriodStart: (date: string) => Promise<void>;
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
    const logs = [log, ...get().logs];
    set({
      logs,
      currentCycleDay: 1,
      currentPhase: 'period',
    });
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
      const { logs, currentCycleDay, currentPhase } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ logs, currentCycleDay, currentPhase }));
    } catch {}
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CycleState>;
        const cycleDay = saved.currentCycleDay ?? null;
        set({
          logs: saved.logs ?? [],
          currentCycleDay: cycleDay,
          currentPhase: cycleDay ? getCurrentPhase(cycleDay) : null,
        });
      }
    } catch {}
  },
}));
