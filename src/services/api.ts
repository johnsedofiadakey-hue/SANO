import axios from 'axios';
import { auth, DEMO_MODE } from '../config/firebase';
import { logger } from '../utils/logger';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth?.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        logger.error('Failed to get Firebase ID token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get a 401 Unauthorized, it means the session is invalid
    if (error.response?.status === 401) {
      logger.error('Session expired or unauthorized. Logging out.');
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().signOut().catch(() => {});
    }
    logger.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
