/**
 * The other half of the widgets: catching the URL one was tapped with.
 *
 * Two ways in, and the app has to handle both — a cold launch, where the URL
 * is waiting as the launch argument, and a tap while the app is already in
 * memory, which arrives as an event.
 *
 * @format
 */

import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { parseWidgetLink, type WidgetLink } from './links';

export function useDeepLink(onLink: (link: WidgetLink) => void): void {
  // Held in a ref so the listeners are installed once, rather than being torn
  // down and rebuilt every time the handler closes over fresher state.
  const handler = useRef(onLink);
  handler.current = onLink;

  useEffect(() => {
    let alive = true;

    const take = (url: string | null | undefined) => {
      const link = parseWidgetLink(url);
      if (link) handler.current(link);
    };

    Linking.getInitialURL()
      .then(url => {
        if (alive) take(url);
      })
      // No launch URL to read is the ordinary case, not a fault.
      .catch(() => {});

    const sub = Linking.addEventListener('url', ({ url }) => take(url));
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
}
