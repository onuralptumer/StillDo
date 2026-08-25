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

/** One titled paragraph of the guide. */
export type GuideSection = { title: string; body: string };

/**
 * The app guide, shown from Settings.
 *
 * It describes what the app already does, in the order you meet it — catching,
 * the day, the sweep, and where any of it lives. Like `settingDefs`, it only
 * claims what the code keeps: nothing here should describe a feature the app
 * does not have.
 */
export const appGuide: GuideSection[] = [
  {
    title: 'Catching',
    body: 'Anything you might forget goes into the Inbox, and it is meant to go in badly. Type half a sentence, hold the button and say it out loud, or snap a photo of the letter, the shelf, the note on the fridge. There is nothing to date, tag or file — the point is to get it out of your head in one move and carry on with whatever you were doing.',
  },
  {
    title: 'Today',
    body: 'Today is everything still open, oldest first, with the one at the top treated as the thing in front of you. Open a card to read what you caught and how you caught it, and mark it done or let it go from there. Nothing on this screen expires, moves itself, or nags you — it simply keeps holding what you gave it.',
  },
  {
    title: 'The sweep',
    body: 'Once a day, at the time you have set, the phone asks you to go back over the day. The sweep hands you what is still open one card at a time, and each one takes a single answer: you did it, you are moving it to tomorrow, or you are letting it go. Tomorrow’s cards drop out of Today until then. When the last card is answered the day is closed — that is the whole ritual, and it is usually over in a minute.',
  },
  {
    title: 'On this phone',
    body: 'Everything lives in one file inside the app: your captures, your photos and your settings. There is no account, no sync and no server, so nothing you catch leaves the device, and the widgets on the home and lock screens are fed from that same local file. It also means nothing is backed up anywhere else — clearing the data from here, or deleting the app, takes it with it.',
  },
];

/**
 * The three places the app actually is. Settings is not among them — it is an
 * aside, and reaches for the gear in the header instead.
 */
export const tabs: [string, string][] = [
  ['today', 'Today'],
  ['inbox', 'Inbox'],
  ['sweep', 'Sweep'],
];
