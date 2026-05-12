import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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

    // Always persist locally first
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(scans));
    } catch (e) {
      console.error('Failed to persist scans securely:', e);
      // NOTE: SecureStore has a size limit of 2048 bytes on iOS.
      // If this fails, we may need to implement a chunked or encrypted AsyncStorage solution.
    }

    // Sync to Firestore if Firebase is configured
    if (FIREBASE_READY) {
      try {
        const { auth } = await import('../config/firebase');
        const { firestoreService } = await import('../services/firestore');
        const uid = auth?.currentUser?.uid;
        if (uid) {
          await firestoreService.saveScan(uid, {
            imageStoragePath: (scan as any).imageUri ?? '',
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
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) set({ scans: JSON.parse(raw) as Scan[] });
    } catch (e) {
      console.error('Failed to load scans securely:', e);
    }
  },
}));

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  // Ghana: harmattan Nov-Mar, rainy Apr-Oct
  if (month >= 11 || month <= 3) return 'harmattan';
  return 'rainy';
}
