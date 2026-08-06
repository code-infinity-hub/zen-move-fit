import { type Activity } from "@/types/activity.type";

type DurationSource = Pick<Activity, "type" | "duration_seconds"> & {
  metrics?: { moving_seconds?: number | null } | null
};

export const getPrimaryDurationSeconds = (activity: DurationSource) => {
  if (activity.type !== "AVULSE") return activity.duration_seconds;

  const movingSeconds = activity.metrics?.moving_seconds;

  if (movingSeconds === undefined || movingSeconds === null) {
    return activity.duration_seconds;
  }

  return Math.min(movingSeconds, activity.duration_seconds);
};
