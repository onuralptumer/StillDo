//
//  Every Stilldo widget shows the same summary, so they all share one timeline.
//

import WidgetKit

struct Entry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot
  /// The ISO day this entry is drawn for, so "caught today" can tell whether
  /// the tally it was handed is still about today.
  let day: String

  var caughtToday: Int { snapshot.caughtToday(on: day) }
}

private let isoDay: DateFormatter = {
  let f = DateFormatter()
  // Fixed to the phone's own day boundary, which is what the app counts by.
  f.dateFormat = "yyyy-MM-dd"
  return f
}()

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> Entry {
    Entry(date: Date(), snapshot: .empty, day: isoDay.string(from: Date()))
  }

  func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
    completion(entry())
  }

  /// One entry, then a refresh at the next midnight.
  ///
  /// Nothing here changes on its own between now and then — the app reloads
  /// these timelines itself every time what they show changes. Midnight is the
  /// exception: "caught today" becomes a count of yesterday without anything
  /// having happened, and the app may be asleep through it.
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let now = Date()
    let midnight = Calendar.current.nextDate(
      after: now,
      matching: DateComponents(hour: 0, minute: 0, second: 0),
      matchingPolicy: .nextTime
    )
    completion(Timeline(entries: [entry(at: now)], policy: .after(midnight ?? now.addingTimeInterval(3600))))
  }

  private func entry(at date: Date = Date()) -> Entry {
    Entry(
      date: date,
      snapshot: WidgetStore.read() ?? .empty,
      day: isoDay.string(from: date)
    )
  }
}
