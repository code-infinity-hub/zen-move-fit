export interface Challenge {
  _id: string,
  created_at?: string,
  date: string,
  intensity: "light" | "moderate" | "intense",
  activity_id: string,
  status: "PENDING" | "STARTED" | "DONE",
  exercises: {
    name: string,
    exercise_id: string,
    sets: number,
    calories_per_min: number,
    thumb?: string,
    video_source?: "youtube" | "own",
    video_link?: string,
    instructions: string[],
    tips: string[],
    common_mistakes: string[],
    equipments: {
      icon: string,
      title: string,
      description: string
    }[],
    reps: {
      type: "time" | "fixed",
      min: number | null,
      max: number | null,
      time: number | null,
      time_type: "seconds" | "minutes" | "hours" | null,
    },
    rest_between_sets_seconds: number,
    rest_after_exercise_seconds: number,
    estimated_duration_seconds: number,
    estimated_calories: number,
    difficulty: "easy" | "medium" | "hard"
  }[],
};