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
  where: string;
  caught: string;
  slips: string;
  nudge: NudgeKey;
  status: TaskStatus;
  source: string;
  from: Origin;
};

export type Screen = 'today' | 'inbox' | 'detail' | 'sweep' | 'settings';

export type Verdict = 'done' | 'later' | 'drop';

export type SettingKey =
  | 'sweepTime'
  | 'autoResurface'
  | 'tone'
  | 'silentHours'
  | 'location'
  | 'weeklyReview'
  | 'appearance';

export type Settings = Record<SettingKey, string>;
