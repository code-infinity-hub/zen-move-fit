<template>
  <div class="px-4 py-4">
    <div class="mb-3 d-flex align-center ga-2">
      <v-icon
        color="primary"
        :size="18"
      >mdi-flag-checkered</v-icon>

      <span class="text-subtitle-1 font-weight-bold">
        {{ t("$vuetify.activity_analysis.next_goal_title") }}
      </span>
    </div>

    <div class="text-body-2 text-grey-lighten-1 mt-2">
      {{ t(`$vuetify.activity_analysis.${goal.label_key}`) }}
    </div>

    <div class="d-flex justify-space-between mt-3">
      <span class="text-caption">
        {{ t("$vuetify.activity_analysis.next_goal_current", formattedCurrent) }}
      </span>

      <span class="text-caption text-primary font-weight-bold">
        {{ t("$vuetify.activity_analysis.next_goal_target", formattedTarget) }}
      </span>
    </div>

    <v-progress-linear
      rounded
      color="primary"
      bg-color="tertiary"
      height="6"
      :model-value="progressPct"
      class="mt-2"
    />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { type ActivityAnalysisNextGoal } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ goal: ActivityAnalysisNextGoal }>();

/// COMPUTED
const formattedCurrent = computed(() =>
  props.goal.unit === "s_per_km" ?
    formatPace(props.goal.current_value) :
    formatDistance(props.goal.current_value)
);

const formattedTarget = computed(() =>
  props.goal.unit === "s_per_km" ?
    formatPace(props.goal.target_value) :
    formatDistance(props.goal.target_value)
);

const progressPct = computed(() => Math.min(100, Math.round((props.goal.current_value / props.goal.target_value) * 100)));

/// METHODS
const formatPace = (s: number): string => {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}/${t("$vuetify.label.km")}`;
};

const formatDistance = (m: number): string => {
  return `${formatNumber(m / 1000)} ${t("$vuetify.label.km")}`;
};
</script>