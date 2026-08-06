<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_challenge_progress") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <div class="sc-percent-row">
      <span class="sc-percent-val" :style="{ color: percentColor }">{{ progress.percentage }}</span>
      <span class="sc-percent-sign" :style="{ color: percentColor }">%</span>
    </div>

    <p class="sc-percent-sub">{{ t("$vuetify.share.challenge_percent_sub") }}</p>

    <div class="sc-progress-bar-wrap">
      <div
        class="sc-progress-bar"
        :style="{ width: `${Math.min(progress.percentage, 100)}%`, background: progressGradient }"
      ></div>
    </div>

    <div class="sc-stats-row">
      <div class="sc-pill">
        <span class="sc-pill-val">{{ progress.completed }}</span>
        <span class="sc-pill-lbl">{{ t("$vuetify.share.of_activities", [progress.total]) }}</span>
      </div>
      <div class="sc-pill sc-pill-ordinal">
        {{ t("$vuetify.challenge_analysis.plan_ordinal", [progress.ordinal, progress.total]) }}
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
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const progress = computed(() => props.activity.challenge_plan_progress!);
const percentColor = computed(() => {
  const pct = progress.value.percentage;
  return pct >= 100 || pct >= 75 ? "#48F26D" : pct >= 50 ? "#FFEB3B" : "rgba(255, 255, 255, 0.85)";
});
const progressGradient = computed(() => {
  const pct = progress.value.percentage;
  return pct >= 75
    ? "linear-gradient(to right, #48F26D, rgba(72, 242, 109, 0.6))"
    : pct >= 50
      ? "linear-gradient(to right, #FFEB3B, rgba(255, 235, 59, 0.6))"
      : "linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3))";
});
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
  background: radial-gradient(circle at 85% 85%, rgba(72, 242, 109, 0.07) 0%, transparent 55%)
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
  margin-bottom: 10px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-percent-row
  display: flex
  align-items: flex-start
  margin-bottom: 4px

.sc-percent-val
  font-size: 128px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.85
  letter-spacing: -5px

.sc-percent-sign
  font-size: 48px
  font-weight: 800
  font-family: "Space Grotesk", system-ui, sans-serif
  margin-top: 16px
  margin-left: 4px

.sc-percent-sub
  font-size: 14px
  font-weight: 600
  color: #FFF6
  letter-spacing: 0.04em
  margin-bottom: 20px

.sc-progress-bar-wrap
  width: 100%
  height: 8px
  background: #FFFFFF12
  border-radius: 4px
  overflow: hidden
  margin-bottom: 16px

.sc-progress-bar
  height: 100%
  border-radius: 4px
  transition: none

.sc-stats-row
  display: flex
  align-items: center
  gap: 10px
  flex-wrap: wrap

.sc-pill
  display: flex
  align-items: center
  gap: 5px
  background: #FFFFFF0D
  border: 1px solid rgba(255, 255, 255, 0.09)
  border-radius: 20px
  padding: 5px 14px

.sc-pill-val
  font-size: 14px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-pill-lbl
  font-size: 12px
  color: #FFF6

.sc-pill-ordinal
  font-size: 12px
  font-weight: 600
  color: #FFFFFF73
</style>