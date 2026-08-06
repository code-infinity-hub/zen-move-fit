<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_challenge_complete") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <div :style="{ flex: 1 }"></div>

    <div class="sc-body">
      <div class="sc-trophy">🏆</div>
      <div class="sc-complete-val">100%</div>
      <div class="sc-complete-label">{{ t("$vuetify.share.completed_label") }}</div>

      <div class="sc-stats-row">
        <div class="sc-stat">
          <span class="sc-stat-num">{{ progress.completed }}</span>
          <span class="sc-stat-lbl">{{ t("$vuetify.share.activities_label") }}</span>
        </div>

        <div class="sc-stat-divider"></div>

        <div v-if="progress.ordinal > 1" class="sc-stat">
          <span class="sc-stat-num">{{ `${progress.ordinal}º` }}</span>
          <span class="sc-stat-lbl">{{ t("$vuetify.share.challenge_label") }}</span>
        </div>

        <div v-if="progress.ordinal > 1" class="sc-stat-divider"></div>

        <div class="sc-stat">
          <span class="sc-stat-num">{{ formatDuration(activity.duration_seconds) }}</span>
          <span class="sc-stat-lbl">{{ t("$vuetify.share.today_label") }}</span>
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
import { formatDuration } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const progress = computed(() => props.activity.challenge_plan_progress!);
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
  background: radial-gradient(circle at 50% 50%, rgba(72, 242, 109, 0.12) 0%, transparent 65%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
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

.sc-trophy
  font-size: 72px
  line-height: 1
  margin-bottom: 12px
  filter: drop-shadow(0 4px 20px rgba(255, 235, 59, 0.3))

.sc-complete-val
  font-size: 96px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.9
  color: #48F26D
  letter-spacing: -4px
  text-shadow: 0 0 40px rgba(72, 242, 109, 0.4)

.sc-complete-label
  font-size: 16px
  font-weight: 800
  letter-spacing: 0.2em
  color: #FFFFFF80
  margin-top: 10px
  margin-bottom: 24px

.sc-stats-row
  display: flex
  align-items: center
  gap: 20px
  padding: 14px 24px
  background: #48F26D0F
  border: 1px solid rgba(72, 242, 109, 0.15)
  border-radius: 14px

.sc-stat
  display: flex
  align-items: baseline
  gap: 5px

.sc-stat-num
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-stat-lbl
  font-size: 11px
  color: #FFF6

.sc-stat-divider
  width: 1px
  height: 24px
  background: #FFFFFF1A
</style>