<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-map-bg" :style="{ backgroundImage: `url('${mapImageSrc}')` }"></div>
    <div class="sc-overlay"></div>

    <div class="sc-content">
      <div class="sc-header">
        <span class="sc-badge">{{ t("$vuetify.share.badge_route") }}</span>
      </div>

      <div :style="{ flex: 1 }"></div>

      <div class="sc-metrics">
        <div v-if="distanceValue" class="sc-big-metric">
          <span class="sc-big-value">{{ distanceValue }}</span>
          <span class="sc-big-unit">{{ t("$vuetify.label.km") }}</span>
        </div>

        <div class="sc-row-metrics">
          <div v-if="activity.duration_seconds" class="sc-row-item">
            <span class="sc-row-val">{{ formatDuration(getPrimaryDurationSeconds(activity)) }}</span>
            <span class="sc-row-lbl">{{ t("$vuetify.share.time_label") }}</span>
          </div>

          <div v-if="paceValue" class="sc-row-item">
            <span class="sc-row-val">{{ paceValue }}</span>
            <span class="sc-row-lbl">{{ t("$vuetify.share.pace_km_label") }}</span>
          </div>

          <div v-if="elevationValue" class="sc-row-item">
            <span class="sc-row-val">{{ `+${elevationValue}${t("$vuetify.label.meters_abbreviation")}` }}</span>
            <span class="sc-row-lbl">{{ t("$vuetify.share.elevation_label") }}</span>
          </div>
        </div>
      </div>

      <div class="sc-footer">
        <div class="sc-user">
          <div class="sc-avatar">
            <img v-if="avatarSrc" :src="avatarSrc" class="sc-avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
          <span class="sc-username">{{ activity.account.name }}</span>
        </div>
        <span class="sc-brand">
          <ShareCardBrand />
        </span>
      </div>
    </div>
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
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, initials, avatarSrc } = useShareCardIdentity(props);
const mapImageSrc = computed(() => props.imageCache?.[props.activity.map_picture!] ?? props.activity.map_picture);
const distanceValue = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  return meters ? formatNumber(meters / 1000) : null;
});
const paceValue = computed(() => {
  const pace = props.activity.metrics?.avg_pace;
  return pace ? RunningMetricsService.formatPace(pace) : null;
});
const elevationValue = computed(() => {
  const gain = props.activity.metrics?.elevation?.gain;
  return gain ? formatNumber(gain) : null;
});

/// METHODS
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  position: relative
  overflow: hidden
  background: #0E1115
  box-sizing: border-box

.sc-map-bg
  position: absolute
  inset: 0
  background-size: cover
  background-position: center
  filter: brightness(0.75) saturate(0.7)

.sc-overlay
  position: absolute
  inset: 0
  background: linear-gradient(to top, #0E1115F2, #0E111566 40%, #0E111526)

.sc-content
  position: relative
  z-index: 2
  height: 100%
  display: flex
  flex-direction: column
  padding: 0 28px 28px

.sc-header
  padding-top: 28px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFF9
  text-transform: uppercase
  background: #0006
  padding: 4px 10px
  border-radius: 20px
  backdrop-filter: blur(4px)

.sc-big-metric
  display: flex
  align-items: baseline
  gap: 8px
  margin-bottom: 12px

.sc-big-value
  font-size: 72px
  font-weight: 800
  color: #FFF
  line-height: 1
  font-family: "Space Grotesk", system-ui, sans-serif
  letter-spacing: -2px

.sc-big-unit
  font-size: 22px
  font-weight: 600
  color: #48F26D

.sc-row-metrics
  display: flex
  gap: 24px
  margin-bottom: 20px

.sc-row-item
  display: flex
  flex-direction: column
  gap: 2px

.sc-row-val
  font-size: 20px
  font-weight: 700
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-row-lbl
  font-size: 11px
  color: #FFFFFF73

.sc-footer
  display: flex
  align-items: center
  justify-content: space-between

.sc-user
  display: flex
  align-items: center
  gap: 10px

.sc-avatar
  width: 30px
  height: 30px
  border-radius: 50%
  background: #48F26D33
  border: 1.5px solid rgba(72, 242, 109, 0.5)
  display: flex
  align-items: center
  justify-content: center
  font-size: 13px
  font-weight: 700
  color: #48F26D

.sc-avatar-img
  width: 100%
  height: 100%
  border-radius: 50%
  object-fit: cover

.sc-username
  font-size: 13px
  font-weight: 600
  color: #FFFC

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.05em
  opacity: 0.75
</style>