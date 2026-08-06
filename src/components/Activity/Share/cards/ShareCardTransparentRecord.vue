<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-body">
      <div v-if="record" class="sc-card">
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

.sc-card
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  gap: 8px

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
  text-shadow: none
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