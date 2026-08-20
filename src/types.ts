/**
 * @format
 */

export type NudgeKey = 'gentle' | 'insistent' | 'alarm';
export type TaskStatus = 'open' | 'done' | 'dropped';
export type Origin = 'today' | 'inbox';

export type Task = {
  id: number;
  title: string;
  note: string;
  when: string;
  /** Epoch milliseconds: the moment this was captured. */
  caught: number;
  nudge: NudgeKey;
  status: TaskStatus;
  source: string;
  from: Origin;
  /** Local file URI of an attached photo, for captures made with "Snap it". */
  photoUri?: string;
  /**
   * ISO date ('YYYY-MM-DD') this task is held until — set by "move to
   * tomorrow" in the sweep. Absent means it is live now.
   */
  deferUntil?: string;
};

export type Screen = 'today' | 'inbox' | 'detail' | 'sweep' | 'settings';

export type Verdict = 'done' | 'later' | 'drop';

export type SettingKey =
  /** Not shown in Settings: whether the intro has been through once. */
  | 'onboarded'
  | 'sweepTime'
  | 'autoResurface'
  | 'tone'
  | 'silentHours'
  | 'location'
  | 'weeklyReview'
  | 'appearance';

export type Settings = Record<SettingKey, string>;
