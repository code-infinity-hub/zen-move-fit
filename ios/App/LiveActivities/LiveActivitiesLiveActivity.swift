//
//  LiveActivitiesLiveActivity.swift
//  LiveActivities
//
//  Created by Philipi Guisolpe on 07/08/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

private let primaryColor = Color(red: 0x48 / 255, green: 0xF2 / 255, blue: 0x6D / 255)
private let backgroundColor = Color(red: 0x0E / 255, green: 0x11 / 255, blue: 0x15 / 255)

private func formatDuration(_ seconds: Int) -> String {
    let minutes = seconds / 60
    let secs = seconds % 60
    return String(format: "%02d:%02d", minutes, secs)
}

@available(iOS 16.2, *)
struct LiveActivitiesLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RunActivityAttributes.self) { context in
            VStack(spacing: 6) {
                HStack(spacing: 6) {
                    Image(systemName: context.attributes.icon)
                        .foregroundColor(primaryColor)

                    Text(context.attributes.title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    if !context.state.statusLabel.isEmpty {
                        Text("• \(context.state.statusLabel)")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.yellow)
                            .lineLimit(1)
                    }
                }

                if !context.state.subtitle.isEmpty {
                    Text(context.state.subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }

                HStack(spacing: 20) {
                    Text(formatDuration(context.state.durationSeconds))

                    if !context.state.stat1.isEmpty {
                        Text(context.state.stat1)
                    }

                    if !context.state.stat2.isEmpty {
                        Text(context.state.stat2)
                    }
                }
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            }
            .padding(12)
            .activityBackgroundTint(backgroundColor)
            .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(formatDuration(context.state.durationSeconds))
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.stat1)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }

                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.stat2)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.subtitle.isEmpty ? context.attributes.title : context.state.subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(primaryColor)
                        .lineLimit(1)
                }
            } compactLeading: {
                Image(systemName: context.attributes.icon)
                    .foregroundColor(primaryColor)
            } compactTrailing: {
                Text(formatDuration(context.state.durationSeconds))
                    .font(.system(size: 13))
                    .foregroundColor(.white)
            } minimal: {
                Image(systemName: context.attributes.icon)
                    .foregroundColor(primaryColor)
            }
            .keylineTint(primaryColor)
        }
    }
}
