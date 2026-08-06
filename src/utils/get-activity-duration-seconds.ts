import dayjs from "dayjs";
import { type Activity } from "@/types/activity.type";

export const getActivityDurationSeconds = (activity: Activity, endedAt: string) => {
  const startedAt = dayjs(activity.started_at);
  const finishedAt = dayjs(endedAt);

  const totalSeconds = finishedAt.diff(startedAt, "second");

  const pausedSeconds = activity.pauses.reduce((acc, pause) => {
    if (!pause.ended_at) return acc;
    return acc + dayjs(pause.ended_at).diff(dayjs(pause.started_at), "second");
  }, 0);

  return Math.max(0, totalSeconds - pausedSeconds);
};