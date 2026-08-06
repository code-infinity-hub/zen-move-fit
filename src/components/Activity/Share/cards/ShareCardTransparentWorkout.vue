<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-body">
      <p class="sc-title">
        {{ activity.workout_title ?? t("$vuetify.share.workout_completed") }}
      </p>

      <div class="sc-stats-row">
        <div class="sc-stat">
          <span class="sc-stat-val">{{ totalSets }}</span>
          <span class="sc-stat-unit">{{ t("$vuetify.label.series") }}</span>
        </div>

        <div class="sc-divider"></div>

        <div class="sc-stat">
          <span class="sc-stat-val">{{ formatDuration(activity.duration_seconds) }}</span>
          <span class="sc-stat-unit">{{ t("$vuetify.share.time_label") }}</span>
        </div>

        <template v-if="activity.calories">
          <div class="sc-divider"></div>
          <div class="sc-stat">
            <span class="sc-stat-val">{{ formatNumber(activity.calories) }}</span>
            <span class="sc-stat-unit">{{ t("$vuetify.label.kcal_abbreviation") }}</span>
          </div>
        </template>
      </div>

      <div v-if="muscleGroups.length" class="sc-muscles">
        <span
          v-for="group in muscleGroups"
          :key="group"
          class="sc-muscle-tag"
        >{{ t(`$vuetify.muscle_groups.${group}`) }}</span>
      </div>

      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { getCardStyle } from "@/composables/use-share-renderer";
import { formatDuration } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
const totalSets = computed(() => (props.activity.exercises ?? []).reduce((sum, ex) => sum + ex.series.length, 0));
const muscleGroups = computed(() => (props.activity.training_analysis?.volume?.muscles_worked ?? []).slice(0, 3).map((m) => m.group));
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
  padding: 24px 32px 40px
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%)
  display: flex
  flex-direction: column
  gap: 10px

.sc-title
  font-size: 26px
  font-weight: 800
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.7)
  line-height: 1.15

.sc-stats-row
  display: flex
  align-items: center
  gap: 16px

.sc-stat
  display: flex
  align-items: baseline
  gap: 5px

.sc-stat-val
  font-size: 32px
  font-weight: 900
  color: #48F26D
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(72, 242, 109, 0.3)

.sc-stat-unit
  font-size: 12px
  font-weight: 600
  color: #FFF9
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8)

.sc-divider
  width: 1px
  height: 24px
  background: #FFF3

.sc-muscles
  display: flex
  gap: 6px
  flex-wrap: wrap

.sc-muscle-tag
  font-size: 11px
  font-weight: 700
  color: #FFF
  background: #00000080
  border: 1px solid rgba(255, 255, 255, 0.2)
  padding: 3px 10px
  border-radius: 20px
  backdrop-filter: blur(4px)
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8)
  letter-spacing: 0.04em
  text-transform: capitalize

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26DB3
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
</style>