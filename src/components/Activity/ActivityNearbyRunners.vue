<template>
  <div class="px-4 py-4">
    <div class="text-subtitle-1 font-weight-bold">
      {{ t("$vuetify.activity_analysis.nearby_title") }}
    </div>

    <div class="text-caption text-grey-lighten-1 mb-3">
      {{ t("$vuetify.activity_analysis.nearby_subtitle") }}
    </div>

    <div
      v-if="runners.length === 0"
      class="text-caption text-grey text-center"
    >{{ t("$vuetify.activity_analysis.nearby_no_data") }}</div>
    <template v-else>
      <div
        v-for="(runner, index) in runners"
        :key="runner.account_id"
        :class="[
          'd-flex align-center ga-3 py-3',
          index < runners.length - 1 ? 'border-bottom-tertiary' : ''
        ]"
      >
        <div>
          <ProfileImage
            size="36px"
            :image="runner.account_image"
            :name="runner.account_name || runner.account_username || ''"
          />
        </div>

        <div class="d-flex flex-column flex-fill">
          <span class="text-body-2 font-weight-bold">
            {{ runner.account_name || runner.account_username || "" }}
          </span>

          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.activity_analysis.nearby_distance", formatNumber(runner.distance_meters)) }}
          </span>
        </div>

        <span class="text-caption text-grey-lighten-1 flex-shrink-0">
          {{ dayjs(runner.crossed_at).format("HH:mm") }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import ProfileImage from "../ProfileImage.vue";

interface NearbyRunner {
  account_id: string,
  activity_id: string,
  distance_meters: number,
  crossed_at: string,
  account_name?: string,
  account_username?: string,
  account_image?: string,
};

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ runners: NearbyRunner[] }>();
</script>