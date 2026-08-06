<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_streak") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <div :style="{ flex: 1 }"></div>

    <div class="sc-body">
      <div class="sc-fire-emoji">🔥</div>
      <div class="sc-streak-val">{{ streak }}</div>
      <div class="sc-streak-label">{{ t("$vuetify.share.challenges_in_a_row") }}</div>
      <div v-if="streak >= 7" class="sc-milestone-pill">{{ milestoneLabel }}</div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const streak = computed(() => props.activity.challenge_analysis?.streak ?? 0);
const milestoneLabel = computed(() => {
  const value = streak.value;
  return t(value >= 30 ? "$vuetify.share.milestone_legendary" : value >= 14 ? "$vuetify.share.milestone_incredible" : "$vuetify.share.milestone_week");
});
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
  background: radial-gradient(circle at 50% 50%, rgba(255, 152, 0, 0.08) 0%, transparent 60%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #FF9800, transparent)
  margin-bottom: 20px

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
  gap: 0

.sc-fire-emoji
  font-size: 64px
  line-height: 1
  margin-bottom: 8px

.sc-streak-val
  font-size: 140px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.85
  color: #FFF
  letter-spacing: -6px
  text-shadow: 0 4px 32px rgba(255, 152, 0, 0.4), 0 0 60px rgba(255, 152, 0, 0.2)

.sc-streak-label
  font-size: 14px
  font-weight: 700
  letter-spacing: 0.18em
  color: #FFFFFF80
  margin-top: 10px

.sc-milestone-pill
  margin-top: 16px
  font-size: 14px
  font-weight: 700
  color: #FF9800
  background: #FF98001A
  border: 1px solid rgba(255, 152, 0, 0.3)
  padding: 6px 20px
  border-radius: 20px
</style>