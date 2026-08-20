/**
 * Seed content, verbatim from the canvas prototype.
 *
 * @format
 */

import type { NudgeKey, SettingKey, Settings, Task } from './types';

export const seedTasks: Task[] = [
  {
    id: 1,
    title: 'Call the dentist back',
    note: 'They rang at 11:20 while you were on the other call. Reception closes at 17:30.',
    when: 'Before 17:30',
    where: 'Anywhere',
    caught: 'Mon 11:22 · voice',
    slips: '3 days running',
    nudge: 'insistent',
    status: 'open',
    source: 'Missed call · 11:20',
    from: 'today',
  },
  {
    id: 2,
    title: 'Passport form — page 3',
    note: 'You opened it Saturday, got to the signature box, and put it down to find a pen.',
    when: 'This week',
    where: 'Desk',
    caught: 'Sat 15:04 · photo',
    slips: '6 days running',
    nudge: 'gentle',
    status: 'open',
    source: 'Half-finished Saturday',
    from: 'today',
  },
  {
    id: 3,
    title: 'Bins out before 07:00',
    note: 'Recycling week. Last time this one got you at 06:58.',
    when: 'Tonight',
    where: 'Home',
    caught: 'Repeats weekly',
    slips: 'Missed twice',
    nudge: 'alarm',
    status: 'open',
    source: 'Recurring · Tuesdays',
    from: 'today',
  },
  {
    id: 4,
    title: 'Reply to Priya about the invoice',
    note: "You read it, thought 'two minutes', and the app switched.",
    when: 'Today',
    where: 'Anywhere',
    caught: 'Today 09:12 · share sheet',
    slips: 'Read, not answered',
    nudge: 'gentle',
    status: 'done',
    source: 'Opened but not answered',
    from: 'today',
  },
  {
    id: 5,
    title: 'Book the car in for its service',
    note: 'Mentioned twice this week. No date set.',
    when: 'No date yet',
    where: 'Anywhere',
    caught: 'Today 08:40 · voice',
    slips: 'New',
    nudge: 'gentle',
    status: 'open',
    source: 'Said out loud twice',
    from: 'inbox',
  },
  {
    id: 6,
    title: 'That thing about the loft hatch',
    note: 'Half a thought, caught mid-sentence. The sweep will ask you what you meant.',
    when: 'Unclear',
    where: 'Home',
    caught: 'Today 13:05 · voice',
    slips: 'New',
    nudge: 'gentle',
    status: 'open',
    source: 'Fragment',
    from: 'inbox',
  },
  {
    id: 7,
    title: 'Chase the parcel refund',
    note: 'Fourteen days since the claim. They said seven.',
    when: 'Overdue',
    where: 'Anywhere',
    caught: 'Fri 18:31 · typed',
    slips: '9 days running',
    nudge: 'insistent',
    status: 'open',
    source: 'Aging in the inbox',
    from: 'inbox',
  },
];

export const seedSettings: Settings = {
  sweepTime: '21:00',
  autoResurface: 'On',
  tone: 'Warm',
  silentHours: 'On',
  location: 'On',
  weeklyReview: 'Sun',
  appearance: 'System',
};

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

/** key, label, description, the values it cycles through on tap. */
export const settingDefs: [SettingKey, string, string, string[]][] = [
  [
    'sweepTime',
    'Sweep at',
    'When the day gets reconstructed for you.',
    ['21:00', '19:30', '22:30'],
  ],
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
