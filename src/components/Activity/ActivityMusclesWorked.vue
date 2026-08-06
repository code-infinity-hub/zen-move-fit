<template>
  <div v-if="muscleData.length" class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_detail.muscles_worked_title") }}
    </p>

    <div class="d-flex flex-column ga-3">
      <div
        v-for="muscle in muscleData"
        :key="muscle.key"
        class="muscle-row"
      >
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-body-2 font-weight-medium">
            {{ muscle.label }}
          </span>

          <span class="text-caption font-weight-bold text-primary">
            {{ formatNumber(muscle.percentage, "percent", 0) }}
          </span>
        </div>
        <div class="muscle-track rounded-pill">
          <div
            class="muscle-fill rounded-pill"
            :style="{ width: `${muscle.percentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { type ActivityDetail } from "@/types/activity.type";

interface MuscleEntry {
  key: string,
  label: string,
  sets: number,
  percentage: number,
};

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ exercises: ActivityDetail["exercises"] }>();

/// COMPUTED
const muscleData = computed<MuscleEntry[]>(() => {
  const counts: Record<string, number> = { };

  for (const ex of (props.exercises ?? [])) {
    const weight = ex.series.length || 1;

    for (const muscle of ex.muscle_groups ?? []) {
      counts[muscle] = (counts[muscle] ?? 0) + weight;
    }
  }

  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  return Object.entries(counts)
    .map(([key, sets]) => ({
      key,
      label: t(`$vuetify.muscle_groups.${key}`, key),
      sets,
      percentage: Math.round((sets / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);
});
</script>

<style lang="sass" scoped>
.muscle-track
  height: 5px
  background: rgba(255, 255, 255, 0.07)
  overflow: hidden

.muscle-fill
  height: 100%
  background: var(--primary)
  opacity: 0.70
  transition: width 0.4s ease
</style>