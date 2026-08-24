/**
 * Keeps whatever is on the home and lock screens in step with the store.
 *
 * @format
 */

import { useEffect, useRef } from 'react';
import { publishSnapshot } from './native';
import type { WidgetSnapshot } from './snapshot';

/**
 * Publish `snapshot` whenever it differs from the last one published.
 *
 * The comparison is on the serialised payload rather than on identity: the
 * snapshot is rebuilt on every render that touches the task list, and most of
 * those rebuilds say exactly what the previous one said. Waking the widget
 * host for those would be work the system is entitled to start rate-limiting.
 *
 * Pass null while the store is still loading — an empty snapshot published
 * before the first read would blank the widget on every cold start.
 */
export function useWidgetSync(snapshot: WidgetSnapshot | null): void {
  const published = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    const json = JSON.stringify(snapshot);
    if (json === published.current) return;
    published.current = json;

    // A failed publish means a widget that keeps showing what it last had.
    // Nothing is lost and there is nothing the owner could do about it, so it
    // does not get a place in the app's error line the way an unsaved capture
    // or an unschedulable sweep does.
    publishSnapshot(snapshot).catch(() => {
      published.current = null;
    });
  }, [snapshot]);
}
