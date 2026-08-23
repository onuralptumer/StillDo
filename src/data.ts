/**
 * Fixed content: the app's default settings and the copy for the controls that
 * present them. No task data — the app starts with an empty database.
 *
 * @format
 */

import type { SettingKey, Settings } from './types';

export const seedSettings: Settings = {
  onboarded: 'no',
  sweepTime: '21:00',
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
 *
 * Settings only lists what the app actually does. Earlier builds also offered
 * auto-resurface, a voice, quiet hours, place triggers and a weekly look-back;
 * every one of them stored a value that nothing ever read, so a promise was
 * being made here that no code kept.
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
