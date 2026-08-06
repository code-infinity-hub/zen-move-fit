<template>
  <div ref="rootRef" class="sc-root" :style="cardStyle">
    <div v-if="activity.insight" class="sc-body">
      <div class="sc-ai-icon">🤖</div>
      <div class="sc-card">
        <p class="sc-quote-mark">"</p>
        <p ref="textRef" class="sc-text">{{ fittedText }}</p>
      </div>
      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFitText } from "@/composables/use-fit-text";
import { getCardStyle } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const props = defineProps<ShareCardProps>();

const rootRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const { fittedText } = useFitText(
  rootRef,
  textRef,
  () => props.activity.insight ?? "",
  { watchSources: () => props.format }
);

/// COMPUTED
const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: transparent
  display: flex
  flex-direction: column
  justify-content: flex-end
  box-sizing: border-box
  overflow: hidden

.sc-body
  padding: 28px 32px 40px
  display: flex
  flex-direction: column
  gap: 10px

.sc-ai-icon
  font-size: 28px
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9))

.sc-card
  position: relative
  padding: 20px 24px
  background: #0000008C
  border-radius: 16px
  backdrop-filter: blur(12px)
  border: 1px solid rgba(255, 255, 255, 0.1)
  box-shadow: 0 8px 32px #00000080

.sc-quote-mark
  font-size: 64px
  line-height: 0.5
  color: #48F26D
  font-family: Georgia, serif
  font-weight: 900
  margin-bottom: 8px
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6)

.sc-text
  font-size: 16px
  font-weight: 500
  color: #FFFFFFEB
  line-height: 1.55
  font-style: italic
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8)

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DB3
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>