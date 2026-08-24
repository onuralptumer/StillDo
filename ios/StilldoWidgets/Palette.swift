//
//  The app's tokens, in the form SwiftUI wants them. Ported from
//  `src/theme.ts`; the widgets are the app's surface on someone else's screen,
//  so they are the same two palettes and the same typeface, not an approximation.
//

import SwiftUI

extension Color {
  /// The tokens are written as hex in `src/theme.ts`, and stay written that
  /// way here so the two files can be read side by side.
  init(hex: UInt32) {
    self.init(
      .sRGB,
      red: Double((hex >> 16) & 0xFF) / 255,
      green: Double((hex >> 8) & 0xFF) / 255,
      blue: Double(hex & 0xFF) / 255,
      opacity: 1
    )
  }
}

struct Palette {
  let bg: Color
  let raise: Color
  let accent: Color
  let ink: Color
  let mute: Color
  let line: Color

  static let dark = Palette(
    bg: Color(hex: 0x100904),
    raise: Color(hex: 0x382416),
    accent: Color(hex: 0xDC5000),
    ink: Color(hex: 0xFFEDD7),
    mute: Color(hex: 0x6C5F51),
    line: Color(hex: 0x40372E)
  )

  static let light = Palette(
    bg: Color(hex: 0xFBF7F3),
    raise: Color(hex: 0xF2E3D3),
    accent: Color(hex: 0xA83900),
    ink: Color(hex: 0x251A11),
    mute: Color(hex: 0x6B5949),
    line: Color(hex: 0xD9CABB)
  )

  /// Settings can hold the app dark or light against the phone's own choice.
  /// A widget honours that, because a widget that ignored it would be the one
  /// bright square on an otherwise held-dark home screen.
  static func of(_ appearance: String, following scheme: ColorScheme) -> Palette {
    switch appearance {
    case "dark": return .dark
    case "light": return .light
    default: return scheme == .light ? .light : .dark
    }
  }
}

/// Weight lives in the family name, as it does in the app.
enum Face {
  static let regular = "HankenGrotesk-Regular"
  static let medium = "HankenGrotesk-Medium"
}

extension Font {
  /// The app's small uppercase label. `tracking` is applied by the caller,
  /// because SwiftUI keeps letter-spacing on the view rather than on the font.
  static func label(_ size: CGFloat) -> Font {
    .custom(Face.medium, size: size)
  }

  static func body(_ size: CGFloat) -> Font {
    .custom(Face.regular, size: size)
  }
}

extension View {
  /// iOS 17 draws the widget's background for us, and wants to be told what it
  /// is so it can extend it behind the system's own margins. Before that, the
  /// view had to paint its own.
  @ViewBuilder
  func widgetBackground(_ color: Color) -> some View {
    if #available(iOS 17.0, *) {
      containerBackground(color, for: .widget)
    } else {
      background(color)
    }
  }
}
