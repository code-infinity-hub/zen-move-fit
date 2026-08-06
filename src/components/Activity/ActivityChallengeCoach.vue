<template>
  <div
    v-if="bullets.length || streak >= 3"
    class="mx-4 mt-3 coach-card rounded-xl pa-4"
  >
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon
        color="primary"
        :size="18"
      >mdi-robot-outline</v-icon>

      <span class="text-subtitle-2 font-weight-bold text-primary">
        {{ t("$vuetify.challenge_analysis.coach_title") }}
      </span>

      <v-spacer />

      <v-chip
        v-if="streak >= 3"
        color="orange"
        variant="tonal"
        size="x-small"
        prepend-icon="mdi-fire"
        class="font-weight-bold"
      >{{ t("$vuetify.challenge_analysis.streak", streak) }}</v-chip>
    </div>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="bullet in bullets"
        :key="bullet.key"
        class="d-flex align-start ga-2"
      >
        <v-icon
          :size="14"
          color="primary"
          class="mt-1 flex-shrink-0"
        >mdi-circle-small</v-icon>

        <span class="text-body-2 text-medium-emphasis">
          {{ t(`$vuetify.challenge_analysis.${bullet.key}`, bullet.params) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ bullets: { key: string; params: (string | number)[] }[], streak: number }>();
</script>

<style lang="sass" scoped>
.coach-card
  background: rgba(72, 242, 109, 0.04)
  border: 1px solid rgba(72, 242, 109, 0.12)
</style>