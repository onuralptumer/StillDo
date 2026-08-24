//
//  Quick capture — the reason the widgets exist.
//
//  A thought that has to survive finding the app, opening it and reaching the
//  Inbox often does not. These are the three captures, one tap from the home
//  screen, and the app opens with the microphone or the camera already coming up.
//

import SwiftUI
import WidgetKit

/// One of the three. Drawn as the outlined tile the canvas uses for its
/// "Quick catch" pair: a small mute label over the word for the thing itself.
private struct CaptureTile: View {
  let kicker: String
  let action: String
  let palette: Palette

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(kicker)
        .font(.label(9))
        .tracking(0.9)
        .textCase(.uppercase)
        .foregroundColor(palette.mute)
      Text(action)
        .font(.label(13))
        .tracking(0.65)
        .textCase(.uppercase)
        .foregroundColor(palette.ink)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
    .overlay(
      RoundedRectangle(cornerRadius: 12).strokeBorder(palette.line, lineWidth: 1)
    )
  }
}

private struct QuickCaptureView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.colorScheme) private var scheme
  var entry: Entry

  private var palette: Palette {
    Palette.of(entry.snapshot.appearance, following: scheme)
  }

  var body: some View {
    Group {
      if family == .systemMedium {
        medium
      } else {
        small
      }
    }
    .widgetBackground(palette.bg)
  }

  /// Three real tap targets. `Link` only resolves to separate targets from
  /// medium upwards, which is why this size is the one that carries all three.
  private var medium: some View {
    VStack(alignment: .leading, spacing: 10) {
      header
      HStack(spacing: 9) {
        Link(destination: WidgetLink.voice) {
          CaptureTile(kicker: "Say it", action: "Speak it", palette: palette)
        }
        Link(destination: WidgetLink.text) {
          CaptureTile(kicker: "Write it", action: "Type it", palette: palette)
        }
        Link(destination: WidgetLink.photo) {
          CaptureTile(kicker: "Show it", action: "Snap it", palette: palette)
        }
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
  }

  /// A small widget is a single tap target however it is drawn, so it commits
  /// to the fastest of the three rather than showing three words that all do
  /// the same thing.
  private var small: some View {
    VStack(alignment: .leading, spacing: 8) {
      header
      Spacer(minLength: 0)
      Text("Speak it")
        .font(.label(20))
        .tracking(1)
        .textCase(.uppercase)
        .foregroundColor(palette.ink)
      Text("Hold the thought out loud")
        .font(.body(12))
        .foregroundColor(palette.ink)
        .opacity(0.7)
        .lineLimit(2)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetURL(WidgetLink.voice)
  }

  private var header: some View {
    HStack {
      Text("Stilldo")
        .font(.label(10))
        .tracking(1)
        .textCase(.uppercase)
        .foregroundColor(palette.accent)
      Spacer(minLength: 4)
      // What this widget is for, counted back: the Right Now widget is the
      // one that reports what is still outstanding.
      Text(entry.caughtToday == 0 ? "Nothing caught yet" : "\(entry.caughtToday) caught today")
        .font(.label(10))
        .tracking(1)
        .textCase(.uppercase)
        .foregroundColor(palette.mute)
    }
  }
}

struct QuickCaptureWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StilldoQuickCapture", provider: Provider()) { entry in
      QuickCaptureView(entry: entry)
    }
    .configurationDisplayName("Quick capture")
    .description("Catch it out loud, in a line, or as a picture — without opening the app first.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
