<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-bell
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.enable_notifications") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1">
          {{ t("$vuetify.message.enable_notifications") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7"
          @click="allow"
        >{{ t("$vuetify.label.continue") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { OneSignal, SystemBars, SystemBarType } from "@/mobile";

const props = defineProps<{ modelValue: boolean }>();

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "request"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const allow = async () => {
  await SystemBars.show({
    bar: SystemBarType.StatusBar,
    animation: "NONE"
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const accepted = await OneSignal.default.Notifications.requestPermission(true);

  if (accepted) emit("request");

  modelProxy.value = false;
};
</script>