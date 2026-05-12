import Constants from 'expo-constants';

const isDev = Constants.expoConfig?.extra?.dev === true || __DEV__;

type LogLevel = 'log' | 'warn' | 'error' | 'info';

function log(level: LogLevel, ...args: unknown[]): void {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console[level]('[SANO]', ...args);
}

export const logger = {
  log:   (...args: unknown[]) => log('log', ...args),
  warn:  (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  info:  (...args: unknown[]) => log('info', ...args),
};
