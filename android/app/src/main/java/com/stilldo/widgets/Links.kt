package com.stilldo.widgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import com.stilldo.MainActivity

/**
 * The URLs the widgets open the app with; parsed by `src/widgets/links.ts`.
 *
 * MainActivity is `singleTask`, so a tap on a running app arrives at
 * `onNewIntent` and React Native turns it into the `url` event the app is
 * listening for, rather than starting a second copy of the app.
 */
object Links {
  const val VOICE = "stilldo://capture/voice"
  const val TEXT = "stilldo://capture/text"
  const val PHOTO = "stilldo://capture/photo"
  const val NOW = "stilldo://now"

  /**
   * `requestCode` has to differ per destination: PendingIntents that match on
   * everything else are the same object to the system, and three buttons would
   * end up all doing whatever the last one asked for.
   */
  fun open(context: Context, url: String, requestCode: Int): PendingIntent {
    val intent =
        Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
          setClass(context, MainActivity::class.java)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
    return PendingIntent.getActivity(
        context,
        requestCode,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
