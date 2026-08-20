/**
 * The on-device driver. Everything the app persists lives in one file in the
 * app's own container — the Settings footnote's "stores captures on device"
 * is literal.
 *
 * @format
 */

import { open, type DB } from '@op-engineering/op-sqlite';
import type { SqlDriver, SqlValue } from './driver';
import { prepare } from './schema';

export const DATABASE_NAME = 'stilldo.sqlite';

const wrap = (db: DB): SqlDriver => ({
  async execute<T>(sql: string, params: SqlValue[] = []) {
    const result = await db.execute(sql, params);
    return (result.rows ?? []) as T[];
  },
});

export async function openDatabase(): Promise<SqlDriver> {
  const db = wrap(open({ name: DATABASE_NAME }));
  // WAL keeps a write from blocking the read that paints the next screen.
  await db.execute('PRAGMA journal_mode = WAL');
  return prepare(db);
}
