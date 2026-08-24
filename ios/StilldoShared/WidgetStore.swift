//
//  The one place the app and its widgets meet.
//
//  A widget runs in its own process and cannot open the app's SQLite file, so
//  the app writes a small summary into a shared container and the widgets read
//  only that. Both targets compile this file, so the shape can never disagree
//  between the side that writes it and the side that reads it.
//

import Foundation

/// Keep in step with `src/widgets/snapshot.ts`. The app group has to be on the
/// entitlements of both targets, and its name follows the bundle identifier —
/// changing one means changing the other.
enum WidgetStore {
  static let appGroup = "group.org.reactjs.native.example.StillDo"
  static let snapshotKey = "stilldo.snapshot"

  private static var shared: UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }

  static func write(json: String) {
    shared?.set(json, forKey: snapshotKey)
  }

  /// Nil when nothing has been written yet — a widget added before the app has
  /// ever been opened — or when the payload was written by a build of the app
  /// whose shape this one does not know.
  static func read() -> WidgetSnapshot? {
    guard
      let json = shared?.string(forKey: snapshotKey),
      let data = json.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(WidgetSnapshot.self, from: data),
      snapshot.version == WidgetSnapshot.supportedVersion
    else { return nil }
    return snapshot
  }
}

struct WidgetTask: Codable, Hashable {
  let id: Int
  let title: String
  let note: String
}

struct WidgetSnapshot: Codable, Hashable {
  static let supportedVersion = 1

  let version: Int
  let rightNow: WidgetTask?
  let openCount: Int
  let caughtToday: Int
  let caughtDay: String
  let sweepTime: String
  let appearance: String

  /// What a widget shows before it has ever been given anything: the gallery
  /// preview, and the first seconds of a widget added before the app is opened.
  static let empty = WidgetSnapshot(
    version: supportedVersion,
    rightNow: nil,
    openCount: 0,
    caughtToday: 0,
    caughtDay: "",
    sweepTime: "21:00",
    appearance: "system"
  )

  /// The tally is about the day it was written on. A widget outlives that, so
  /// after midnight it reports nothing caught rather than yesterday's count.
  func caughtToday(on day: String) -> Int {
    caughtDay == day ? caughtToday : 0
  }
}

/// The URLs the widgets open the app with; parsed by `src/widgets/links.ts`.
enum WidgetLink {
  static let voice = URL(string: "stilldo://capture/voice")!
  static let text = URL(string: "stilldo://capture/text")!
  static let photo = URL(string: "stilldo://capture/photo")!
  static let now = URL(string: "stilldo://now")!
  static let sweep = URL(string: "stilldo://sweep")!
}
