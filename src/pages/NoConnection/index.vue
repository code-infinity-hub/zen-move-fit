<template>
  <div class="w-100 h-100 d-flex flex-column justify-center align-center text-center px-3 bg-secondary">
    <img
      src="@/assets/images/no-connection.gif"
      :style="{ width: '5.5rem' }"
      class="mb-4"
    />

    <p
      class="mb-2 text-center text-h6 font-weight-bold font-space-grotesk"
    >{{ t("$vuetify.label.no_internet_connection") }}</p>

    <p class="text-center text-body-2 text-grey-lighten-1 mb-5">
      {{ t("$vuetify.message.we_are_trying_to_reconnect_your_connection") }}
    </p>

    <v-btn
      color="primary"
      class="w-100 pa-7 d-flex text-h6 font-weight-bold"
      @click="openNetworkSettings"
    >{{ t("$vuetify.label.open_network_settings") }}</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import {
  App,
  NativeSettings, AndroidSettings, IOSSettings
} from "@/mobile";

/// DATA
const { t } = useLocale();

/// LIFE CYCLE
onMounted(() => {
  eventBus.on("BACK_BUTTON", minimizeApp);
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", minimizeApp);
});

/// METHODS
const minimizeApp = () => {
  App.minimizeApp();
};

const openNetworkSettings = () => {
  NativeSettings.open({
    optionAndroid: AndroidSettings.Wireless,
    optionIOS: IOSSettings.WiFi
  });
};
</script>