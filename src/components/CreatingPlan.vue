<template>
  <div class="pa-5 w-100 h-100 d-flex flex-column justify-center align-center">
    <img
      src="@/assets/images/load-plan.gif"
      :style="{ width: '4.5rem' }"
      class="mb-4"
    />

    <p
      class="mb-2 text-center text-h6 font-weight-bold font-space-grotesk"
    >{{ `${t("$vuetify.message.were_building_your_plan")}${dotsLoader}` }}</p>

    <p class="text-center text-body-2 text-grey-lighten-1 mb-2">
      {{ t("$vuetify.message.as_soon_as_were_finished_well_send_you_an_email_and_or_notification") }}
    </p>

    <p class="d-flex ga-2 justify-center align-center flex-wrap text-center text-caption text-grey-lighten-1">
      <v-icon :size="15">
        mdi-clock-outline
      </v-icon>

      <span>
        {{ t("$vuetify.message.it_usually_takes_a_maximum_of_20_minutes") }}
      </span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";

/// DATA
const { t } = useLocale();
const intervalLoader = ref(0);
const dotsLoader = ref("");
const accountsStore = useAccountsStore();
const intervalCheck = ref<null | number>(null);

/// LIFE CYCLES
onMounted(() => {
  startLoader();

  intervalCheck.value = setInterval(() =>
    accountsStore.GET_ACCOUNT(),
  10_000);
});

onBeforeUnmount(() => {
  clearInterval(intervalLoader.value);
  dotsLoader.value = "";

  if (intervalCheck.value !== null) {
    clearInterval(intervalCheck.value)
  }
});

/// METHODS
const startLoader = () => {
   intervalLoader.value = setInterval(() => {
    if (dotsLoader.value.length < 3) dotsLoader.value += ".";
    else dotsLoader.value = "";
  }, 1000);
};
</script>