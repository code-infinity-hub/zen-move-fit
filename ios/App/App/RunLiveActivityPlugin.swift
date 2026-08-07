import ActivityKit
import Capacitor
import Foundation

@objc(RunLiveActivityPlugin)
public class RunLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "RunLiveActivityPlugin"
  public let jsName = "RunLiveActivity"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
  ]

  private var activity: Any?

  @objc func isSupported(_ call: CAPPluginCall) {
    guard #available(iOS 16.2, *) else {
      call.resolve(["supported": false])
      return
    }

    call.resolve(["supported": ActivityAuthorizationInfo().areActivitiesEnabled])
  }

  private func readContentState(_ call: CAPPluginCall) -> RunActivityAttributes.ContentState {
    RunActivityAttributes.ContentState(
      durationSeconds: call.getInt("durationSeconds") ?? 0,
      statusLabel: call.getString("statusLabel") ?? "",
      subtitle: call.getString("subtitle") ?? "",
      stat1: call.getString("stat1") ?? "",
      stat2: call.getString("stat2") ?? ""
    )
  }

  @objc func start(_ call: CAPPluginCall) {
    guard #available(iOS 16.2, *) else {
      call.resolve(["started": false])
      return
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      call.resolve(["started": false])
      return
    }

    let attributes = RunActivityAttributes(
      title: call.getString("title") ?? "",
      icon: call.getString("icon") ?? "figure.run"
    )

    do {
      let started = try Activity<RunActivityAttributes>.request(
        attributes: attributes,
        content: .init(state: readContentState(call), staleDate: nil)
      )

      self.activity = started
      call.resolve(["started": true, "activityId": started.id])
    } catch {
      call.resolve(["started": false, "error": error.localizedDescription])
    }
  }

  @objc func update(_ call: CAPPluginCall) {
    guard #available(iOS 16.2, *), let activity = self.activity as? Activity<RunActivityAttributes> else {
      call.resolve()
      return
    }

    let contentState = readContentState(call)

    Task {
      await activity.update(.init(state: contentState, staleDate: nil))
      call.resolve()
    }
  }

  @objc func end(_ call: CAPPluginCall) {
    guard #available(iOS 16.2, *), let activity = self.activity as? Activity<RunActivityAttributes> else {
      call.resolve()
      return
    }

    Task {
      await activity.end(nil, dismissalPolicy: .immediate)
      self.activity = nil
      call.resolve()
    }
  }
}
