import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { authService } from '../services/auth';

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
    await authService.signOut();
    set({ user: null, loading: false });
  },
}));
