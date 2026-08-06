<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ `💪 ${t("$vuetify.label.series")}` }}</span>
      <span class="sc-date">{{ formatDuration(activity.duration_seconds) }}</span>
    </div>

    <p class="sc-title">{{ activity.workout_title ?? t("$vuetify.share.free_workout") }}</p>

    <div class="sc-list">
      <div v-for="exercise in visibleExercises" :key="exercise.name" class="sc-ex-row">
        <div class="sc-ex-left">
          <span class="sc-ex-name">{{ exercise.name }}</span>
          <span v-if="exercise.topLoad" class="sc-ex-load">{{ exercise.topLoad }}</span>
        </div>
        <div class="sc-ex-sets">
          <span
            v-for="(set, index) in exercise.sets"
            :key="index"
            class="sc-set-chip"
          >{{ set }}</span>
        </div>
      </div>
      <div v-if="remainingCount > 0" class="sc-more">{{ t("$vuetify.share.more_exercises", [remainingCount]) }}</div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();
const MAX_VISIBLE_EXERCISES = 6;

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const exercisesSummary = computed(() =>
  (props.activity.exercises ?? []).map((exercise) => {
    const loads = exercise.series.map((set) => set.load).filter((load) => load != null) as number[];
    const topLoad = loads.length > 0 ? `${Math.max(...loads)}${t("$vuetify.label.kg_abbreviation")}` : null;
    const sets = exercise.series.slice(0, 4).map((set) => {
      if (exercise.reps.type === "time") {
        const time = exercise.reps.time ?? exercise.reps.max ?? 0;
        const unit = exercise.reps.time_type === "minutes" ? t("$vuetify.label.min_abbreviation") : "s";
        return `${time}${unit}`;
      }
      const reps = exercise.reps.max ?? exercise.reps.min ?? "?";
      return set.load ? `${reps}×${set.load}${t("$vuetify.label.kg_abbreviation")}` : `${reps}r`;
    });
    return { name: exercise.name, sets, topLoad };
  })
);
const visibleExercises = computed(() => exercisesSummary.value.slice(0, MAX_VISIBLE_EXERCISES));
const remainingCount = computed(() => Math.max(0, exercisesSummary.value.length - MAX_VISIBLE_EXERCISES));
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
  background: radial-gradient(circle at 5% 95%, rgba(72, 242, 109, 0.06) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 18px

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

.sc-title
  font-size: 18px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 14px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-list
  display: flex
  flex-direction: column
  gap: 0

.sc-ex-row
  display: flex
  align-items: center
  justify-content: space-between
  padding: 10px 0
  border-bottom: 1px solid rgba(255, 255, 255, 0.04)
  gap: 12px

.sc-ex-left
  display: flex
  flex-direction: column
  gap: 2px
  min-width: 0
  flex: 1

.sc-ex-name
  font-size: 13px
  font-weight: 600
  color: #FFFFFFD9
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-ex-load
  font-size: 10px
  color: #48F26D
  font-weight: 700

.sc-ex-sets
  display: flex
  gap: 5px
  flex-shrink: 0
  flex-wrap: wrap
  justify-content: flex-end
  max-width: 200px

.sc-set-chip
  font-size: 11px
  font-weight: 700
  color: #FFFFFF8C
  background: #FFFFFF0D
  border: 1px solid rgba(255, 255, 255, 0.08)
  padding: 2px 8px
  border-radius: 6px

.sc-more
  font-size: 12px
  color: #FFFFFF4D
  text-align: center
  padding: 8px 0
</style>