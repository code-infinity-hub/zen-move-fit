export interface Workout {
  _id: string,
  created_at?: string,
  date: string,
  day: number,
  week: number,
  title: string,
  exercises: {
    exercise_id: string,
    name: string,
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
    load: {
      type: "bodyweight" | "fixed" | "percentage",
      value: number | null,
      unit: "kg" | "lbs" | "%" | null
    },
    rest_seconds: number,
    rest_after_exercise_seconds: number,
    estimated_duration_seconds: number,
    warmup: boolean
  }[],
  estimated_duration_seconds: number,
  estimated_calories: number,
  met: number,
  intensity: "light" | "moderate" | "heavy",
  status: "PENDING" | "STARTED" | "DONE",
  activity_id: string,
};