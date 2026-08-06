export type NotificationType =
  | "PLAN_READY"
  | "TRAINING_INSIGHT"
  | "CHALLENGE_INSIGHT"
  | "ACTIVITY_INSIGHT"
  | "ZENA_MESSAGE"
  | "ACTIVITY_TAG"
  | "STREAK_ALERT"
  | "WEEKLY_WORKOUTS_COMPLETED"
  | "WEEKLY_CHALLENGES_COMPLETED"
  | "POST_MENTION"
  | "COMMENT_MENTION"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "ACHIEVEMENT"
  | "POST_REACTION"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "CHAT_MESSAGE"
  | "LEVEL_UP"
  | "PAYMENT_FAILED"
  | "SUBSCRIPTION_EXPIRING"
  | "SUBSCRIPTION_ENDED"
  | "SUBSCRIPTION_ACTIVATED"
  | "CREDIT_PURCHASE_PAID"
  | "CREDITS_LOW"
  | "DOCUMENT_VERIFICATION_REQUIRED"
  | "DOCUMENT_VERIFICATION_APPROVED"
  | "DOCUMENT_VERIFICATION_REJECTED"
  | "DAILY_WORKOUT_REMINDER"
  | "MISSED_WORKOUT"
  | "EQUIPMENT_MILEAGE";

export type AppNotification = {
  _id: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, string>,
  image: string,
  read: boolean,
  push_sent: boolean,
  created_at: string,
};