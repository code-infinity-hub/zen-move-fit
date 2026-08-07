import ActivityKit
import Foundation

@available(iOS 16.2, *)
struct RunActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var durationSeconds: Int
    var statusLabel: String
    var subtitle: String
    var stat1: String
    var stat2: String
  }

  var title: String
  var icon: String
}
