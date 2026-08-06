import { type Component } from "vue";
import { MediaService } from "@/services/media.service";
import { type ActivityDetail } from "@/types/activity.type";

export interface ContentSegment {
  type: "text" | "mention",
  value: string,
  userId?: string,
};

export type Platform = "android" | "ios" | "web";

export interface Options {
  method?: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, any>,
  headers?: Record<string, string>
};

export interface Response {
  error: boolean,
  server_error?: boolean,
  message?: string,
  [key: string]: any
};

export interface Availability {
  available: boolean,
  message: { pt: string, en: string },
  updated_at: string
};

export interface GetCardToken {
  cardNumber: string,
  cardholderName: string,
  cardExpirationMonth: string,
  cardExpirationYear: string,
  securityCode: string,
  identificationNumber: string,
  identificationType: "CPF" | "CNPJ"
};

export type DoubleTapOptions = {
  delay?: number,
  onDoubleTap: (event?: PointerEvent) => void,
};

export type Pagination<T> = {
  page: number,
  limit: number,
  total: number,
  pages: number,
  results: T[]
};

export type ToneOptions = {
  freq: number,
  at?: number,
  dur?: number,
  type?: OscillatorType,
  vol?: number,
  slideTo?: number,
};

export type CelebrationIntensity = "light" | "success" | "epic";
export type CelebrateOptions = { sound?: boolean };

export type AppEvent = {
  event: "app_opened" | "push_opt_in" | "push_opt_out" | "screen_viewed",
  props?: Record<string, any>,
};

export type DailyQuest = {
  id: string,
  event: string,
  target: number,
  xp: number,
  progress: number,
  completed: boolean,
};

// Map
export type Maplibre = typeof import("maplibre-gl");
export type MapOnEvents = "ready" | "change-recenter";

export interface Point {
  lat: number,
  lng: number,
  accuracy: number,
  speed: number
};

// Medias
export type MediaResult = Awaited<ReturnType<MediaService["formatResult"]>>;

// Workout
export type WorkoutGoal = "LOSE_WEIGHT" | "GAIN_MUSCLE_MASS" | "PERFORMANCE";
export type WorkoutLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type WorkoutPerformance = "RUNNING" | "STRENGTH" | "ENDURANCE";
export type WorkoutPlace = "HOME" | "EXTERNAL" | "BOTH";
export type WorkoutRegion = "CHEST" | "BACK" | "LEGS" | "ARMS" | "SHOULDER" | "GLUTEUS" | "ABDOMEN";
export type WorkoutActivitiesTimeline = {
  type: "rest" | "exercise",
  seconds: number,
  calories_per_min: number
}[];

// Activity
export type SyntheticPause = { started_at: string, ended_at: string };

export interface LocationPoint {
  lat: number,
  lng: number,
  accuracy: number,
  altitude: number,
  altitudeAccuracy: number,
  speed: number,
  time: number,
  elapsedSeconds: number
};

export interface Split {
  km: number,
  pace: number,
  duration: number,
};

export interface RunningRealtimeMetrics {
  duration: number,
  movingDuration: number,
  distance: number,
  avgPace: number,
  realtimePace: number,
  avgSpeed: number,
  calories: number,
  splits: Split[],
  lastPoint?: LocationPoint
};

export interface RunningMetricsCheckpoint {
  distance: number,
  calories: number,
  movingDuration: number,
  avgSpeed: number,
  avgPace: number,
  realtimePace: number,
  currentSpeed: number,
  elapsedSeconds: number,
  currentSplitDistance: number,
  currentSplitStartedAt: number,
  cadence: number,
  splits: Split[],
  lastPoint?: LocationPoint,
  steps: number,
}

export type ActivitiesCategories = "RUNNING" | "TRAIL_RUNNING" | "WALKING" | "CYCLING" | "BELT";

export type ProjectedPoint = { x: number, y: number };

export type RouteMarkers = {
  start: ProjectedPoint,
  end: ProjectedPoint,
  isCircular: boolean,
};

export interface BestEffort {
  distanceKm: number,
  label: string,
  totalSeconds: number,
  paceSeconds: number,
};

// AI
export type ZenaActionId = "OPEN_SUBSCRIPTION" | "CREATE_PLAN" | "VIEW_WORKOUTS" | "VIEW_CHALLENGES";

export interface ZenaAction {
  id: ZenaActionId,
  label: string,
};

export type ListMessages = {
  message_id: string,
  role: "user" | "system",
  content: string,
  actions?: ZenaAction[],
}[];

export interface ReceivedMessageAi {
  conversation_id: string,
  message_id: string,
  reply: string,
  replace?: boolean,
  actions?: ZenaAction[],
};

export interface ReceivedErrorMessageAi {
  conversation_id: string,
  message_id: string,
  error: string,
  input: string,
  system_error?: boolean,
  new?: boolean,
};

/// SHARE
export type ShareFormat = "feed" | "story";

export interface ShareCardProps {
  activity: ActivityDetail,
  format?: ShareFormat,
  imageCache?: Record<string, string>,
};

export interface ShareTemplateDef {
  id: string,
  labelKey: string,
  component: Component,
  formats: ShareFormat[],
  transparent?: boolean,
  props?: Record<string, any>,
};

export interface ShareTemplateGroupDef {
  id: string,
  labelKey: string,
  templates: ShareTemplateDef[],
};

/// LEAGUE
export type LeagueMember = {
  _id: string,
  position: number,
  xp: number,
  name: string,
  username: string,
  image: string,
  level: number,
};

export type League = {
  _id: string,
  week: string,
  tier: number,
  tier_name: string,
  closes_at: string,
  zones: { promote: number, demote: number },
  position: number,
  members: LeagueMember[],
};

export type LeagueResult = {
  cohort_id: string,
  week: string,
  tier: number,
  tier_name: string,
  position: number,
  xp: number,
  movement: "PROMOTED" | "DEMOTED" | "STAYED",
};

/// REWARD CHESTS
export type ChestRarity = "common" | "rare" | "epic";

export type PossibleReward = {
  type: "CREDITS" | "XP" | "STREAK_FREEZE",
  amount: number,
  rarity: ChestRarity,
};

export type PendingChest = {
  _id: string,
  source: "ACTIVITY" | "STREAK_MILESTONE" | "DAILY_QUESTS" | "WELCOME",
  created_at: string,
  possible_rewards: PossibleReward[],
};

export type ChestReward = {
  type: "CREDITS" | "XP" | "STREAK_FREEZE",
  amount: number,
  rarity: ChestRarity,
};