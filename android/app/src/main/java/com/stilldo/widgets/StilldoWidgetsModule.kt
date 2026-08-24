package com.stilldo.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * The app's half of the widget bridge: take the payload JavaScript built, put
 * it where the widget providers can read it, and tell the launcher that what
 * they are showing is now out of date.
 */
class StilldoWidgetsModule(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName(): String = NAME

  @ReactMethod
  fun publish(json: String, promise: Promise) {
    try {
      val context = reactApplicationContext
      WidgetStore.write(context, json)

      val manager = AppWidgetManager.getInstance(context)
      for (provider in PROVIDERS) {
        val ids = manager.getAppWidgetIds(ComponentName(context, provider))
        // Nothing placed on a home screen: there is nothing to redraw, and the
        // payload is already stored for whenever one is.
        if (ids.isNotEmpty()) {
          context.sendBroadcast(
              Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
                  .setComponent(ComponentName(context, provider))
                  .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids))
        }
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("widget_publish_failed", e)
    }
  }

  companion object {
    const val NAME = "StilldoWidgets"

    private val PROVIDERS =
        listOf(QuickCaptureWidget::class.java, RightNowWidget::class.java)
  }
}
