import {
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { auth, FIREBASE_READY } from '../config/firebase';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'abena@demo.sano.health',
  displayName: 'Abena Osei',
  phoneNumber: '+233241234567',
  photoURL: null,
} as unknown as User;

export const authService = {

  signInWithGoogle: async (idToken?: string): Promise<User> => {
    if (!FIREBASE_READY) { await delay(1000); return DEMO_USER; }
    if (!idToken) throw new Error('Google idToken required');
    const cred = GoogleAuthProvider.credential(idToken);
    return (await signInWithCredential(auth, cred)).user;
  },

  signInWithFacebook: async (accessToken?: string): Promise<User> => {
    if (!FIREBASE_READY) { await delay(1000); return DEMO_USER; }
    if (!accessToken) throw new Error('Facebook accessToken required');
    const cred = FacebookAuthProvider.credential(accessToken);
    return (await signInWithCredential(auth, cred)).user;
  },

  sendPhoneOTP: async (phoneNumber: string, recaptchaVerifier?: any): Promise<ConfirmationResult | any> => {
    if (!FIREBASE_READY) {
      await delay(1200);
      return {
        demoMode: true,
        confirm: async (code: string) => {
          if (code === '123456') return { user: { uid: 'demo-user-001', phoneNumber } };
          throw new Error('Invalid code. Use 123456 in demo mode.');
        },
      };
    }
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  },

  verifyPhoneOTP: async (confirmationResult: any, otp: string): Promise<User> => {
    return (await confirmationResult.confirm(otp)).user;
  },

  signInWithEmail: async (email: string, password: string): Promise<User> => {
    if (!FIREBASE_READY) { await delay(800); return DEMO_USER; }
    return (await signInWithEmailAndPassword(auth, email, password)).user;
  },

  registerWithEmail: async (email: string, password: string): Promise<User> => {
    if (!FIREBASE_READY) { await delay(1000); return DEMO_USER; }
    return (await createUserWithEmailAndPassword(auth, email, password)).user;
  },

  sendMagicLink: async (email: string): Promise<void> => {
    if (!FIREBASE_READY) { await delay(800); return; }
    await sendSignInLinkToEmail(auth, email, {
      url: 'https://getsano.com/auth/email-callback',
      handleCodeInApp: true,
    });
  },

  getCurrentUser: (): User | null => {
    if (!FIREBASE_READY) return DEMO_USER;
    return auth?.currentUser ?? null;
  },

  signOut: async (): Promise<void> => {
    if (!FIREBASE_READY) return;
    return firebaseSignOut(auth);
  },

  onAuthChange: (callback: (user: User | null) => void): (() => void) => {
    if (!FIREBASE_READY) {
      callback(DEMO_USER);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },
};

export default authService;
