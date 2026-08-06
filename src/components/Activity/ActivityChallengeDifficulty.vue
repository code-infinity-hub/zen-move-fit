<template>
  <div
    v-if="total > 0"
    class="mx-4 mt-5 difficulty-card rounded-xl pa-4"
  >
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon
        :size="18"
        color="white"
      >mdi-dumbbell</v-icon>

      <span class="text-subtitle-2 font-weight-bold">
        {{ t("$vuetify.challenge_analysis.difficulty_title") }}
      </span>
    </div>

    <div class="mt-4 d-flex flex-column ga-3">
      <div
        v-for="bar in bars"
        :key="bar.key"
        class="d-flex align-center ga-3"
      >
        <span class="text-body-2 diff-label text-medium-emphasis">
          {{ bar.label }}
        </span>

        <div class="diff-track rounded-pill flex-fill">
          <div
            class="diff-fill rounded-pill"
            :style="{
              width: `${(bar.count / total) * 100}%`,
              background: `rgb(var(--v-theme-${bar.color}))`,
            }"
          ></div>
        </div>

        <span
          class="text-caption font-weight-bold diff-count"
          :style="{ color: `rgb(var(--v-theme-${bar.color}))` }"
        >{{ bar.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ breakdown: { easy: number, medium: number, hard: number } }>();

/// COMPUTED
const total = computed(() => props.breakdown.easy + props.breakdown.medium + props.breakdown.hard);
const bars = computed(() => [
  {
    key: "easy",
    label: t("$vuetify.challenge_analysis.difficulty_easy"),
    count: props.breakdown.easy,
    color: "primary",
  },
  {
    key: "medium",
    label: t("$vuetify.challenge_analysis.difficulty_medium"),
    count: props.breakdown.medium,
    color: "yellow",
  },
  {
    key: "hard",
    label: t("$vuetify.challenge_analysis.difficulty_hard"),
    count: props.breakdown.hard,
    color: "orange",
  },
].filter((b) => b.count > 0));
</script>

<style lang="sass" scoped>
.difficulty-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)

.diff-label
  min-width: 52px
  font-size: 0.78rem

.diff-count
  min-width: 16px
  text-align: right

.diff-track
  height: 5px
  background: rgba(255, 255, 255, 0.08)
  overflow: hidden

.diff-fill
  height: 100%
  opacity: 0.75
  transition: width 0.4s ease
</style>