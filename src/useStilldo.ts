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
import { clearAll } from './db/reset';
import { allSettings, putSetting } from './db/settings';
import { allTasks, insertTask, updateTask } from './db/tasks';
import type {
  Origin,
  Screen,
  SettingKey,
  Settings,
  Task,
  TaskStatus,
  Verdict,
} from './types';
import type { CaptureKind, WidgetLink } from './widgets/links';

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
  /**
   * A capture a widget asked for, waiting for the Inbox to reach the hardware
   * for it. The screen that owns the microphone and the camera is the one that
   * can start them, so the request is parked here until it renders.
   */
  pendingCapture: CaptureKind | null;
  /**
   * A widget tap that arrived before the first read landed. Routing it then
   * would have nothing to route against — the "right now" task is not known
   * yet — so it waits here for one.
   */
  pendingLink: WidgetLink | null;
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
  pendingCapture: null,
  pendingLink: null,
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
  caught: Date.now(),
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

  /**
   * Where a widget tap lands.
   *
   * A capture request only gets as far as the Inbox: the microphone and the
   * camera belong to that screen, and it starts them once it is on.
   */
  const apply = useCallback(
    (link: WidgetLink) => {
      // The intro owns the whole frame and has its own first thing to do. A
      // widget tapped before the app has ever been opened is answered by the
      // intro, not by the camera coming up behind it.
      if (stateRef.current.settings.onboarded !== 'yes') return;

      if (link.kind === 'capture') {
        setState(s => ({ ...s, screen: 'inbox', pendingCapture: link.how }));
        return;
      }
      if (link.kind === 'sweep') {
        startSweep();
        return;
      }
      // 'now' — the task the widget was showing, which is the first thing
      // still due. Back from here goes to Today rather than to wherever the
      // app happened to be left, because Today is where that card lives.
      const first = stateRef.current.tasks.filter(t => isDue(t, today))[0];
      setState(s =>
        first
          ? { ...s, screen: 'detail', prev: 'today', detailId: first.id }
          : { ...s, screen: 'today' },
      );
    },
    [startSweep, today],
  );

  /**
   * Follow a widget's URL. Held until the first read has landed — routing
   * "right now" against an empty task list would send every cold launch from
   * that widget to an empty Today instead of to the task it was showing.
   */
  const follow = useCallback(
    (link: WidgetLink) => {
      if (!stateRef.current.ready) {
        setState(s => ({ ...s, pendingLink: link }));
        return;
      }
      apply(link);
    },
    [apply],
  );

  useEffect(() => {
    if (!state.ready || !state.pendingLink) return;
    const link = state.pendingLink;
    setState(s => ({ ...s, pendingLink: null }));
    apply(link);
  }, [state.ready, state.pendingLink, apply]);

  /** The Inbox has taken the request; it is no longer outstanding. */
  const clearCapture = useCallback(() => {
    setState(s => (s.pendingCapture ? { ...s, pendingCapture: null } : s));
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

  /**
   * Empty the store: every capture gone, every setting back to its default.
   *
   * `onboarded` is carried across rather than reset. Clearing your data is not
   * a request to sit through the intro again, and the screen that offers this
   * is one you can only reach by having been through it already.
   *
   * The sweep in progress goes too — its queue is a list of ids that no longer
   * exist — and the id counter starts over, which is safe now the table it was
   * seeded past is empty.
   */
  const clearData = useCallback(() => {
    const settings: Settings = {
      ...seedSettings,
      onboarded: stateRef.current.settings.onboarded,
    };
    nextId.current = 1;
    setState(s => ({
      ...s,
      tasks: [],
      settings,
      draft: '',
      sweepQueue: [],
      sweepIdx: 0,
      sweepLog: [],
      dbError: null,
    }));
    write(d => clearAll(d, settings));
  }, [write]);

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
      follow,
      clearCapture,
      startSweep,
      setDraft,
      addFromDraft,
      capture,
      resolve,
      advance,
      setSetting,
      cycleSetting,
      finishOnboarding,
      clearData,
    },
  };
}

export type Stilldo = ReturnType<typeof useStilldo>;
