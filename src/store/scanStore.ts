import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Scan, ScanResult } from '../types/scan';
import { FIREBASE_READY } from '../config/firebase';

const STORAGE_KEY = 'sano_scans';

interface ScanState {
  scans: Scan[];
  currentResult: ScanResult | null;
  selectedBodyArea: string | null;
  isProcessing: boolean;
  setCurrentResult: (result: ScanResult | null) => void;
  setSelectedBodyArea: (area: string | null) => void;
  setProcessing: (processing: boolean) => void;
  addScan: (scan: Scan) => Promise<void>;
  loadScans: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
  scans: [],
  currentResult: null,
  selectedBodyArea: null,
  isProcessing: false,

  setCurrentResult: (result) => set({ currentResult: result }),
  setSelectedBodyArea: (area) => set({ selectedBodyArea: area }),
  setProcessing: (processing) => set({ isProcessing: processing }),

  addScan: async (scan) => {
    const scans = [scan, ...get().scans];
    set({ scans });

    // Always persist locally first. Use AsyncStorage for larger data capacity.
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    } catch (e) {
      console.error('Failed to persist scans:', e);
    }

    // Recalculate Glow Score from this scan's conditions
    try {
      const { useProfileStore } = await import('./profileStore');
      const conditions: Array<{ severity?: number; confidence?: number }> =
        (scan.conditions_detected ?? []) as any;
      let score = 100;
      for (const c of conditions) {
        score -= (c.severity ?? 0) * (c.confidence ?? 1) * 30;
      }
      useProfileStore.getState().setGlowScore(score);
      await useProfileStore.getState().persist();
    } catch (e) {
      console.error('Failed to update glow score:', e);
    }

    // Sync to Firestore if Firebase is configured
    if (FIREBASE_READY) {
      try {
        const { auth } = await import('../config/firebase');
        const { firestoreService } = await import('../services/firestore');
        const uid = auth?.currentUser?.uid;
        if (uid) {
          const localUri: string = (scan as any).imageUri ?? '';
          let imageStoragePath = localUri;
          if (localUri) {
            try {
              imageStoragePath = await firestoreService.uploadScanImage(uid, localUri);
            } catch (e) {
              console.error('Firebase Storage upload failed — using local URI:', e);
            }
          }
          await firestoreService.saveScan(uid, {
            imageStoragePath,
            skinTone: scan.skin_tone ?? 5,
            conditions: (scan.conditions_detected ?? []) as unknown[],
            area: scan.body_area ?? 'face',
            cycleDay: scan.cycle_day ?? null,
            region: scan.region ?? 'Greater Accra',
            season: scan.season ?? getSeason(),
            phoneModel: scan.phone_model ?? 'Unknown',
            modelVersion: scan.model_version ?? 'v1',
            confidence: scan.conditions_detected?.[0]?.confidence ?? 0,
          });
        }
      } catch (e) {
        // Silent fail — local storage is source of truth
      }
    }
  },

  loadScans: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ scans: JSON.parse(raw) as Scan[] });
    } catch (e) {
      console.error('Failed to load scans:', e);
    }

    // Sync from Firestore if Firebase is configured
    if (FIREBASE_READY) {
      try {
        const { auth } = await import('../config/firebase');
        const { firestoreService } = await import('../services/firestore');
        const uid = auth?.currentUser?.uid;
        if (uid) {
          const firestoreScans = await firestoreService.getUserScans(uid);
          if (firestoreScans && firestoreScans.length > 0) {
            set({ scans: firestoreScans as unknown as Scan[] });
          }
        }
      } catch (e) {
        console.error('Failed to load scans from Firestore:', e);
      }
    }
  },

  reset: async () => {
    try {
      // Clear local images from FileSystem to prevent storage leaks
      const { scans } = get();
      const FileSystem = await import('expo-file-system');
      await Promise.all(
        scans
          .map(s => (s as any).imageUri)
          .filter(Boolean)
          .map(uri => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}))
      );

      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ scans: [], currentResult: null, selectedBodyArea: null });
    } catch (e) {
      console.error('Failed to reset scan store:', e);
    }
  },
}));

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 11 || month <= 3) return 'harmattan';
  return 'rainy';
}
