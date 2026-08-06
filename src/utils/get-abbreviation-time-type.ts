import { type WorkoutExercise } from "@/types/activity.type";

export const getAbbreviationTime = (type: WorkoutExercise["reps"]["time_type"]) => {
  if (!type) return "";
  return {
    hours: "h",
    minutes: "m",
    seconds: "s",
  }[type] || "";
};