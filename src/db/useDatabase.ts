/**
 * @format
 */

import { useEffect, useState } from 'react';
import type { SqlDriver } from './driver';
import { openDatabase } from './open';

export function useDatabase() {
  const [db, setDb] = useState<SqlDriver | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    openDatabase()
      .then(d => {
        if (live) setDb(d);
      })
      .catch(e => {
        if (live) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      live = false;
    };
  }, []);

  return { db, error };
}
