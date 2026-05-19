import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleIfGranted(
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({ content, trigger });
}

/** Daily 8:30 AM scan reminder */
export async function scheduleDailyScanReminder(): Promise<string | null> {
  return scheduleIfGranted(
    {
      title: 'Time for your daily scan 📸',
      body: 'Keep your streak alive — scan your skin to track your progress.',
      data: { route: '/scan/mannequin' },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 8,
      minute: 30,
      repeats: true,
    }
  );
}

/** Sunday 7 PM weekly summary */
export async function scheduleWeeklySummary(): Promise<string | null> {
  return scheduleIfGranted(
    {
      title: 'Your weekly SANO report is ready 📊',
      body: 'See how your skin changed this week and what to do next.',
      data: { route: '/features/dashboard' },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 1,
      hour: 19,
      minute: 0,
      repeats: true,
    }
  );
}

/** Cycle day 20 — luteal phase alert */
export async function scheduleCycleAlert(cycleStartDate: Date): Promise<string | null> {
  const day20 = new Date(cycleStartDate);
  day20.setDate(day20.getDate() + 19); // Day 1 + 19 = Day 20
  if (day20 < new Date()) return null; // Already passed

  return scheduleIfGranted(
    {
      title: 'Skin alert: luteal phase starting 🌙',
      body: "Progesterone peak incoming — more sebum, more breakout risk. We've got tips ready.",
      data: { route: '/features/cycle' },
    },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date: day20 }
  );
}

/** 24-hour streak reminder — fires if no scan detected after 24h */
export async function scheduleStreakReminder(streakDays: number): Promise<string | null> {
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);

  return scheduleIfGranted(
    {
      title: `Don't break your ${streakDays}-day streak! 🔥`,
      body: 'You\'re on a roll. One quick scan keeps your progress going.',
      data: { route: '/scan/mannequin' },
    },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date: tomorrow }
  );
}

/** Cancel all scheduled notifications */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Schedule all default notifications on first launch */
export async function scheduleDefaultNotifications(opts: {
  cycleStartDate?: Date;
  streakDays?: number;
}): Promise<void> {
  await Promise.allSettled([
    scheduleDailyScanReminder(),
    scheduleWeeklySummary(),
    opts.cycleStartDate ? scheduleCycleAlert(opts.cycleStartDate) : Promise.resolve(null),
    opts.streakDays ? scheduleStreakReminder(opts.streakDays) : Promise.resolve(null),
  ]);
}
