import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { authService } from '../services/auth';
import { useProfileStore } from './profileStore';
import { useScanStore } from './scanStore';
import { cancelAllNotifications } from '../services/notifications';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user, initialized: true, loading: false }),

  signOut: async () => {
    set({ loading: true });
    try {
      // Clear all local stores and cancel notifications on logout
      await Promise.allSettled([
        authService.signOut(),
        useProfileStore.getState().reset(),
        useScanStore.getState().reset(),
        cancelAllNotifications(),
      ]);
    } finally {
      set({ user: null, loading: false });
    }
  },
}));
