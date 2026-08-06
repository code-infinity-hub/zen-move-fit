<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_predictions") }}</span>
      <span class="sc-premium">{{ t("$vuetify.share.premium_tag") }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.predictions_subtitle") }}</p>

    <div class="sc-predictions">
      <div
        v-for="item in predictions"
        :key="item.distance_km"
        class="sc-pred-row"
        :class="{ featured: item.isFeatured }"
      >
        <div class="sc-pred-distance">
          <span class="sc-pred-dist-val">{{ t(`$vuetify.activity_analysis.${item.label_key}`) }}</span>
        </div>
        <div class="sc-pred-bar-wrap">
          <div class="sc-pred-bar" :style="{ width: `${item.barPct}%` }"></div>
        </div>
        <span class="sc-pred-time">{{ formatDuration(item.estimated_seconds) }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const predictions = computed(() => {
  const items = (props.activity.analysis?.predictions?.items ?? []).slice(0, 6);
  const min = Math.min(...items.map((i) => i.estimated_seconds));
  const max = Math.max(...items.map((i) => i.estimated_seconds));
  const range = max - min || 1;
  const currentDistanceKm = props.activity.metrics?.distance_meters != null ? props.activity.metrics.distance_meters / 1000 : null;

  return items.map((item) => ({
    ...item,
    barPct: Math.round(30 + ((max - item.estimated_seconds) / range) * 65),
    isFeatured: currentDistanceKm != null && Math.abs(item.distance_km - currentDistanceKm) < 0.5,
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
  inset: 0
  background: radial-gradient(circle at 30% 80%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
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

.sc-premium
  font-size: 10px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.12em
  opacity: 0.7

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 24px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-predictions
  display: flex
  flex-direction: column
  gap: 14px

.sc-pred-row
  display: flex
  align-items: center
  gap: 12px
  &.featured
    .sc-pred-dist-val, .sc-pred-time
      color: #48F26D
    .sc-pred-bar
      background: #48F26D !important

.sc-pred-distance
  display: flex
  align-items: baseline
  gap: 3px
  width: 72px
  flex-shrink: 0

.sc-pred-dist-val
  font-size: 20px
  font-weight: 800
  color: #FFFFFFD9
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1

.sc-pred-dist-unit
  font-size: 11px
  font-weight: 600
  color: #FFFFFF66

.sc-pred-bar-wrap
  flex: 1
  height: 4px
  background: #FFFFFF0F
  border-radius: 2px
  overflow: hidden

.sc-pred-bar
  height: 100%
  background: #FFFFFF33
  border-radius: 2px

.sc-pred-time
  font-size: 16px
  font-weight: 700
  color: #FFFFFFCC
  font-family: "Space Grotesk", system-ui, sans-serif
  width: 72px
  text-align: right
  flex-shrink: 0
</style>