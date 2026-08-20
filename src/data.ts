/**
 * Fixed content: the app's default settings and the copy for the controls that
 * present them. No task data — the app starts with an empty database.
 *
 * @format
 */

import type { NudgeKey, SettingKey, Settings } from './types';

export const seedSettings: Settings = {
  onboarded: 'no',
  sweepTime: '21:00',
  autoResurface: 'On',
  tone: 'Warm',
  silentHours: 'On',
  location: 'On',
  weeklyReview: 'Sun',
  appearance: 'System',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Every half hour of the day, 00:00 through 23:30. */
export const sweepTimes = Array.from({ length: 48 }, (_, i) =>
  `${pad2(Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`,
);

/**
 * The three offered during onboarding. Picking a sweep time should not mean
 * reading a list of forty-eight before you have used the app once; Settings
 * has the full set.
 */
export const sweepTimePresets = ['19:30', '21:00', '22:30'];

export const nudgeOptions: {key: NudgeKey; label: string; desc: string}[] = [
  {
    key: 'gentle',
    label: 'Gentle',
    desc: 'One quiet nudge, then it waits for the sweep.',
  },
  {
    key: 'insistent',
    label: 'Insistent',
    desc: 'Comes back every hour until you answer it.',
  },
  {
    key: 'alarm',
    label: 'Alarm',
    desc: 'Full sound and a lock-screen takeover. For the ones that cost you.',
  },
];

/** A row on the Settings screen. */
export type SettingDef = {
  key: SettingKey;
  label: string;
  desc: string;
  options: string[];
  /** Too many options to tap through — opens a picker instead of cycling. */
  pick?: boolean;
};

/**
 * The rows the Settings screen shows, in order. `onboarded` is deliberately
 * not among them.
 */
export const settingDefs: SettingDef[] = [
  {
    key: 'sweepTime',
    label: 'Sweep at',
    desc: 'When the day gets reconstructed for you.',
    options: sweepTimes,
    pick: true,
  },
  {
    key: 'autoResurface',
    label: 'Auto-resurface',
    desc: 'Anything untouched for two days comes back on its own.',
    options: ['On', 'Off'],
  },
  {
    key: 'tone',
    label: 'Voice',
    desc: 'How the app talks to you when you have missed things.',
    options: ['Warm', 'Plain', 'Blunt'],
  },
  {
    key: 'silentHours',
    label: 'Quiet after 22:30',
    desc: 'Nudges hold until morning. The sweep still runs.',
    options: ['On', 'Off'],
  },
  {
    key: 'location',
    label: 'Place triggers',
    desc: 'Home and desk items surface when you arrive.',
    options: ['On', 'Off'],
  },
  {
    key: 'weeklyReview',
    label: 'Weekly look-back',
    desc: 'A longer sweep for what fell through the whole week.',
    options: ['Sun', 'Fri', 'Off'],
  },
  {
    key: 'appearance',
    label: 'Appearance',
    desc: 'Follow the phone, or hold it dark or light.',
    options: ['System', 'Dark', 'Light'],
  },
];

export const tabs: [string, string][] = [
  ['today', 'Today'],
  ['inbox', 'Inbox'],
  ['sweep', 'Sweep'],
  ['settings', 'Settings'],
];
