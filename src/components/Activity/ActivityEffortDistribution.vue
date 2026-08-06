<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-1">
      {{ t("$vuetify.activity_analysis.effort_title") }}
    </p>

    <p class="text-caption text-grey-lighten-1 mb-4">
      {{ t(`$vuetify.activity_analysis.${effort.description_key}`) }}
    </p>

    <!-- Timeline -->
    <div class="d-flex align-start">
      <template v-for="(phase, i) in phases" :key="phase.labelKey">
        <!-- Phase node -->
        <div class="phase-node d-flex flex-column align-center">
          <div
            class="phase-dot d-flex align-center justify-center rounded-circle"
            :style="{
              background: `${phase.color}1A`,
              borderColor: phase.color,
            }"
          >
            <v-icon
              :size="18"
              :color="phase.color"
            >{{ phase.icon }}</v-icon>
          </div>

          <p
            class="text-center mt-2"
            :style="{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }"
          >{{ t(`$vuetify.activity_analysis.${phase.labelKey}`) }}</p>

          <p
            class="text-center font-weight-bold mt-1"
            :style="{ fontSize: '0.68rem', color: phase.color }"
          >{{ t(`$vuetify.activity_analysis.${phase.translationKey}`) }}</p>
        </div>

        <div
          v-if="i < phases.length - 1"
          class="phase-connector flex-fill"
          :style="{ marginTop: '20px' }"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisEffortDistribution } from "@/types/activity.type";

/// DATA
const props = defineProps<{ effort: ActivityAnalysisEffortDistribution }>();
const { t } = useLocale();
const PHASE_COLORS: Record<string, string> = {
  easy: "var(--primary)",
  moderate: "var(--blue)",
  hard: "var(--orange)",
  aggressive: "var(--red)",
  strong: "var(--primary)",
  consistent: "var(--blue)",
  fatigue: "var(--red)",
};
const PHASE_ICONS: Record<string, string> = {
  easy: "mdi-walk",
  moderate: "mdi-run",
  hard: "mdi-run-fast",
  aggressive: "mdi-lightning-bolt",
  strong: "mdi-fire",
  consistent: "mdi-check-circle-outline",
  fatigue: "mdi-trending-down",
};

/// COMPUTED
const phases = computed(() => [
  {
    labelKey: "effort_label_start",
    translationKey: `effort_start_${props.effort.start}`,
    color: PHASE_COLORS[props.effort.start],
    icon: PHASE_ICONS[props.effort.start],
  },
  {
    labelKey: "effort_label_middle",
    translationKey: `effort_middle_${props.effort.middle}`,
    color: PHASE_COLORS[props.effort.middle],
    icon: PHASE_ICONS[props.effort.middle],
  },
  {
    labelKey: "effort_label_finish",
    translationKey: `effort_finish_${props.effort.finish}`,
    color: PHASE_COLORS[props.effort.finish],
    icon: PHASE_ICONS[props.effort.finish],
  },
]);
</script>

<style lang="sass" scoped>
.phase-node
  width: 80px
  flex-shrink: 0

.phase-dot
  width: 44px
  height: 44px
  border: 2px solid
  margin: 0 auto
  transition: border-color 0.3s ease

.phase-connector
  height: 2px
  background: rgba(255, 255, 255, 0.1)
  border-radius: 1px
  align-self: flex-start
</style>