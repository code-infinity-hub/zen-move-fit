<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow" :style="{ background: `radial-gradient(circle at 80% 20%, ${zoneBg}, transparent 55%)` }"></div>
    <div class="sc-accent-line" :style="{ background: `linear-gradient(to right, ${zoneColor}, transparent)` }"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_training_load") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <div class="sc-acwr-row">
      <span class="sc-acwr-val" :style="{ color: zoneColor }">{{ trainingLoad.acwr.toFixed(2) }}</span>
      <span class="sc-acwr-label">{{ t("$vuetify.share.acwr_label") }}</span>
    </div>

    <div class="sc-zone-pill-wrap">
      <div class="sc-zone-pill" :style="{ background: zoneBg, border: `1px solid ${zoneBorder}`, color: zoneColor }">
        {{ zoneLabel }}
      </div>
    </div>

    <div class="sc-zone-bar">
      <div class="sc-zone-seg seg-low" :class="{ active: trainingLoad.zone === 'low' }">{{ t("$vuetify.share.zone_seg_low") }}</div>
      <div class="sc-zone-seg seg-opt" :class="{ active: trainingLoad.zone === 'optimal' }">{{ t("$vuetify.share.zone_seg_optimal") }}</div>
      <div class="sc-zone-seg seg-cau" :class="{ active: trainingLoad.zone === 'caution' }">{{ t("$vuetify.share.zone_seg_caution") }}</div>
      <div class="sc-zone-seg seg-dan" :class="{ active: trainingLoad.zone === 'danger' }">{{ t("$vuetify.share.zone_seg_danger") }}</div>
    </div>

    <div class="sc-load-row">
      <div class="sc-load-item">
        <span class="sc-load-label">{{ t("$vuetify.activity_analysis.load_acute") }}</span>
        <span class="sc-load-val">
          {{ Math.round(trainingLoad.acute_load / 60) }}
          <span class="sc-load-unit">{{ t("$vuetify.label.min_abbreviation") }}</span>
        </span>
      </div>
      <div class="sc-load-divider"></div>
      <div class="sc-load-item">
        <span class="sc-load-label">{{ t("$vuetify.activity_analysis.load_chronic") }}</span>
        <span class="sc-load-val">{{ Math.round(trainingLoad.chronic_load / 60) }}
          <span class="sc-load-unit">{{ t("$vuetify.label.min_abbreviation") }}</span>
        </span>
      </div>
    </div>

    <p class="sc-zone-desc">{{ zoneDescription }}</p>

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
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const trainingLoad = computed(() => props.activity.analysis!.training_load!);
const zoneColor = computed(() => {
  switch (trainingLoad.value.zone) {
    case "low": return "#3B82F6";
    case "optimal": return "#48F26D";
    case "caution": return "#FF9800";
    default: return "#F44336";
  }
});
const zoneBg = computed(() => {
  switch (trainingLoad.value.zone) {
    case "low": return "rgba(59, 130, 246, 0.12)";
    case "optimal": return "rgba(72, 242, 109, 0.12)";
    case "caution": return "rgba(255, 152, 0, 0.12)";
    default: return "rgba(244, 67, 54, 0.12)";
  }
});
const zoneBorder = computed(() => {
  switch (trainingLoad.value.zone) {
    case "low": return "rgba(59, 130, 246, 0.35)";
    case "optimal": return "rgba(72, 242, 109, 0.35)";
    case "caution": return "rgba(255, 152, 0, 0.35)";
    default: return "rgba(244, 67, 54, 0.35)";
  }
});
const zoneLabel = computed(() => t(`$vuetify.share.zone_pill_${trainingLoad.value.zone}`));
const zoneDescription = computed(() => t(`$vuetify.activity_analysis.load_desc_${trainingLoad.value.zone}`));
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
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  margin-bottom: 22px

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

.sc-acwr-row
  display: flex
  align-items: baseline
  gap: 10px

.sc-acwr-val
  font-size: 80px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.95
  letter-spacing: -3px

.sc-acwr-label
  font-size: 18px
  font-weight: 700
  color: #FFFFFF59
  letter-spacing: 0.1em

.sc-zone-pill-wrap
  margin-top: 12px
  margin-bottom: 20px

.sc-zone-pill
  display: inline-block
  font-size: 12px
  font-weight: 800
  letter-spacing: 0.12em
  padding: 5px 16px
  border-radius: 20px

.sc-zone-bar
  display: flex
  gap: 4px
  margin-bottom: 20px

.sc-zone-seg
  flex: 1
  height: 6px
  border-radius: 3px
  display: flex
  align-items: flex-end
  padding-bottom: 10px
  font-size: 8px
  font-weight: 700
  letter-spacing: 0.08em
  color: #FFFFFF40
  justify-content: center
  flex-direction: column
  gap: 6px
  &::before
    content: ""
    display: block
    width: 100%
    height: 6px
    border-radius: 3px
    opacity: 0.3
  &.active
    color: #FFFFFFB3
    &::before
      opacity: 1
  &.seg-low::before
    background: #3B82F6
  &.seg-opt::before
    background: #48F26D
  &.seg-cau::before
    background: #FF9800
  &.seg-dan::before
    background: #F44336

.sc-load-row
  display: flex
  align-items: center
  gap: 24px
  padding: 16px 20px
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.06)
  border-radius: 12px
  margin-bottom: 16px

.sc-load-item
  display: flex
  flex-direction: column
  gap: 4px

.sc-load-label
  font-size: 10px
  color: #FFFFFF61
  font-weight: 600
  letter-spacing: 0.05em

.sc-load-val
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-load-unit
  font-size: 13px
  font-weight: 600
  color: #FFFFFF73
  margin-left: 2px

.sc-load-divider
  width: 1px
  height: 32px
  background: #FFFFFF1A

.sc-zone-desc
  font-size: 13px
  color: #FFFFFF80
  line-height: 1.5
</style>