<template>
  <div
    v-ripple
    class="bg-quintet border-sextet rounded-lg pa-3 d-flex align-center ga-4"
    :style="{ cursor: 'pointer' }"
    @click="navigateToActivity"
  >
    <div>
      <div
        class="d-flex align-center justify-center rounded-lg bg-theme-primary-15 flex-shrink-0"
        :style="{ width: '44px', height: '44px' }"
      >
        <v-icon :size="20" color="primary">
          {{ icon }}
        </v-icon>
      </div>
    </div>

    <div class="d-flex flex-column flex-fill min-width-0">
      <p class="text-body-2 font-weight-medium text-truncate d-flex align-center ga-1">
        {{ title }}

        <v-icon
          v-if="activity.is_shared"
          :size="14"
          :title="t('$vuetify.label.shared_activity')"
          color="grey-lighten-1"
        >mdi-account-multiple</v-icon>
      </p>

      <p class="text-caption text-medium-emphasis mt-1">
        {{ formattedDate }}
      </p>

      <div
        class="d-flex align-center flex-wrap mt-1"
        :style="{ columnGap: '12px', rowGap: '4px' }"
      >
        <span class="text-caption text-medium-emphasis">
          <v-icon :size="12" class="mr-1">
            mdi-clock-outline
          </v-icon>

          {{ formattedDuration }}
        </span>

        <template v-if="distance !== null">
          <span class="text-caption">•</span>

          <span class="text-caption text-medium-emphasis">
            <v-icon :size="12" class="mr-1">
              mdi-map-marker-distance
            </v-icon>

            {{ distance }}
          </span>
        </template>

        <template v-if="showCalories !== false">
          <span class="text-caption">•</span>

          <span class="text-caption text-medium-emphasis">
            <v-icon :size="12" class="mr-1">mdi-fire</v-icon>
            {{ `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { date, getPrimaryDurationSeconds } from "@/utils";
import { type Activity } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const { formatTime } = date();
const { formatNumber } = useFormatNumber();
const router = useRouter();
const props = defineProps<{ activity: Activity, showCalories?: boolean }>();

/// COMPUTED
const formattedDate = computed(() => dayjs(props.activity.started_at).format(t("$vuetify.label.full_date_format")));
const formattedDuration = computed(() => formatTime(getPrimaryDurationSeconds(props.activity)));
const icon = computed(() => {
  if (props.activity.type === "TRAINING") return "mdi-dumbbell";

  if (props.activity.type === "CHALLENGE") return "mdi-trophy-outline";

  switch (props.activity.category) {
    case "RUNNING": return "mdi-run";
    case "TRAIL_RUNNING": return "mdi-run-fast";
    case "WALKING": return "mdi-walk";
    case "CYCLING": return "mdi-bike";
    case "BELT": return "mdi-treadmill";
    default: return "mdi-lightning-bolt-outline";
  };
});
const title = computed(() => {
  if (props.activity.workout_title) return props.activity.workout_title;
  if (props.activity.title) return props.activity.title;
});
const distance = computed((): string | null => {
  const meters = props.activity.metrics?.distance_meters;
  if (!meters) return null;
  return `${formatNumber(meters / 1000)} ${t("$vuetify.label.km")}`;
});

/// METHODS
const navigateToActivity = () => {
  router.push({ name: "activity", params: { _id: props.activity._id } });
};
</script>

<style lang="sass" scoped>
.min-width-0
  min-width: 0
</style>