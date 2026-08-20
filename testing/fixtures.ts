/**
 * The design canvas's demo content. It is fixture data for the tests only —
 * the app itself ships with an empty database.
 *
 * @format
 */

import type { Task } from '../src/types';

/** A fixed instant, so the fixtures are deterministic. */
const BASE = 1755000000000;
const MINUTE = 60_000;

export const demoTasks: Task[] = [
  {
    id: 1,
    title: 'Call the dentist back',
    note: 'They rang at 11:20 while you were on the other call. Reception closes at 17:30.',
    caught: BASE + 7 * MINUTE,
    nudge: 'insistent',
    status: 'open',
    source: 'Missed call · 11:20',
    from: 'today',
  },
  {
    id: 2,
    title: 'Passport form — page 3',
    note: 'You opened it Saturday, got to the signature box, and put it down to find a pen.',
    caught: BASE + 14 * MINUTE,
    nudge: 'gentle',
    status: 'open',
    source: 'Half-finished Saturday',
    from: 'today',
  },
  {
    id: 3,
    title: 'Bins out before 07:00',
    note: 'Recycling week. Last time this one got you at 06:58.',
    caught: BASE + 21 * MINUTE,
    nudge: 'alarm',
    status: 'open',
    source: 'Recurring · Tuesdays',
    from: 'today',
  },
  {
    id: 4,
    title: 'Reply to Priya about the invoice',
    note: "You read it, thought 'two minutes', and the app switched.",
    caught: BASE + 28 * MINUTE,
    nudge: 'gentle',
    status: 'done',
    source: 'Opened but not answered',
    from: 'today',
  },
  {
    id: 5,
    title: 'Book the car in for its service',
    note: 'Mentioned twice this week. No date set.',
    caught: BASE + 35 * MINUTE,
    nudge: 'gentle',
    status: 'open',
    source: 'Said out loud twice',
    from: 'inbox',
  },
  {
    id: 6,
    title: 'That thing about the loft hatch',
    note: 'Half a thought, caught mid-sentence. The sweep will ask you what you meant.',
    caught: BASE + 42 * MINUTE,
    nudge: 'gentle',
    status: 'open',
    source: 'Fragment',
    from: 'inbox',
  },
  {
    id: 7,
    title: 'Chase the parcel refund',
    note: 'Fourteen days since the claim. They said seven.',
    caught: BASE + 49 * MINUTE,
    nudge: 'insistent',
    status: 'open',
    source: 'Aging in the inbox',
    from: 'inbox',
  },
];
