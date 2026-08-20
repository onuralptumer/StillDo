/**
 * Schema and migrations.
 *
 * Column names diverge from the TypeScript field names where the natural word
 * is a reserved one: `when` → due, `where` → place, `from` → origin.
 *
 * @format
 */

import { seedSettings } from '../data';
import type { SqlDriver } from './driver';
import { putSetting } from './settings';

/** Each entry is one version; the index is the version it upgrades *to*. */
export const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE tasks (
       id         INTEGER PRIMARY KEY,
       title      TEXT    NOT NULL,
       note       TEXT    NOT NULL DEFAULT '',
       due        TEXT    NOT NULL DEFAULT '',
       place      TEXT    NOT NULL DEFAULT '',
       caught     TEXT    NOT NULL DEFAULT '',
       slips      TEXT    NOT NULL DEFAULT '',
       nudge      TEXT    NOT NULL DEFAULT 'gentle',
       status     TEXT    NOT NULL DEFAULT 'open',
       source     TEXT    NOT NULL DEFAULT '',
       origin     TEXT    NOT NULL DEFAULT 'inbox',
       photo_uri  TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX tasks_status ON tasks (status)`,
    `CREATE TABLE settings (
       key   TEXT PRIMARY KEY,
       value TEXT NOT NULL
     )`,
  ],
  // Earlier builds seeded the design canvas's demo tasks. Clear them out of
  // databases that already have them, matching on id *and* title so a row the
  // owner has since edited or replaced is left alone. Migrations are a frozen
  // record, so these titles stay spelled out here rather than imported.
  [
    `DELETE FROM tasks WHERE id = 1 AND title = 'Call the dentist back'`,
    `DELETE FROM tasks WHERE id = 2 AND title = 'Passport form — page 3'`,
    `DELETE FROM tasks WHERE id = 3 AND title = 'Bins out before 07:00'`,
    `DELETE FROM tasks WHERE id = 4 AND title = 'Reply to Priya about the invoice'`,
    `DELETE FROM tasks WHERE id = 5 AND title = 'Book the car in for its service'`,
    `DELETE FROM tasks WHERE id = 6 AND title = 'That thing about the loft hatch'`,
    `DELETE FROM tasks WHERE id = 7 AND title = 'Chase the parcel refund'`,
  ],
  // "Move to tomorrow" in the sweep had nowhere to record itself, so it did
  // nothing. This is where a deferral now lives.
  [`ALTER TABLE tasks ADD COLUMN defer_until TEXT`],
  // `place` and `slips` were display-only text that nothing acted on, and
  // `caught` held a frozen phrase ("Typed · just now") rather than a time.
  // The real capture moment was already in created_at; give it the name the
  // screen uses and drop the three dead columns.
  [
    `ALTER TABLE tasks DROP COLUMN place`,
    `ALTER TABLE tasks DROP COLUMN slips`,
    `ALTER TABLE tasks DROP COLUMN caught`,
    `ALTER TABLE tasks RENAME COLUMN created_at TO caught_at`,
  ],
  // Rows captured by an earlier build froze the phrase "Typed · just now" into
  // source, which then read as "just now" forever. Leave only the method.
  [`UPDATE tasks SET source = REPLACE(source, ' · just now', '')`],
  // `due` was the last of the display-only text columns: every capture wrote
  // "No date yet" into it and nothing ever changed it, so both places that
  // showed it said the same meaningless thing forever.
  [`ALTER TABLE tasks DROP COLUMN due`],
];

export const LATEST_VERSION = MIGRATIONS.length;

export async function migrate(db: SqlDriver): Promise<void> {
  const rows = await db.execute<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const current = rows[0]?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    for (const statement of MIGRATIONS[v]) {
      await db.execute(statement);
    }
    // PRAGMA will not take a bound parameter, and v is a loop counter, not
    // anything that came from outside.
    await db.execute(`PRAGMA user_version = ${v + 1}`);
  }
}

/**
 * Write any default setting the database does not have a value for yet. These
 * are configuration, not content: the Settings screen needs something to show
 * on a first run, and a later version of the app can add a row here.
 */
export async function ensureSettings(db: SqlDriver): Promise<void> {
  const rows = await db.execute<{ key: string }>('SELECT key FROM settings');
  const have = new Set(rows.map(r => r.key));
  for (const [key, value] of Object.entries(seedSettings)) {
    if (!have.has(key)) await putSetting(db, key, value);
  }
}

export async function prepare(db: SqlDriver): Promise<SqlDriver> {
  await db.execute('PRAGMA foreign_keys = ON');
  await migrate(db);
  await ensureSettings(db);
  return db;
}
