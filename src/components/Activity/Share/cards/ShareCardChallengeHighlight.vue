<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_challenge_coach") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.challenge_analysis.coach_title") }}</p>

    <div v-if="performanceVsEstimated !== null" class="sc-perf-row">
      <span class="sc-perf-val" :style="{ color: perfColor }">
        {{ `${perfSign}${Math.abs(Math.round(performanceVsEstimated))}%` }}
      </span>
      <span class="sc-perf-label">{{ perfLabel }}</span>
    </div>

    <div class="sc-bullets">
      <div v-for="bullet in coachBullets" :key="bullet.key" class="sc-bullet">
        <span class="sc-dot">▸</span>
        <span class="sc-bullet-text">{{ t(`$vuetify.challenge_analysis.${bullet.key}`, bullet.params) }}</span>
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

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const performanceVsEstimated = computed(() => props.activity.challenge_analysis?.performance_vs_estimated ?? null);
const perfColor = computed(() => (performanceVsEstimated.value ?? 0) >= 0 ? "#48F26D" : "#F44336");
const perfSign = computed(() => (performanceVsEstimated.value ?? 0) >= 0 ? "+" : "-");
const perfLabel = computed(() => t((performanceVsEstimated.value ?? 0) >= 0 ? "$vuetify.share.faster_than_estimated" : "$vuetify.share.slower_than_estimated"));
const coachBullets = computed(() => (props.activity.challenge_analysis?.coach_bullets ?? []).slice(0, 5));
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
  background: radial-gradient(circle at 30% 70%, rgba(72, 242, 109, 0.06) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 22px

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
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 18px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-perf-row
  display: flex
  align-items: center
  gap: 12px
  padding: 14px 18px
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  margin-bottom: 18px

.sc-perf-val
  font-size: 36px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1

.sc-perf-label
  font-size: 13px
  font-weight: 600
  color: #FFFFFF80

.sc-bullets
  display: flex
  flex-direction: column
  gap: 12px

.sc-bullet
  display: flex
  align-items: flex-start
  gap: 10px

.sc-dot
  color: #48F26D
  font-size: 14px
  line-height: 1.5
  flex-shrink: 0

.sc-bullet-text
  font-size: 14px
  color: #FFFFFFBF
  line-height: 1.5
  font-weight: 500
</style>