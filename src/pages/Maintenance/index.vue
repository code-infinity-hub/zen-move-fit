<template>
  <div class="w-100 h-100 d-flex flex-column justify-center align-center text-center px-3 bg-secondary">
    <div
      class="d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-4"
      :style="{ width: '5.5rem', height: '5.5rem' }"
    >
      <v-icon color="primary" :size="42">
        mdi-tools
      </v-icon>
    </div>

    <p
      class="mb-2 text-center text-h6 font-weight-bold font-space-grotesk"
    >{{ t("$vuetify.label.under_maintenance") }}</p>

    <p class="text-center text-body-2 text-grey-lighten-1 mb-5">
      {{ message }}
    </p>

    <v-btn
      color="primary"
      class="w-100 pa-7 d-flex text-h6 font-weight-bold text-none"
      :loading="checking"
      @click="retry"
    >{{ t("$vuetify.label.try_again") }}</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { eventBus } from "@/eventBus";
import { checkAvailability } from "@/plugins/Fetcher";
import { useAppStore } from "@/stores/app";

/// DATA
const { t } = useLocale();
const router = useRouter();
const appStore = useAppStore();

const checking = ref(false);

/// COMPUTED
const message = computed(() => appStore.maintenance_message || t("$vuetify.message.we_are_under_maintenance"));

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", finishApp);
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", finishApp);
});

/// METHODS
const finishApp = () => {
  eventBus.emit("FINISH_APP");
};

const retry = async () => {
  try {
    checking.value = true;

    const availability = await checkAvailability();

    if (availability.available) {
      appStore.maintenance_message = "";
      router.back();
    }
  } catch {
    ///
  } finally {
    checking.value = false;
  }
};
</script>