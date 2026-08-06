<template>
  <div class="px-4 py-4">
    <div class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.recommendations_title") }}
    </div>

    <div
      v-for="(rec, index) in props.recommendations"
      :key="rec.key"
      :class="[
        'd-flex align-start ga-3 py-3',
        index < recommendations.length - 1 ? 'border-bottom-tertiary' : ''
      ]"
    >
      <span
        class="priority-dot flex-shrink-0"
        :style="{ background: dotColor(rec.priority) }"
      ></span>

      <span class="text-body-2">
        {{ t(`$vuetify.activity_analysis.${rec.key}`) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisRecommendation } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ recommendations: ActivityAnalysisRecommendation[] }>();

/// METHODS
const dotColor = (priority: "high" | "medium" | "low"): string => {
  if (priority === "high") return "var(--red)"
  if (priority === "medium") return "var(--orange)"
  return "var(--blue)"
};
</script>

<style lang="sass" scoped>
.priority-dot
  width: 8px
  height: 8px
  border-radius: 50%
  margin-top: 6px
  display: inline-block
  flex-shrink: 0

.border-bottom-tertiary
  border-bottom: 1px solid rgba(255, 255, 255, 0.07)
</style>