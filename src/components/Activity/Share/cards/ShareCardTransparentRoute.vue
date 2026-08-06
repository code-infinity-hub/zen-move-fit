<template>
  <div class="sc-root" :style="cardStyle">
    <ShareRouteLineSvg
      :route-points="routePoints ?? []"
      :width="540"
      :height="svgHeight"
      uid="rt"
    />
    <div class="sc-brand">
      <ShareCardBrand />
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

.sc-brand
  position: relative
  z-index: 1
  padding: 0 36px 28px
  font-size: 11px
  font-weight: 700
  color: #48F26DD9
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>