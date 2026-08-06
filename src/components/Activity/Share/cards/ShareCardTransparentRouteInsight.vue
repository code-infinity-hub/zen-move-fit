<template>
  <div ref="rootRef" class="sc-root" :style="cardStyle">
    <ShareRouteLineSvg
      :route-points="routePoints ?? []"
      :width="540"
      :height="svgHeight"
      uid="ri"
    />

    <div class="sc-overlay">
      <div class="sc-ai-badge">{{ t("$vuetify.share.badge_ai_insight") }}</div>
      <p ref="textRef" class="sc-insight-text">{{ fittedText }}</p>
      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type RoutePoint } from "@/types/share.type";
import ShareRouteLineSvg from "./ShareRouteLineSvg.vue";
import { useFitText } from "@/composables/use-fit-text";
import { getCardStyle, FORMAT_HEIGHTS } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const props = defineProps<ShareCardProps & { routePoints?: RoutePoint[] }>();
const { t } = useLocale();

const rootRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const { fittedText } = useFitText(
  rootRef,
  textRef,
  () => props.activity.insight ?? "",
  { watchSources: () => props.format }
);

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

.sc-overlay
  position: relative
  z-index: 1
  padding: 28px 36px 36px
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.32) 70%, transparent 100%)
  display: flex
  flex-direction: column
  gap: 10px

.sc-ai-badge
  font-size: 10px
  font-weight: 800
  letter-spacing: 0.14em
  color: #48F26D
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)

.sc-insight-text
  font-size: 17px
  font-weight: 600
  color: #FFF
  line-height: 1.45
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.7)

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DCC
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>