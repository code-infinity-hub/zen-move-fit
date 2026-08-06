<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.label.exercises") }}
    </p>

    <div class="rounded-lg bg-quintet border-sextet overflow-hidden">
      <div
        v-for="(ex, index) in props.exercises"
        :key="ex.exercise_id + index"
        class="d-flex align-center px-3 py-3 border-bottom-tertiary exercise-row"
      >
        <div class="exercise-index d-flex justify-center align-center rounded-lg bg-tertiary mr-3">
          <span class="text-caption font-weight-bold text-primary">
            {{ index + 1 }}
          </span>
        </div>

        <div class="flex-fill">
          <p class="text-body-2 font-weight-bold mb-1">
            {{ ex.name }}
          </p>

          <p
            v-if="!hasVaryingLoads(ex)"
            class="text-caption text-grey-lighten-1"
          >{{ exerciseInfo(ex) }}</p>
          <div v-else class="d-flex flex-column ga-1">
            <div
              v-for="serie in ex.series"
              :key="serie.set"
              class="d-flex align-center ga-2"
            >
              <span class="text-caption font-weight-bold text-primary set-label">
                {{ t("$vuetify.label.set_label", serie.set) }}
              </span>

              <span class="text-caption text-grey-lighten-1">
                {{ repsStr(ex) }}

                <template v-if="serie.load != null">
                  {{ ` · ${serie.load} ${loadUnit(ex)}` }}
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { getAbbreviationTime } from "@/utils";
import { type ActivityDetail } from "@/types/activity.type";

type Ex = NonNullable<ActivityDetail["exercises"]>[number];

/// DATA
const { t } = useLocale();
const props = defineProps<{ exercises: ActivityDetail["exercises"] }>();

/// METHODS
const repsStr = (ex: Ex): string =>
  ex.reps.type === "fixed"
    ? String(ex.reps.max)
    : `${ex.reps.time}${getAbbreviationTime(ex.reps.time_type)}`;

const loadUnit = (_ex: Ex): string => "kg";

const hasVaryingLoads = (ex: Ex): boolean => {
  const loads = ex.series.map((s) => s.load).filter((l) => l != null);
  if (loads.length < 2) return false;
  return loads.some((l) => l !== loads[0]);
};

const uniformLoad = (ex: Ex): number | null => {
  const loads = ex.series.map((s) => s.load).filter((l) => l != null);
  if (!loads.length) return null;
  if (loads.every((l) => l === loads[0])) return loads[0] as number;
  return null;
};

const exerciseInfo = (ex: Ex): string => {
  const sets = ex.series.length;
  const reps = repsStr(ex);
  const load = uniformLoad(ex);
  return load != null ? `${sets} x ${reps} · ${load} kg` : `${sets} x ${reps}`;
};
</script>

<style lang="sass" scoped>
.exercise-row
  &:last-child
    border-bottom: none !important

.exercise-index
  width: 28px
  height: 28px
  flex-shrink: 0

.set-label
  min-width: 44px
</style>