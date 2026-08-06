<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ `💪 ${t("$vuetify.label.training")}` }}</span>
      <span class="sc-date">{{ formatDuration(activity.duration_seconds) }}</span>
    </div>

    <p class="sc-title">{{ activity.workout_title ?? t("$vuetify.share.free_workout") }}</p>

    <div v-if="muscleGroups.length" class="sc-muscle-row">
      <span
        v-for="muscle in muscleGroups"
        :key="muscle"
        class="sc-muscle-badge"
      >{{ t(`$vuetify.muscle_groups.${muscle}`) }}</span>
    </div>

    <div class="sc-exercises">
      <div v-for="ex in visibleExercises" :key="ex.name" class="sc-ex-row">
        <span class="sc-ex-name">{{ ex.name }}</span>
        <span class="sc-ex-detail">{{ ex.detail }}</span>
      </div>
      <div v-if="hiddenExerciseCount > 0" class="sc-ex-more">
        {{ t("$vuetify.share.more_exercises", [hiddenExerciseCount]) }}
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <div class="sc-volume-row">
      <div class="sc-vol-item">
        <span class="sc-vol-val">{{ totalSets }}</span>
        <span class="sc-vol-lbl">{{ t("$vuetify.label.series") }}</span>
      </div>

      <div class="sc-vol-divider"></div>

      <div v-if="totalReps > 0" class="sc-vol-item">
        <span class="sc-vol-val">{{ totalReps }}</span>
        <span class="sc-vol-lbl">{{ t("$vuetify.activity_detail.total_reps") }}</span>
      </div>

      <div v-if="totalReps > 0" class="sc-vol-divider"></div>

      <div class="sc-vol-item">
        <span class="sc-vol-val">{{ activity.calories ? formatNumber(activity.calories) : "—" }}</span>
        <span class="sc-vol-lbl">{{ t("$vuetify.label.kcal_abbreviation") }}</span>
      </div>
    </div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const props = defineProps<ShareCardProps>();
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const MAX_VISIBLE_EXERCISES = 6;

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const muscleGroups = computed(() => (props.activity.training_analysis?.volume?.muscles_worked ?? []).slice(0, 4).map((m) => m.group));
const exercisesList = computed(() =>
  (props.activity.exercises ?? []).map((ex) => {
    const setsCount = ex.series.length;
    const detail = ex.reps.type === "time"
      ? `${ex.reps.time ?? ex.reps.max ?? ""}${ex.reps.time_type === "minutes" ? t("$vuetify.label.min_abbreviation") : "s"}`
      : String(ex.reps.max ?? ex.reps.min ?? "?");
    return { name: ex.name, detail: `${setsCount}×${detail}` };
  })
);
const visibleExercises = computed(() => exercisesList.value.slice(0, MAX_VISIBLE_EXERCISES));
const hiddenExerciseCount = computed(() => Math.max(0, exercisesList.value.length - MAX_VISIBLE_EXERCISES));
const totalSets = computed(() => (props.activity.exercises ?? []).reduce((sum, ex) => sum + ex.series.length, 0));
const totalReps = computed(() =>
  (props.activity.exercises ?? []).reduce((sum, ex) => {
    if (ex.reps.type !== "fixed") return sum;
    const reps = ex.reps.max ?? ex.reps.min ?? 0;
    return sum + ex.series.length * reps;
  }, 0)
);
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: linear-gradient(145deg, #111419, #0E1115)
  display: flex
  flex-direction: column
  padding: 0 32px 28px
  position: relative
  overflow: hidden
  box-sizing: border-box

.sc-glow
  position: absolute
  inset: 0
  background: radial-gradient(circle at 10% 90%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 20px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 4px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 12px
  font-weight: 700
  color: #FFFFFF80

.sc-title
  font-size: 20px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 12px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-muscle-row
  display: flex
  flex-wrap: wrap
  gap: 6px
  margin-bottom: 16px

.sc-muscle-badge
  font-size: 10px
  font-weight: 600
  color: #48F26D
  background: #48F26D1A
  border: 1px solid rgba(72, 242, 109, 0.2)
  padding: 3px 10px
  border-radius: 20px
  letter-spacing: 0.04em
  text-transform: capitalize

.sc-exercises
  display: flex
  flex-direction: column
  gap: 4px

.sc-ex-row
  display: flex
  justify-content: space-between
  align-items: center
  padding: 9px 0
  border-bottom: 1px solid rgba(255, 255, 255, 0.04)

.sc-ex-name
  font-size: 13px
  font-weight: 600
  color: #FFFFFFCC
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  max-width: 280px

.sc-ex-detail
  font-size: 13px
  font-weight: 700
  color: #FFFFFF73
  flex-shrink: 0

.sc-ex-more
  font-size: 12px
  color: #FFFFFF4D
  text-align: center
  padding: 8px 0

.sc-volume-row
  display: flex
  align-items: center
  gap: 20px
  margin-bottom: 16px
  padding: 12px 16px
  background: #FFFFFF08
  border-radius: 10px

.sc-vol-item
  display: flex
  align-items: baseline
  gap: 4px

.sc-vol-val
  font-size: 20px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-vol-lbl
  font-size: 11px
  color: #FFFFFF61

.sc-vol-divider
  width: 1px
  height: 20px
  background: #FFFFFF1A
</style>