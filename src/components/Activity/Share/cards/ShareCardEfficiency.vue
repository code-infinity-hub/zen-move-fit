<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_efficiency") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-label">{{ label }}</p>

    <div class="sc-pace-row">
      <span class="sc-pace-val" :style="{ color: trendColor }">
        {{ paceFormatted }}
      </span>
      <span class="sc-pace-unit">
        {{ `/${t("$vuetify.label.km")}` }}
      </span>
    </div>

    <div class="sc-trend-row">
      <div
        class="sc-trend-icon"
        :style="{ color: trendColor }"
      >{{ trendIcon }}</div>

      <div
        v-if="efficiency.comparison_pct !== 0"
        class="sc-chip"
        :style="{ background: chipBg, borderColor: chipBorder, color: trendColor }"
      >{{ `${Math.abs(efficiency.comparison_pct)}% ${comparisonLabel}` }}</div>
    </div>

    <p class="sc-note">{{ t("$vuetify.activity_analysis.efficiency_note") }}</p>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const efficiency = computed(() => props.activity.analysis!.efficiency!);
const label = computed(() => t(`$vuetify.activity_analysis.${efficiency.value.label_key}`));
const paceFormatted = computed(() => RunningMetricsService.formatPace(efficiency.value.value));
const trendColor = computed(() => {
  switch (efficiency.value.trend) {
    case "up": return "#48F26D";
    case "down": return "#F44336";
    default: return "rgba(255, 255, 255, 0.7)";
  }
});
const trendIcon = computed(() => {
  switch (efficiency.value.trend) {
    case "up": return "↑";
    case "down": return "↓";
    default: return "→";
  }
});
const comparisonLabel = computed(() => t(efficiency.value.comparison_pct > 0 ? "$vuetify.activity_analysis.efficiency_better" : "$vuetify.activity_analysis.efficiency_worse"));
const chipBg = computed(() => (efficiency.value.comparison_pct > 0 ? "rgba(72, 242, 109, 0.10)" : "rgba(244, 67, 54, 0.10)"));
const chipBorder = computed(() => (efficiency.value.comparison_pct > 0 ? "rgba(72, 242, 109, 0.30)" : "rgba(244, 67, 54, 0.30)"));
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
  background: radial-gradient(circle at 20% 75%, rgba(72, 242, 109, 0.05) 0%, transparent 55%)
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
  margin-bottom: 8px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-label
  font-size: 14px
  font-weight: 600
  color: #FFFFFF73
  letter-spacing: 0.06em
  text-transform: uppercase
  margin-bottom: 12px

.sc-pace-row
  display: flex
  align-items: flex-end
  gap: 8px
  margin-bottom: 20px

.sc-pace-val
  font-size: 88px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.9
  letter-spacing: -4px

.sc-pace-unit
  font-size: 24px
  font-weight: 700
  color: #FFF6
  padding-bottom: 8px

.sc-trend-row
  display: flex
  align-items: center
  gap: 12px
  margin-bottom: 16px

.sc-trend-icon
  font-size: 36px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1

.sc-chip
  font-size: 13px
  font-weight: 700
  padding: 6px 16px
  border-radius: 20px
  border: 1px solid
  letter-spacing: 0.03em

.sc-note
  font-size: 12px
  color: #FFFFFF4D
  font-style: italic
</style>