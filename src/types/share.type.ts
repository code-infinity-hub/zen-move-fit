export type ShareFormat = "feed" | "story";

export type ImageCache = Record<string, string>;

export type ShareTemplateGroup =
  | "highlights"
  | "photos"
  | "ai"
  | "stats"
  | "records"
  | "transparent"
  | "route"
  | "workout"
  | "challenge";

export type RoutePoint = { lat: number, lng: number };

export type PhotoLayout =
  | "fullscreen"
  | "metrics"
  | "map"
  | "data"
  | "ai"
  | "record"
  | "goal";