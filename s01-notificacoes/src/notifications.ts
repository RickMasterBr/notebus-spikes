import * as Notifications from 'expo-notifications';

import { insertRecord } from './db';

export const CATEGORY_ID = 'bus-departure';
export const ACTION_REGISTER = 'register';
export const ACTION_MISSED = 'missed';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setUpCategoryAsync = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    // T2a: does NOT open the app. Per the docs, the JS listener only runs if the app is
    // still in memory. The spike checks what really happens with the app killed.
    {
      identifier: ACTION_REGISTER,
      buttonTitle: 'Registrar passagem',
      options: { opensAppToForeground: false },
    },
    // T2b: opens the app.
    { identifier: ACTION_MISSED, buttonTitle: 'Perdi', options: { opensAppToForeground: true } },
  ]);
};

export const requestPermissionAsync = async (): Promise<string> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return asked.granted ? 'granted' : asked.status;
};

const minutesFromNow = (minutes: number): Date => new Date(Date.now() + minutes * 60_000);

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

type ScheduleInput = {
  minutes: number;
  label: string;
  timeSensitive?: boolean;
};

const scheduleAtAsync = async ({ minutes, label, timeSensitive }: ScheduleInput): Promise<void> => {
  const fireAt = minutesFromNow(minutes);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Saia agora · ${label}`,
      body: `Agendado para ${formatTime(fireAt)}. Anote a hora em que chegou.`,
      categoryIdentifier: CATEGORY_ID,
      data: { label, scheduledFor: fireAt.toISOString() },
      interruptionLevel: timeSensitive ? 'timeSensitive' : 'active',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
};

// T1 + T2
export const scheduleThreeAsync = async (): Promise<void> => {
  for (const minutes of [2, 5, 10]) {
    await scheduleAtAsync({ minutes, label: `T1 +${minutes} min` });
  }
};

// T4
export const scheduleTimeSensitiveAsync = async (): Promise<void> => {
  await scheduleAtAsync({ minutes: 1, label: 'T4 time-sensitive', timeSensitive: true });
};

export type LimitReport = {
  requested: number;
  kept: number;
  firstKept: string;
  lastKept: string;
};

// T3: schedule 70 out of order (farthest first) to see which 64 iOS keeps.
export const scheduleSeventyAsync = async (): Promise<LimitReport> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const requested = 70;
  for (let index = requested; index >= 1; index -= 1) {
    await scheduleAtAsync({ minutes: 60 * 24 + index, label: `T3 #${index}` });
  }
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const labels = pending
    .map((request) => String(request.content.data?.label ?? '?'))
    .sort((a, b) => Number(a.split('#')[1]) - Number(b.split('#')[1]));
  return {
    requested,
    kept: pending.length,
    firstKept: labels[0] ?? '-',
    lastKept: labels[labels.length - 1] ?? '-',
  };
};

export const pendingCountAsync = async (): Promise<number> =>
  (await Notifications.getAllScheduledNotificationsAsync()).length;

export const cancelAllAsync = (): Promise<void> =>
  Notifications.cancelAllScheduledNotificationsAsync();

// Finding (S-01, run 1): on iOS, expo-notifications reports `notification.date` in SECONDS
// (NotificationRecords.swift: timeIntervalSince1970), not milliseconds.
const deliveredAt = (rawDate: number): Date =>
  new Date(rawDate < 1e12 ? rawDate * 1000 : rawDate);

export const recordResponse = (response: Notifications.NotificationResponse): void => {
  const label = String(response.notification.request.content.data?.label ?? '?');
  const note = `${label} · entregue ${formatTime(deliveredAt(response.notification.date))}`;
  const dedupeKey = `${response.notification.request.identifier}:${response.actionIdentifier}`;
  if (response.actionIdentifier === ACTION_REGISTER) insertRecord('action-register', note, dedupeKey);
  else if (response.actionIdentifier === ACTION_MISSED) insertRecord('action-missed', note, dedupeKey);
  else insertRecord('tap', note, dedupeKey);
};
