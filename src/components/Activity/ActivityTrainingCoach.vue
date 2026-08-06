<template>
  <div
    v-if="bullets.length || weeklyCount > 0"
    class="mx-4 mt-3 coach-card rounded-xl pa-4"
  >
    <div class="d-flex align-center ga-3 mb-3">
      <v-icon color="primary" :size="18">mdi-robot-outline</v-icon>
      <span class="text-subtitle-2 font-weight-bold text-primary">
        {{ t("$vuetify.training_analysis.coach_title") }}
      </span>
    </div>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="bullet in bullets"
        :key="bullet.key"
        class="d-flex align-start ga-2"
      >
        <v-icon
          color="primary"
          class="mt-1 flex-shrink-0"
          :size="14"
        >mdi-circle-small</v-icon>

        <span class="text-body-2 text-medium-emphasis">
          {{
            t(
              `$vuetify.training_analysis.${bullet.key}`,
              ...bullet.params.map((p) => typeof p === "string" ? t(`$vuetify.muscle_groups.${p}`, p).toLowerCase() : p)
            )
          }}
        </span>
      </div>
    </div>

    <div
      v-if="weeklyCount > 0 || streak > 0"
      class="d-flex ga-4 mt-3 pt-3 consistency-row"
    >
      <div v-if="streak > 1" class="d-flex align-center ga-2">
        <v-icon color="orange" :size="16">mdi-fire</v-icon>
        <span class="text-caption font-weight-bold">
          {{ t("$vuetify.training_analysis.consistency_streak", streak) }}
        </span>
      </div>
      <div v-if="weeklyCount > 0" class="d-flex align-center ga-2">
        <v-icon color="primary" :size="16">mdi-calendar-week</v-icon>
        <span class="text-caption text-medium-emphasis">
          {{ t("$vuetify.training_analysis.consistency_week", weeklyCount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type TrainingAnalysisCoachBullet } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ bullets: TrainingAnalysisCoachBullet[], weeklyCount: number, streak: number }>();
</script>

<style lang="sass" scoped>
.coach-card
  background: rgba(72, 242, 109, 0.04)
  border: 1px solid rgba(72, 242, 109, 0.12)

.consistency-row
  border-top: 1px solid rgba(255, 255, 255, 0.06)
</style>