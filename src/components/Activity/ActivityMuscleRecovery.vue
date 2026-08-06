<template>
  <div class="mx-4 mt-5 recovery-card rounded-xl pa-4">
    <div class="d-flex align-center mb-5">
      <div class="d-flex align-center ga-2">
        <v-icon
          :size="18"
          color="white"
        >mdi-clock-outline</v-icon>

        <span class="text-subtitle-2 font-weight-bold">
          {{ t("$vuetify.training_analysis.recovery_title") }}
        </span>
      </div>
    </div>

    <div class="recovery-track rounded-pill mb-3">
      <div
        class="recovery-fill rounded-pill"
        :style="{ width: barWidth, background: `rgb(var(--v-theme-${barColor}))` }"
      ></div>
    </div>

    <div class="d-flex mb-4">
      <v-chip
        :color="barColor"
        variant="tonal"
        size="x-small"
        class="font-weight-bold"
      >{{ t("$vuetify.training_analysis.recovery_hours", hours) }}</v-chip>
    </div>

    <div v-if="primaryMuscles.length">
      <p class="text-caption text-medium-emphasis mb-2">
        {{ t("$vuetify.training_analysis.recovery_primary_label") }}
      </p>

      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="muscle in primaryMuscles"
          :key="muscle"
          size="x-small"
          variant="tonal"
          color="blue"
        >{{ t(`$vuetify.muscle_groups.${muscle}`, muscle) }}</v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ hours: number, primaryMuscles: string[] }>();

/// COMPUTED
const barWidth = computed(() => {
  const pct = Math.min((props.hours / 48) * 100, 100);
  return `${pct}%`;
});
const barColor = computed(() => {
  if (props.hours <= 24) return "primary";
  if (props.hours <= 36) return "yellow";
  return "orange";
});
</script>

<style lang="sass" scoped>
.recovery-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)

.recovery-track
  height: 6px
  background: rgba(255, 255, 255, 0.08)
  overflow: hidden

.recovery-fill
  height: 100%
  transition: width 0.5s ease
</style>