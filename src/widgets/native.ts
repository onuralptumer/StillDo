/**
 * The bridge to the two widget hosts.
 *
 * Both platforms want the same two things — put this payload somewhere the
 * widget process can read it, then tell the system the widget is stale — so
 * the module is one method on each side.
 *
 * Absent on a build without the native module (and under test), in which case
 * publishing is a no-op rather than a crash: widgets are an extra surface, not
 * something the app depends on to work.
 *
 * @format
 */

import { NativeModules } from 'react-native';
import type { WidgetSnapshot } from './snapshot';

type WidgetsModule = {
  /** Store the JSON where the widgets can read it and refresh them. */
  publish(json: string): Promise<void>;
};

const native: WidgetsModule | undefined = NativeModules.StilldoWidgets;

export const widgetsAvailable = !!native;

export async function publishSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (!native) return;
  await native.publish(JSON.stringify(snapshot));
}
