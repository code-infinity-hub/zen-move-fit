<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.evolution_title") }}
    </p>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="item in props.evolution"
        :key="item.key"
        class="bg-quintet border-sextet d-flex align-center ga-3 pa-3 rounded-lg"
      >
        <v-icon
          :size="20"
          :color="trendColor(item.trend)"
        >{{ trendIcon(item.trend) }}</v-icon>

        <div class="flex-fill">
          <p class="text-body-2">
            {{
              item.streak && item.key === 'evo_pace_improving' ?
                t(`$vuetify.activity_analysis.${item.key}`, item.streak) :
                t(`$vuetify.activity_analysis.${item.key}`)
            }}
          </p>
        </div>
        <div
          class="trend-badge"
          :style="{ background: trendBg(item.trend) }"
        >
          <v-icon
            :size="12"
            :color="trendColor(item.trend)"
          >{{ trendIcon(item.trend) }}</v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisEvolutionItem } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ evolution: ActivityAnalysisEvolutionItem[] }>();

/// METHODS
const trendIcon = (trend: string) => {
  if (trend === "up") return "mdi-trending-up";
  if (trend === "down") return "mdi-trending-down";
  return "mdi-minus";
};

const trendColor = (trend: string) => {
  if (trend === "up") return "primary";
  if (trend === "down") return "red";
  return "grey-lighten-1";
};

const trendBg = (trend: string) => {
  if (trend === "up") return "rgba(72, 242, 109, 0.1)";
  if (trend === "down") return "rgba(244, 67, 54, 0.1)";
  return "rgba(255, 255, 255, 0.06)";
};
</script>

<style lang="sass" scoped>
.trend-badge
  width: 24px
  height: 24px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0
</style>