/**
 * Emptying the store.
 *
 * @format
 */

import type { Settings } from '../types';
import type { SqlDriver } from './driver';
import { putSetting } from './settings';

/**
 * Delete every capture and rewrite the settings table as `keep`.
 *
 * One transaction, because a half-cleared store is worse than either end of
 * it: the app's read model has already been emptied by the time this runs, so
 * a failure between the two deletes would leave rows on disk that no screen
 * shows and the next launch would resurrect.
 *
 * Attached photos are not touched. The camera writes them into the app's own
 * temporary storage and a picked one is the library's file, not ours; deleting
 * the app is what takes those, as the guide says.
 */
export async function clearAll(db: SqlDriver, keep: Settings): Promise<void> {
  await db.execute('BEGIN');
  try {
    await db.execute('DELETE FROM tasks');
    await db.execute('DELETE FROM settings');
    for (const [key, value] of Object.entries(keep)) {
      await putSetting(db, key, value);
    }
    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}
