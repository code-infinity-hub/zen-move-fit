<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_challenge") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <p class="sc-title">
      {{ activity.workout_title ?? t("$vuetify.share.card_challenge") }}
    </p>

    <div v-if="progress" class="sc-day-row">
      <span class="sc-day-num">
        {{ t("$vuetify.share.day_num", [progress.ordinal]) }}
      </span>
      <span class="sc-day-of">
        {{ t("$vuetify.share.day_of", [progress.total]) }}
      </span>
    </div>

    <div v-if="progress" class="sc-progress-section">
      <div class="sc-progress-track">
        <div
          class="sc-progress-fill"
          :style="{ width: `${progress.percentage}%` }"
        ></div>
      </div>
      <span class="sc-progress-pct">
        {{ `${progress.percentage}%` }}
      </span>
    </div>

    <div v-if="streak >= 2" class="sc-streak-row">
      <span class="sc-streak-fire">🔥</span>
      <div class="sc-streak-content">
        <span class="sc-streak-val">{{ t("$vuetify.share.days_in_a_row", [streak]) }}</span>
        <span class="sc-streak-lbl">{{ t("$vuetify.share.current_streak") }}</span>
      </div>
    </div>

    <div v-if="hasDifficulty" class="sc-difficulty">
      <div class="sc-diff-label">
        {{ t("$vuetify.share.difficulty_distribution") }}
      </div>

      <div class="sc-diff-bars">
        <div v-if="difficulty.easy > 0" class="sc-diff-bar-item">
          <div
            class="sc-diff-fill easy"
            :style="{ height: `${difficulty.easy * 3}px` }"
          ></div>

          <span class="sc-diff-pct">{{ `${difficulty.easy}%` }}</span>
          <span class="sc-diff-name">{{ t("$vuetify.challenge_analysis.difficulty_easy") }}</span>
        </div>

        <div v-if="difficulty.medium > 0" class="sc-diff-bar-item">
          <div
            class="sc-diff-fill medium"
            :style="{ height: `${difficulty.medium * 3}px` }"
          ></div>

          <span class="sc-diff-pct">{{ `${difficulty.medium}%` }}</span>
          <span class="sc-diff-name">{{ t("$vuetify.challenge_analysis.difficulty_medium") }}</span>
        </div>

        <div v-if="difficulty.hard > 0" class="sc-diff-bar-item">
          <div
            class="sc-diff-fill hard"
            :style="{ height: `${difficulty.hard * 3}px` }"
          ></div>

          <span class="sc-diff-pct">{{ `${difficulty.hard}%` }}</span>
          <span class="sc-diff-name">{{ t("$vuetify.challenge_analysis.difficulty_hard") }}</span>
        </div>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

const props = defineProps<ShareCardProps>();

/// DATA
const { t } = useLocale();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const progress = computed(() => props.activity.challenge_plan_progress ?? null);
const streak = computed(() => props.activity.challenge_analysis?.streak ?? 0);
const difficulty = computed(() => props.activity.challenge_analysis?.difficulty_breakdown ?? { easy: 0, medium: 0, hard: 0 });
const hasDifficulty = computed(() => difficulty.value.easy + difficulty.value.medium + difficulty.value.hard > 0);
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
  background: radial-gradient(circle at 50% 20%, rgba(255, 120, 40, 0.06) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 24px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 6px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 20px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 20px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-day-row
  display: flex
  align-items: baseline
  gap: 8px
  margin-bottom: 12px

.sc-day-num
  font-size: 56px
  font-weight: 900
  color: #FFFFFFF2
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1
  letter-spacing: -1px

.sc-day-of
  font-size: 18px
  font-weight: 500
  color: #FFF6

.sc-progress-section
  display: flex
  align-items: center
  gap: 12px
  margin-bottom: 20px

.sc-progress-track
  flex: 1
  height: 8px
  background: #FFFFFF14
  border-radius: 4px
  overflow: hidden

.sc-progress-fill
  height: 100%
  background: linear-gradient(to right, #48F26D99, #48F26D)
  border-radius: 4px
  transition: none

.sc-progress-pct
  font-size: 14px
  font-weight: 700
  color: #48F26D
  flex-shrink: 0

.sc-streak-row
  display: flex
  align-items: center
  gap: 12px
  padding: 14px 16px
  background: #FF782812
  border: 1px solid rgba(255, 120, 40, 0.15)
  border-radius: 12px
  margin-bottom: 20px

.sc-streak-fire
  font-size: 24px
  flex-shrink: 0

.sc-streak-content
  display: flex
  flex-direction: column
  gap: 2px

.sc-streak-val
  font-size: 18px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-streak-lbl
  font-size: 11px
  color: #FFF6

.sc-difficulty
  display: flex
  flex-direction: column
  gap: 8px

.sc-diff-label
  font-size: 11px
  font-weight: 600
  color: #FFFFFF59
  text-transform: uppercase
  letter-spacing: 0.06em

.sc-diff-bars
  display: flex
  gap: 12px
  align-items: flex-end
  height: 80px

.sc-diff-bar-item
  display: flex
  flex-direction: column
  align-items: center
  gap: 4px

.sc-diff-fill
  width: 36px
  border-radius: 4px 4px 0 0
  min-height: 4px
  &.easy
    background: #48F26D80
  &.medium
    background: #FFB80080
  &.hard
    background: #FF503C80

.sc-diff-pct
  font-size: 11px
  font-weight: 700
  color: #FFFFFFB3

.sc-diff-name
  font-size: 10px
  color: #FFFFFF59
</style>