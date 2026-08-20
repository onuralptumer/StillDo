/**
 * Exercises the real schema and queries against node:sqlite.
 *
 * @format
 */

import { nodeDriver } from '../testing/nodeDriver';
import {
  LATEST_VERSION,
  MIGRATIONS,
  ensureSettings,
  migrate,
  prepare,
} from '../src/db/schema';
import { allTasks, insertTask, updateTask } from '../src/db/tasks';
import { allSettings, putSetting } from '../src/db/settings';
import { demoTasks } from '../testing/fixtures';
import { stamp } from '../src/date';
import type { Task } from '../src/types';

/** An empty, migrated database — what a real first run now produces. */
const fresh = async () => {
  const db = nodeDriver();
  await prepare(db);
  return db;
};

/** ...plus some content, for the tests that need rows to act on. */
const stocked = async () => {
  const db = await fresh();
  for (const task of demoTasks) await insertTask(db, task);
  return db;
};

test('migrating an empty database lands on the latest version', async () => {
  const db = nodeDriver();
  await migrate(db);

  const [{ user_version }] = await db.execute<{ user_version: number }>(
    'PRAGMA user_version',
  );
  expect(user_version).toBe(LATEST_VERSION);
  db.close();
});

test('migrating twice is a no-op', async () => {
  const db = nodeDriver();
  await migrate(db);
  await expect(migrate(db)).resolves.toBeUndefined();
  db.close();
});

test('a first run starts with no tasks at all', async () => {
  const db = await fresh();
  expect(await allTasks(db)).toEqual([]);
  db.close();
});

test('a first run still has its default settings', async () => {
  const db = await fresh();
  expect((await allSettings(db)).sweepTime).toBe('21:00');

  // Running it again must not overwrite a value the owner has changed.
  await putSetting(db, 'sweepTime', '19:30');
  await ensureSettings(db);
  expect((await allSettings(db)).sweepTime).toBe('19:30');
  db.close();
});

test('reading order is insertion order, which the lists rely on', async () => {
  const db = await stocked();
  expect((await allTasks(db)).map(t => t.title)).toEqual(
    demoTasks.map(t => t.title),
  );
  db.close();
});

test('a task survives the round trip through SQLite intact', async () => {
  const db = await stocked();
  const original = demoTasks[0];
  const stored = (await allTasks(db)).find(t => t.id === original.id)!;
  expect(stored).toEqual(original);
  db.close();
});

test('upgrading an old database clears the demo rows it was seeded with', async () => {
  const db = nodeDriver();
  // A genuine version-1 database, seeded the way earlier builds did.
  for (const statement of MIGRATIONS[0]) await db.execute(statement);
  await db.execute('PRAGMA user_version = 1');
  // Insert the way that build did — the v1 table has no defer_until column.
  const v1Insert = (id: number, title: string, origin: string) =>
    db.execute(
      `INSERT INTO tasks (id, title, origin, created_at) VALUES (?,?,?,?)`,
      [id, title, origin, id],
    );
  for (const task of demoTasks) await v1Insert(task.id, task.title, task.from);
  // ...and one thing the owner captured themselves, plus a demo row they edited.
  await v1Insert(42, 'Ring the vet', 'inbox');
  await db.execute(
    "UPDATE tasks SET title = 'Bins out — moved to Thursdays' WHERE id = 3",
  );

  await migrate(db);

  const left = (await allTasks(db)).map(t => t.title);
  expect(left).toEqual(['Bins out — moved to Thursdays', 'Ring the vet']);
  db.close();
});

test('reserved-word fields map onto their columns', async () => {
  const db = await fresh();
  const task: Task = {
    id: 900,
    title: 'Ring the vet',
    note: 'n',
    when: 'Before 17:30',
    caught: 1_755_000_000_000,
    nudge: 'gentle',
    status: 'open',
    source: 'Typed',
    from: 'inbox',
  };
  await insertTask(db, task);

  const [row] = await db.execute<{
    due: string;
    caught_at: number;
    origin: string;
  }>('SELECT due, caught_at, origin FROM tasks WHERE id = 900');
  expect(row).toEqual({
    due: 'Before 17:30',
    caught_at: 1_755_000_000_000,
    origin: 'inbox',
  });
  expect((await allTasks(db)).find(t => t.id === 900)).toEqual(task);
  db.close();
});

test('the capture instant survives as a number, not a formatted string', async () => {
  const db = await fresh();
  const at = Date.UTC(2026, 7, 21, 9, 34) + new Date().getTimezoneOffset() * 60_000;
  await insertTask(db, { ...demoTasks[0], id: 901, caught: at });

  const stored = (await allTasks(db)).find(t => t.id === 901)!;
  expect(typeof stored.caught).toBe('number');
  expect(stored.caught).toBe(at);
  expect(stamp(stored.caught)).toBe('21 Aug 2026 · 09:34');
  db.close();
});

test('the dead display-only columns are gone', async () => {
  const db = await fresh();
  const columns = (
    await db.execute<{ name: string }>('PRAGMA table_info(tasks)')
  ).map(c => c.name);

  expect(columns).not.toContain('place');
  expect(columns).not.toContain('slips');
  expect(columns).toContain('caught_at');
  expect(columns).not.toContain('created_at');
  db.close();
});

test('a photo URI persists, and its absence stays absent', async () => {
  const db = await stocked();
  await insertTask(db, {
    ...demoTasks[0],
    id: 901,
    photoUri: 'file:///tmp/receipt.jpg',
  });

  const withPhoto = (await allTasks(db)).find(t => t.id === 901)!;
  expect(withPhoto.photoUri).toBe('file:///tmp/receipt.jpg');
  // A task without one must not come back carrying null.
  expect('photoUri' in (await allTasks(db)).find(t => t.id === 1)!).toBe(false);
  db.close();
});

test('a partial update touches only the fields it was given', async () => {
  const db = await stocked();
  const before = (await allTasks(db)).find(t => t.id === 2)!;

  await updateTask(db, 2, { status: 'done', nudge: 'alarm' });

  const after = (await allTasks(db)).find(t => t.id === 2)!;
  expect(after).toEqual({ ...before, status: 'done', nudge: 'alarm' });
  db.close();
});

test('an empty update is not sent to the database', async () => {
  const db = await stocked();
  const spy = jest.spyOn(db, 'execute');
  await updateTask(db, 1, {});
  expect(spy).not.toHaveBeenCalled();
  db.close();
});

test('settings upsert rather than collide', async () => {
  const db = await fresh();
  expect((await allSettings(db)).sweepTime).toBe('21:00');

  await putSetting(db, 'sweepTime', '19:30');
  await putSetting(db, 'sweepTime', '22:30');

  expect((await allSettings(db)).sweepTime).toBe('22:30');
  const [{ n }] = await db.execute<{ n: number }>(
    "SELECT COUNT(*) AS n FROM settings WHERE key = 'sweepTime'",
  );
  expect(n).toBe(1);
  db.close();
});

test('a setting the database has never heard of falls back to its default', async () => {
  const db = await fresh();
  await db.execute("DELETE FROM settings WHERE key = 'appearance'");
  expect((await allSettings(db)).appearance).toBe('System');
  db.close();
});
