<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_records") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.records_subtitle") }}</p>

    <div class="sc-records">
      <div v-for="record in records" :key="record.title_key" class="sc-record-item">
        <div class="sc-record-icon">🏅</div>
        <div class="sc-record-content">
          <span class="sc-record-type">{{ t(`$vuetify.activity_analysis.${record.title_key}`) }}</span>
          <span class="sc-record-value">{{ describeRecord(record) }}</span>
        </div>
        <div class="sc-record-badge">{{ t("$vuetify.label.pr") }}</div>
      </div>
    </div>

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
const records = computed(() => (props.activity.analysis?.records ?? []).filter((r) => r.is_pr).slice(0, 4));

/// METHODS
const describeRecord = (record: { description_key: string; value?: number; rank?: number }) => {
  if (record.value !== undefined) return t(`$vuetify.activity_analysis.${record.description_key}`, [record.value]);
  if (record.rank !== undefined) return t(`$vuetify.activity_analysis.${record.description_key}`, [record.rank]);
  return t(`$vuetify.activity_analysis.${record.description_key}`);
};
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
  background: radial-gradient(circle at 50% 10%, rgba(72, 242, 109, 0.08) 0%, transparent 55%)
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

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 28px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-records
  display: flex
  flex-direction: column
  gap: 16px

.sc-record-item
  display: flex
  align-items: center
  gap: 16px
  padding: 16px 20px
  background: #48F26D0A
  border: 1px solid rgba(72, 242, 109, 0.12)
  border-radius: 14px

.sc-record-icon
  font-size: 24px
  line-height: 1
  flex-shrink: 0

.sc-record-content
  flex: 1
  display: flex
  flex-direction: column
  gap: 2px

.sc-record-type
  font-size: 11px
  font-weight: 600
  color: #FFF6
  text-transform: uppercase
  letter-spacing: 0.06em

.sc-record-value
  font-size: 14px
  font-weight: 600
  color: #FFFFFFBF
  line-height: 1.4

.sc-record-badge
  font-size: 10px
  font-weight: 800
  color: #0E1115
  background: #48F26D
  padding: 3px 7px
  border-radius: 6px
  letter-spacing: 0.08em
  flex-shrink: 0
</style>