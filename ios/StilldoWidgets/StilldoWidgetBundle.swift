//
//  Everything Stilldo offers the home and lock screens.
//

import SwiftUI
import WidgetKit

@main
struct StilldoWidgetBundle: WidgetBundle {
  var body: some Widget {
    QuickCaptureWidget()
    RightNowWidget()
    VoiceCaptureWidget()
    TextCaptureWidget()
    PhotoCaptureWidget()
  }
}
