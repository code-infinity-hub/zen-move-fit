<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.recovery_title") }}
    </p>

    <div
      class="recovery-card pa-4 rounded-xl d-flex align-center ga-4"
      :style="borderStyle"
    >
      <div class="recovery-left text-center">
        <div
          class="text-h3 font-weight-black"
          :style="{ color: zoneColor }"
        >{{ recovery.hours }}</div>

        <div class="text-caption mt-1" :style="{ color: zoneColor }">
          {{ t(`$vuetify.activity_analysis.${recovery.label_key}`) }}
        </div>

        <div class="text-caption text-grey-lighten-1 mt-1">
          {{ t("$vuetify.activity_analysis.recovery_hours", recovery.hours) }}
        </div>
      </div>

      <v-divider vertical />

      <div class="recovery-right flex-grow-1">
        <p class="text-body-2 text-grey-lighten-2">
          {{ t(`$vuetify.activity_analysis.${recovery.description_key}`) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisRecovery } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ recovery: ActivityAnalysisRecovery }>();

/// COMPUTED
const zoneColor = computed(() => {
  switch (props.recovery.label_key) {
    case "recovery_easy": return getColor("--primary");
    case "recovery_moderate": return getColor("--blue");
    case "recovery_hard": return getColor("--orange");
    case "recovery_extreme": return getColor("--red");
    default: return getColor("--primary");
  }
});

const borderStyle = computed(() => ({ borderColor: `${zoneColor.value}40` }));

/// METHODS
const getColor = (color: string) => getComputedStyle(document.documentElement).getPropertyValue(color);
</script>

<style lang="sass" scoped>
.recovery-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)

.recovery-left
  min-width: 80px
</style>