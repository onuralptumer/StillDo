package com.stilldo.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.stilldo.R

/**
 * "Right now" — the one card off the top of Today, and nothing else.
 *
 * Today already decides what that is: the first thing still due. Putting it on
 * the home screen means the single thing you are meant to be doing is readable
 * without opening anything.
 */
class RightNowWidget : AppWidgetProvider() {

  override fun onUpdate(
      context: Context,
      manager: AppWidgetManager,
      ids: IntArray,
  ) {
    val snapshot = WidgetStore.read(context)
    val palette = Palette.of(snapshot.appearance, context)
    val task = snapshot.rightNow

    val views = RemoteViews(context.packageName, R.layout.widget_right_now)
    views.setInt(R.id.widget_root, "setBackgroundResource", palette.surfaceRes)

    views.setTextColor(R.id.now_kicker, palette.mute)
    views.setTextColor(R.id.now_title, palette.ink)
    views.setTextColor(R.id.now_note, palette.ink)
    views.setTextColor(R.id.now_footer, palette.accent)

    views.setTextViewText(R.id.now_title, task?.title ?: "Nothing open")

    val note = task?.note ?: "The sweep found everything."
    views.setTextViewText(R.id.now_note, note)
    // A capture made without one would otherwise leave a gap where a line was.
    views.setViewVisibility(
        R.id.now_note,
        if (note.isBlank()) View.GONE else View.VISIBLE,
    )

    // The same line Today closes with, so the widget and the screen agree about
    // what is still outstanding and when it gets looked at.
    views.setTextViewText(
        R.id.now_footer,
        if (snapshot.openCount > 1) {
          "${snapshot.openCount - 1} more · sweep ${snapshot.sweepTime}"
        } else {
          "Sweep ${snapshot.sweepTime}"
        },
    )

    // With nothing due there is no task to open; go to the inbox instead, which
    // is where the next one gets caught.
    views.setOnClickPendingIntent(
        R.id.widget_root,
        if (task == null) Links.open(context, Links.TEXT, 5)
        else Links.open(context, Links.NOW, 4),
    )

    manager.updateAppWidget(ids, views)
  }
}
