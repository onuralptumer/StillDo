/**
 * A node:sqlite driver, used by the tests so the real schema, migrations and
 * queries run rather than being mocked. Not part of the app bundle.
 *
 * @format
 */

import { DatabaseSync } from 'node:sqlite';
import type { SqlDriver, SqlValue } from '../src/db/driver';

export function nodeDriver(
  path = ':memory:',
): SqlDriver & { close: () => void } {
  const db = new DatabaseSync(path);
  return {
    close: () => db.close(),
    async execute<T>(sql: string, params: SqlValue[] = []) {
      // node:sqlite's all() is happy with any statement, returning [] for the
      // ones that produce no rows.
      return db.prepare(sql).all(...params) as T[];
    },
  };
}
