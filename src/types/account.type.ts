import { type Subscription } from "./subscription.type";
import { type Workout } from "./workout.type";
import { type Challenge } from "./challenge.type";
import { type MealType } from "./plan.type";

export interface Account {
  _id: string,
  created_at: string,
  name: string,
  username: string,
  email: string,
  date_of_birth: string,
  image: string,
  updated_image_at: string,
  subscription: string,
  subscription_recurrences: number,
  subscription_lifetime: {
    enabled: boolean,
    recharge_credits: boolean,
    credits: number,
    renewal_date: string,
  },
  cpf: string,
  weight: number,
  height: number,
  level: number,
  xp: number,
  max_xp: number,
  classification: "beginner" | "improving" | "consistent" | "dedicated" | "athlete" | "elite",
  preparing_plan: boolean,
  guarantee_activated: boolean,
  consecutive_days: number,
  streak_freezes: number,
  league_tier: number,
  timezone: string,
  plan_id: string,
  credits: { plan: number, purchased: number },
  indication: {
    status: boolean,
    percentage: number,
    id: string,
    reason: string,
    reversible: boolean,
    second_level_status: boolean,
    second_level_percentage: number,
    extras_status: boolean,
    extras_percentage: number,
    amount?: number,
    full_amount?: number
  },
  phone: { ddi: string, ddd: string, number: string },
  recipient: { identification: string, status: string },
  balance: { available: number, pendant: number, transferred: number },
  popups: { refer_and_earn: boolean },
  historical: { activities: number, distances: number, calories: number },
  notification_ids: {
    type: "app" | "backoffice",
    platform: "android" | "ios",
    id: string,
    created_at: string
  }[],
  preferences: {
    desired_weight: number,
    goal: string,
    level: string,
    training_location: string,
    sports_practiced: string[],
    days: number,
    personalized_goal: {
      status: boolean,
      focus_region: string[],
      focus_performance: string,
      desired_goal: string,
      deadline: string
    },
    food: {
      dietary_restriction: string,
      preferences: string,
      pre_workout: boolean,
      post_workout: boolean,
      supper: boolean,
    }
  },
  plan: {
    status: boolean,
    workout?: Workout,
    challenge?: Challenge,
    meal_plan?: {
      _id: string,
      created_at: string,
      date: string,
      meals: {
        snack_id: string,
        type: MealType,
        status: "PENDING" | "DONE",
        done_at: string,
        name: string,
        ingredients: string[],
        steps: string[],
        nutrition: {
          calories: number,
          protein: number,
          carbs: number,
          fat: number
        }
      }[],
    }[],
    weekly_progress?: {
      total: number,
      minutes: number,
      calories: number,
      percentage: number
    }
  },
  settings: {
    privacy: {
      visibility: "public" | "private",
      content_visibility: {
        workouts: "public" | "followers" | "only_me",
        challenges: "public" | "followers" | "only_me",
        progress: "public" | "followers" | "only_me",
      },
      sensitive_data: {
        show_weight: boolean,
        show_measurements: boolean,
        show_calories: boolean
      },
      interactions: {
        who_can_comment: "all" | "followers" | "none",
        who_can_tag: "all" | "followers" | "none",
        who_can_mention: "all" | "followers" | "none",
        who_can_invite_to_workout: "all" | "followers" | "none"
      },
      tagging: {
        auto_approve_tags: boolean,
        review_tags_before_post: boolean
      }
    },
    notifications: {
      workout: {
        daily_reminder: boolean,
        plan_ready: boolean,
        missed_workout: boolean
      },
      habits: {
        reminders: boolean,
        streak_alerts: boolean
      },
      social: {
        likes: boolean,
        comments: boolean,
        messages: boolean,
        new_followers: boolean,
        mentions: boolean,
        tags: boolean,
        workout_invites: boolean
      },
      system: {
        push: boolean,
        email: boolean
      },
      referral: {
        enabled: boolean,
        apply_quiet_hours: boolean,
      },
      quiet_hours: {
        enabled: boolean,
        start: string,
        end: string
      },
    }
  },
  ai_settings: {
    nickname: string,
    style: "motivational" | "direct" | "technical" | "friendly",
    goal: "weight_loss" | "hypertrophy" | "conditioning" | "health",
    frequency_of_motivation: "high" | "medium" | "low",
    detailed_answers: boolean,
  },
  achievements: {
    id: string,
    emoji: string,
    conquered?: boolean,
    conquered_at?: string,
    view?: boolean
  }[],
  verified?: true,
  updated_at?: string,
  subscription_details?: Subscription,
  backoffice?: {
    enabled: boolean,
  },
};

export type UpdateAccount = Partial<Pick<Account, "settings" | "notification_ids" | "timezone" | "username" | "preferences" | "ai_settings">> |
  {
    lang?: string,
    profile: { base64: string, format: string, mimetype: string }
  };

export interface AccountRanking {
  _id: string,
  total_xp: number,
  account_id: string,
  name: string,
  username: string,
  image: string,
  initial: string,
};

export interface AccountIndication {
  _id: string,
  name: string,
  image: string,
  created_at: string,
  converted: boolean,
  status: "PENDING" | "CONVERTED" | "CANCELED",
  earned_amount: number,
};

export interface AccountIndicationTransaction {
  _id: string,
  type: "SUBSCRIPTION" | "PURCHASE_OF_CREDITS",
  amount: number,
  created_at: string,
};

export interface AccountIndicationDetail {
  indication: AccountIndication,
  transactions: AccountIndicationTransaction[],
};

export interface AccountAggregateIndication {
  _id: string,
  name: string,
  image: string,
  percentage: number,
  earned_amount: number,
};

export interface AccountRecipient {
  name: string,
  birthdate: string,
  monthly_income: number,
  professional_occupation: string,
  id: string,
  status: "registration" | "affiliation" | "active" | "refused" | "suspended" | "blocked" | "inactive",
  email: string,
  type: "individual",
  document: string,
  phone_number: string,
  phone_type: "mobile",
  address: {
    street: string,
    reference_point?: string,
    complement?: string
    neighborhood: string,
    city: string,
    state: string,
    zipcode: string,
    number: string,
  },
  default_bank_account: {
    bank: string,
    holder_name: string,
    branch_number: string,
    branch_check_digit: string,
    account_number: string,
    account_check_digit: string,
    type: "checking" | "savings"
  }
};

export interface AccountMetrics {
  consecutive_days: number,
  number_training: number,
  number_challenges: number,
  calories: number,
  kms: number,
  weekly_progress?: {
    total: number,
    target: number,
    percentage: number,
    goal: string
  },
  daily_workouts: number[],
  calories_per_day: { total: number, training: number, challenge: number, avulse: number }[],
  kilometers_traveled: number[],
};