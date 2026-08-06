<template>
  <div v-if="highlights.length" class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.training_analysis.highlights_title") }}
    </p>

    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="h in highlights"
        :key="h.key"
        :color="colorMap[h.type]"
        :prepend-icon="iconMap[h.type]"
        variant="tonal"
        size="small"
        class="font-weight-medium"
      >{{ t(`$vuetify.training_analysis.${h.key}`) }}</v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type TrainingAnalysisHighlight } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ highlights: TrainingAnalysisHighlight[] }>();
const colorMap: Record<string, string> = {
  positive: "primary",
  neutral: "blue",
  info: "yellow",
};
const iconMap: Record<string, string> = {
  positive: "mdi-trending-up",
  neutral: "mdi-minus",
  info: "mdi-information-outline",
};
</script>