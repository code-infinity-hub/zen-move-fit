<template>
  <div class="px-4 py-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-caption text-uppercase">
        {{ t(`$vuetify.activity_analysis.${efficiency.label_key}`) }}
      </span>

      <v-icon :color="trendColor" :size="20">
        {{ trendIcon }}
      </v-icon>
    </div>

    <div class="text-h4 font-weight-black text-primary">
      {{ formatPace(efficiency.value) }}
    </div>

    <div class="text-caption text-grey mt-1">
      {{ t("$vuetify.activity_analysis.efficiency_note") }}
    </div>

    <div v-if="showChip" class="mt-3">
      <v-chip
        :color="comparisonPositive ? 'primary' : 'red'"
        size="small"
        variant="tonal"
      >
        {{ formatNumber(comparisonAbs, "percent", 0) }}
        <span class="ml-1">
          {{
            comparisonPositive
              ? t("$vuetify.activity_analysis.efficiency_better")
              : t("$vuetify.activity_analysis.efficiency_worse")
          }}
        </span>
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisEfficiency } from "@/types/activity.type";
import { useFormatNumber } from "@/composables";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ efficiency: ActivityAnalysisEfficiency }>();

/// COMPUTED
const trendIcon = computed(() => {
  switch (props.efficiency.trend) {
    case "up": return "mdi-trending-up";
    case "down": return "mdi-trending-down";
    default: return "mdi-trending-neutral";
  }
});
const trendColor = computed(() => {
  switch (props.efficiency.trend) {
    case "up": return "var(--primary)";
    case "down": return "var(--red)";
    default: return "grey";
  }
});
const comparisonAbs = computed(() => Math.abs(props.efficiency.comparison_pct));
const comparisonPositive = computed(() => props.efficiency.comparison_pct > 0);
const comparisonNegative = computed(() => props.efficiency.comparison_pct < 0);
const showChip = computed(() => props.efficiency.comparison_pct !== 0);

/// METHODS
const formatPace = (s: number): string => {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}/${t("$vuetify.label.km")}`;
};
</script>