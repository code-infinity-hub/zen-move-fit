<template>
  <div class="sc-root" :style="cardStyle">
    <div v-if="paceLabel" class="sc-body">
      <div class="sc-label-top">{{ t("$vuetify.share.avg_pace_label") }}</div>
      <div class="sc-pace-row">
        <span class="sc-val">{{ paceLabel }}</span>
        <span class="sc-unit">{{ `/${t("$vuetify.label.km")}` }}</span>
      </div>
      <div v-if="distanceKm" class="sc-sub">{{ `${distanceKm} ${t("$vuetify.label.km")} · ${formatDuration(getPrimaryDurationSeconds(activity))}` }}</div>
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
import { getCardStyle } from "@/composables/use-share-renderer";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
const paceLabel = computed(() => {
  const pace = props.activity.metrics?.avg_pace;
  return pace ? RunningMetricsService.formatPace(pace) : null;
});
const distanceKm = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  return meters ? formatNumber(meters / 1000) : null;
});
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: transparent
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  box-sizing: border-box
  overflow: hidden

.sc-body
  display: flex
  flex-direction: column
  align-items: center
  gap: 0

.sc-label-top
  font-size: 13px
  font-weight: 800
  letter-spacing: 0.2em
  color: #FFF9
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)
  text-transform: uppercase
  margin-bottom: 4px

.sc-pace-row
  display: flex
  align-items: flex-end
  gap: 6px

.sc-val
  font-size: 120px
  font-weight: 900
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.9
  letter-spacing: -5px
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9), 0 8px 40px rgba(0, 0, 0, 0.7)

.sc-unit
  font-size: 32px
  font-weight: 700
  color: #48F26D
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(72, 242, 109, 0.3)
  padding-bottom: 10px

.sc-sub
  font-size: 18px
  font-weight: 600
  color: #FFFFFFA6
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)
  margin-top: 12px

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26D99
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
  margin-top: 20px
</style>