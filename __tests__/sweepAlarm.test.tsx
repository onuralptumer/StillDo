/**
 * The sweep alarm: the app's one real promise about time.
 *
 * @format
 */

import React from 'react';
import { AppState } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';
import { SWEEP_NOTIFICATION_ID, nextOccurrence } from '../src/notify';
import { useSweepAlarm, type SweepAlarm } from '../src/useSweepAlarm';

const act = ReactTestRenderer.act;
const api = notifee as unknown as Record<string, jest.Mock>;

const authorized = { authorizationStatus: 1 };
const denied = { authorizationStatus: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  api.requestPermission.mockResolvedValue(authorized);
  api.getNotificationSettings.mockResolvedValue(authorized);
});

/** The trigger handed to notifee on the nth scheduling call. */
const triggerAt = (n = 0) => api.createTriggerNotification.mock.calls[n][1];
const notificationAt = (n = 0) => api.createTriggerNotification.mock.calls[n][0];

async function mount(time = '21:00', active = true) {
  const ref: { current: SweepAlarm } = { current: null as unknown as SweepAlarm };
  const Host = ({ t, on }: { t: string; on: boolean }) => {
    ref.current = useSweepAlarm(t, on);
    return null;
  };
  let tree: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(<Host t={time} on={active} />);
  });
  const rerender = async (t: string, on = true) => {
    await act(async () => {
      tree.update(<Host t={t} on={on} />);
    });
  };
  return { ref, rerender };
}

describe('when the alarm is set', () => {
  test('a permitted launch schedules the sweep for the chosen time', async () => {
    await mount('21:00');

    expect(api.requestPermission).toHaveBeenCalledTimes(1);
    expect(api.createTriggerNotification).toHaveBeenCalledTimes(1);

    expect(triggerAt()).toEqual({
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence('21:00'),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: { allowWhileIdle: true },
    });
  });

  test('it repeats daily rather than firing once', async () => {
    await mount('21:00');
    expect(triggerAt().repeatFrequency).toBe(RepeatFrequency.DAILY);
  });

  test('the Android channel exists before anything is posted to it', async () => {
    await mount('21:00');

    const channelOrder = api.createChannel.mock.invocationCallOrder[0];
    const scheduleOrder =
      api.createTriggerNotification.mock.invocationCallOrder[0];
    expect(channelOrder).toBeLessThan(scheduleOrder);
    expect(notificationAt().android.channelId).toBe(
      api.createChannel.mock.calls[0][0].id,
    );
  });

  test('rescheduling replaces the alarm instead of stacking a second one', async () => {
    const { rerender } = await mount('21:00');
    await rerender('06:30');

    expect(api.createTriggerNotification).toHaveBeenCalledTimes(2);
    // Same id both times — notifee replaces rather than adds.
    expect(notificationAt(0).id).toBe(SWEEP_NOTIFICATION_ID);
    expect(notificationAt(1).id).toBe(SWEEP_NOTIFICATION_ID);
    expect(triggerAt(1).timestamp).toBe(nextOccurrence('06:30'));
  });

  test('nothing is scheduled over the top of onboarding', async () => {
    await mount('21:00', false);

    expect(api.requestPermission).not.toHaveBeenCalled();
    expect(api.createTriggerNotification).not.toHaveBeenCalled();
  });
});

describe('when the phone will not let it through', () => {
  test('a refusal schedules nothing and says so', async () => {
    api.requestPermission.mockResolvedValue(denied);
    const { ref } = await mount('21:00');

    expect(ref.current.permitted).toBe(false);
    expect(api.createTriggerNotification).not.toHaveBeenCalled();
    // An alarm that cannot fire is cleared rather than left lying around.
    expect(api.cancelTriggerNotification).toHaveBeenCalledWith(
      SWEEP_NOTIFICATION_ID,
    );
  });

  test('granting it in system settings takes effect on returning to the app', async () => {
    const listeners: ((s: string) => void)[] = [];
    const spy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_e, fn) => {
        listeners.push(fn as (s: string) => void);
        return { remove: () => {} } as ReturnType<
          typeof AppState.addEventListener
        >;
      });

    api.requestPermission.mockResolvedValue(denied);
    const { ref } = await mount('21:00');
    expect(ref.current.permitted).toBe(false);

    // The user leaves, turns notifications on, and comes back.
    api.getNotificationSettings.mockResolvedValue(authorized);
    await act(async () => {
      listeners.forEach(fn => fn('active'));
    });

    expect(ref.current.permitted).toBe(true);
    expect(triggerAt().timestamp).toBe(nextOccurrence('21:00'));
    spy.mockRestore();
  });

  test('the system prompt is only ever raised once', async () => {
    const listeners: ((s: string) => void)[] = [];
    const spy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_e, fn) => {
        listeners.push(fn as (s: string) => void);
        return { remove: () => {} } as ReturnType<
          typeof AppState.addEventListener
        >;
      });

    await mount('21:00');
    await act(async () => {
      listeners.forEach(fn => fn('active'));
    });

    expect(api.requestPermission).toHaveBeenCalledTimes(1);
    expect(api.getNotificationSettings).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('a failure surfaces instead of vanishing', async () => {
    api.requestPermission.mockRejectedValue(new Error('notifee unavailable'));
    const { ref } = await mount('21:00');

    expect(ref.current.error).toBe('notifee unavailable');
  });
});

describe('the time the alarm lands on', () => {
  const at = (h: number, m: number) => new Date(2026, 7, 23, h, m, 0, 0);

  test('later today, when the time is still ahead', () => {
    expect(nextOccurrence('21:00', at(9, 0))).toBe(at(21, 0).getTime());
  });

  test('tomorrow, when it has already gone', () => {
    const t = nextOccurrence('06:30', at(9, 0));
    expect(t).toBe(new Date(2026, 7, 24, 6, 30, 0, 0).getTime());
  });

  test('tomorrow, when it is exactly now — not this instant', () => {
    // A timestamp in the past fires immediately; equal counts as past.
    const t = nextOccurrence('09:00', at(9, 0));
    expect(t).toBe(new Date(2026, 7, 24, 9, 0, 0, 0).getTime());
  });

  test('midnight is a real choice, not a falsy one', () => {
    expect(nextOccurrence('00:00', at(9, 0))).toBe(
      new Date(2026, 7, 24, 0, 0, 0, 0).getTime(),
    );
  });
});
