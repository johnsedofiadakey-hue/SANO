import {
  collection, doc, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';

export type ConsultStatus = 'pending' | 'active' | 'answered' | 'closed';

export interface Consultation {
  id: string;
  patientUid: string;
  patientName: string;
  doctorUid?: string;
  doctorName?: string;
  subject: string;
  message: string;
  doctorReply?: string;
  condition?: string;
  scanId?: string;
  status: ConsultStatus;
  createdAt: Date;
  repliedAt?: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  yearsExp: number;
  verified: boolean;
  bio: string;
  avgResponseHours: number;
}

const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'dr1',
    name: 'Dr. Ama Owusu',
    specialty: 'Dermatology',
    location: 'Ridge Hospital, Accra',
    yearsExp: 12,
    verified: true,
    bio: 'Specialises in conditions affecting African skin types, including PIH, melasma, and acne in Fitzpatrick IV–VI.',
    avgResponseHours: 24,
  },
  {
    id: 'dr2',
    name: 'Dr. Kofi Mensah',
    specialty: 'Dermatology & Aesthetics',
    location: 'Korle-Bu Teaching Hospital, Accra',
    yearsExp: 8,
    verified: true,
    bio: 'Expert in eczema, psoriasis, and razor bumps with a focus on evidence-based treatment for darker skin tones.',
    avgResponseHours: 36,
  },
];

const DEMO_CONSULTATIONS: Consultation[] = [];

// ── Service ───────────────────────────────────────────────────────────────────

export const consultationService = {

  async fetchDoctors(): Promise<Doctor[]> {
    if (DEMO_MODE || !db) return DEMO_DOCTORS;
    const snap = await getDocs(query(collection(db, 'doctors'), where('verified', '==', true)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
  },

  async fetchMyConsultations(patientUid: string): Promise<Consultation[]> {
    if (DEMO_MODE || !db) return DEMO_CONSULTATIONS;
    const q = query(
      collection(db, 'consultations'),
      where('patientUid', '==', patientUid),
      orderBy('createdAt', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        patientUid: data.patientUid,
        patientName: data.patientName,
        doctorUid: data.doctorUid,
        doctorName: data.doctorName,
        subject: data.subject,
        message: data.message,
        doctorReply: data.doctorReply,
        condition: data.condition,
        scanId: data.scanId,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        repliedAt: data.repliedAt?.toDate?.(),
      } as Consultation;
    });
  },

  async getConsultation(id: string): Promise<Consultation | null> {
    if (DEMO_MODE || !db) return null;
    const snap = await getDoc(doc(db, 'consultations', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      patientUid: data.patientUid,
      patientName: data.patientName,
      doctorUid: data.doctorUid,
      doctorName: data.doctorName,
      subject: data.subject,
      message: data.message,
      doctorReply: data.doctorReply,
      condition: data.condition,
      scanId: data.scanId,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      repliedAt: data.repliedAt?.toDate?.(),
    };
  },

  async createConsultation(params: {
    patientUid: string;
    patientName: string;
    subject: string;
    message: string;
    condition?: string;
    scanId?: string;
  }): Promise<string> {
    if (DEMO_MODE || !db) return 'demo-consult';
    const ref = await addDoc(collection(db, 'consultations'), {
      ...params,
      status: 'pending' as ConsultStatus,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async closeConsultation(id: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, 'consultations', id), { status: 'closed' });
  },
};
