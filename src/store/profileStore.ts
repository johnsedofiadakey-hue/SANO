import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Fitzpatrick, SkinConcern, SkinGoal, Gender } from '../types/user';
import { firestoreService } from '../services/firestore';
import { auth } from '../config/firebase';

const STORAGE_KEY = 'sano_profile';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

interface ProfileState {
  fitzpatrick: Fitzpatrick | null;
  skinConcerns: SkinConcern[];
  skinGoal: SkinGoal | null;
  name: string;
  gender: Gender | null;
  glowScore: number;
  streakDays: number;
  cycleTracking: boolean;
  undertone: 'warm' | 'cool' | 'neutral' | null;
  subscription: SubscriptionTier;
  setFitzpatrick: (tone: Fitzpatrick) => void;
  setSkinConcerns: (concerns: SkinConcern[]) => void;
  toggleSkinConcern: (concern: SkinConcern) => void;
  setSkinGoal: (goal: SkinGoal) => void;
  setName: (name: string) => void;
  setGender: (g: Gender) => void;
  setGlowScore: (score: number) => void;
  setCycleTracking: (val: boolean) => void;
  setUndertone: (val: 'warm' | 'cool' | 'neutral') => void;
  setSubscription: (tier: SubscriptionTier) => void;
  persist: () => Promise<void>;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  fitzpatrick: null,
  skinConcerns: [],
  skinGoal: null,
  name: '',
  gender: null,
  glowScore: 0,
  streakDays: 0,
  cycleTracking: false,
  undertone: null,
  subscription: 'free',

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
  setGender: (g) => set({ gender: g }),
  setGlowScore: (score) => set({ glowScore: Math.max(0, Math.min(100, Math.round(score))) }),
  setCycleTracking: (val) => set({ cycleTracking: val }),
  setSubscription: (tier) => set({ subscription: tier }),
  setUndertone: (val) => set({ undertone: val }),

  persist: async () => {
    const { fitzpatrick, skinConcerns, skinGoal, name, gender, glowScore, streakDays, cycleTracking, undertone, subscription } = get();
    try {
      // 1. Local Persistence
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
        fitzpatrick, skinConcerns, skinGoal, name, gender, glowScore, streakDays, cycleTracking, undertone, subscription,
      }));

      // 2. Cloud Persistence (Sync to Firestore if logged in)
      if (auth?.currentUser) {
        await firestoreService.saveUserProfile(auth.currentUser.uid, {
          name,
          fitzpatrick: fitzpatrick ?? undefined,
          primaryConcern: skinConcerns[0] ?? undefined, // Sync primary one
          skinGoal: skinGoal ?? undefined,
          gender: gender ?? undefined,
          researchOptIn: true, // Default to opt-in for research
        });
      }
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
          gender: saved.gender ?? null,
          glowScore: saved.glowScore ?? 0,
          streakDays: saved.streakDays ?? 0,
          cycleTracking: saved.cycleTracking ?? false,
          undertone: saved.undertone ?? null,
          subscription: (saved.subscription as SubscriptionTier) ?? 'free',
        });
      }
    } catch (e) {
      console.error('Failed to hydrate profile:', e);
    }

    // Refresh subscription tier from Firestore
    try {
      if (auth?.currentUser) {
        const profile = await firestoreService.getUserProfile(auth.currentUser.uid);
        if (profile?.subscription) {
          set({ subscription: profile.subscription as SubscriptionTier });
        }
      }
    } catch (e) {
      // Subscription tier fetch failed — local cache still valid
    }
  },
  reset: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      set({
        fitzpatrick: null,
        skinConcerns: [],
        skinGoal: null,
        name: '',
        gender: null,
        cycleTracking: false,
        undertone: null,
        glowScore: 0,
        streakDays: 0,
      });
    } catch (e) {
      console.error('Failed to reset profile:', e);
    }
  },
}));
