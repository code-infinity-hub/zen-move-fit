<template>
  <div class="sc-root" :style="cardStyle">
    <ShareRouteLineSvg
      :route-points="routePoints ?? []"
      :width="540"
      :height="svgHeight"
      uid="rm"
    />

    <div class="sc-overlay">
      <div v-if="distanceKm" class="sc-distance-row">
        <span class="sc-distance-val">{{ distanceKm }}</span>
        <span class="sc-distance-unit">{{ t("$vuetify.label.km") }}</span>
      </div>

      <div class="sc-metrics-row">
        <div v-if="activity.duration_seconds" class="sc-metric">
          <span class="sc-metric-val">{{ formatDuration(getPrimaryDurationSeconds(activity)) }}</span>
          <span class="sc-metric-unit">{{ t("$vuetify.share.time_label") }}</span>
        </div>
        <div v-if="paceLabel" class="sc-metric">
          <span class="sc-metric-val">{{ paceLabel }}</span>
          <span class="sc-metric-unit">{{ `/${t("$vuetify.label.km")}` }}</span>
        </div>
        <div v-if="elevationGain" class="sc-metric">
          <span class="sc-metric-val">{{ `+${elevationGain}${t("$vuetify.label.meters_abbreviation")}` }}</span>
          <span class="sc-metric-unit">{{ t("$vuetify.share.elev_abbr_label") }}</span>
        </div>
      </div>

      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { type RoutePoint } from "@/types/share.type";
import ShareRouteLineSvg from "./ShareRouteLineSvg.vue";
import { getCardStyle, FORMAT_HEIGHTS } from "@/composables/use-share-renderer";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const props = defineProps<ShareCardProps & { routePoints?: RoutePoint[] }>();

const { t } = useLocale();
const { formatNumber } = useFormatNumber();

/// COMPUTED
const format = computed(() => props.format ?? "feed");
const cardStyle = computed(() => getCardStyle(format.value));
const svgHeight = computed(() => FORMAT_HEIGHTS[format.value]);
const distanceKm = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  return meters ? formatNumber(meters / 1000) : null;
});
const paceLabel = computed(() => {
  const pace = props.activity.metrics?.avg_pace;
  return pace ? RunningMetricsService.formatPace(pace) : null;
});
const elevationGain = computed(() => {
  const gain = props.activity.metrics?.elevation?.gain;
  return gain ? formatNumber(gain) : null;
});
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: var(--sc-h, 540px)
  background: transparent
  position: relative
  display: flex
  flex-direction: column
  justify-content: flex-end
  box-sizing: border-box
  overflow: hidden

.sc-overlay
  position: relative
  z-index: 1
  padding: 32px 36px 36px
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.24) 70%, transparent 100%)

.sc-distance-row
  display: flex
  align-items: baseline
  gap: 10px
  margin-bottom: 10px

.sc-distance-val
  font-size: 96px
  font-weight: 900
  color: #48F26D
  line-height: 1
  font-family: "Space Grotesk", system-ui, sans-serif
  letter-spacing: -4px
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 6px 24px rgba(0, 0, 0, 0.7)

.sc-distance-unit
  font-size: 32px
  font-weight: 700
  color: #FFFFFFD9
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)

.sc-metrics-row
  display: flex
  gap: 24px
  margin-bottom: 12px

.sc-metric
  display: flex
  flex-direction: column
  gap: 1px

.sc-metric-val
  font-size: 22px
  font-weight: 800
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.7)
  line-height: 1

.sc-metric-unit
  font-size: 10px
  font-weight: 600
  color: #FFF9
  text-transform: uppercase
  letter-spacing: 0.06em
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9)

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DCC
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>