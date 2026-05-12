import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Scan, ScanResult } from '../types/scan';

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
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    } catch {}
  },

  loadScans: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ scans: JSON.parse(raw) as Scan[] });
    } catch {}
  },
}));
