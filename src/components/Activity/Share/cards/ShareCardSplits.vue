<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_splits") }}</span>
      <span class="sc-date">{{ `${distanceLabel} ${t("$vuetify.label.km")} · ${formatDuration(getPrimaryDurationSeconds(activity))}` }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.splits_subtitle") }}</p>

    <div class="sc-avg-row">
      <span class="sc-avg-label">{{ t("$vuetify.share.avg_pace_row_label") }}</span>
      <span class="sc-avg-val">{{ `${avgPaceLabel}/${t("$vuetify.label.km")}` }}</span>
    </div>

    <div class="sc-splits">
      <div v-for="split in splits" :key="split.km" class="sc-split-row">
        <span class="sc-split-km">{{ split.km }}</span>
        <div class="sc-split-bar-wrap">
          <div
            class="sc-split-bar"
            :style="{ width: `${split.barWidth}%`, background: split.isFastest ? '#48F26D' : 'rgba(255, 255, 255, 0.15)' }"
          ></div>
        </div>
        <span class="sc-split-pace" :style="{ color: split.isFastest ? '#48F26D' : 'rgba(255, 255, 255, 0.75)' }">{{ split.paceStr }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const distanceLabel = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  return meters ? formatNumber(meters / 1000) : "?";
});
const avgPaceLabel = computed(() => {
  const pace = props.activity.metrics?.avg_pace;
  return pace ? RunningMetricsService.formatPace(pace) : "--";
});
const splits = computed(() => {
  const items = (props.activity.metrics?.splits ?? []).slice(0, 9);
  const min = Math.min(...items.map((s) => s.duration_seconds));
  const max = Math.max(...items.map((s) => s.duration_seconds));
  const range = max - min || 1;

  return items.map((s) => ({
    km: s.km,
    paceStr: RunningMetricsService.formatPace(s.duration_seconds),
    isFastest: s.duration_seconds === min,
    barWidth: Math.round(40 + ((max - s.duration_seconds) / range) * 55),
  }));
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
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: radial-gradient(circle at 80% 20%, rgba(72, 242, 109, 0.05) 0%, transparent 50%)
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
  text-transform: uppercase

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 10px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-avg-row
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 16px
  padding-bottom: 10px
  border-bottom: 1px solid rgba(255, 255, 255, 0.07)

.sc-avg-label
  font-size: 12px
  color: #FFF6

.sc-avg-val
  font-size: 14px
  font-weight: 700
  color: #FFFFFFBF

.sc-splits
  display: flex
  flex-direction: column
  gap: 8px

.sc-split-row
  display: flex
  align-items: center
  gap: 10px

.sc-split-km
  font-size: 11px
  font-weight: 600
  color: #FFF6
  width: 18px
  text-align: right
  flex-shrink: 0

.sc-split-bar-wrap
  flex: 1
  height: 5px
  background: #FFFFFF0F
  border-radius: 2px
  overflow: hidden

.sc-split-bar
  height: 100%
  border-radius: 2px
  transition: none

.sc-split-pace
  font-size: 13px
  font-weight: 700
  width: 52px
  text-align: right
  flex-shrink: 0
  font-family: "Space Grotesk", system-ui, sans-serif
</style>