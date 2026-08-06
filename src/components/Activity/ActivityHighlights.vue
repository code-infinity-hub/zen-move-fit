<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-4">
      {{ t("$vuetify.activity_analysis.highlights_title") }}
    </p>

    <div class="d-flex flex-column ga-3">
      <div
        v-for="(h, index) in highlights"
        :key="h.label_key"
        :class="[
          'd-flex align-center ga-3',
          index < highlights.length - 1 ? 'pb-3 border-bottom-tertiary' : ''
        ]"
      >
        <div
          class="highlight-icon d-flex align-center justify-center rounded-circle flex-shrink-0"
          :style="{ background: iconBg(h.type) }"
        >
          <v-icon :size="18" :style="{ color: iconColor(h.type) }">
            {{ iconForType(h.type) }}
          </v-icon>
        </div>

        <span class="text-body-2 text-grey-lighten-2">
          {{ t(`$vuetify.activity_analysis.${h.label_key}`, h.value ?? "") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisHighlight } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ highlights: ActivityAnalysisHighlight[] }>();

/// METHODS
const iconForType = (type: ActivityAnalysisHighlight["type"]): string => {
  switch (type) {
    case "positive": return "mdi-star";
    case "info": return "mdi-information-outline";
    default: return "mdi-check-circle-outline";
  }
};

const iconColor = (type: ActivityAnalysisHighlight["type"]): string => {
  switch (type) {
    case "positive": return "var(--primary)";
    case "info": return "var(--blue)";
    default: return "grey";
  }
};

const iconBg = (type: ActivityAnalysisHighlight["type"]): string => {
  switch (type) {
    case "positive": return "rgba(72, 242, 109, 0.10)";
    case "info": return "rgba(59, 130, 246, 0.10)";
    default: return "rgba(158, 158, 158, 0.10)";
  }
};
</script>

<style lang="sass" scoped>
.highlight-icon
  width: 36px
  height: 36px

.border-bottom-tertiary
  border-bottom: 1px solid rgba(255, 255, 255, 0.07)
</style>