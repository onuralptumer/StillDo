package com.stilldo.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.stilldo.R

/**
 * Quick capture — the reason the widgets exist.
 *
 * A thought that has to survive finding the app, opening it and reaching the
 * Inbox often does not. These are the three captures, one tap from the home
 * screen, and the app opens with the microphone or the camera already coming up.
 */
class QuickCaptureWidget : AppWidgetProvider() {

  override fun onUpdate(
      context: Context,
      manager: AppWidgetManager,
      ids: IntArray,
  ) {
    val snapshot = WidgetStore.read(context)
    val palette = Palette.of(snapshot.appearance, context)
    val caught = snapshot.caughtToday(WidgetStore.today())

    val views = RemoteViews(context.packageName, R.layout.widget_quick_capture)
    views.setInt(R.id.widget_root, "setBackgroundResource", palette.surfaceRes)

    views.setTextColor(R.id.quick_wordmark, palette.accent)
    // What this widget is for, counted back: the Right Now widget is the one
    // that reports what is still outstanding.
    views.setTextViewText(
        R.id.quick_caught,
        if (caught == 0) "Nothing caught yet" else "$caught caught today",
    )
    views.setTextColor(R.id.quick_caught, palette.mute)

    tile(views, R.id.quick_voice, R.id.quick_voice_kicker, R.id.quick_voice_label, palette)
    tile(views, R.id.quick_text, R.id.quick_text_kicker, R.id.quick_text_label, palette)
    tile(views, R.id.quick_photo, R.id.quick_photo_kicker, R.id.quick_photo_label, palette)

    views.setOnClickPendingIntent(R.id.quick_voice, Links.open(context, Links.VOICE, 1))
    views.setOnClickPendingIntent(R.id.quick_text, Links.open(context, Links.TEXT, 2))
    views.setOnClickPendingIntent(R.id.quick_photo, Links.open(context, Links.PHOTO, 3))

    manager.updateAppWidget(ids, views)
  }

  private fun tile(
      views: RemoteViews,
      tile: Int,
      kicker: Int,
      label: Int,
      palette: Palette,
  ) {
    views.setInt(tile, "setBackgroundResource", palette.tileRes)
    views.setTextColor(kicker, palette.mute)
    views.setTextColor(label, palette.ink)
  }
}
