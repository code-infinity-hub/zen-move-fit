<template>
  <div class="mx-4 mt-5 balance-card rounded-xl pa-4">
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon
        :size="18"
        color="white"
      >mdi-scale-balance</v-icon>

      <span class="text-subtitle-2 font-weight-bold">
        {{ t("$vuetify.training_analysis.balance_title") }}
      </span>
    </div>

    <div
      v-if="!neglected.length"
      class="d-flex align-center ga-2"
    >
      <v-icon
        color="primary"
        :size="20"
      >mdi-check-circle-outline</v-icon>
      <span class="text-body-2 text-medium-emphasis">
        {{ t("$vuetify.training_analysis.balance_all_good") }}
      </span>
    </div>
    <div v-else class="d-flex flex-column ga-3">
      <div
        v-for="item in neglected"
        :key="item.group"
        class="d-flex align-center justify-space-between"
      >
        <span class="text-body-2">
          {{ t(`$vuetify.muscle_groups.${item.group}`, item.group) }}
        </span>

        <v-chip
          size="x-small"
          color="orange"
          variant="tonal"
          class="font-weight-medium"
        >{{ t("$vuetify.training_analysis.balance_neglected_label", item.days_since) }}</v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ neglected: { group: string, days_since: number }[] }>();
</script>

<style lang="sass" scoped>
.balance-card
  background: rgba(255, 255, 255, 0.03)
  border: 1px solid rgba(255, 255, 255, 0.07)
</style>