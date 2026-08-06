<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_comparison") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.comparison_title") }}</p>

    <div class="sc-periods">
      <div
        v-for="period in periods"
        :key="period.label_key"
        class="sc-period-card"
      >
        <span class="sc-period-label">
          {{ t(`$vuetify.activity_analysis.${period.label_key}`) }}
        </span>

        <div v-if="period.available" class="sc-period-results">
          <span
            v-if="period.pace_diff_seconds !== null"
            class="sc-period-stat"
            :style="{ color: paceDiffColor(period.pace_diff_seconds) }"
          >{{ paceDiffLabel(period.pace_diff_seconds) }}</span>

          <span
            v-if="period.distance_diff_pct !== null && Math.abs(period.distance_diff_pct) > 5"
            class="sc-period-stat"
            :style="{ color: distanceDiffColor(period.distance_diff_pct) }"
          >{{ distanceDiffLabel(period.distance_diff_pct) }}</span>
        </div>
        <span v-else class="sc-period-nodata">
          {{ t("$vuetify.activity_analysis.cty_no_data") }}
        </span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { formatPaceDiff } from "@/utils";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const periods = computed(() => (props.activity.analysis?.compared_to_you?.periods ?? []).slice(0, 3));

/// METHODS
const paceDiffLabel = (seconds: number) => {
  if (seconds > 5) return `⬆ ${t("$vuetify.activity_analysis.cty_faster", [formatPaceDiff(seconds)])}`;
  if (seconds < -5) return `⬇ ${t("$vuetify.activity_analysis.cty_slower", [formatPaceDiff(seconds)])}`;
  return t("$vuetify.activity_analysis.cty_same_pace");
};

const paceDiffColor = (seconds: number) => (seconds > 5 ? "#48F26D" : seconds < -5 ? "#F44336" : "rgba(255, 255, 255, 0.5)");

const distanceDiffLabel = (pct: number) =>
  pct > 5
    ? t("$vuetify.activity_analysis.cty_more_distance", [Math.abs(Math.round(pct))])
    : t("$vuetify.activity_analysis.cty_less_distance", [Math.abs(Math.round(pct))]);
const distanceDiffColor = (pct: number) => (pct > 0 ? "#48F26D" : "#F44336");
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
  background: radial-gradient(circle at 75% 25%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
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
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 24px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-periods
  display: flex
  flex-direction: column
  gap: 10px

.sc-period-card
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  padding: 14px 18px
  display: flex
  align-items: center
  justify-content: space-between
  gap: 12px

.sc-period-label
  font-size: 13px
  font-weight: 700
  color: #FFFFFFA6
  min-width: 110px
  flex-shrink: 0

.sc-period-nodata
  font-size: 12px
  color: #FFFFFF40
  font-style: italic

.sc-period-results
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 4px

.sc-period-stat
  font-size: 13px
  font-weight: 700
</style>