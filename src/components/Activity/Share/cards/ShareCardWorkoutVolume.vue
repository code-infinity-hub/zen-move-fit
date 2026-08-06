<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_workout_volume") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-title">{{ activity.workout_title ?? t("$vuetify.share.free_workout") }}</p>

    <div class="sc-stats-row">
      <div class="sc-stat">
        <span class="sc-stat-val">{{ volume.total_sets }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.label.series") }}</span>
      </div>

      <div class="sc-stat-divider"></div>

      <div v-if="volume.total_reps > 0" class="sc-stat">
        <span class="sc-stat-val">{{ volume.total_reps }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.activity_detail.total_reps") }}</span>
      </div>

      <div v-if="volume.total_reps > 0" class="sc-stat-divider"></div>

      <div class="sc-stat">
        <span class="sc-stat-val">{{ activity.calories ? formatNumber(activity.calories) : "—" }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.label.kcal_abbreviation") }}</span>
      </div>
    </div>

    <div class="sc-muscles">
      <div v-for="muscle in muscles" :key="muscle.group" class="sc-muscle-row">
        <span class="sc-muscle-name">{{ muscleLabel(muscle.group) }}</span>
        <div class="sc-bar-wrap">
          <div class="sc-bar" :style="{ width: `${muscle.percentage}%` }"></div>
        </div>
        <span class="sc-muscle-pct">{{ `${muscle.percentage}%` }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const volume = computed(() => props.activity.training_analysis!.volume!);
const muscles = computed(() => [...(volume.value.muscles_worked ?? [])].sort((a, b) => b.percentage - a.percentage).slice(0, 5));

/// METHODS
const muscleLabel = (group: string) => t(`$vuetify.muscle_groups.${group}`);
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
  background: radial-gradient(circle at 10% 90%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
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
  margin-bottom: 4px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 20px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 18px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-stats-row
  display: flex
  align-items: center
  gap: 20px
  padding: 14px 18px
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  margin-bottom: 20px

.sc-stat
  display: flex
  align-items: baseline
  gap: 5px

.sc-stat-val
  font-size: 28px
  font-weight: 800
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-stat-lbl
  font-size: 12px
  color: #FFFFFF61

.sc-stat-divider
  width: 1px
  height: 24px
  background: #FFFFFF1A

.sc-muscles
  display: flex
  flex-direction: column
  gap: 10px

.sc-muscle-row
  display: flex
  align-items: center
  gap: 10px

.sc-muscle-name
  font-size: 12px
  font-weight: 600
  color: #FFFFFFA6
  width: 80px
  flex-shrink: 0

.sc-bar-wrap
  flex: 1
  height: 6px
  background: #FFFFFF0F
  border-radius: 3px
  overflow: hidden

.sc-bar
  height: 100%
  background: linear-gradient(to right, #48F26D, #48F26D80)
  border-radius: 3px
  max-width: 100%

.sc-muscle-pct
  font-size: 11px
  font-weight: 700
  color: #FFF6
  width: 32px
  text-align: right
  flex-shrink: 0
</style>