package com.stilldo.widgets

import android.content.Context
import android.content.res.Configuration
import com.stilldo.R

/**
 * The app's tokens, ported from `src/theme.ts`.
 *
 * A widget is drawn by the launcher, so it cannot inherit the app's theme
 * context — the colours are resolved here and pushed into the RemoteViews one
 * at a time, which is also what lets Settings hold the widget dark or light
 * against the phone's own choice.
 */
data class Palette(
    val accent: Int,
    val ink: Int,
    val mute: Int,
    /** Drawable, not a colour: the rounded page the widget is drawn on. */
    val surfaceRes: Int,
    /** Drawable: the hairline-outlined tile a capture button sits in. */
    val tileRes: Int,
) {
  companion object {
    private val DARK =
        Palette(
            accent = 0xFFDC5000.toInt(),
            ink = 0xFFFFEDD7.toInt(),
            mute = 0xFF6C5F51.toInt(),
            surfaceRes = R.drawable.widget_surface_dark,
            tileRes = R.drawable.widget_tile_dark,
        )

    private val LIGHT =
        Palette(
            accent = 0xFFA83900.toInt(),
            ink = 0xFF251A11.toInt(),
            mute = 0xFF6B5949.toInt(),
            surfaceRes = R.drawable.widget_surface_light,
            tileRes = R.drawable.widget_tile_light,
        )

    fun of(appearance: String, context: Context): Palette =
        when (appearance) {
          "dark" -> DARK
          "light" -> LIGHT
          else -> if (isNight(context)) DARK else LIGHT
        }

    private fun isNight(context: Context): Boolean =
        (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES
  }
}
