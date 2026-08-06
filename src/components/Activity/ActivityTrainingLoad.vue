<template>
  <div class="px-4 py-4">
    <div class="d-flex align-center ga-1">
      <span class="text-subtitle-1 font-weight-bold">
        {{ t("$vuetify.activity_analysis.training_load_title") }}
      </span>

      <v-icon
        :size="18"
        class="ml-1"
        color="grey-lighten-1"
        @click="showInfo = true"
      >mdi-information-outline</v-icon>
    </div>

    <ActivityTrainingLoadInfoSheet
      v-model="showInfo"
    />

    <div class="d-flex align-center ga-3 mt-3">
      <div class="d-flex flex-column align-center">
        <span
          class="text-h3 font-weight-black"
          :style="{ color: zoneColor }"
        >{{ formatNumber(load.acwr) }}</span>

        <span
          class="text-caption"
          :style="{ color: zoneColor }"
        >{{ t(`$vuetify.activity_analysis.${load.label_key}`) }}</span>
      </div>

      <div class="flex-fill d-flex flex-column ga-2">
        <div class="d-flex justify-space-between align-center">
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.activity_analysis.load_acute") }}
          </span>

          <span class="text-caption font-weight-bold">
            {{ formatDuration(load.acute_load) }}
          </span>
        </div>

        <div class="d-flex justify-space-between align-center">
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.activity_analysis.load_chronic") }}
          </span>

          <span class="text-caption font-weight-bold">
            {{ formatDuration(load.chronic_load) }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="text-body-2 text-grey-lighten-1 mt-3"
      :style="{ lineHeight: '1.5' }"
    >{{ t(`$vuetify.activity_analysis.load_desc_${load.zone}`) }}</div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisTrainingLoad } from "@/types/activity.type";
import { useFormatNumber } from "@/composables";

/// COMPONENTS
import ActivityTrainingLoadInfoSheet from "./ActivityTrainingLoadInfoSheet.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ load: ActivityAnalysisTrainingLoad }>();
const showInfo = ref(false);

/// COMPUTED
const zoneColor = computed(() => {
  if (props.load.zone === "low") return "var(--blue)";
  if (props.load.zone === "optimal") return "var(--primary)";
  if (props.load.zone === "caution") return "var(--orange)";
  return "var(--red)";
});

/// METHODS
const formatDuration = (val: number): string => `${Math.round(val / 60)}min`;
</script>