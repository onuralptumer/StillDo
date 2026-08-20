/**
 * @format
 */

import { seedSettings } from '../data';
import type { SettingKey, Settings } from '../types';
import type { SqlDriver } from './driver';

export async function allSettings(db: SqlDriver): Promise<Settings> {
  const rows = await db.execute<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );
  // Start from the defaults so a setting added in a later version of the app
  // still has a value on a database written by an earlier one.
  const out: Settings = { ...seedSettings };
  for (const { key, value } of rows) {
    if (key in out) out[key as SettingKey] = value;
  }
  return out;
}

export async function putSetting(
  db: SqlDriver,
  key: string,
  value: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}
