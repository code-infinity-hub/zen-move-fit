<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_recommendations") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.recommendations_subtitle") }}</p>

    <div class="sc-recs">
      <div v-for="rec in recommendations" :key="rec.key" class="sc-rec-card">
        <div class="sc-priority-dot" :style="{ background: priorityColor(rec.priority) }"></div>
        <div class="sc-rec-content">
          <span class="sc-priority-label" :style="{ color: priorityColor(rec.priority) }">{{ priorityLabel(rec.priority) }}</span>
          <span class="sc-rec-text">{{ t(`$vuetify.activity_analysis.${rec.key}`) }}</span>
        </div>
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
const recommendations = computed(() => (props.activity.analysis?.recommendations ?? []).slice(0, 3));

/// METHODS
const priorityColor = (priority: string) => (priority === "high" ? "#F44336" : priority === "medium" ? "#FF9800" : "#3B82F6");
const priorityLabel = (priority: string) => t(priority === "high" ? "$vuetify.share.priority_high" : priority === "medium" ? "$vuetify.share.priority_medium" : "$vuetify.share.priority_low");
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
  background: radial-gradient(circle at 90% 90%, rgba(72, 242, 109, 0.06) 0%, transparent 55%)
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

.sc-recs
  display: flex
  flex-direction: column
  gap: 14px

.sc-rec-card
  display: flex
  align-items: flex-start
  gap: 16px
  padding: 16px 18px
  background: #FFFFFF06
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 14px

.sc-priority-dot
  width: 10px
  height: 10px
  border-radius: 50%
  margin-top: 5px
  flex-shrink: 0

.sc-rec-content
  display: flex
  flex-direction: column
  gap: 4px

.sc-priority-label
  font-size: 10px
  font-weight: 700
  letter-spacing: 0.1em
  text-transform: uppercase

.sc-rec-text
  font-size: 13px
  font-weight: 500
  color: #FFFFFFC7
  line-height: 1.4
</style>