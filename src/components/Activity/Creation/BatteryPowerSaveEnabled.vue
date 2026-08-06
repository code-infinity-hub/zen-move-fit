<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-battery-sync-outline
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.active_power_saving_mode") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
          {{ t("$vuetify.message.active_power_saving_mode") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="openSettingsPowerSave"
        >{{ t("$vuetify.label.turn_off_economy") }}</v-btn>

        <v-btn
          block
          color="tertiary"
          class="font-weight-bold text-none pa-7"
          @click="continueAnyway"
        >{{ t("$vuetify.label.continue_anyway") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { NativeSettings, AndroidSettings, IOSSettings } from "@/mobile";

const props = defineProps<{ modelValue: boolean }>();

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "forced"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const openSettingsPowerSave = () => {
  NativeSettings.open({
    optionAndroid: AndroidSettings.Settings,
    optionIOS: IOSSettings.General
  });
  modelProxy.value = false;
};

const continueAnyway = () => {
  emit("forced");
  modelProxy.value = false;
};
</script>