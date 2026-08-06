import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import type { Account } from "@/types/account.type";
import type { Activity, WorkoutExercise } from "@/types/activity.type";
import type {
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPerformance,
  WorkoutPlace,
  WorkoutRegion,
  WorkoutActivitiesTimeline
} from "@/types/global.type";

dayjs.extend(minMax);

export class WorkoutService  {
  private readonly REST_CALORIES_PER_MIN = 1.5;

  // Factors
  private goalFactor: Record<WorkoutGoal, number> = {
    LOSE_WEIGHT: 1.1,
    GAIN_MUSCLE_MASS: 0.95,
    PERFORMANCE: 1.05
  };

  private levelFactor: Record<WorkoutLevel, number> = {
    BEGINNER: 0.9,
    INTERMEDIATE: 1,
    ADVANCED: 1.1
  };

  private performanceFactor: Record<WorkoutPerformance, number> = {
    RUNNING: 1.2,
    STRENGTH: 1,
    ENDURANCE: 1.15
  };

  private placeFactor: Record<WorkoutPlace, number> = {
    HOME: 0.95,
    EXTERNAL: 1.05,
    BOTH: 1
  };

  private regionFactor: Record<WorkoutRegion, number> = {
    LEGS: 1.2,
    BACK: 1.1,
    CHEST: 1.05,
    GLUTEUS: 1.15,
    ARMS: 0.95,
    SHOULDER: 0.95,
    ABDOMEN: 0.9
  };

  // Core
  private getWeightFactor(weight: number) {
    const raw = weight / 70;
    return 0.5 + raw * 0.5;
  };

  private getRegionFactor(regions?: WorkoutRegion[]) {
    if (!regions || regions.length === 0) return 1;

    const values = regions.map((r) => this.regionFactor[r] || 1);

    // pega média das regiões
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  private clampFactor(value: number) {
    // evita valores irreais
    return Math.min(1.6, Math.max(0.7, value));
  };

  getPausedSecondsInInterval(start: string, end: string, pauses: Activity["pauses"]) {
    const startM = dayjs(start);
    const endM = dayjs(end);

    return pauses.reduce((acc, pause) => {
      const pStart = dayjs(pause.started_at);
      const pEnd = pause.ended_at ? dayjs(pause.ended_at) : dayjs();

      // calcula interseção
      const overlapStart = dayjs.max(startM, pStart);
      const overlapEnd = dayjs.min(endM, pEnd);

      if (overlapEnd.isAfter(overlapStart)) {
        acc += overlapEnd.diff(overlapStart, "second");
      }

      return acc;
    }, 0);
  };

  buildActivityTimeline(activity: Activity, workoutExercises: Omit<WorkoutExercise, "load" | "warmup">[], account: Account) {
    const userFactor = this.getAccountTotalFactor(account);

    return activity.exercises!.reduce((acc, exercise) => {
      const startedAt = dayjs(exercise.started_at);
      const endedAt = exercise.ended_at ? dayjs(exercise.ended_at) : dayjs();

      // 1. Tempo total de relógio (ex: 10 min)
      const totalDurationSeconds = endedAt.diff(startedAt, "second");

      // 2. Pausas globais do cronômetro (ex: apertou 'Pause' pra beber água)
      const pausedSeconds = this.getPausedSecondsInInterval(
        exercise.started_at,
        exercise.ended_at || dayjs().toISOString(),
        activity.pauses
      );

      // 3. Descanso planejado entre as séries (ex: 30s entre série 1 e 2)
      const restSeconds = exercise.series.reduce(
        (accRest, serie) => accRest + (serie.rest.seconds || 0), 0
      );

      // 4. CÁLCULO CORRIGIDO:
      // O tempo de exercício real é: Total - Pausas do App - Descanso entre Séries
      const effectiveSeconds = Math.max(
        0,
        totalDurationSeconds - pausedSeconds - restSeconds
      );

      const findExercise = workoutExercises.find(
        (exer) => exer.exercise_id === exercise.exercise_id
      )!;

      acc.push(
        {
          type: "rest" as const,
          seconds: restSeconds,
          calories_per_min: this.REST_CALORIES_PER_MIN
        },
        {
          type: "exercise" as const,
          seconds: effectiveSeconds,
          calories_per_min: findExercise.calories_per_min * userFactor
        }
      );

      return acc;
    }, [] as WorkoutActivitiesTimeline);
  };

  calculateTotalCalories(timeline: WorkoutActivitiesTimeline) {
    const total = timeline.reduce((acc, item) => {
      const calories = (item.calories_per_min / 60) * item.seconds;
      return acc + calories;
    }, 0);

    return Math.round(total * 1000) / 1000;
  };

  private getAccountTotalFactor(account: Account) {
    const weightFactor = this.getWeightFactor(account.weight);
    const goalFactor = this.goalFactor[account.preferences.goal as WorkoutGoal] || 1;
    const levelFactor = this.levelFactor[account.preferences.level as WorkoutLevel] || 1;
    const placeFactor = this.placeFactor[account.preferences.training_location as WorkoutPlace] || 1;

    let performanceFactor = 1;
    let regionFactor = 1;

    if (account.preferences.personalized_goal.status) {
      if (account.preferences.goal === "PERFORMANCE") {
        performanceFactor = this.performanceFactor[account.preferences.personalized_goal.focus_performance as WorkoutPerformance] || 1;
      }

      if (account.preferences.goal === "GAIN_MUSCLE_MASS") {
        regionFactor = this.getRegionFactor(account.preferences.personalized_goal.focus_region as WorkoutRegion[]);
      }
    }

    return this.clampFactor(weightFactor * goalFactor * levelFactor * performanceFactor * placeFactor * regionFactor);
  }
};