const SENTRY_READY = !!process.env.EXPO_PUBLIC_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_READY) return;

  // Install: npx expo install @sentry/react-native
  // Then uncomment:
  //
  // import * as Sentry from '@sentry/react-native';
  // Sentry.init({
  //   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  //   environment: process.env.NODE_ENV || 'development',
  //   tracesSampleRate: 0.1,
  //   integrations: [new Sentry.ReactNativeTracing()],
  // });
};

export const captureError = (error: Error, context?: Record<string, unknown>) => {
  if (!SENTRY_READY) {
    if (__DEV__) console.error('[SANO Error]', error.message, context);
    return;
  }
  // import * as Sentry from '@sentry/react-native';
  // Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error') => {
  if (!SENTRY_READY) {
    if (__DEV__) console.log(`[SANO ${level ?? 'info'}]`, message);
    return;
  }
  // Sentry.captureMessage(message, level);
};
