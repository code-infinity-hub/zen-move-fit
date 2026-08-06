<template>
  <v-bottom-sheet v-model="model">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-shoe-sneaker
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.equipment_near_limit_title") }}
        </p>

        <div class="d-flex flex-column ga-3 mb-5">
          <div
            v-for="equipment in equipments"
            :key="equipment._id"
            class="bg-tertiary rounded-lg pa-3"
          >
            <p class="font-weight-bold mb-1">{{ equipment.nickname }}</p>

            <p class="text-body-2 text-grey-lighten-1 mb-3">
              {{ t("$vuetify.message.equipment_near_limit_description", formatNumber(equipment.used), formatNumber(equipment.mileage || 0)) }}
            </p>

            <v-checkbox
              hide-details
              density="compact"
              color="primary"
              v-model="dismissed[equipment._id]"
              :label="t('$vuetify.label.dont_show_again')"
            />
          </div>
        </div>

        <v-btn
          block
          color="primary"
          class="text-black font-weight-bold text-none mt-2 pa-7"
          @click="close"
        >{{ t("$vuetify.label.got_it") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useEquipmentsStore } from "@/stores/equipments";
import { useFormatNumber } from "@/composables";
import { type Equipment } from "@/types/equipment.type";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const equipmentsStore = useEquipmentsStore();
const model = defineModel<boolean>({ default: false });
const props = defineProps<{ equipments: Equipment[] }>();

const dismissed = ref<Record<string, boolean>>({});

/// METHODS
const close = async () => {
  const toDismiss = props.equipments.filter((equipment) => dismissed.value[equipment._id]);

  await Promise.all(
    toDismiss.map((equipment) => equipmentsStore.PATCH(equipment._id, { alert_dismissed: true }))
  );

  model.value = false;
};
</script>