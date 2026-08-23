/**
 * Keeps the scheduled sweep notification in step with the chosen time.
 *
 * The permission switch lives in system settings, where it can be turned off
 * behind the app's back, so the answer is re-read every time the app comes
 * back to the foreground rather than trusted from launch.
 *
 * @format
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  cancelSweep,
  openSweepSettings,
  requestSweepPermission,
  scheduleSweep,
  sweepPermitted,
} from './notify';

export type SweepAlarm = {
  /** Null until the first answer lands; false means the sweep cannot reach you. */
  permitted: boolean | null;
  error: string | null;
  openSettings: () => void;
};

const reason = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function useSweepAlarm(time: string, active: boolean): SweepAlarm {
  const [permitted, setPermitted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The system prompt can only be shown once; after that, only read the state.
  const asked = useRef(false);

  useEffect(() => {
    if (!active) return;
    let alive = true;

    const check = async () => {
      try {
        const ok = asked.current
          ? await sweepPermitted()
          : await requestSweepPermission();
        asked.current = true;
        if (alive) setPermitted(ok);
      } catch (e) {
        if (alive) setError(reason(e));
      }
    };

    check();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [active]);

  useEffect(() => {
    // Nothing to schedule until the app is past onboarding and the permission
    // answer has actually landed.
    if (!active || permitted === null) return;
    let alive = true;
    (async () => {
      try {
        if (permitted) await scheduleSweep(time);
        // Revoked: clear the alarm rather than leave one that cannot fire.
        else await cancelSweep();
      } catch (e) {
        if (alive) setError(reason(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [active, permitted, time]);

  const openSettings = useCallback(() => {
    openSweepSettings().catch(e => setError(reason(e)));
  }, []);

  return { permitted, error, openSettings };
}
