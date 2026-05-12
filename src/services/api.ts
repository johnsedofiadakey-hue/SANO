import axios from 'axios';
import { auth, DEMO_MODE } from '../config/firebase';
import { logger } from '../utils/logger';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    if (DEMO_MODE) return config;
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
    logger.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
