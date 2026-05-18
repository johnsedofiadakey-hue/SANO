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

export const authService = {
  signInWithGoogle: async (idToken?: string): Promise<User> => {
    if (!idToken) throw new Error('Google idToken required');
    const cred = GoogleAuthProvider.credential(idToken);
    return (await signInWithCredential(auth, cred)).user;
  },

  signInWithFacebook: async (accessToken?: string): Promise<User> => {
    if (!accessToken) throw new Error('Facebook accessToken required');
    const cred = FacebookAuthProvider.credential(accessToken);
    return (await signInWithCredential(auth, cred)).user;
  },

  sendPhoneOTP: async (phoneNumber: string, recaptchaVerifier?: any): Promise<ConfirmationResult | any> => {
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  },

  verifyPhoneOTP: async (confirmationResult: any, otp: string): Promise<User> => {
    return (await confirmationResult.confirm(otp)).user;
  },

  signInWithEmail: async (email: string, password: string): Promise<User> => {
    return (await signInWithEmailAndPassword(auth, email, password)).user;
  },

  registerWithEmail: async (email: string, password: string): Promise<User> => {
    return (await createUserWithEmailAndPassword(auth, email, password)).user;
  },

  sendMagicLink: async (email: string): Promise<void> => {
    const callbackUrl = process.env.EXPO_PUBLIC_MAGIC_LINK_URL ?? 'https://getsano.com/auth/email-callback';
    await sendSignInLinkToEmail(auth, email, {
      url: callbackUrl,
      handleCodeInApp: true,
    });
  },

  getCurrentUser: (): User | null => {
    return auth?.currentUser ?? null;
  },

  signOut: async (): Promise<void> => {
    return firebaseSignOut(auth);
  },

  onAuthChange: (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

export default authService;
