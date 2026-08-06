<template>
  <div>
    <div class="d-flex align-center px-4 pb-2">
      <span class="text-caption text-grey-lighten-1 col-km">
        {{ t("$vuetify.label.km") }}
      </span>

      <span class="text-caption text-grey-lighten-1 col-pace">
        {{ t("$vuetify.label.rhythm") }}
      </span>

      <div class="flex-fill mx-2"></div>

      <span
        v-if="props.elevationPerSplit"
        class="text-caption text-grey-lighten-1 col-elev"
      >{{ t("$vuetify.label.elev") }}</span>
    </div>

    <div
      v-for="(split, i) in props.splits"
      :key="split.km"
      class="d-flex align-center px-4 py-2 border-top-tertiary"
    >
      <span class="text-body-2 font-weight-bold col-km">
        {{ split.km }}
      </span>

      <span class="text-body-2 font-weight-bold col-pace">
        {{ formatPace(split.duration_seconds) }}
      </span>

      <div class="flex-fill mx-2">
        <div class="split-bar-bg rounded-xl">
          <div
            class="split-bar-fill rounded-xl"
            :style="{ width: `${barWidth(split.duration_seconds)}%` }"
          ></div>
        </div>
      </div>

      <span
        v-if="props.elevationPerSplit"
        :class="[
          'text-body-2 col-elev',
          elevColor(props.elevationPerSplit[i]!)
        ]"
      >{{ elevLabel(props.elevationPerSplit[i]!) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { type Activity } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{
  splits: NonNullable<Activity["metrics"]>["splits"],
  elevationPerSplit?: number[] | null,
}>();

/// COMPUTED
const minPace = computed(() => Math.min(...props.splits.map((s) => s.duration_seconds)));
const maxPace = computed(() => Math.max(...props.splits.map((s) => s.duration_seconds)));

/// METHODS
const formatPace = (seconds: number) => RunningMetricsService.formatPace(seconds);
const elevLabel = (m: number) => (m > 0 ? `+${m}` : `${m}`);
const barWidth = (seconds: number) => {
  const range = maxPace.value - minPace.value || 1;
  return 30 + ((maxPace.value - seconds) / range) * 70;
};
const elevColor = (m: number) => {
  if (m > 0) return "text-primary";
  if (m < 0) return "text-red";
  return "text-grey-lighten-1";
};
</script>

<style lang="sass" scoped>
.col-km
  min-width: 2rem

.col-pace
  min-width: 3.5rem
  margin-left: 0.5rem

.col-elev
  min-width: 3rem
  text-align: right

.split-bar-bg
  height: 8px
  background: var(--tertiary)

.split-bar-fill
  height: 8px
  background: var(--blue)
  transition: width 0.3s ease
</style>