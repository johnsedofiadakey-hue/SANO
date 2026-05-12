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
  PhoneAuthProvider,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { auth, DEMO_MODE } from '../config/firebase';
import { logger } from '../utils/logger';

// ── Demo mode stub user ───────────────────────────────────────────────────────
const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@sano.health',
  displayName: 'Abena Osei',
  phoneNumber: '+233241234567',
  photoURL: null,
} as unknown as User;

// ── Auth service ──────────────────────────────────────────────────────────────
export const authService = {

  // Google Sign In
  // In Expo Go: use expo-auth-session to get idToken, then pass here
  // In production custom dev client: use @react-native-google-signin
  signInWithGoogle: async (idToken: string): Promise<User> => {
    if (DEMO_MODE) return DEMO_USER;
    if (!auth) throw new Error('Firebase not initialized');
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  },

  // Facebook Sign In
  signInWithFacebook: async (accessToken: string): Promise<User> => {
    if (DEMO_MODE) return DEMO_USER;
    if (!auth) throw new Error('Firebase not initialized');
    const credential = FacebookAuthProvider.credential(accessToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  },

  // Phone OTP — Step 1: Send OTP
  // phoneNumber format: +233241234567
  // In Expo Go: Firebase phone auth requires a custom dev client for native ReCaptcha.
  // For testing in Firebase console: add +233000000000 as a test number with code 123456.
  sendPhoneOTP: async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!auth) throw new Error('Firebase not initialized');
    // @ts-ignore — ApplicationVerifier is optional in test mode
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, undefined);
    return confirmationResult;
  },

  // Phone OTP — Step 2: Verify OTP
  verifyPhoneOTP: async (confirmationResult: ConfirmationResult, otp: string): Promise<User> => {
    if (DEMO_MODE) return DEMO_USER;
    const result = await confirmationResult.confirm(otp);
    return result.user;
  },

  // Email + password sign in
  signInWithEmail: async (email: string, password: string): Promise<User> => {
    if (DEMO_MODE) return DEMO_USER;
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Email + password register
  registerWithEmail: async (email: string, password: string): Promise<User> => {
    if (DEMO_MODE) return DEMO_USER;
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Passwordless email link (magic link)
  sendMagicLink: async (email: string): Promise<void> => {
    if (DEMO_MODE) return;
    if (!auth) throw new Error('Firebase not initialized');
    await sendSignInLinkToEmail(auth, email, {
      url: `${process.env.EXPO_PUBLIC_API_URL ?? 'https://sano.health'}/auth/callback`,
      handleCodeInApp: true,
    });
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (DEMO_MODE) return;
    if (!auth) return;
    await firebaseSignOut(auth);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (DEMO_MODE) return DEMO_USER;
    return auth?.currentUser ?? null;
  },

  // Listen for auth state changes
  onAuthChange: (callback: (user: User | null) => void): (() => void) => {
    if (DEMO_MODE) {
      // In demo mode: fire callback immediately with demo user, return no-op
      setTimeout(() => callback(DEMO_USER), 0);
      return () => {};
    }
    if (!auth) {
      setTimeout(() => callback(null), 0);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },
};
