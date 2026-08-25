//
//  The three captures on the lock screen.
//
//  An accessory widget is a single tap target however it is drawn, so the three
//  captures cannot share one square the way they do at medium size on the home
//  screen. They are three widgets instead, and you place the one you actually
//  reach for — which for most people is the microphone.
//

import SwiftUI
import WidgetKit

private struct LockCaptureView: View {
  @Environment(\.widgetFamily) private var family

  let symbol: String
  let word: String
  let destination: URL
  var entry: Entry

  var body: some View {
    Group {
      switch family {
      case .accessoryInline:
        // One line, shared with whatever else is on that row: name the app,
        // because "Speak it" alone says nothing about what it belongs to.
        Label("ThinkLighter — \(word)", systemImage: symbol)
      case .accessoryRectangular:
        rectangular
      default:
        circular
      }
    }
    .widgetURL(destination)
  }

  private var rectangular: some View {
    HStack(spacing: 8) {
      Image(systemName: symbol)
        .font(.system(size: 16))
        .widgetAccentable()
      VStack(alignment: .leading, spacing: 1) {
        Text("Catch it")
          .font(.label(10))
          .textCase(.uppercase)
          .widgetAccentable()
        Text(word)
          .font(.label(14))
          .textCase(.uppercase)
          .lineLimit(1)
          .minimumScaleFactor(0.8)
      }
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }

  private var circular: some View {
    ZStack {
      // The system draws the well behind accessory widgets on some watch faces
      // and lock screens and not on others; asking for it keeps the mark
      // legible either way.
      AccessoryWidgetBackground()
      Image(systemName: symbol).font(.system(size: 20, weight: .medium))
    }
  }
}

struct VoiceCaptureWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StilldoCaptureVoice", provider: Provider()) { entry in
      LockCaptureView(
        symbol: "mic.fill",
        word: "Speak it",
        destination: WidgetLink.voice,
        entry: entry
      )
    }
    .configurationDisplayName("Catch it out loud")
    .description("Opens ThinkLighter listening, so the thought can be said before it goes.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

struct TextCaptureWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StilldoCaptureText", provider: Provider()) { entry in
      LockCaptureView(
        symbol: "square.and.pencil",
        word: "Type it",
        destination: WidgetLink.text,
        entry: entry
      )
    }
    .configurationDisplayName("Catch it in a line")
    .description("Opens ThinkLighter with the cursor already in the inbox field.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

struct PhotoCaptureWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StilldoCaptureSnap", provider: Provider()) { entry in
      LockCaptureView(
        symbol: "camera.fill",
        word: "Snap it",
        destination: WidgetLink.photo,
        entry: entry
      )
    }
    .configurationDisplayName("Catch it as a picture")
    .description("Opens ThinkLighter with the camera coming up, for a receipt or a form.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}
