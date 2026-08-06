import { type Account } from "@/types/account.type";
import { type ActivitiesCategories } from "./global.type";

export type WorkoutExercise = NonNullable<Account["plan"]["workout"]>["exercises"][number];

export interface Exercise {
  started_at: string,
  ended_at: string,
  exercise_id: string,
  reps: WorkoutExercise["reps"],
  series: {
    set: number,
    started_at: string,
    ended_at: string,
    rest: { seconds: number, created_at: string, ended_at: string, jump: boolean },
    load?: number | null,
  }[]
};

export interface Activity {
  _id: string,
  account_id?: string,
  is_shared?: boolean,
  workout_id?: string,
  challenge_id?: string,
  created_at?: string,
  timezone: string,
  date_completed: string,
  duration_seconds: number,
  calories: number,
  started_at: string,
  ended_at: string,
  type: "TRAINING" | "CHALLENGE" | "AVULSE",
  status: "PENDING" | "DONE",
  pauses: { started_at: string, ended_at: string }[],
  exercises?: Exercise[],
  from_coords: { lat: number, lng: number },
  workout_title?: string,
  title?: string,
  category?: ActivitiesCategories,
  detect_nearby_runners?: boolean,
  metrics?: {
    avg_pace: number,
    avg_speed: number,
    distance_meters: number,
    steps: number,
    elapsed_seconds: number,
    moving_seconds?: number,
    splits: {
      km: number,
      started_at: string,
      ended_at: string,
      duration_seconds: number,
    }[]
  },
  points?: {
    id: number,
    accuracy: number,
    altitude: number,
    altitudeAccuracy: number,
    lat: number,
    lng: number,
    speed: number,
    time: number,
  }[]
};

export interface ActivityAnalysisContextItem {
  key: string,
  value?: number,
  type: "positive" | "neutral" | "negative",
  icon: string,
};

export interface ActivityAnalysisEvolutionItem {
  key: string,
  trend: "up" | "down" | "stable",
  streak?: number,
};

export interface ActivityAnalysisScore {
  score: number,
  label_key: string,
  color: string,
  reason_keys: string[],
};

export interface ActivityAnalysisWhatItMeansItem {
  key: string,
  value?: number,
};

export interface ActivityAnalysisEffortDistribution {
  start: "easy" | "moderate" | "hard" | "aggressive",
  middle: "easy" | "moderate" | "hard",
  finish: "strong" | "consistent" | "fatigue",
  description_key: string,
};

export interface ActivityAnalysisRecord {
  title_key: string,
  description_key: string,
  value?: number,
  rank?: number,
  is_pr: boolean,
};

export interface ActivityAnalysisPredictionItem {
  distance_km: number,
  label_key: string,
  estimated_seconds: number,
};

export interface ActivityAnalysisPredictions {
  items: ActivityAnalysisPredictionItem[],
};

export interface ActivityAnalysisRecovery {
  hours: number,
  label_key: string,
  description_key: string,
};

export interface ActivityAnalysisEfficiency {
  label_key: string,
  value: number,
  comparison_pct: number,
  trend: "up" | "down" | "stable",
};

export interface ActivityAnalysisHighlight {
  label_key: string,
  value?: number,
  secondary_value?: number,
  type: "positive" | "neutral" | "info",
};

export interface ActivityAnalysisNextGoal {
  type: "pace" | "distance",
  label_key: string,
  target_value: number,
  current_value: number,
  unit: string,
};

export interface ActivityAnalysisRecommendation {
  key: string,
  priority: "high" | "medium" | "low",
};

export interface ActivityAnalysisConsistency {
  active_weeks: number,
  total_weeks: number,
  streak: number,
  label_key: string,
  weekly_counts: number[],
  badges: string[],
};

export interface ActivityAnalysisTrainingLoad {
  acwr: number,
  zone: "low" | "optimal" | "caution" | "danger",
  label_key: string,
  acute_load: number,
  chronic_load: number,
};

export interface ActivityAnalysisComparedPeriod {
  label_key: string,
  pace_diff_seconds: number | null,
  distance_diff_pct: number | null,
  available: boolean,
};

export interface ActivityAnalysisComparedToYou {
  periods: ActivityAnalysisComparedPeriod[],
};

export interface ActivityAnalysis {
  context: ActivityAnalysisContextItem[],
  evolution: ActivityAnalysisEvolutionItem[],
  score: ActivityAnalysisScore,
  what_it_means: ActivityAnalysisWhatItMeansItem[],
  effort_distribution: ActivityAnalysisEffortDistribution | null,
  records: ActivityAnalysisRecord[],
  predictions: ActivityAnalysisPredictions | null,
  recovery: ActivityAnalysisRecovery | null,
  efficiency: ActivityAnalysisEfficiency | null,
  highlights: ActivityAnalysisHighlight[],
  next_goal: ActivityAnalysisNextGoal | null,
  recommendations: ActivityAnalysisRecommendation[],
  consistency: ActivityAnalysisConsistency | null,
  training_load: ActivityAnalysisTrainingLoad | null,
  compared_to_you: ActivityAnalysisComparedToYou | null,
};

export interface ChallengeAnalysis {
  difficulty_breakdown: { easy: number, medium: number, hard: number },
  streak: number,
  performance_vs_estimated: number | null,
  coach_bullets: { key: string, params: (string | number)[] }[],
};

export interface TrainingAnalysisMuscle {
  group: string,
  sets: number,
  percentage: number,
};

export interface TrainingAnalysisHighlight {
  key: string,
  type: "positive" | "neutral" | "info",
};

export interface TrainingAnalysisCoachBullet {
  key: string,
  params: (string | number)[],
};

export interface TrainingAnalysis {
  volume: {
    total_sets: number,
    total_reps: number,
    muscles_worked: TrainingAnalysisMuscle[],
  },
  highlights: TrainingAnalysisHighlight[],
  recovery: {
    hours: number,
    primary_muscles: string[],
  } | null,
  muscle_frequency: {
    period_days: number,
    counts: Record<string, number>,
  } | null,
  muscle_balance: {
    neglected: { group: string, days_since: number }[],
  } | null,
  consistency: {
    streak: number,
    weekly_count: number,
  } | null,
  coach_bullets: TrainingAnalysisCoachBullet[],
};

export interface ActivityDetail {
  _id: string,
  is_own: boolean,
  account_id: string,
  type: "TRAINING" | "CHALLENGE" | "AVULSE",
  category: "RUNNING" | "TRAIL_RUNNING" | "WALKING" | "CYCLING" | "BELT" | null,
  status: "PENDING" | "DONE",
  visibility: "ALL" | "FOLLOWERS" | "NONE",
  workout_id: string | null,
  workout_title: string | null,
  workout_intensity: "light" | "moderate" | "heavy" | "intense" | null,
  title: string | null,
  description: string | null,
  address: string | null,
  started_at?: string,
  ended_at: string,
  duration_seconds: number,
  calories?: number,
  perceived_effort: number | null,
  tags: string[],
  files: { url: string, mimetype: string }[],
  map_picture: string | null,
  insight: string | null,
  weather: {
    temperature: number,
    feels_like: number,
    humidity: number,
    wind_speed: number,
    wind_direction: number,
    wind_dir_text: string,
    weather_code: number,
    key: string,
  } | null,
  metrics: {
    avg_pace: number,
    avg_speed: number,
    distance_meters: number,
    steps: number,
    elapsed_seconds: number,
    moving_seconds?: number,
    elevation: { gain: number, min: number, max: number } | null,
    splits: { km: number, started_at: string, ended_at: string, duration_seconds: number }[],
  } | null,
  exercises?: {
    exercise_id: string,
    name: string,
    muscle_groups: string[],
    reps: {
      type: "time" | "fixed",
      min: number | null,
      max: number | null,
      time: number | null,
      time_type: "seconds" | "minutes" | "hours" | null,
    },
    series: {
      set: number,
      started_at: string,
      ended_at: string,
      rest: { seconds: number },
      load?: number | null,
    }[],
  }[],
  elevation_stream: { distance: number, elevation: number }[] | null,
  private_observations?: string | null,
  hidden_details?: string[],
  post?: boolean,
  tagged_people?: { _id: string, name: string, username: string, image: string, tag_id: string }[],
  post_id?: string | null,
  nearby_runners?: {
    account_id: string,
    activity_id: string,
    distance_meters: number,
    crossed_at: string,
    account_name: string,
    account_username: string,
    account_image: string,
  }[],
  equipment?: { _id: string, name: string, brand: string, distance_km: number } | null,
  analysis?: ActivityAnalysis | null,
  training_analysis?: TrainingAnalysis | null,
  challenge_analysis?: ChallengeAnalysis | null,
  challenge_plan_progress?: {
    ordinal: number,
    total: number,
    completed: number,
    percentage: number,
  } | null,
  show_complete: boolean,
  show_premium_sheet: boolean,
  account: {
    _id: string,
    name: string,
    username: string,
    image: string,
  },
};

export interface PendingActivityTag {
  _id: string,
  activity_id: string,
  created_at: string,
  account: {
    _id: string,
    name: string,
    username: string,
    image: string,
  },
  activity: {
    _id: string,
    type: "TRAINING" | "CHALLENGE" | "AVULSE",
    title: string,
  } | null,
};