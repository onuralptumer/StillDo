/**
 * What the home- and lock-screen widgets are allowed to know.
 *
 * A widget is a separate process on both platforms: it cannot open the app's
 * SQLite file, and it is redrawn by the system at moments the app is not
 * running for. So the app hands it a small flat summary instead, and the
 * widget renders only that.
 *
 * Keep this small. It is rewritten on every change to the task list and read
 * on every timeline refresh.
 *
 * @format
 */

import { isoDay } from '../date';
import type { Settings, Task } from '../types';

/**
 * Bumped when the shape below changes. A widget left on the home screen keeps
 * rendering the last payload it was given, which may have been written by an
 * older build of the app — the native side checks this before trusting it.
 */
export const SNAPSHOT_VERSION = 1;

/** Only the fields a widget has room to draw. */
export type WidgetTask = {
  id: number;
  title: string;
  note: string;
};

export type WidgetSnapshot = {
  version: number;
  /** The one task Today calls "Right now", or null when nothing is due. */
  rightNow: WidgetTask | null;
  /**
   * Open and not held for a later day — the same count Today shows.
   *
   * A task held until tomorrow rejoins this count at midnight, which is a
   * moment the app may sleep through. The widget can under-report until the
   * app next runs; it can never over-report, so the number is safe to trust.
   */
  openCount: number;
  caughtToday: number;
  /**
   * The ISO day `caughtToday` counts. Written down because the widget outlives
   * the payload: past midnight the count is not wrong, it is about yesterday,
   * and the widget zeroes it rather than showing a stale tally.
   */
  caughtDay: string;
  sweepTime: string;
  /** 'system' lets the widget follow the phone, as the app's default does. */
  appearance: 'system' | 'dark' | 'light';
};

/**
 * Derive the payload from what the store already holds.
 *
 * `dueTasks` is passed in rather than re-derived here: "what is outstanding"
 * is the store's definition, and a second copy of it would drift.
 */
export function buildSnapshot({
  dueTasks,
  tasks,
  settings,
  now = new Date(),
}: {
  dueTasks: Task[];
  tasks: Task[];
  settings: Settings;
  now?: Date;
}): WidgetSnapshot {
  const today = isoDay(now);
  const first = dueTasks[0];

  return {
    version: SNAPSHOT_VERSION,
    rightNow: first
      ? { id: first.id, title: first.title, note: first.note }
      : null,
    openCount: dueTasks.length,
    caughtToday: tasks.filter(t => isoDay(new Date(t.caught)) === today).length,
    caughtDay: today,
    sweepTime: settings.sweepTime,
    appearance: (settings.appearance.toLowerCase() === 'dark'
      ? 'dark'
      : settings.appearance.toLowerCase() === 'light'
      ? 'light'
      : 'system') as WidgetSnapshot['appearance'],
  };
}
