/**
 * The app's whole state machine — the React Native port of the canvas
 * prototype's DCLogic class.
 *
 * @format
 */

import { useCallback, useMemo, useState } from 'react';
import { seedSettings, seedTasks } from './data';
import type {
  NudgeKey,
  Screen,
  SettingKey,
  Settings,
  Task,
  TaskStatus,
  Verdict,
} from './types';

type State = {
  screen: Screen;
  prev: Screen;
  detailId: number;
  draft: string;
  /**
   * Ids captured when the sweep starts. The prototype re-derived the queue on
   * every render, so resolving a card shrank the list *and* advanced the index
   * — silently skipping the next item. Snapshotting fixes that and keeps the
   * counter and progress bar honest for the length of a run.
   */
  sweepQueue: number[];
  sweepIdx: number;
  sweepLog: Verdict[];
  settings: Settings;
  tasks: Task[];
};

const initial: State = {
  screen: 'today',
  prev: 'today',
  detailId: 2,
  draft: '',
  sweepQueue: [],
  sweepIdx: 0,
  sweepLog: [],
  settings: seedSettings,
  tasks: seedTasks,
};

const isOpen = (t: Task) => t.status === 'open';

export function useStilldo() {
  const [state, setState] = useState<State>(initial);

  const openTasks = useMemo(() => state.tasks.filter(isOpen), [state.tasks]);

  const patch = useCallback((id: number, fields: Partial<Task>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => (t.id === id ? { ...t, ...fields } : t)),
    }));
  }, []);

  const capture = useCallback(
    (title: string, caught: string, note: string) => {
      setState(s => ({
        ...s,
        tasks: s.tasks.concat([
          {
            id: Date.now(),
            title,
            note,
            when: 'No date yet',
            where: 'Anywhere',
            caught,
            slips: 'New',
            nudge: 'gentle',
            status: 'open',
            source: caught,
            from: 'inbox',
          },
        ]),
      }));
    },
    [],
  );

  const startSweep = useCallback(() => {
    setState(s => ({
      ...s,
      screen: 'sweep',
      sweepQueue: s.tasks.filter(isOpen).map(t => t.id),
      sweepIdx: 0,
      sweepLog: [],
    }));
  }, []);

  /** Re-arm a finished (or never-started) run, otherwise resume where it was. */
  const go = useCallback(
    (screen: Screen) => {
      if (screen === 'sweep') {
        setState(s =>
          s.sweepIdx >= s.sweepQueue.length
            ? {
                ...s,
                screen: 'sweep',
                sweepQueue: s.tasks.filter(isOpen).map(t => t.id),
                sweepIdx: 0,
                sweepLog: [],
              }
            : { ...s, screen: 'sweep' },
        );
        return;
      }
      setState(s => ({ ...s, screen }));
    },
    [],
  );

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
    setState(s => {
      const v = s.draft.trim();
      if (!v) return s;
      return {
        ...s,
        draft: '',
        tasks: s.tasks.concat([
          {
            id: Date.now(),
            title: v,
            note: 'Caught and left alone. The sweep will bring it back tonight.',
            when: 'No date yet',
            where: 'Anywhere',
            caught: 'Typed · just now',
            slips: 'New',
            nudge: 'gentle',
            status: 'open',
            source: 'Typed · just now',
            from: 'inbox',
          },
        ]),
      };
    });
  }, []);

  const setNudge = useCallback(
    (id: number, nudge: NudgeKey) => patch(id, { nudge }),
    [patch],
  );

  /** Resolve the detail item and drop back to wherever it was opened from. */
  const resolve = useCallback((id: number, status: TaskStatus) => {
    setState(s => ({
      ...s,
      screen: s.prev,
      tasks: s.tasks.map(t => (t.id === id ? { ...t, status } : t)),
    }));
  }, []);

  const advance = useCallback((verdict: Verdict) => {
    setState(s => {
      const id = s.sweepQueue[s.sweepIdx];
      const status: TaskStatus | null =
        verdict === 'done' ? 'done' : verdict === 'drop' ? 'dropped' : null;
      return {
        ...s,
        sweepIdx: s.sweepIdx + 1,
        sweepLog: s.sweepLog.concat(verdict),
        tasks: status
          ? s.tasks.map(t => (t.id === id ? { ...t, status } : t))
          : s.tasks,
      };
    });
  }, []);

  const cycleSetting = useCallback((key: SettingKey, options: string[]) => {
    setState(s => {
      const i = options.indexOf(s.settings[key]);
      return {
        ...s,
        settings: { ...s.settings, [key]: options[(i + 1) % options.length] },
      };
    });
  }, []);

  const detail = useMemo(
    () => state.tasks.find(t => t.id === state.detailId) || state.tasks[0],
    [state.tasks, state.detailId],
  );

  const sweepCard = useMemo(() => {
    const id = state.sweepQueue[state.sweepIdx];
    return id === undefined ? null : state.tasks.find(t => t.id === id) || null;
  }, [state.sweepQueue, state.sweepIdx, state.tasks]);

  return {
    ...state,
    openTasks,
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
      cycleSetting,
    },
  };
}

export type Stilldo = ReturnType<typeof useStilldo>;
