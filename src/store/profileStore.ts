import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Fitzpatrick, SkinConcern, SkinGoal } from '../types/user';

const STORAGE_KEY = 'sano_profile';

interface ProfileState {
  fitzpatrick: Fitzpatrick | null;
  skinConcerns: SkinConcern[];
  skinGoal: SkinGoal | null;
  name: string;
  glowScore: number;
  streakDays: number;
  setFitzpatrick: (tone: Fitzpatrick) => void;
  setSkinConcerns: (concerns: SkinConcern[]) => void;
  toggleSkinConcern: (concern: SkinConcern) => void;
  setSkinGoal: (goal: SkinGoal) => void;
  setName: (name: string) => void;
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

  persist: async () => {
    const { fitzpatrick, skinConcerns, skinGoal, name } = get();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ fitzpatrick, skinConcerns, skinGoal, name }));
    } catch {}
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ProfileState>;
        set({
          fitzpatrick: saved.fitzpatrick ?? null,
          skinConcerns: saved.skinConcerns ?? [],
          skinGoal: saved.skinGoal ?? null,
          name: saved.name ?? '',
        });
      }
    } catch {}
  },
}));
