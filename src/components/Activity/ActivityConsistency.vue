<template>
  <div class="px-4 py-4">
    <div class="mb-3 d-flex justify-space-between align-center">
      <span class="text-subtitle-1 font-weight-bold">
        {{ t("$vuetify.activity_analysis.consistency_title") }}
      </span>

      <v-chip
        size="small"
        variant="tonal"
        :color="labelColor"
      >{{ t(`$vuetify.activity_analysis.${consistency.label_key}`) }}</v-chip>
    </div>

    <div class="text-caption text-grey-lighten-1 mb-4 mt-1">
      {{ t("$vuetify.activity_analysis.consistency_subtitle") }}
    </div>

    <div class="d-flex ga-2 mt-3 flex-wrap">
      <span
        v-for="(dot, index) in dots"
        :key="index"
        :class="{
          'week-dot': true,
          'week-dot--active': dot.active,
          'week-dot--current': dot.isCurrent
        }"
      ></span>
    </div>

    <div class="d-flex ga-4 mt-3">
      <span class="text-caption text-grey-lighten-1">
        {{ t("$vuetify.activity_analysis.consistency_weeks", consistency.active_weeks, consistency.total_weeks ?? 8) }}
      </span>

      <span
        v-if="consistency.streak > 1"
        class="text-caption text-primary"
      >{{ t("$vuetify.activity_analysis.consistency_streak", consistency.streak) }}</span>
    </div>

    <div
      v-if="consistency.badges?.length"
      class="d-flex flex-wrap ga-2 mt-3"
    >
      <v-chip
        v-for="badge in consistency.badges"
        :key="badge"
        size="x-small"
        color="primary"
        variant="tonal"
      >{{ t(`$vuetify.activity_analysis.${badge}`) }}</v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisConsistency } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ consistency: ActivityAnalysisConsistency }>();

/// COMPUTED
const labelColor = computed(() => {
  const key = props.consistency.label_key;
  if (key === "consistency_excellent") return "primary";
  if (key === "consistency_good") return "primary";
  if (key === "consistency_average") return "orange";
  return "red";
});

const dots = computed(() => {
  const result = [];
  for (let i = 0; i < 8; i++) {
    const count = props.consistency.weekly_counts[i] ?? 0;
    result.push({ active: count > 0, isCurrent: i === 0 });
  }
  return result;
});
</script>

<style lang="sass" scoped>
.week-dot
  width: 28px
  height: 28px
  border-radius: 50%
  display: inline-block
  background: rgba(255, 255, 255, 0.08)
  border: 1px solid rgba(255, 255, 255, 0.12)
  transition: transform 0.15s ease

  &--active
    background: var(--primary)
    opacity: 0.9
    border-color: transparent

  &--current
    width: 32px
    height: 32px
    box-shadow: 0 0 0 2px rgba(72, 242, 109, 0.35)
</style>