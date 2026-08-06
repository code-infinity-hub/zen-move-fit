<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_workout_highlights") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <p class="sc-title">{{ activity.workout_title ?? t("$vuetify.share.free_workout") }}</p>

    <div class="sc-chips">
      <div
        v-for="item in highlights"
        :key="item.key"
        class="sc-chip"
        :class="`chip-${item.type}`"
      >
        <span class="sc-chip-icon">{{ highlightIcon(item.type) }}</span>
        <span class="sc-chip-text">{{ t(`$vuetify.training_analysis.${item.key}`) }}</span>
      </div>
    </div>

    <div v-if="coachBullets.length" class="sc-coach">
      <span class="sc-coach-title">{{ t("$vuetify.training_analysis.coach_title") }}</span>
      <div class="sc-coach-bullets">
        <div v-for="bullet in coachBullets" :key="bullet.key" class="sc-bullet">
          <span class="sc-dot">·</span>
          <span>{{ coachText(bullet.key, bullet.params) }}</span>
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
import { type TrainingAnalysisHighlight } from "@/types/activity.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const highlights = computed(() => (props.activity.training_analysis?.highlights ?? []).slice(0, 5));
const coachBullets = computed(() => (props.activity.training_analysis?.coach_bullets ?? []).slice(0, 3));

/// METHODS
const highlightIcon = (type: TrainingAnalysisHighlight["type"]) =>
  type === "positive" ? "✅" : type === "info" ? "💡" : "⚡";

const coachText = (key: string, params: (string | number)[]) =>
  t(`$vuetify.training_analysis.${key}`, params.map((p) => (typeof p === "string" ? t(`$vuetify.muscle_groups.${p}`, p) : p)));
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
  background: radial-gradient(circle at 85% 15%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
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
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 20px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 18px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-chips
  display: flex
  flex-wrap: wrap
  gap: 8px
  margin-bottom: 18px

.sc-chip
  display: flex
  align-items: center
  gap: 6px
  padding: 7px 14px
  border-radius: 20px
  font-size: 13px
  font-weight: 600
  &.chip-positive
    background: #48F26D14
    border: 1px solid rgba(72, 242, 109, 0.2)
    color: #48F26D
  &.chip-neutral
    background: #3B82F614
    border: 1px solid rgba(59, 130, 246, 0.2)
    color: #3B82F6
  &.chip-info
    background: #FFEB3B14
    border: 1px solid rgba(255, 235, 59, 0.2)
    color: #FFEB3B

.sc-chip-icon
  font-size: 14px
  line-height: 1

.sc-chip-text
  font-size: 12px

.sc-coach
  background: #FFFFFF06
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  padding: 12px 16px
  display: flex
  flex-direction: column
  gap: 8px

.sc-coach-title
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.08em
  color: #48F26DB3

.sc-coach-bullets
  display: flex
  flex-direction: column
  gap: 5px

.sc-bullet
  display: flex
  align-items: flex-start
  gap: 8px
  font-size: 12px
  color: #FFF9
  line-height: 1.4

.sc-dot
  color: #48F26D
  font-size: 16px
  line-height: 1
  flex-shrink: 0
</style>