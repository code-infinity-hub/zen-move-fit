<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-body">
      <div class="sc-streak-card">
        <div class="sc-fire-row">
          <span class="sc-fire">🔥</span>
          <span class="sc-val">{{ streak }}</span>
        </div>
        <p class="sc-label">{{ streakLabel }}</p>
        <div class="sc-brand">
          <ShareCardBrand />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { getCardStyle } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
const streak = computed(
  () => props.activity.challenge_analysis?.streak ?? props.activity.training_analysis?.consistency?.streak ?? props.activity.analysis?.consistency?.streak ?? 1,
);
const streakLabel = computed(() => t(streak.value === 1 ? "$vuetify.share.training_day" : "$vuetify.share.days_in_a_row_label"));
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
  padding: 32px

.sc-streak-card
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  gap: 4px

.sc-fire-row
  display: flex
  align-items: center
  gap: 8px

.sc-fire
  font-size: 72px
  filter: drop-shadow(0 4px 20px rgba(255, 120, 40, 0.6)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9))

.sc-val
  font-size: 120px
  font-weight: 900
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1
  letter-spacing: -4px
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.9), 0 8px 40px rgba(0, 0, 0, 0.7)

.sc-label
  font-size: 22px
  font-weight: 700
  color: #FFFFFFD9
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)
  letter-spacing: 0.02em
  margin-top: 4px

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DB3
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
  margin-top: 16px
</style>