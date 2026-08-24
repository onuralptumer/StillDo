//
//  The app's half of the widget bridge: take the payload JavaScript built,
//  put it where the widget process can read it, and tell WidgetKit that what
//  it is showing is now out of date.
//

import Foundation
import React
import WidgetKit

@objc(StilldoWidgets)
class StilldoWidgets: NSObject {

  /// Widgets are drawn by the system, not by us — nothing here touches the UI,
  /// so this can stay off the main queue and out of the way of the next frame.
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(publish:resolver:rejecter:)
  func publish(
    _ json: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard UserDefaults(suiteName: WidgetStore.appGroup) != nil else {
      // The app group is missing from the entitlements, so there is nowhere
      // shared to write. Say so rather than reporting a write that went into
      // this process's own defaults and will never be read.
      reject(
        "no_app_group",
        "Stilldo cannot reach the widget container \(WidgetStore.appGroup).",
        nil
      )
      return
    }

    WidgetStore.write(json: json)
    WidgetCenter.shared.reloadAllTimelines()
    resolve(nil)
  }
}
