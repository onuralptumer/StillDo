package com.stilldo.widgets

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/** Nothing here can be autolinked — it is the app's own code, not a library. */
class StilldoWidgetsPackage : ReactPackage {
  override fun createNativeModules(
      context: ReactApplicationContext
  ): List<NativeModule> = listOf(StilldoWidgetsModule(context))

  override fun createViewManagers(
      context: ReactApplicationContext
  ): List<ViewManager<*, *>> = emptyList()
}
