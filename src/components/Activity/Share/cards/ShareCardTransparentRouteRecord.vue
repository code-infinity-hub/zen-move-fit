<template>
  <div class="sc-root" :style="cardStyle">
    <ShareRouteLineSvg
      :route-points="routePoints ?? []"
      :width="540"
      :height="svgHeight"
      uid="rr"
    />

    <div v-if="record" class="sc-overlay">
      <div class="sc-trophy-row">
        <span class="sc-trophy">🏆</span>
        <div class="sc-pr-badge">{{ t("$vuetify.share.new_pr") }}</div>
      </div>
      <p class="sc-record-label">{{ record.label }}</p>
      <p class="sc-record-val">{{ record.value }}</p>
      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type RoutePoint } from "@/types/share.type";
import { getCardStyle, FORMAT_HEIGHTS } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";
import ShareRouteLineSvg from "./ShareRouteLineSvg.vue";

/// DATA
const props = defineProps<ShareCardProps & { routePoints?: RoutePoint[] }>();
const { t } = useLocale();

/// COMPUTED
const format = computed(() => props.format ?? "feed");
const cardStyle = computed(() => getCardStyle(format.value));
const svgHeight = computed(() => FORMAT_HEIGHTS[format.value]);
const record = computed(() => {
  const pr = props.activity.analysis?.records?.find((r) => r.is_pr);
  if (!pr) return null;
  const label = t(`$vuetify.activity_analysis.${pr.title_key}`);
  const value =
    pr.value !== undefined
      ? t(`$vuetify.activity_analysis.${pr.description_key}`, [pr.value])
      : pr.rank !== undefined
        ? t(`$vuetify.activity_analysis.${pr.description_key}`, [pr.rank])
        : t(`$vuetify.activity_analysis.${pr.description_key}`);
  return { label, value };
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
  justify-content: center
  align-items: center
  box-sizing: border-box
  overflow: hidden

.sc-overlay
  position: relative
  z-index: 1
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  gap: 8px
  padding: 32px

.sc-trophy-row
  display: flex
  align-items: center
  gap: 12px
  margin-bottom: 4px

.sc-trophy
  font-size: 56px
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.8))

.sc-pr-badge
  font-size: 13px
  font-weight: 900
  letter-spacing: 0.12em
  color: #0E1115
  background: #48F26D
  padding: 5px 14px
  border-radius: 20px
  box-shadow: 0 4px 20px #48F26D80, 0 2px 8px #0009

.sc-record-label
  font-size: 16px
  font-weight: 600
  color: #FFFFFFBF
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.7)
  text-transform: uppercase
  letter-spacing: 0.06em

.sc-record-val
  font-size: 26px
  font-weight: 700
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1.3
  max-width: 380px
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 6px 24px rgba(0, 0, 0, 0.7)

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DB3
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
  margin-top: 8px
</style>