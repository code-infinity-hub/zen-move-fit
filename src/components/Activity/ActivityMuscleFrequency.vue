<template>
  <div class="mx-4 mt-5 frequency-card rounded-xl pa-4">
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon
        :size="18"
        color="white"
      >mdi-chart-bar</v-icon>

      <span class="text-subtitle-2 font-weight-bold">
        {{ t("$vuetify.training_analysis.frequency_title") }}
      </span>
    </div>

    <div class="d-flex flex-column ga-3">
      <div
        v-for="[muscle, count] in sorted"
        :key="muscle"
        class="d-flex align-center ga-3"
      >
        <span class="text-body-2 freq-label text-medium-emphasis">
          {{ t(`$vuetify.muscle_groups.${muscle}`, muscle) }}
        </span>

        <div class="freq-track rounded-pill flex-fill">
          <div
            class="freq-fill rounded-pill"
            :style="{ width: `${(count / maxCount) * 100}%` }"
          ></div>
        </div>

        <span class="text-caption font-weight-bold text-primary freq-count">
          {{ t("$vuetify.training_analysis.frequency_times", count) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ counts: Record<string, number>, periodDays: number }>();

/// COMPUTED
const sorted = computed(() =>
  Object.entries(props.counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
);
const maxCount = computed(() => Math.max(1, ...Object.values(props.counts)));
</script>

<style lang="sass" scoped>
.frequency-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)

.freq-label
  min-width: 80px
  font-size: 0.78rem

.freq-count
  min-width: 24px
  text-align: right

.freq-track
  height: 5px
  background: rgba(255, 255, 255, 0.08)
  overflow: hidden

.freq-fill
  height: 100%
  background: var(--primary)
  opacity: 0.7
  transition: width 0.4s ease
</style>