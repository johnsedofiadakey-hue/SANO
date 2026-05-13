import {
  collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, query, where, orderBy,
  limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';
import { MOCK_SCAN_HISTORY, MOCK_VITALS, MOCK_CYCLE } from '../data/mockData';

// ── Collection names ──────────────────────────────────────────────────────────
const C = {
  users:        'users',
  scans:        'scans',
  healthEvents: 'health_events',
  cycleLogs:    'cycle_logs',
  routines:     'routines',
  consentLog:   'consent_log',
  analytics:    'analytics_events',
} as const;

// ── Firestore service ─────────────────────────────────────────────────────────
export const firestoreService = {

  // ── User profile ────────────────────────────────────────────────────────────

  saveUserProfile: async (uid: string, profile: {
    region?: string;
    fitzpatrick?: number;
    primaryConcern?: string;
    skinGoal?: string;
    ageGroup?: string;
    researchOptIn?: boolean;
  }): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, C.users, uid), {
      ...profile,
      subscription: 'free',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
  },

  getUserProfile: async (uid: string): Promise<Record<string, unknown> | null> => {
    if (!db) return null;
    const snap = await getDoc(doc(db, C.users, uid));
    return snap.exists() ? snap.data() : null;
  },

  // ── Scans ───────────────────────────────────────────────────────────────────

  saveScan: async (uid: string, scanData: {
    imageStoragePath: string;
    skinTone: number;
    conditions: unknown[];
    area: string;
    cycleDay: number | null;
    region: string;
    season: string;
    phoneModel: string;
    modelVersion: string;
    confidence: number;
  }): Promise<string> => {
    if (DEMO_MODE || !db) return `demo_scan_${Date.now()}`;
    const ref = await addDoc(collection(db, C.scans), {
      userId: uid,
      ...scanData,
      doctorConfirmed: false,
      shareCount: 0,
      queuedForLabel: scanData.confidence < 0.75,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  getUserScans: async (uid: string, limitCount = 20): Promise<unknown[]> => {
    if (!db) {
      return [];
    }
    const q = query(
      collection(db, C.scans),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  confirmScan: async (scanId: string): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, C.scans, scanId), { doctorConfirmed: true });
  },

  incrementShareCount: async (scanId: string): Promise<void> => {
    if (DEMO_MODE || !db) return;
    const ref = doc(db, C.scans, scanId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const current = (snap.data().shareCount as number) ?? 0;
      await updateDoc(ref, { shareCount: current + 1 });
    }
  },

  // Real-time scan listener
  listenToUserScans: (uid: string, callback: (scans: unknown[]) => void): (() => void) => {
    if (!db) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, C.scans),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Health events ────────────────────────────────────────────────────────────

  saveHealthEvent: async (uid: string, event: {
    type: string;
    value: Record<string, unknown>;
    device?: string;
    confidence?: number;
  }): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await addDoc(collection(db, C.healthEvents), {
      userId: uid,
      ...event,
      createdAt: serverTimestamp(),
    });
  },

  getRecentVitals: async (uid: string): Promise<Record<string, unknown>> => {
    if (!db) return {};
    const q = query(
      collection(db, C.healthEvents),
      where('userId', '==', uid),
      where('type', 'in', ['heart_rate', 'spo2', 'blood_pressure']),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const latest: Record<string, unknown> = {};
    for (const d of snap.docs) {
      const data = d.data();
      if (!latest[data.type as string]) {
        latest[data.type as string] = { ...data.value, recordedAt: data.createdAt };
      }
    }
    return latest;
  },

  // ── Cycle logs ───────────────────────────────────────────────────────────────

  saveCycleLog: async (uid: string, cycleData: {
    cycleDay: number;
    periodStart?: string;
    periodEnd?: string;
    symptoms?: string[];
    skinCondition?: number;
  }): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await addDoc(collection(db, C.cycleLogs), {
      userId: uid,
      ...cycleData,
      createdAt: serverTimestamp(),
    });
  },

  getCycleLogs: async (uid: string): Promise<unknown[]> => {
    if (DEMO_MODE || !db) return [];
    const q = query(
      collection(db, C.cycleLogs),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(12)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── Routine ───────────────────────────────────────────────────────────────────

  saveRoutine: async (uid: string, routine: {
    morning: unknown[];
    evening: unknown[];
    conflicts: unknown[];
  }): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await setDoc(doc(db, C.routines, uid), {
      userId: uid,
      ...routine,
      updatedAt: serverTimestamp(),
    });
  },

  // ── Consent log (append-only, never delete) ───────────────────────────────────

  logConsent: async (uid: string, consentData: {
    action: string;
    feature: string;
    policyVersion: string;
  }): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await addDoc(collection(db, C.consentLog), {
      userId: uid,
      ...consentData,
      timestamp: serverTimestamp(),
    });
  },

  // ── Analytics ─────────────────────────────────────────────────────────────────

  logAnalyticsEvent: async (uid: string | null, event: {
    type: string;
    data: Record<string, unknown>;
  }): Promise<void> => {
    if (DEMO_MODE || !db) return;
    await addDoc(collection(db, C.analytics), {
      userId: uid ?? 'anonymous',
      ...event,
      createdAt: serverTimestamp(),
    });
  },
};
