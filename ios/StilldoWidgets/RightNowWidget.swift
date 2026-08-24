//
//  "Right now" — the one card off the top of Today, and nothing else.
//
//  Today already decides what that is: the first thing still due. Putting it on
//  the home and lock screens means the single thing you are meant to be doing
//  is readable without unlocking anything.
//

import SwiftUI
import WidgetKit

private struct RightNowView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.colorScheme) private var scheme
  var entry: Entry

  private var palette: Palette {
    Palette.of(entry.snapshot.appearance, following: scheme)
  }

  private var task: WidgetTask? { entry.snapshot.rightNow }

  var body: some View {
    Group {
      switch family {
      case .accessoryRectangular: accessory
      case .accessoryInline: Text(task?.title ?? "Nothing open")
      default: home
      }
    }
    .widgetURL(task == nil ? WidgetLink.text : WidgetLink.now)
  }

  private var home: some View {
    VStack(alignment: .leading, spacing: family == .systemSmall ? 8 : 12) {
      Text("Right now")
        .font(.label(10))
        .tracking(1)
        .textCase(.uppercase)
        .foregroundColor(palette.mute)

      if let task {
        Text(task.title)
          .font(.label(family == .systemSmall ? 16 : 21))
          .tracking(family == .systemSmall ? 0.5 : 0.6)
          .textCase(.uppercase)
          .lineSpacing(1)
          .foregroundColor(palette.ink)
          .lineLimit(family == .systemSmall ? 4 : 3)
          .minimumScaleFactor(0.85)

        if family != .systemSmall {
          Text(task.note)
            .font(.body(14))
            .foregroundColor(palette.ink)
            .opacity(0.75)
            .lineLimit(3)
        }
      } else {
        Text("Nothing open")
          .font(.label(family == .systemSmall ? 16 : 21))
          .tracking(0.6)
          .textCase(.uppercase)
          .foregroundColor(palette.ink)
        Text("The sweep found everything.")
          .font(.body(13))
          .foregroundColor(palette.ink)
          .opacity(0.7)
          .lineLimit(2)
      }

      Spacer(minLength: 0)

      // The same line Today closes with, so the widget and the screen agree
      // about what is still outstanding and when it gets looked at.
      Text(
        entry.snapshot.openCount > 1
          ? "\(entry.snapshot.openCount - 1) more · sweep \(entry.snapshot.sweepTime)"
          : "Sweep \(entry.snapshot.sweepTime)"
      )
      .font(.label(9))
      .tracking(0.8)
      .textCase(.uppercase)
      .foregroundColor(palette.accent)
      .lineLimit(1)
      .minimumScaleFactor(0.8)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetBackground(palette.bg)
  }

  /// The lock screen renders these as a flat stencil in the system's own tint,
  /// so this drops the palette entirely rather than setting colours that will
  /// be thrown away.
  private var accessory: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("Right now")
        .font(.label(11))
        .textCase(.uppercase)
        .widgetAccentable()
      Text(task?.title ?? "Nothing open")
        .font(.label(14))
        .textCase(.uppercase)
        .lineLimit(2)
        .minimumScaleFactor(0.8)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }
}

struct RightNowWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StilldoRightNow", provider: Provider()) { entry in
      RightNowView(entry: entry)
    }
    .configurationDisplayName("Right now")
    .description("The one thing off the top of Today, and nothing else.")
    .supportedFamilies([
      .systemSmall,
      .systemMedium,
      .accessoryRectangular,
      .accessoryInline,
    ])
  }
}
