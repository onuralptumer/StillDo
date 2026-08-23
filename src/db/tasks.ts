/**
 * @format
 */

import type { Origin, Task, TaskStatus } from '../types';
import type { SqlDriver, SqlValue } from './driver';

type Row = {
  id: number;
  title: string;
  note: string;
  caught_at: number;
  status: string;
  source: string;
  origin: string;
  photo_uri: string | null;
  defer_until: string | null;
};

const toTask = (r: Row): Task => ({
  id: r.id,
  title: r.title,
  note: r.note,
  caught: r.caught_at,
  status: r.status as TaskStatus,
  source: r.source,
  from: r.origin as Origin,
  // Keep these absent rather than null, so `!!task.photoUri` stays honest.
  ...(r.photo_uri ? { photoUri: r.photo_uri } : {}),
  ...(r.defer_until ? { deferUntil: r.defer_until } : {}),
});

/** Capture order is the reading order the screens rely on. */
export async function allTasks(db: SqlDriver): Promise<Task[]> {
  const rows = await db.execute<Row>(
    'SELECT * FROM tasks ORDER BY caught_at, id',
  );
  return rows.map(toTask);
}

export async function insertTask(db: SqlDriver, task: Task): Promise<void> {
  await db.execute(
    `INSERT INTO tasks
       (id, title, note, caught_at, status, source,
        origin, photo_uri, defer_until)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      task.id,
      task.title,
      task.note,
      task.caught,
      task.status,
      task.source,
      task.from,
      task.photoUri ?? null,
      task.deferUntil ?? null,
    ],
  );
}

/** Maps Task field names onto their column names for partial updates. */
const COLUMN: Partial<Record<keyof Task, string>> = {
  title: 'title',
  note: 'note',
  caught: 'caught_at',
  status: 'status',
  source: 'source',
  from: 'origin',
  photoUri: 'photo_uri',
  deferUntil: 'defer_until',
};

export async function updateTask(
  db: SqlDriver,
  id: number,
  fields: Partial<Task>,
): Promise<void> {
  const entries = Object.entries(fields).filter(([k]) => k in COLUMN);
  if (entries.length === 0) return;

  const set = entries.map(([k]) => `${COLUMN[k as keyof Task]} = ?`).join(', ');
  const values = entries.map(([, v]) => (v ?? null) as SqlValue);
  await db.execute(`UPDATE tasks SET ${set} WHERE id = ?`, [...values, id]);
}
