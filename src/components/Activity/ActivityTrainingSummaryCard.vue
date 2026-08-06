<template>
  <div class="summary-card mx-4 rounded-lg pa-4">
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon
        color="primary"
        :size="12"
      >mdi-chart-bar</v-icon>

      <span
        class="text-caption font-weight-bold text-primary text-uppercase"
        :style="{ letterSpacing: '0.07em', fontSize: '10px' }"
      >{{ t("$vuetify.activity_detail.training_summary") }}</span>
    </div>

    <div class="stats-row">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        :class="[
          'stat-item d-flex flex-column align-center',
          i < stats.length - 1 ? 'stat-divider' : ''
        ]"
      >
        <v-icon
          :size="16"
          color="primary"
          class="mb-2"
        >{{ stat.icon }}</v-icon>

        <span class="stat-value font-weight-black">
          {{ stat.value }}
        </span>

        <span class="stat-label text-center text-grey-lighten-1">
          {{ stat.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { date } from "@/utils";
import { useFormatNumber } from "@/composables";
import { type ActivityDetail } from "@/types/activity.type";

interface StatItem {
  icon: string,
  value: string,
  label: string,
};

/// DATA
const { t } = useLocale();
const { formatTime } = date();
const { formatNumber } = useFormatNumber();
const props = defineProps<{
  durationSeconds: number
  calories?: number
  exercises: ActivityDetail["exercises"]
}>();

/// COMPUTED
const totalSets = computed(() => (props.exercises ?? []).reduce((sum, ex) => sum + ex.series.length, 0));
const totalReps = computed(() =>
  (props.exercises ?? []).reduce((sum, ex) => {
    if (ex.reps.type !== "fixed") return sum;
    return sum + ex.series.length * (ex.reps.max ?? ex.reps.min ?? 0);
  }, 0)
);
const stats = computed<StatItem[]>(() => {
  const items: StatItem[] = [];

  items.push({
    icon: "mdi-timer-outline",
    value: formatTime(props.durationSeconds),
    label: t("$vuetify.label.time"),
  });

  if (totalSets.value > 0) {
    items.push({
      icon: "mdi-dumbbell",
      value: String(totalSets.value),
      label: t("$vuetify.activity_detail.total_sets"),
    });
  }

  if (totalReps.value > 0) {
    items.push({
      icon: "mdi-repeat",
      value: String(totalReps.value),
      label: t("$vuetify.activity_detail.total_reps"),
    });
  }

  if ((props.calories ?? 0) > 0) {
    items.push({
      icon: "mdi-fire",
      value: formatNumber(props.calories ?? 0),
      label: t("$vuetify.label.kcal_abbreviation"),
    });
  }

  return items;
});
</script>

<style lang="sass" scoped>
.summary-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)

.stats-row
  display: flex
  align-items: center

.stat-item
  flex: 1

.stat-divider
  border-right: 1px solid rgba(255, 255, 255, 0.07)

.stat-value
  font-size: 1.1rem
  line-height: 1.2
  color: rgba(255, 255, 255, 0.92)

.stat-label
  font-size: 10px
  margin-top: 2px
  line-height: 1.2
</style>