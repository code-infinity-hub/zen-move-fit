<template>
  <v-bottom-sheet
    v-model="model"
    :persistent="running"
  >
    <v-card>
      <v-card-text class="py-5 d-flex flex-column align-center text-center ga-2">
        <template v-if="!finished">
          <div
            class="d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-2"
            :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
          >🧘</div>

          <p class="text-h6 font-space-grotesk font-weight-bold">
            {{ t("$vuetify.label.rescue_activity") }}
          </p>

          <p class="text-body-2 text-grey-lighten-1">
            {{ t("$vuetify.message.rescue_activity_hint") }}
          </p>

          <p class="text-h3 font-space-grotesk font-weight-bold mt-4">
            {{ formattedTime }}
          </p>

          <p v-if="running" class="text-body-2 text-primary mt-2">
            {{ t(`$vuetify.rescue_steps.step_${currentStep}`) }}
          </p>

          <v-btn
            v-if="!running"
            block
            color="primary"
            class="text-none font-weight-bold mt-4 pa-7 d-flex text-black"
            @click="start"
          >{{ t("$vuetify.label.start_rescue") }}</v-btn>
          <v-btn
            v-else
            block
            variant="tonal"
            color="red"
            class="text-none font-weight-bold mt-4 pa-6"
            @click="cancel"
          >{{ t("$vuetify.label.cancel") }}</v-btn>
        </template>
        <template v-else>
          <div
            class="d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-2"
            :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
          >🔥</div>

          <p class="text-h6 font-space-grotesk font-weight-bold">
            {{ t("$vuetify.message.streak_saved") }}
          </p>

          <v-btn
            block
            color="primary"
            class="text-none font-weight-bold mt-4 pa-7 d-flex text-black"
            @click="close"
          >{{ t("$vuetify.label.got_it") }}</v-btn>
        </template>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useCelebration } from "@/composables/use-celebration";
import { eventBus } from "@/eventBus";

const RESCUE_SECONDS = 300;
const STEPS = 5;

/// DATA
const { t } = useLocale();
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();
const { celebrate } = useCelebration();

const model = ref(false);
const running = ref(false);
const finished = ref(false);
const remaining = ref(RESCUE_SECONDS);

let interval: ReturnType<typeof setInterval> | null = null;

/// COMPUTED
const formattedTime = computed(() => {
  const minutes = Math.floor(remaining.value / 60);
  const seconds = remaining.value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
});
const currentStep = computed(() => Math.min(STEPS, Math.floor(((RESCUE_SECONDS - remaining.value) / RESCUE_SECONDS) * STEPS) + 1));

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("OPEN_RESCUE_ACTIVITY", openSheet);
});

onBeforeUnmount(() => {
  eventBus.off("OPEN_RESCUE_ACTIVITY", openSheet);
  stopTimer();
});

/// METHODS
const openSheet = () => {
  finished.value = false;
  running.value = false;
  remaining.value = RESCUE_SECONDS;
  model.value = true;
};

const start = () => {
  running.value = true;

  interval = setInterval(() => {
    remaining.value--;

    if (remaining.value <= 0) {
      stopTimer();
      complete();
    }
  }, 1000);
};

const stopTimer = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  running.value = false;
};

const cancel = () => {
  stopTimer();
  model.value = false;
};

const complete = async () => {
  const response = await activitiesStore.POST("rescue", {
    timezone: accountsStore.account.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    duration_seconds: RESCUE_SECONDS,
  });

  if (response.error) {
    model.value = false;
    return;
  }

  finished.value = true;
  celebrate("epic");

  accountsStore.GET_ACCOUNT();
};

const close = () => {
  model.value = false;
  eventBus.emit("CHECK_ACHIEVEMENTS");
  eventBus.emit("CHECK_CHESTS");
};
</script>