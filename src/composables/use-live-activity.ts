import { Capacitor, RunLiveActivity } from "@/mobile";

interface LiveActivityContent {
  durationSeconds: number,
  statusLabel?: string,
  subtitle?: string,
  stat1?: string,
  stat2?: string
};

interface LiveActivityStart extends LiveActivityContent {
  title: string,
  icon: string
};

export const useLiveActivity = () => {
  const active = ref(false);

  const start = async (options: LiveActivityStart) => {
    if (Capacitor.getPlatform() !== "ios" || active.value) return;

    const { started } = await RunLiveActivity.start({
      title: options.title,
      icon: options.icon,
      durationSeconds: options.durationSeconds,
      statusLabel: options.statusLabel ?? "",
      subtitle: options.subtitle ?? "",
      stat1: options.stat1 ?? "",
      stat2: options.stat2 ?? ""
    });

    active.value = started;
  };

  const update = async (options: LiveActivityContent) => {
    if (!active.value) return;

    await RunLiveActivity.update({
      durationSeconds: options.durationSeconds,
      statusLabel: options.statusLabel ?? "",
      subtitle: options.subtitle ?? "",
      stat1: options.stat1 ?? "",
      stat2: options.stat2 ?? ""
    });
  };

  const end = async () => {
    if (!active.value) return;

    active.value = false;
    await RunLiveActivity.end();
  };

  return { active, start, update, end };
};