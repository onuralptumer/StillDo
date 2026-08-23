/**
 * The sweep alarm.
 *
 * Settings promises "the day gets reconstructed for you" at a chosen time.
 * Nothing here decides *what* the sweep contains — that is still built from
 * the database when the screen opens — this only makes sure the phone asks.
 *
 * One notification, one fixed id: rescheduling replaces it rather than piling
 * a second alarm on top of the first.
 *
 * @format
 */

import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';

const CHANNEL_ID = 'sweep';
export const SWEEP_NOTIFICATION_ID = 'sweep';

/**
 * The next time HH:MM comes round: later today if it is still ahead,
 * otherwise tomorrow. A trigger in the past fires the moment it is set, which
 * would mean picking 07:00 at lunchtime buzzes you immediately.
 */
export function nextOccurrence(time: string, from: Date = new Date()): number {
  const [h, m] = time.split(':').map(Number);
  const at = new Date(from.getTime());
  at.setHours(h, m, 0, 0);
  if (at.getTime() <= from.getTime()) at.setDate(at.getDate() + 1);
  return at.getTime();
}

/**
 * Ask once. Android below 13 has nothing to ask, and notifee reports those as
 * authorised; iOS and Android 13+ show the system prompt.
 */
export async function requestSweepPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function sweepPermitted(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Schedule the nightly sweep for `time`, replacing whatever was scheduled
 * before. Safe to call on every launch; it is the same alarm each time.
 *
 * A daily repeat is a fixed 24-hour step, so an alarm set before a clock
 * change comes back an hour out. Rescheduling on every launch is what pulls it
 * straight again — which is why this recomputes the timestamp rather than
 * skipping the work when the time has not changed.
 */
export async function scheduleSweep(time: string): Promise<void> {
  // Creating a channel that already exists updates it rather than duplicating.
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'The sweep',
    description: 'The nightly look back over what the day left.',
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.createTriggerNotification(
    {
      id: SWEEP_NOTIFICATION_ID,
      title: 'The sweep',
      body: 'Time to go back over what the day left.',
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default', launchActivity: 'default' },
      },
      ios: {
        sound: 'default',
        // iOS silences a local notification while its own app is in the
        // foreground unless it is told otherwise. Notifee happens to default
        // these on; say so anyway, because the sweep landing at 21:00 while
        // you happen to have the app open is the whole point of it.
        foregroundPresentationOptions: { banner: true, list: true, sound: true },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence(time),
      repeatFrequency: RepeatFrequency.DAILY,
      // Inexact on purpose. An exact alarm needs SCHEDULE_EXACT_ALARM, which
      // Android 14 grants only to clock-shaped apps; a nightly prompt that may
      // land a few minutes late is the honest trade.
      alarmManager: { allowWhileIdle: true },
    },
  );
}

export async function cancelSweep(): Promise<void> {
  await notifee.cancelTriggerNotification(SWEEP_NOTIFICATION_ID);
}

/** Deep-links to the app's own row in the system notification settings. */
export async function openSweepSettings(): Promise<void> {
  await notifee.openNotificationSettings();
}
