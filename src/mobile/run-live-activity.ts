import { registerPlugin } from "@capacitor/core";

interface ContentState {
  durationSeconds: number,
  statusLabel: string,
  subtitle: string,
  stat1: string,
  stat2: string
};

interface StartOptions extends ContentState {
  title: string,
  icon: string
};

interface RunLiveActivityPlugin {
  isSupported(): Promise<{ supported: boolean }>,
  start(options: StartOptions): Promise<{ started: boolean, activityId?: string, error?: string }>,
  update(options: ContentState): Promise<void>,
  end(): Promise<void>
};

export const RunLiveActivity = registerPlugin<RunLiveActivityPlugin>("RunLiveActivity");