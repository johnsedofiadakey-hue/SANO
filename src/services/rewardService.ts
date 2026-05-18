import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';

const REWARD_AMOUNT_GHS = 25;

export interface RewardStatus {
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  scansContributed: number;
  eligible: boolean;
  momoNumber?: string;
}

export const rewardService = {

  async getStatus(uid: string): Promise<RewardStatus> {
    if (DEMO_MODE || !db) {
      return { totalEarned: 0, pendingPayout: 0, paidOut: 0, scansContributed: 0, eligible: false };
    }
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return { totalEarned: 0, pendingPayout: 0, paidOut: 0, scansContributed: 0, eligible: false };
    const data = snap.data();
    const scansContributed: number = data.researchScansContributed ?? 0;
    const totalEarned = Math.floor(scansContributed / 10) * REWARD_AMOUNT_GHS;
    const paidOut: number = data.rewardPaidOut ?? 0;
    return {
      totalEarned,
      pendingPayout: totalEarned - paidOut,
      paidOut,
      scansContributed,
      eligible: scansContributed >= 10,
      momoNumber: data.momoNumber,
    };
  },

  async recordContribution(uid: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, 'users', uid), {
      researchScansContributed: increment(1),
      lastContributionAt: serverTimestamp(),
    });
  },

  async requestPayout(uid: string, momoNumber: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, 'users', uid), {
      momoNumber,
      payoutRequestedAt: serverTimestamp(),
      payoutStatus: 'pending',
    });
  },
};
