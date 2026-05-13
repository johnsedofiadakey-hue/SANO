import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaystackProvider } from 'react-native-paystack-webview';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import { useProfileStore } from '../src/store/profileStore';
import { useScanStore } from '../src/store/scanStore';
import { useCycleStore } from '../src/store/cycleStore';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { initAnalytics } from '../src/services/analytics';
import { initSentry } from '../src/config/sentry';
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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    // Initialize error tracking and analytics
    initSentry();
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

    // Smart Sleep Detection
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        const now = new Date();
        const hours = now.getHours();
        // If it's late (after 9 PM or before 4 AM), record as potential sleep start
        if (hours >= 21 || hours < 4) {
          await SecureStore.setItemAsync('last_active_night', now.toISOString());
        }
      } else if (nextAppState === 'active') {
        const lastNight = await SecureStore.getItemAsync('last_active_night');
        if (lastNight) {
          const lastDate = new Date(lastNight);
          const now = new Date();
          const hours = now.getHours();
          // If it's morning (after 5 AM), calculate sleep
          if (hours >= 5 && hours < 12) {
            const diffMs = now.getTime() - lastDate.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);
            
            // If the difference is reasonable (4 to 12 hours), save it!
            if (diffHrs >= 4 && diffHrs <= 12) {
              await SecureStore.setItemAsync('smart_sleep_hours', diffHrs.toFixed(1));
              const { auth, FIREBASE_READY } = await import('../src/config/firebase');
              const { firestoreService } = await import('../src/services/firestore');
              if (FIREBASE_READY && auth?.currentUser?.uid) {
                await firestoreService.saveHealthEvent(auth.currentUser.uid, {
                  type: 'sleep',
                  value: { hours: parseFloat(diffHrs.toFixed(1)), method: 'smart_estimate' },
                });
              }
            }
            // Clear it so we don't calculate again today
            await SecureStore.deleteItemAsync('last_active_night');
          }
        }
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [setUser, hydrateProfile, loadScans, hydrateCycle]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaystackProvider
            publicKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ''}
            currency="GHS"
            defaultChannels={['card', 'mobile_money']}
          >
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
              <Stack.Screen name="features" />
            </Stack>
          </PaystackProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
