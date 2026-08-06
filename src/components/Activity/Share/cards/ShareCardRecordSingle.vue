<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_new_record") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <div :style="{ flex: 1 }"></div>

    <div v-if="record" class="sc-body">
      <div class="sc-record-emoji">🏅</div>
      <div class="sc-pr-badge">{{ t("$vuetify.label.pr") }}</div>
      <div class="sc-record-type">{{ t(`$vuetify.activity_analysis.${record.title_key}`) }}</div>
      <div class="sc-record-value">{{ describeRecord(record) }}</div>
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
const props = defineProps<ShareCardProps & { recordKey: string }>();

/// COMPUTED
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const record = computed(() => (props.activity.analysis?.records ?? []).find((r) => r.is_pr && r.title_key === props.recordKey) ?? null);

/// METHODS
const describeRecord = (r: { description_key: string; value?: number; rank?: number }) => {
  if (r.value !== undefined) return t(`$vuetify.activity_analysis.${r.description_key}`, [r.value]);
  if (r.rank !== undefined) return t(`$vuetify.activity_analysis.${r.description_key}`, [r.rank]);
  return t(`$vuetify.activity_analysis.${r.description_key}`);
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
  background: radial-gradient(circle at 50% 50%, rgba(72, 242, 109, 0.1) 0%, transparent 60%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 22px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-body
  display: flex
  flex-direction: column
  align-items: center

.sc-record-emoji
  font-size: 60px
  line-height: 1
  margin-bottom: 16px

.sc-pr-badge
  font-size: 13px
  font-weight: 800
  letter-spacing: 0.12em
  color: #0E1115
  background: #48F26D
  padding: 4px 14px
  border-radius: 8px
  margin-bottom: 16px

.sc-record-type
  font-size: 14px
  font-weight: 600
  letter-spacing: 0.1em
  color: #FFFFFF73
  text-transform: uppercase
  margin-bottom: 10px

.sc-record-value
  font-size: 26px
  font-weight: 700
  font-family: "Space Grotesk", system-ui, sans-serif
  color: #FFF
  line-height: 1.3
  text-align: center
  text-shadow: 0 0 40px rgba(72, 242, 109, 0.25)
  max-width: 380px
</style>