<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.predictions_title") }}
    </p>

    <div class="predictions-scroll">
      <div
        v-for="item in predictions.items"
        :key="item.label_key"
        :style="{ minWidth: '7rem' }"
        class="bg-quintet border-sextet rounded-lg pa-3 text-center flex-fill"
      >
        <div class="text-caption text-grey-lighten-1">
          {{ t(`$vuetify.activity_analysis.${item.label_key}`) }}
        </div>

        <div class="text-h6 font-weight-black text-primary mt-1">
          {{ formatSeconds(item.estimated_seconds) }}
        </div>

        <div class="text-caption text-grey mt-1">
          {{ `${formatNumber(item.distance_km)} ${t("$vuetify.label.km")}` }}
        </div>
      </div>
    </div>

    <p class="text-caption text-grey mt-3">
      {{ t("$vuetify.activity_analysis.predictions_note") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { type ActivityAnalysisPredictions } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ predictions: ActivityAnalysisPredictions }>();

/// METHODS
const formatSeconds = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}h${String(m).padStart(2, "0")}m`
    : `${m}:${String(sec).padStart(2, "0")}`;
};
</script>

<style lang="sass" scoped>
.predictions-scroll
  display: flex
  flex-direction: row
  gap: 10px
  overflow-x: auto
  padding-bottom: 8px

  &::-webkit-scrollbar
    height: 3px

  &::-webkit-scrollbar-track
    background: transparent

  &::-webkit-scrollbar-thumb
    background: rgba(255, 255, 255, 0.15)
    border-radius: 2px
</style>