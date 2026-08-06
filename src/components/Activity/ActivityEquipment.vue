<template>
  <div class="px-4 py-4">
    <div class="d-flex align-center ga-4 mb-5">
      <v-icon
        color="primary"
        :size="20"
      >mdi-shoe-sneaker</v-icon>

      <span class="text-subtitle-1 font-weight-bold">
        {{ t("$vuetify.activity_analysis.equipment_title") }}
      </span>
    </div>

    <div class="d-flex align-center ga-3 mt-3">
      <div class="equipment-icon-circle d-flex align-center justify-center">
        <v-icon
          color="primary"
          :size="22"
        >mdi-shoe-sneaker</v-icon>
      </div>

      <div class="d-flex flex-column">
        <span class="text-body-1 font-weight-bold">
          {{ equipment.name }}
        </span>

        <span class="text-caption text-grey-lighten-1">
          {{ equipment.brand }}
        </span>

        <span class="text-caption text-primary">
          {{ t("$vuetify.activity_analysis.equipment_distance", formatNumber(equipment.distance_km)) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ equipment: { _id: string, name: string, brand: string, distance_km: number } }>();
</script>

<style lang="sass" scoped>
.equipment-icon-circle
  width: 44px
  height: 44px
  border-radius: 50%
  background: rgba(72, 242, 109, 0.12)
  flex-shrink: 0
</style>