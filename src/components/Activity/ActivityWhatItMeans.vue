<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.what_it_means_title") }}
    </p>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="item in items"
        :key="item.key"
        class="bg-quintet border-sextet pa-3 rounded-lg d-flex align-start ga-3"
      >
        <div class="wim-dot flex-shrink-0"></div>

        <p
          class="text-body-2"
          :style="{ lineHeight: '1.65', color: 'rgba(255, 255, 255, 0.82)' }"
        >
          {{
            item.value !== undefined ?
              t(`$vuetify.activity_analysis.${item.key}`, item.value) :
              t(`$vuetify.activity_analysis.${item.key}`)
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisWhatItMeansItem } from "@/types/activity.type";

/// DATA
defineProps<{ items: ActivityAnalysisWhatItMeansItem[] }>();
const { t } = useLocale();
</script>

<style lang="sass" scoped>
.wim-dot
  width: 6px
  height: 6px
  border-radius: 50%
  background: var(--primary)
  margin-top: 7px
  flex-shrink: 0
</style>