/**
 * The home- and lock-screen widgets: what they are told, and where a tap on
 * one lands.
 *
 * @format
 */

import React from 'react';
import { NativeModules } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { nodeDriver } from '../testing/nodeDriver';
import { demoTasks } from '../testing/fixtures';
import { prepare } from '../src/db/schema';
import { insertTask } from '../src/db/tasks';
import { putSetting } from '../src/db/settings';
import type { SqlDriver } from '../src/db/driver';
import { isoDay } from '../src/date';
import type { Settings, Task } from '../src/types';
import { useStilldo, type Stilldo } from '../src/useStilldo';
import { linkFor, parseWidgetLink } from '../src/widgets/links';
import { SNAPSHOT_VERSION, buildSnapshot } from '../src/widgets/snapshot';
import { useWidgetSync } from '../src/widgets/useWidgetSync';

const act = ReactTestRenderer.act;
const bridge = NativeModules.StilldoWidgets as { publish: jest.Mock };

beforeEach(() => {
  bridge.publish.mockClear();
  bridge.publish.mockResolvedValue(undefined);
});

describe('the URLs a widget opens the app with', () => {
  test('each capture button names the capture it is for', () => {
    expect(parseWidgetLink('stilldo://capture/voice')).toEqual({
      kind: 'capture',
      how: 'voice',
    });
    expect(parseWidgetLink('stilldo://capture/text')).toEqual({
      kind: 'capture',
      how: 'text',
    });
    expect(parseWidgetLink('stilldo://capture/photo')).toEqual({
      kind: 'capture',
      how: 'photo',
    });
  });

  test('the other two routes', () => {
    expect(parseWidgetLink('stilldo://now')).toEqual({ kind: 'now' });
    expect(parseWidgetLink('stilldo://sweep')).toEqual({ kind: 'sweep' });
  });

  test('the native widget definitions are built against the same strings', () => {
    for (const link of [
      { kind: 'capture', how: 'voice' },
      { kind: 'capture', how: 'text' },
      { kind: 'capture', how: 'photo' },
      { kind: 'now' },
      { kind: 'sweep' },
    ] as const) {
      expect(parseWidgetLink(linkFor(link))).toEqual(link);
    }
  });

  test('a URL is read the way the platforms actually hand it over', () => {
    // Trailing slashes, a query the launcher appended, and a scheme the system
    // has upper-cased are all the same route.
    expect(parseWidgetLink('stilldo://capture/voice/')).toEqual({
      kind: 'capture',
      how: 'voice',
    });
    expect(parseWidgetLink('STILLDO://NOW')).toEqual({ kind: 'now' });
    expect(parseWidgetLink('stilldo://now?from=lock')).toEqual({ kind: 'now' });
  });

  test('anything it does not recognise routes nowhere', () => {
    // Including a route a later build of the widgets might add: the app opens
    // where it was rather than guessing.
    expect(parseWidgetLink('stilldo://capture/handwriting')).toBeNull();
    expect(parseWidgetLink('stilldo://reminisce')).toBeNull();
    expect(parseWidgetLink('https://stilldo.app/now')).toBeNull();
    expect(parseWidgetLink('stilldo:now')).toBeNull();
    expect(parseWidgetLink(null)).toBeNull();
    expect(parseWidgetLink('')).toBeNull();
  });
});

describe('what the widgets are told', () => {
  const settings: Settings = {
    onboarded: 'yes',
    sweepTime: '21:00',
    appearance: 'System',
  };
  const task = (over: Partial<Task>): Task => ({
    id: 1,
    title: 'Call the dentist back',
    note: 'Reception closes at 17:30.',
    caught: Date.now(),
    status: 'open',
    source: 'Voice',
    from: 'inbox',
    ...over,
  });

  test('"right now" is the first thing still due, as it is on Today', () => {
    const due = [task({ id: 4 }), task({ id: 9, title: 'Bins out' })];
    const snapshot = buildSnapshot({ dueTasks: due, tasks: due, settings });

    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.rightNow).toEqual({
      id: 4,
      title: 'Call the dentist back',
      note: 'Reception closes at 17:30.',
    });
    expect(snapshot.openCount).toBe(2);
    expect(snapshot.sweepTime).toBe('21:00');
  });

  test('nothing due leaves the card empty rather than showing something else', () => {
    const held = [task({ id: 4, deferUntil: '2999-01-01' })];
    const snapshot = buildSnapshot({ dueTasks: [], tasks: held, settings });

    expect(snapshot.rightNow).toBeNull();
    expect(snapshot.openCount).toBe(0);
  });

  test('the tally is counted for a named day, so it can go stale honestly', () => {
    const now = new Date(2026, 7, 24, 9, 0);
    const yesterday = new Date(2026, 7, 23, 22, 0);
    const tasks = [
      task({ id: 1, caught: now.getTime() }),
      task({ id: 2, caught: now.getTime() + 1000 }),
      task({ id: 3, caught: yesterday.getTime() }),
    ];

    const snapshot = buildSnapshot({ dueTasks: tasks, tasks, settings, now });

    expect(snapshot.caughtToday).toBe(2);
    expect(snapshot.caughtDay).toBe(isoDay(now));
  });

  test('a held appearance travels with it, so the widget is not the bright square', () => {
    const shot = (appearance: string) =>
      buildSnapshot({
        dueTasks: [],
        tasks: [],
        settings: { ...settings, appearance },
      }).appearance;

    expect(shot('System')).toBe('system');
    expect(shot('Dark')).toBe('dark');
    expect(shot('Light')).toBe('light');
  });
});

describe('keeping the widgets in step', () => {
  const mountSync = async (first: ReturnType<typeof buildSnapshot> | null) => {
    const Host = ({ s }: { s: ReturnType<typeof buildSnapshot> | null }) => {
      useWidgetSync(s);
      return null;
    };
    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<Host s={first} />);
    });
    return async (next: ReturnType<typeof buildSnapshot> | null) => {
      await act(async () => {
        tree.update(<Host s={next} />);
      });
    };
  };

  const settings: Settings = {
    onboarded: 'yes',
    sweepTime: '21:00',
    appearance: 'System',
  };
  const snapshot = (tasks: Task[]) =>
    buildSnapshot({ dueTasks: tasks, tasks, settings });

  test('nothing is published until the first read has landed', async () => {
    await mountSync(null);
    expect(bridge.publish).not.toHaveBeenCalled();
  });

  test('the payload goes over as JSON the native side can read', async () => {
    await mountSync(snapshot([]));

    expect(bridge.publish).toHaveBeenCalledTimes(1);
    expect(JSON.parse(bridge.publish.mock.calls[0][0])).toEqual(snapshot([]));
  });

  test('a render that changes nothing does not wake the widget host', async () => {
    const rerender = await mountSync(snapshot([]));
    // A fresh object saying exactly what the last one said — which is what
    // most renders produce.
    await rerender(snapshot([]));

    expect(bridge.publish).toHaveBeenCalledTimes(1);
  });

  test('a change does', async () => {
    const rerender = await mountSync(snapshot([]));
    await rerender(snapshot([demoTasks[0]]));

    expect(bridge.publish).toHaveBeenCalledTimes(2);
    expect(JSON.parse(bridge.publish.mock.calls[1][0]).rightNow.title).toBe(
      demoTasks[0].title,
    );
  });

  test('a failed publish is not allowed to wedge the next one', async () => {
    bridge.publish.mockRejectedValueOnce(new Error('no app group'));
    const rerender = await mountSync(snapshot([]));

    // The same payload again, which the dedupe would otherwise swallow — the
    // widget never got it, so it has to be sent.
    await rerender(snapshot([]));
    expect(bridge.publish).toHaveBeenCalledTimes(2);
  });
});

describe('where a widget tap lands', () => {
  async function mountOn(db: SqlDriver) {
    const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
    const Probe = () => {
      ref.current = useStilldo(db);
      return null;
    };
    await act(async () => {
      ReactTestRenderer.create(<Probe />);
    });
    return ref;
  }

  async function mount({ onboarded = 'yes' } = {}) {
    const db = nodeDriver();
    await prepare(db);
    await putSetting(db, 'onboarded', onboarded);
    for (const task of demoTasks) await insertTask(db, task);
    return { ref: await mountOn(db), db };
  }

  test('a capture button opens the inbox with the request outstanding', async () => {
    const { ref } = await mount();
    await act(async () => ref.current.actions.follow({ kind: 'capture', how: 'photo' }));

    expect(ref.current.screen).toBe('inbox');
    expect(ref.current.pendingCapture).toBe('photo');
  });

  test('the inbox takes the request once, and it does not come back', async () => {
    const { ref } = await mount();
    await act(async () => ref.current.actions.follow({ kind: 'capture', how: 'voice' }));
    await act(async () => ref.current.actions.clearCapture());

    expect(ref.current.pendingCapture).toBeNull();
    expect(ref.current.screen).toBe('inbox');
  });

  test('"right now" opens the task the widget was showing', async () => {
    const { ref } = await mount();
    const showing = ref.current.dueTasks[0];

    await act(async () => ref.current.actions.follow({ kind: 'now' }));

    expect(ref.current.screen).toBe('detail');
    expect(ref.current.detail!.id).toBe(showing.id);
    // Back from here belongs on Today, which is where that card lives.
    await act(async () => ref.current.actions.back());
    expect(ref.current.screen).toBe('today');
  });

  test('with nothing due it opens Today rather than an empty detail', async () => {
    const db = nodeDriver();
    await prepare(db);
    await putSetting(db, 'onboarded', 'yes');
    const ref = await mountOn(db);

    await act(async () => ref.current.actions.follow({ kind: 'now' }));

    expect(ref.current.screen).toBe('today');
  });

  test('the sweep link arms a run rather than opening a spent one', async () => {
    const { ref } = await mount();
    await act(async () => ref.current.actions.follow({ kind: 'sweep' }));

    expect(ref.current.screen).toBe('sweep');
    expect(ref.current.sweepQueue).toHaveLength(6);
    expect(ref.current.sweepCard).not.toBeNull();
  });

  test('a cold launch is held until the first read, then routed', async () => {
    const db = nodeDriver();
    await prepare(db);
    await putSetting(db, 'onboarded', 'yes');
    for (const task of demoTasks) await insertTask(db, task);

    const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
    const Probe = ({ live }: { live: SqlDriver | null }) => {
      ref.current = useStilldo(live);
      return null;
    };

    // The URL arrives before the store has anything to route against, which is
    // the ordinary case when the widget is what launched the app.
    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<Probe live={null} />);
    });
    expect(ref.current.ready).toBe(false);

    await act(async () => ref.current.actions.follow({ kind: 'now' }));
    expect(ref.current.screen).toBe('today');

    await act(async () => {
      tree.update(<Probe live={db} />);
    });

    expect(ref.current.ready).toBe(true);
    expect(ref.current.screen).toBe('detail');
    expect(ref.current.detail!.id).toBe(ref.current.dueTasks[0].id);
  });

  test('a widget tapped before the app has ever been opened gets the intro', async () => {
    const { ref } = await mount({ onboarded: 'no' });

    await act(async () => ref.current.actions.follow({ kind: 'capture', how: 'voice' }));

    // The intro owns the whole frame and has its own first thing to do.
    expect(ref.current.pendingCapture).toBeNull();
    expect(ref.current.screen).toBe('today');
  });
});
