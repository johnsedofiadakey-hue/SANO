import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Fitzpatrick, SkinConcern, SkinGoal } from '../types/user';

const STORAGE_KEY = 'sano_profile';

interface ProfileState {
  fitzpatrick: Fitzpatrick | null;
  skinConcerns: SkinConcern[];
  skinGoal: SkinGoal | null;
  name: string;
  glowScore: number;
  streakDays: number;
  cycleTracking: boolean;
  undertone: 'warm' | 'cool' | 'neutral' | null;
  setFitzpatrick: (tone: Fitzpatrick) => void;
  setSkinConcerns: (concerns: SkinConcern[]) => void;
  toggleSkinConcern: (concern: SkinConcern) => void;
  setSkinGoal: (goal: SkinGoal) => void;
  setName: (name: string) => void;
  setCycleTracking: (val: boolean) => void;
  setUndertone: (val: 'warm' | 'cool' | 'neutral') => void;
  persist: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  fitzpatrick: null,
  skinConcerns: [],
  skinGoal: null,
  name: '',
  glowScore: 74,
  streakDays: 7,
  cycleTracking: false,
  undertone: null,

  setFitzpatrick: (tone) => set({ fitzpatrick: tone }),
  setSkinConcerns: (concerns) => set({ skinConcerns: concerns }),

  toggleSkinConcern: (concern) => {
    const current = get().skinConcerns;
    const exists = current.includes(concern);
    set({
      skinConcerns: exists
        ? current.filter(c => c !== concern)
        : [...current, concern],
    });
  },

  setSkinGoal: (goal) => set({ skinGoal: goal }),
  setName: (name) => set({ name }),
  setCycleTracking: (val) => set({ cycleTracking: val }),
  setUndertone: (val) => set({ undertone: val }),

  persist: async () => {
    const { fitzpatrick, skinConcerns, skinGoal, name, cycleTracking, undertone } = get();
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
        fitzpatrick, skinConcerns, skinGoal, name, cycleTracking, undertone,
      }));
    } catch (e) {
      console.error('Failed to persist profile:', e);
    }
  },

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ProfileState>;
        set({
          fitzpatrick: saved.fitzpatrick ?? null,
          skinConcerns: saved.skinConcerns ?? [],
          skinGoal: saved.skinGoal ?? null,
          name: saved.name ?? '',
          cycleTracking: saved.cycleTracking ?? false,
          undertone: saved.undertone ?? null,
        });
      }
    } catch (e) {
      console.error('Failed to hydrate profile:', e);
    }
  },
}));
