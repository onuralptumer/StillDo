/**
 * The narrow slice of SQLite this app needs.
 *
 * op-sqlite backs it on device; the tests back it with node:sqlite, so the
 * real schema, migrations and queries are exercised rather than mocked.
 *
 * @format
 */

export type SqlValue = string | number | null;

export interface SqlDriver {
  execute<T = Record<string, SqlValue>>(
    sql: string,
    params?: SqlValue[],
  ): Promise<T[]>;
}
