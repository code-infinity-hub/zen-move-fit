<template>
  <div class="w-100 h-100 px-3 d-flex flex-column justify-center align-center">
    <img
      src="@/assets/images/no-connection.gif"
      :style="{ width: '5.5rem' }"
      class="mb-4"
    />

    <p
      class="mb-2 text-center text-h6 font-weight-bold font-space-grotesk"
    >{{ t("$vuetify.label.no_internet_connection") }}</p>

    <p class="text-center text-body-2 text-grey-lighten-1 mb-2">
      {{ t("$vuetify.message.we_are_trying_to_reconnect_your_connection") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
</script>