<template>
  <v-bottom-sheet v-model="model">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-lightning-bolt
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.activity_analysis.acwr_info_title") }}
        </p>

        <p
          class="text-body-2 text-grey-lighten-1 mb-5 text-center"
          :style="{ lineHeight: 1.5 }"
        >{{ t("$vuetify.activity_analysis.acwr_info_intro") }}</p>

        <div
          v-for="zone in zones"
          :key="zone.key"
          class="d-flex flex-column align-start ga-3 bg-tertiary rounded-lg pa-3 mb-3"
        >
          <v-chip
            size="small"
            variant="tonal"
            class="font-weight-bold"
            :color="zone.color"
          >{{ zone.title }}</v-chip>

          <p
            class="text-body-2 text-grey-lighten-1 flex-fill"
            :style="{ lineHeight: 1.5 }"
          >{{ zone.desc }}</p>
        </div>

        <v-btn
          block
          color="primary"
          class="text-black font-weight-bold text-none mt-2 pa-7"
          @click="model = false"
        >{{ t("$vuetify.label.got_it") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const model = defineModel<boolean>({ default: false });

/// COMPUTED
const zones = computed(() => [
  {
    key: "low",
    color: "blue",
    title: t("$vuetify.activity_analysis.acwr_info_zone_low_title"),
    desc: t("$vuetify.activity_analysis.acwr_info_zone_low_desc"),
  },
  {
    key: "optimal",
    color: "primary",
    title: t("$vuetify.activity_analysis.acwr_info_zone_optimal_title"),
    desc: t("$vuetify.activity_analysis.acwr_info_zone_optimal_desc"),
  },
  {
    key: "caution",
    color: "orange",
    title: t("$vuetify.activity_analysis.acwr_info_zone_caution_title"),
    desc: t("$vuetify.activity_analysis.acwr_info_zone_caution_desc"),
  },
  {
    key: "danger",
    color: "red",
    title: t("$vuetify.activity_analysis.acwr_info_zone_danger_title"),
    desc: t("$vuetify.activity_analysis.acwr_info_zone_danger_desc"),
  },
]);
</script>