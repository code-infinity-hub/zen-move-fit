/// FRIENDS
export type FriendStatuses = "PENDING" | "DONE";
export type RequestFriendStatuses = "PENDING" | "DONE" | "REFUSED";

export interface SocialFriend {
  friendship_id: string,
  account_id: string,
  username: string,
  name: string,
  image: string,
  level: number,
  status: FriendStatuses,
  verified?: boolean,
};

export interface SuggestionFriend {
  account_id: string,
  username: string,
  name: string,
  image: string,
  level: number,
  score: number,
  verified?: boolean,
};

export interface RequestFriend {
  friendship_id: string,
  account_id: string,
  username: string,
  name: string,
  image: string,
  level: number,
  verified?: boolean,
};

export interface SearchFriend {
  account_id: string,
  name: string,
  username: string,
  image: string,
  level: number,
  score: number,
  friendship: { friendship_id: string, status: FriendStatuses } | null,
  type: "FRIEND" | "MUTUAL",
  verified?: boolean,
};

/// CHATS
export interface Chat {
  friendship_id: string,
  unread: number,
  account: {
    _id: string,
    username: string,
    name: string,
    image: string,
    level: number,
    verified?: boolean,
  },
  message: {
    _id: string,
    identification: string,
    created_at: string,
    sender: { _id: string, name: string, image: string },
    view: boolean,
    viewed_at?: string,
  } & SendMessage
};

export type SendMessageBody =
  { type: "TEXT", text: string } |
  { type: "VOICE" | "IMAGE", base64: string, format: string, mimetype: string };

export type SendMessage =
  { type: "TEXT", text: string } |
  { type: "VOICE" | "IMAGE", url: string };

export type Message =
  {
    message_id: string,
    friendship_id: string,
    sender: string,
    receiver: string,
    created_at: string,
    view: boolean,
    viewed_at?: string,
  } & SendMessage;

export type ReceivedMessage =
  {
    name: string,
    image: string,
  } & Message;

/// PROFILE
export interface Profile {
  account_id: string,
  username: string,
  name: string,
  image: string,
  level: number,
  classification: "beginner" | "improving" | "consistent" | "dedicated" | "athlete" | "elite",
  friendship?: { friendship_id: string, status: Omit<RequestFriendStatuses, "REFUSED"> },
  verified?: boolean,
  friends: number,
  status: "ONLINE" | "OFFLINE",
  last_time_online: string,
  bio?: string,
  is_private: boolean,
  current_user_relationship: {
    friendship_status: "friends" | "pending_sent" | "pending_received" | "none",
    friendship_id: string | null,
  },
  stats: {
    total_workouts: number | null,
    total_km: number | null,
    total_achievements: number | null,
    total_calories: number | null,
  },
  body: {
    weight: number | null,
    height: number | null,
  },
};

/// POSTS
export type PostReactionType = "LIKE" | "FIRE" | "STRENGTH" | "CLAP";

export interface PostReactionSummaryItem {
  type: PostReactionType,
  count: number,
};

export interface PostReactions {
  total: number,
  summary: PostReactionSummaryItem[],
  current_user_reaction: PostReactionType | null,
};

export interface PostPermissions {
  can_comment: boolean,
  can_react: boolean,
};

export interface PostActivity {
  _id: string,
  type: "TRAINING" | "CHALLENGE" | "AVULSE",
  category: string | null,
  title: string,
  started_at?: string,
  duration_seconds: number,
  calories?: number,
  perceived_effort?: number | null,
  metrics: {
    distance_meters: number,
    avg_pace: number,
    avg_speed: number,
    moving_seconds?: number | null,
  } | null,
  exercises_count?: number,
  map_picture: string | null,
  files: { url: string, mimetype: string }[],
  tagged_people: MentionUser[],
  hidden_details?: string[],
};

export interface Post {
  post_id: string,
  activity_id?: string | null,
  activity?: PostActivity | null,
  created_at: string,
  post: string,
  files: { url: string, mimetype: string }[],
  mentions: MentionUser[],
  reactions: PostReactions,
  comment_count: number,
  save_count: number,
  is_saved: boolean,
  suggested: boolean,
  current_user_permissions: PostPermissions,
  account: {
    _id: string,
    username: string,
    name: string,
    image: string,
    level: number,
    verified?: boolean
  },
};

export interface CommentPermissions {
  can_edit: boolean,
  can_delete: boolean,
};

export interface MentionUser {
  _id: string,
  username: string,
  name: string,
  image: string,
};

export interface PostComment {
  _id: string,
  post_id: string,
  parent_id: string | null,
  text: string,
  reply_count: number,
  deleted: boolean,
  created_at: string,
  account: {
    _id: string,
    username: string,
    name: string,
    image: string,
  },
  permissions: CommentPermissions,
  mentions: MentionUser[],
};