import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useProfileStore } from '../src/store/profileStore';
import { useScanStore } from '../src/store/scanStore';
import { useCycleStore } from '../src/store/cycleStore';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { initAnalytics } from '../src/services/analytics';
import { scheduleDefaultNotifications } from '../src/services/notifications';
import { MOCK_USER } from '../src/data/mockData';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

export default function RootLayout() {
  const { hydrate: hydrateProfile } = useProfileStore();
  const { loadScans } = useScanStore();
  const { hydrate: hydrateCycle } = useCycleStore();
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => {
    // Initialize analytics
    const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
    initAnalytics(posthogKey);

    // Firebase auth state listener — fires immediately with current user or null
    const unsubscribe = authService.onAuthChange((user) => {
      setUser(user);
    });

    // Hydrate local stores
    Promise.all([
      hydrateProfile(),
      loadScans(),
      hydrateCycle(),
    ]).catch(() => {});

    // Schedule local notifications
    scheduleDefaultNotifications({ streakDays: MOCK_USER.streakDays }).catch(() => {});

    return unsubscribe;
  }, [setUser, hydrateProfile, loadScans, hydrateCycle]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            <Stack.Screen name="features" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
