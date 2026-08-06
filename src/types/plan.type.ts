export type MealType = "breakfast" | "lunch" | "snack" | "dinner" | "pre_workout" | "post_workout" | "supper";

export interface Plan {
  _id: string,
  created_at: string,
  weight: number,
  height: number,
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
      date_start: string,
      date_end: string,
    }
  },
};

export interface PlanMeal {
  _id: string,
  date: string,
  meals: {
    snack_id: string,
    type: MealType,
    status: "PENDING" | "DONE",
    done_at: string,
    time: string,
    name: string,
    ingredients: string[],
    steps: string[],
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }[],
  informative: {
    total_calories: number,
    consumed_calories: number,
    percentage_calories: number,
    nutrition: {
      calories: number,
      protein: number,
      carbs: number,
      fat: number
    }
  },
  historical: {
    _id: string,
    date: string,
    name: string,
    description: string,
    creation_method: "AI" | "PHOTO" | "MANUAL",
    type: MealType,
    nutrition: {
      calories: number,
      protein: number,
      carbs: number,
      fat: number
    },
    url_photo?: string,
  }[]
};