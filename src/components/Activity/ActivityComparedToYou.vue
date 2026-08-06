<template>
  <div class="px-4 py-4">
    <div class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.compared_title") }}
    </div>

    <div
      v-for="(period, index) in comparison.periods"
      :key="period.label_key"
      :class="[
        'd-flex align-start py-3',
        index < comparison.periods.length - 1 ? 'border-bottom-tertiary' : ''
      ]"
    >
      <span class="text-body-2 font-weight-bold period-label">
        {{ t(`$vuetify.activity_analysis.${period.label_key}`) }}
      </span>

      <div class="flex-fill d-flex flex-column ga-1">
        <template v-if="!period.available">
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.activity_analysis.cty_no_data") }}
          </span>
        </template>

        <template v-else>
          <template v-if="period.pace_diff_seconds !== null">
            <span
              v-if="period.pace_diff_seconds > 5"
              class="text-caption text-primary"
            >{{ t("$vuetify.activity_analysis.cty_faster", formatPaceDiff(period.pace_diff_seconds)) }}</span>
            <span
              v-else-if="period.pace_diff_seconds < -5"
              class="text-caption text-red"
            >{{ t("$vuetify.activity_analysis.cty_slower", formatPaceDiff(period.pace_diff_seconds)) }}</span>
            <span
              v-else
              class="text-caption text-grey-lighten-1"
            >{{ t("$vuetify.activity_analysis.cty_same_pace") }}</span>
          </template>
          <template v-if="period.distance_diff_pct !== null">
            <span
              v-if="period.distance_diff_pct > 5"
              class="text-caption text-primary"
            >{{ t("$vuetify.activity_analysis.cty_more_distance", Math.abs(period.distance_diff_pct)) }}</span>
            <span
              v-else-if="period.distance_diff_pct < -5"
              class="text-caption text-red"
            >{{ t("$vuetify.activity_analysis.cty_less_distance", Math.abs(period.distance_diff_pct)) }}</span>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisComparedToYou } from "@/types/activity.type";
import { formatPaceDiff } from "@/utils";

/// DATA
const { t } = useLocale();
defineProps<{ comparison: ActivityAnalysisComparedToYou }>();
</script>

<style lang="sass" scoped>
.period-label
  min-width: 110px

.border-bottom-tertiary
  border-bottom: 1px solid rgba(255, 255, 255, 0.07)
</style>