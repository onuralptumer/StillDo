/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { nodeDriver } from '../testing/nodeDriver';
import { prepare } from '../src/db/schema';
import { insertTask } from '../src/db/tasks';
import { demoTasks } from '../testing/fixtures';
import type { SqlDriver } from '../src/db/driver';
import { useStilldo, type Stilldo } from '../src/useStilldo';
import { tomorrow } from '../src/date';

const act = ReactTestRenderer.act;

/** Mount the store over a real SQLite database and wait for the first read. */
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

/** An empty database, which is what a real first run now produces. */
async function mountEmpty() {
  const db = nodeDriver();
  await prepare(db);
  return { ref: await mountOn(db), db };
}

/** ...plus content, for the behaviour that needs tasks to act on. */
async function mount() {
  const db = nodeDriver();
  await prepare(db);
  for (const task of demoTasks) await insertTask(db, task);
  return { ref: await mountOn(db), db };
}

test('a first run opens with nothing in it', async () => {
  const { ref } = await mountEmpty();
  expect(ref.current.ready).toBe(true);
  expect(ref.current.dbError).toBeNull();
  expect(ref.current.tasks).toEqual([]);
  expect(ref.current.dueTasks).toEqual([]);
  // Nothing to show a detail for, and nothing to sweep.
  expect(ref.current.detail).toBeUndefined();
  expect(ref.current.sweepCard).toBeNull();
});

test('the first capture into an empty store gets a usable id', async () => {
  const { ref, db } = await mountEmpty();
  await act(async () => ref.current.actions.capture('First ever', 'Typed', 'n'));

  expect(ref.current.tasks).toHaveLength(1);
  expect(ref.current.tasks[0].id).toBeGreaterThan(0);
  expect(ref.current.dbError).toBeNull();

  const reopened = await mountOn(db);
  expect(reopened.current.tasks.map(t => t.title)).toEqual(['First ever']);
});

test('the store opens on what the database holds', async () => {
  const { ref } = await mount();
  expect(ref.current.ready).toBe(true);
  expect(ref.current.dbError).toBeNull();
  expect(ref.current.dueTasks).toHaveLength(6);
  expect(ref.current.tasks.filter(t => t.status === 'done')).toHaveLength(1);
});

test('the sweep visits every open task exactly once', async () => {
  const { ref } = await mount();
  await act(async () => ref.current.actions.startSweep());

  const queued = [...ref.current.sweepQueue];
  expect(queued).toHaveLength(6);

  const seen: number[] = [];
  // Resolve every card as done — the case that used to make the queue shrink
  // underneath the cursor and skip the following task.
  for (let i = 0; i < queued.length; i++) {
    expect(ref.current.sweepCard).not.toBeNull();
    seen.push(ref.current.sweepCard!.id);
    await act(async () => ref.current.actions.advance('done'));
  }

  expect(seen).toEqual(queued);
  expect(ref.current.sweepCard).toBeNull();
  expect(ref.current.dueTasks).toHaveLength(0);
});

test('"move to tomorrow" holds the task instead of resolving it', async () => {
  const { ref, db } = await mount();
  await act(async () => ref.current.actions.startSweep());
  const id = ref.current.sweepCard!.id;
  const before = ref.current.dueTasks.length;

  await act(async () => ref.current.actions.advance('later'));

  const task = ref.current.tasks.find(t => t.id === id)!;
  expect(task.status).toBe('open');
  expect(task.deferUntil).toBe(tomorrow());
  expect(ref.current.sweepCard!.id).not.toBe(id);

  // The point of the button: it leaves today.
  expect(ref.current.dueTasks.map(t => t.id)).not.toContain(id);
  expect(ref.current.dueTasks).toHaveLength(before - 1);
  expect(ref.current.deferredTasks.map(t => t.id)).toEqual([id]);

  const reopened = await mountOn(db);
  expect(reopened.current.dueTasks.map(t => t.id)).not.toContain(id);
  expect(reopened.current.tasks.find(t => t.id === id)!.deferUntil).toBe(
    tomorrow(),
  );
});

test('a task held for tomorrow is not offered by a later sweep today', async () => {
  const { ref } = await mount();
  await act(async () => ref.current.actions.startSweep());
  const id = ref.current.sweepCard!.id;
  await act(async () => ref.current.actions.advance('later'));

  // Abandon the run and start a fresh one, still on the same day.
  await act(async () => ref.current.actions.go('today'));
  await act(async () => ref.current.actions.startSweep());

  expect(ref.current.sweepQueue).not.toContain(id);
});

test('a task held for tomorrow comes back when tomorrow arrives', async () => {
  const { ref, db } = await mount();
  await act(async () => ref.current.actions.startSweep());
  const id = ref.current.sweepCard!.id;
  await act(async () => ref.current.actions.advance('later'));

  // Reopen the store with the clock a day on.
  const clock = jest
    .spyOn(Date, 'now')
    .mockReturnValue(Date.now() + 24 * 60 * 60 * 1000);
  try {
    const nextDay = await mountOn(db);
    expect(nextDay.current.dueTasks.map(t => t.id)).toContain(id);
    expect(nextDay.current.deferredTasks).toEqual([]);
  } finally {
    clock.mockRestore();
  }
});

test('revisiting the sweep tab re-arms a finished run but resumes a live one', async () => {
  const { ref } = await mount();
  await act(async () => ref.current.actions.startSweep());
  await act(async () => ref.current.actions.advance('done'));

  await act(async () => ref.current.actions.go('today'));
  await act(async () => ref.current.actions.go('sweep'));
  expect(ref.current.sweepIdx).toBe(1);

  while (ref.current.sweepCard) {
    await act(async () => ref.current.actions.advance('drop'));
  }
  await act(async () => ref.current.actions.go('sweep'));
  expect(ref.current.sweepIdx).toBe(0);
  expect(ref.current.sweepQueue).toHaveLength(0);
});

test('captures land in the inbox and typing clears the draft', async () => {
  const { ref } = await mount();
  const before = ref.current.tasks.length;

  await act(async () => ref.current.actions.setDraft('  RING THE VET  '));
  await act(async () => ref.current.actions.addFromDraft());

  expect(ref.current.tasks).toHaveLength(before + 1);
  const added = ref.current.tasks[ref.current.tasks.length - 1];
  expect(added.title).toBe('RING THE VET');
  expect(added.from).toBe('inbox');
  expect(ref.current.draft).toBe('');
});

test('an empty draft captures nothing', async () => {
  const { ref } = await mount();
  const before = ref.current.tasks.length;
  await act(async () => ref.current.actions.setDraft('   '));
  await act(async () => ref.current.actions.addFromDraft());
  expect(ref.current.tasks).toHaveLength(before);
});

test('resolving from the detail screen returns to where it was opened', async () => {
  const { ref } = await mount();
  await act(async () => ref.current.actions.go('inbox'));
  await act(async () => ref.current.actions.open(7));
  expect(ref.current.screen).toBe('detail');

  await act(async () => ref.current.actions.resolve(7, 'dropped'));
  expect(ref.current.screen).toBe('inbox');
  expect(ref.current.tasks.find(t => t.id === 7)!.status).toBe('dropped');
});

test('settings cycle through their options and wrap', async () => {
  const { ref } = await mount();
  const opts = ['21:00', '19:30', '22:30'];
  expect(ref.current.settings.sweepTime).toBe('21:00');
  for (const expected of ['19:30', '22:30', '21:00']) {
    await act(async () => ref.current.actions.cycleSetting('sweepTime', opts));
    expect(ref.current.settings.sweepTime).toBe(expected);
  }
});

describe('what survives being killed and reopened', () => {
  test('a capture, a resolution, a nudge and a setting all persist', async () => {
    const { ref, db } = await mount();

    await act(async () => ref.current.actions.setDraft('RING THE VET'));
    await act(async () => ref.current.actions.addFromDraft());
    await act(async () => ref.current.actions.resolve(1, 'done'));
    await act(async () => ref.current.actions.setNudge(2, 'alarm'));
    await act(async () =>
      ref.current.actions.cycleSetting('sweepTime', ['21:00', '19:30']),
    );
    await act(async () =>
      ref.current.actions.capture('Photo · 22:31', 'Photo', 'n', 'file:///r.jpg'),
    );

    // Reopen the store over the same database, as a cold launch would.
    const reopened = await mountOn(db);

    expect(reopened.current.tasks.map(t => t.title)).toContain('RING THE VET');
    expect(reopened.current.tasks.find(t => t.id === 1)!.status).toBe('done');
    expect(reopened.current.tasks.find(t => t.id === 2)!.nudge).toBe('alarm');
    expect(reopened.current.settings.sweepTime).toBe('19:30');
    expect(
      reopened.current.tasks.find(t => t.title === 'Photo · 22:31')!.photoUri,
    ).toBe('file:///r.jpg');
  });

  test('a sweep resolves its cards in the database, not just on screen', async () => {
    const { ref, db } = await mount();
    await act(async () => ref.current.actions.startSweep());
    const first = ref.current.sweepCard!.id;
    const second = ref.current.sweepQueue[1];

    await act(async () => ref.current.actions.advance('done'));
    await act(async () => ref.current.actions.advance('drop'));

    const reopened = await mountOn(db);
    expect(reopened.current.tasks.find(t => t.id === first)!.status).toBe('done');
    expect(reopened.current.tasks.find(t => t.id === second)!.status).toBe(
      'dropped',
    );
    // The sweep cursor itself is a session, so a cold launch starts over.
    expect(reopened.current.sweepQueue).toHaveLength(0);
  });

  test('two captures in the same millisecond both survive', async () => {
    const { ref, db } = await mount();
    const before = ref.current.tasks.length;
    // Date.now() ids collided here and the second INSERT hit the primary key.
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    try {
      await act(async () => ref.current.actions.capture('First', 'Voice', 'a'));
      await act(async () => ref.current.actions.capture('Second', 'Voice', 'b'));
    } finally {
      now.mockRestore();
    }

    const ids = ref.current.tasks.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ref.current.dbError).toBeNull();

    const reopened = await mountOn(db);
    expect(reopened.current.tasks).toHaveLength(before + 2);
    expect(reopened.current.tasks.map(t => t.title)).toEqual(
      expect.arrayContaining(['First', 'Second']),
    );
  });

  test('a failed write surfaces instead of vanishing', async () => {
    const { ref, db } = await mount();
    jest
      .spyOn(db, 'execute')
      .mockRejectedValueOnce(new Error('database is locked'));

    await act(async () => ref.current.actions.setNudge(3, 'alarm'));

    expect(ref.current.dbError).toBe('database is locked');
  });
});
