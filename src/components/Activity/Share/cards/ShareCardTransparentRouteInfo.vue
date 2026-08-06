<template>
  <div class="sc-root" :style="cardStyle">
    <ShareRouteLineSvg
      :route-points="routePoints ?? []"
      :width="540"
      :height="svgHeight"
      uid="rif"
    />

    <div class="sc-header">
      <p v-if="activity.title" class="sc-title">{{ activity.title }}</p>
      <p v-if="activity.address" class="sc-address">{{ `📍 ${shortAddress}` }}</p>
    </div>

    <div class="sc-footer">
      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type RoutePoint } from "@/types/share.type";
import ShareRouteLineSvg from "./ShareRouteLineSvg.vue";
import { getCardStyle, FORMAT_HEIGHTS } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const props = defineProps<ShareCardProps & { routePoints?: RoutePoint[] }>();

/// COMPUTED
const format = computed(() => props.format ?? "feed");
const cardStyle = computed(() => getCardStyle(format.value));
const svgHeight = computed(() => FORMAT_HEIGHTS[format.value]);
const shortAddress = computed(() => (props.activity.address ?? "").split(",").map((s) => s.trim()).slice(0, 2).join(", "));
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: var(--sc-h, 540px)
  background: transparent
  position: relative
  display: flex
  flex-direction: column
  justify-content: space-between
  box-sizing: border-box
  overflow: hidden

.sc-header
  position: relative
  z-index: 1
  padding: 32px 36px 20px
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.68) 0%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)
  display: flex
  flex-direction: column
  gap: 6px

.sc-title
  font-size: 26px
  font-weight: 800
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1.2
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.7)
  letter-spacing: -0.5px

.sc-address
  font-size: 13px
  font-weight: 600
  color: #FFFFFFBF
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)

.sc-footer
  position: relative
  z-index: 1
  padding: 0 36px 28px

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DD9
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>