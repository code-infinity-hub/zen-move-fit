<template>
  <div class="px-4 py-4">
    <div class="pb-4 d-flex align-center ga-3">
      <!-- Circular ring (accent role) -->
      <div class="score-ring flex-shrink-0">
        <svg viewBox="0 0 64 64" class="score-svg">
          <circle cx="32" cy="32" r="26" class="score-track" />
          <circle
            cx="32"
            cy="32"
            r="26"
            class="score-fill"
            :style="{
              stroke: getVarColor(scoreColor),
              strokeDashoffset: dashOffset,
            }"
          />
        </svg>
        <div class="score-inner">
          <span class="score-num">
            {{ score.score }}
          </span>
        </div>
      </div>

      <!-- Hero content -->
      <div class="flex-fill min-w-0">
        <div class="d-flex align-center ga-2 mb-1">
          <span class="score-emoji">
            {{ scoreEmoji }}
          </span>

          <p class="text-body-1 font-weight-black text-truncate">
            {{ t(`$vuetify.activity_analysis.${score.label_key}`) }}
          </p>
        </div>

        <p class="text-caption text-grey-lighten-1">
          {{ t(`$vuetify.activity_analysis.score_context_${score.label_key.replace("score_", "")}`) }}
        </p>
      </div>
    </div>

    <!-- Reason chips -->
    <div
      v-if="score.reason_keys.length"
      class="d-flex flex-wrap ga-1"
    >
      <v-chip
        v-for="k in score.reason_keys"
        :key="k"
        size="x-small"
        variant="tonal"
        :color="score.color"
      >{{ t(`$vuetify.activity_analysis.${k}`) }}</v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisScore } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ score: ActivityAnalysisScore }>();
const CIRCUMFERENCE = 2 * Math.PI * 26;
const root = document.documentElement;

/// COMPUTED
const dashOffset = computed(() => CIRCUMFERENCE - (props.score.score / 100) * CIRCUMFERENCE);
const scoreColor = computed(() => {
  const c = props.score.color;
  if (c === "green") return "--primary";
  if (c === "blue") return "--blue";
  if (c === "orange") return "--orange";
  return "--red";
});
const scoreEmoji = computed(() => {
  const lk = props.score.label_key;
  if (lk === "score_excellent") return "🔥";
  if (lk === "score_great") return "⚡";
  if (lk === "score_good") return "🏃";
  if (lk === "score_average") return "👟";
  return "💪";
});

/// METHODS
const getVarColor = (value: string) => getComputedStyle(root).getPropertyValue(value);
</script>

<style lang="sass" scoped>
.score-ring
  position: relative
  width: 64px
  height: 64px
  flex-shrink: 0

.score-svg
  width: 64px
  height: 64px
  transform: rotate(-90deg)

.score-track
  fill: none
  stroke: rgba(255, 255, 255, 0.08)
  stroke-width: 5

.score-fill
  fill: none
  stroke-width: 5
  stroke-linecap: round
  stroke-dasharray: 163.36
  transition: stroke-dashoffset 0.7s ease

.score-inner
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center

.score-num
  font-size: 1.1rem
  font-weight: 800
  line-height: 1

.score-emoji
  font-size: 1.15rem
  line-height: 1
  flex-shrink: 0
</style>