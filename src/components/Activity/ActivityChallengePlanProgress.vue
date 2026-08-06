<template>
  <div class="px-4 py-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center ga-2">
        <v-icon
          :size="18"
          class="text-medium-emphasis"
        >mdi-flag-checkered</v-icon>

        <span class="text-subtitle-1 font-weight-bold">
          {{ t("$vuetify.challenge_analysis.plan_progress_title") }}
        </span>
      </div>

      <v-chip
        color="primary"
        variant="tonal"
        size="x-small"
        class="font-weight-bold"
      >{{ t("$vuetify.challenge_analysis.plan_ordinal", ordinal, total) }}</v-chip>
    </div>

    <div class="progress-track rounded-pill mb-2">
      <div
        class="progress-fill rounded-pill"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>

    <p class="text-caption text-medium-emphasis">
      {{ t("$vuetify.challenge_analysis.plan_completed_pct", formatNumber(percentage, "percent", 0)) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{
  ordinal: number,
  total: number,
  completed: number,
  percentage: number,
}>();
</script>

<style lang="sass" scoped>
.progress-track
  height: 6px
  background: rgba(255, 255, 255, 0.08)
  overflow: hidden

.progress-fill
  height: 100%
  background: var(--primary)
  opacity: 0.8
  transition: width 0.5s ease
</style>