package com.stilldo.widgets

import android.content.Context
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import org.json.JSONObject

/**
 * What the home-screen widgets are allowed to know.
 *
 * Keep in step with `src/widgets/snapshot.ts`. A widget provider runs in the
 * launcher's process, not the app's, so it cannot open the app's SQLite file —
 * it reads this summary out of shared preferences instead.
 */
data class WidgetTask(val id: Int, val title: String, val note: String)

data class WidgetSnapshot(
    val rightNow: WidgetTask?,
    val openCount: Int,
    private val caughtCount: Int,
    private val caughtDay: String,
    val sweepTime: String,
    val appearance: String,
) {
  /**
   * The tally is about the day it was written on. A widget outlives that, so
   * after midnight it reports nothing caught rather than yesterday's count.
   */
  fun caughtToday(on: String): Int = if (caughtDay == on) caughtCount else 0

  companion object {
    const val SUPPORTED_VERSION = 1

    /** A widget added before the app has ever been opened. */
    val EMPTY = WidgetSnapshot(null, 0, 0, "", "21:00", "system")

    /**
     * Null for anything this build cannot read — nothing written yet, or a
     * payload from a version of the app whose shape it does not know.
     */
    fun parse(json: String?): WidgetSnapshot? {
      if (json.isNullOrEmpty()) return null
      return try {
        val o = JSONObject(json)
        if (o.optInt("version") != SUPPORTED_VERSION) return null
        val now = o.optJSONObject("rightNow")
        WidgetSnapshot(
            rightNow =
                now?.let {
                  WidgetTask(it.optInt("id"), it.optString("title"), it.optString("note"))
                },
            openCount = o.optInt("openCount"),
            caughtCount = o.optInt("caughtToday"),
            caughtDay = o.optString("caughtDay"),
            sweepTime = o.optString("sweepTime", "21:00"),
            appearance = o.optString("appearance", "system"),
        )
      } catch (e: Exception) {
        null
      }
    }
  }
}

object WidgetStore {
  private const val FILE = "stilldo.widgets"
  private const val KEY = "snapshot"

  /** 'YYYY-MM-DD' in local time — the day boundary the app counts by. */
  fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

  fun write(context: Context, json: String) {
    context
        .getSharedPreferences(FILE, Context.MODE_PRIVATE)
        .edit()
        .putString(KEY, json)
        .apply()
  }

  fun read(context: Context): WidgetSnapshot =
      WidgetSnapshot.parse(
          context.getSharedPreferences(FILE, Context.MODE_PRIVATE).getString(KEY, null))
          ?: WidgetSnapshot.EMPTY
}
