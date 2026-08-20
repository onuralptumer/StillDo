/**
 * The app's whole state machine, backed by SQLite.
 *
 * React state is the read model so the screens stay synchronous; every
 * mutation updates it immediately and writes through to the database. A tap
 * never waits on disk, and nothing is lost when the app is killed.
 *
 * @format
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seedSettings } from './data';
import { isoDay, tomorrow } from './date';
import type { SqlDriver } from './db/driver';
import { allSettings, putSetting } from './db/settings';
import { allTasks, insertTask, updateTask } from './db/tasks';
import type {
  NudgeKey,
  Origin,
  Screen,
  SettingKey,
  Settings,
  Task,
  TaskStatus,
  Verdict,
} from './types';

type State = {
  /** False until the first read of the database has landed. */
  ready: boolean;
  dbError: string | null;
  screen: Screen;
  prev: Screen;
  detailId: number;
  draft: string;
  /**
   * Ids captured when the sweep starts. Re-deriving the queue on every render
   * meant resolving a card shrank the list *and* advanced the cursor, skipping
   * the next item. This is a session cursor, so it is deliberately not stored.
   */
  sweepQueue: number[];
  sweepIdx: number;
  sweepLog: Verdict[];
  settings: Settings;
  tasks: Task[];
};

const initial: State = {
  ready: false,
  dbError: null,
  screen: 'today',
  prev: 'today',
  detailId: 2,
  draft: '',
  sweepQueue: [],
  sweepIdx: 0,
  sweepLog: [],
  settings: seedSettings,
  tasks: [],
};

const isOpen = (t: Task) => t.status === 'open';

/**
 * Open *and* not being held for a later day. Everything that asks "what is
 * outstanding" means this — Today's list and count, and the sweep's queue.
 */
const isDue = (t: Task, today: string) =>
  isOpen(t) && (!t.deferUntil || t.deferUntil <= today);
const reason = (e: unknown) => (e instanceof Error ? e.message : String(e));

const newTask = (
  id: number,
  title: string,
  source: string,
  note: string,
  photoUri?: string,
): Task => ({
  id,
  title,
  note,
  when: 'No date yet',
  caught: Date.now(),
  nudge: 'gentle',
  status: 'open',
  source,
  from: 'inbox' as Origin,
  ...(photoUri ? { photoUri } : {}),
});

export function useStilldo(db: SqlDriver | null) {
  const [state, setState] = useState<State>(initial);

  const dbRef = useRef(db);
  dbRef.current = db;

  // A mirror of the latest state, so the actions can read it without doing
  // their persistence inside a setState updater.
  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Ids come from a counter seeded past whatever the database already holds.
   * Date.now() looked fine until two captures landed in the same millisecond
   * and collided on the primary key.
   */
  const nextId = useRef(1);
  const takeId = useCallback(() => nextId.current++, []);

  /** Fire-and-forget persistence; a failure surfaces rather than vanishing. */
  const write = useCallback((run: (d: SqlDriver) => Promise<void>) => {
    const d = dbRef.current;
    if (!d) return;
    run(d).catch(e => setState(s => ({ ...s, dbError: reason(e) })));
  }, []);

  useEffect(() => {
    if (!db) return;
    let live = true;
    (async () => {
      try {
        const [tasks, settings] = await Promise.all([
          allTasks(db),
          allSettings(db),
        ]);
        if (!live) return;
        nextId.current = tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
        setState(s => ({ ...s, tasks, settings, ready: true }));
      } catch (e) {
        if (live) setState(s => ({ ...s, ready: true, dbError: reason(e) }));
      }
    })();
    return () => {
      live = false;
    };
  }, [db]);

  const today = isoDay();
  const dueTasks = useMemo(
    () => state.tasks.filter(t => isDue(t, today)),
    [state.tasks, today],
  );
  /** Held for a later day: gone from today, but not gone. */
  const deferredTasks = useMemo(
    () => state.tasks.filter(t => isOpen(t) && !!t.deferUntil && t.deferUntil > today),
    [state.tasks, today],
  );

  const patch = useCallback(
    (id: number, fields: Partial<Task>) => {
      setState(s => ({
        ...s,
        tasks: s.tasks.map(t => (t.id === id ? { ...t, ...fields } : t)),
      }));
      write(d => updateTask(d, id, fields));
    },
    [write],
  );

  const add = useCallback(
    (task: Task) => {
      setState(s => ({ ...s, tasks: s.tasks.concat([task]) }));
      write(d => insertTask(d, task));
    },
    [write],
  );

  const capture = useCallback(
    (title: string, source: string, note: string, photoUri?: string) =>
      add(newTask(takeId(), title, source, note, photoUri)),
    [add, takeId],
  );

  const startSweep = useCallback(() => {
    setState(s => ({
      ...s,
      screen: 'sweep',
      sweepQueue: s.tasks.filter(t => isDue(t, today)).map(t => t.id),
      sweepIdx: 0,
      sweepLog: [],
    }));
  }, [today]);

  /** Re-arm a finished (or never-started) run, otherwise resume where it was. */
  const go = useCallback((screen: Screen) => {
    if (screen === 'sweep') {
      setState(s =>
        s.sweepIdx >= s.sweepQueue.length
          ? {
              ...s,
              screen: 'sweep',
              sweepQueue: s.tasks.filter(t => isDue(t, today)).map(t => t.id),
              sweepIdx: 0,
              sweepLog: [],
            }
          : { ...s, screen: 'sweep' },
      );
      return;
    }
    setState(s => ({ ...s, screen }));
  }, [today]);

  const open = useCallback((id: number) => {
    setState(s => ({ ...s, screen: 'detail', prev: s.screen, detailId: id }));
  }, []);

  const back = useCallback(() => {
    setState(s => ({ ...s, screen: s.prev }));
  }, []);

  const setDraft = useCallback((draft: string) => {
    setState(s => ({ ...s, draft }));
  }, []);

  const addFromDraft = useCallback(() => {
    const v = stateRef.current.draft.trim();
    if (!v) return;
    add(
      newTask(
        takeId(),
        v,
        'Typed',
        'Caught and left alone. The sweep will bring it back tonight.',
      ),
    );
    setState(s => ({ ...s, draft: '' }));
  }, [add, takeId]);

  const setNudge = useCallback(
    (id: number, nudge: NudgeKey) => patch(id, { nudge }),
    [patch],
  );

  /** Resolve the detail item and drop back to wherever it was opened from. */
  const resolve = useCallback(
    (id: number, status: TaskStatus) => {
      setState(s => ({ ...s, screen: s.prev }));
      patch(id, { status });
    },
    [patch],
  );

  const advance = useCallback(
    (verdict: Verdict) => {
      const { sweepQueue, sweepIdx } = stateRef.current;
      const id = sweepQueue[sweepIdx];

      setState(s => ({
        ...s,
        sweepIdx: s.sweepIdx + 1,
        sweepLog: s.sweepLog.concat(verdict),
      }));
      if (id === undefined) return;

      // "Move to tomorrow" holds the task rather than resolving it: it stays
      // open, but drops out of today and out of any further sweep until then.
      if (verdict === 'later') patch(id, { deferUntil: tomorrow() });
      else patch(id, { status: verdict === 'done' ? 'done' : 'dropped' });
    },
    [patch],
  );

  const setSetting = useCallback(
    (key: SettingKey, value: string) => {
      setState(s => ({ ...s, settings: { ...s.settings, [key]: value } }));
      write(d => putSetting(d, key, value));
    },
    [write],
  );

  const cycleSetting = useCallback(
    (key: SettingKey, options: string[]) => {
      const current = stateRef.current.settings[key];
      setSetting(key, options[(options.indexOf(current) + 1) % options.length]);
    },
    [setSetting],
  );

  const finishOnboarding = useCallback(
    () => setSetting('onboarded', 'yes'),
    [setSetting],
  );

  const detail = useMemo(
    () => state.tasks.find(t => t.id === state.detailId),
    [state.tasks, state.detailId],
  );

  const sweepCard = useMemo(() => {
    const id = state.sweepQueue[state.sweepIdx];
    return id === undefined ? null : state.tasks.find(t => t.id === id) || null;
  }, [state.sweepQueue, state.sweepIdx, state.tasks]);

  return {
    ...state,
    dueTasks,
    deferredTasks,
    detail,
    sweepCard,
    sweepTotal: state.sweepQueue.length,
    actions: {
      go,
      open,
      back,
      startSweep,
      setDraft,
      addFromDraft,
      capture,
      setNudge,
      resolve,
      advance,
      setSetting,
      cycleSetting,
      finishOnboarding,
    },
  };
}

export type Stilldo = ReturnType<typeof useStilldo>;
