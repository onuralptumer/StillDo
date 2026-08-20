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

/** The sweep times offered during onboarding, and in Settings afterwards. */
export const sweepTimes = ['21:00', '19:30', '22:30'];

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

/**
 * The rows the Settings screen shows: key, label, description, and the values
 * it cycles through on tap. `onboarded` is deliberately not among them.
 */
export const settingDefs: [SettingKey, string, string, string[]][] = [
  ['sweepTime', 'Sweep at', 'When the day gets reconstructed for you.', sweepTimes],
  [
    'autoResurface',
    'Auto-resurface',
    'Anything untouched for two days comes back on its own.',
    ['On', 'Off'],
  ],
  [
    'tone',
    'Voice',
    'How the app talks to you when you have missed things.',
    ['Warm', 'Plain', 'Blunt'],
  ],
  [
    'silentHours',
    'Quiet after 22:30',
    'Nudges hold until morning. The sweep still runs.',
    ['On', 'Off'],
  ],
  [
    'location',
    'Place triggers',
    'Home and desk items surface when you arrive.',
    ['On', 'Off'],
  ],
  [
    'weeklyReview',
    'Weekly look-back',
    'A longer sweep for what fell through the whole week.',
    ['Sun', 'Fri', 'Off'],
  ],
  [
    'appearance',
    'Appearance',
    'Follow the phone, or hold it dark or light.',
    ['System', 'Dark', 'Light'],
  ],
];

export const tabs: [string, string][] = [
  ['today', 'Today'],
  ['inbox', 'Inbox'],
  ['sweep', 'Sweep'],
  ['settings', 'Settings'],
];
