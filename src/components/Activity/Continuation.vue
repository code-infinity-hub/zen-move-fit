<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
            <v-icon color="primary" :size="30">
              mdi-backup-restore
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ title }}
        </p>

        <p class="text-center mb-3 text-grey-lighten-1">
          {{ message }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1">
          {{ `${t("$vuetify.label.choose_how_you_want_to_continue")}:` }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-black text-none pa-7 mb-3"
          @click="handleContinue"
        >{{ continueActivity }}</v-btn>

        <v-btn
          v-if="props.allowRestart"
          block
          varsiant="tonal"
          color="tertiary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="handleRestart"
        >{{ restartActivity }}</v-btn>

        <v-btn
          block
          variant="text"
          color="error"
          class="font-weight-bold text-none pa-7"
          @click="handleDiscardActivity"
        >{{ discardActivity }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { type Activity } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ modelValue: boolean, type: Activity["type"], allowRestart?: boolean }>();
const emit = defineEmits(["update:modelValue", "continue", "discard", "restart"]);

/// COMPUTED
const title = computed(() => {
  if (props.type === "TRAINING") {
    return t("$vuetify.label.recovered_training");
  }

  if (props.type === "AVULSE") {
    return t("$vuetify.label.recovered_activity");
  }

  return t("$vuetify.label.recovered_challenge");
});

const message = computed(() => {
  if (props.type === "TRAINING") {
    return t("$vuetify.message.your_workout_was_unexpectedly_interrupted_but_we_saved_your_progress");
  }

  if (props.type === "AVULSE") {
    return t("$vuetify.message.your_activity_was_unexpectedly_interrupted_but_we_saved_your_progress");
  }

  return t("$vuetify.message.your_challenge_was_unexpectedly_interrupted_but_we_saved_your_progress");
});

const continueActivity = computed(() => {
  if (props.type === "TRAINING") {
    return t("$vuetify.label.continue_training");
  }

  if (props.type === "AVULSE") {
    return t("$vuetify.label.continue_activity");
  }

  return t("$vuetify.label.continue_challenge");
});

const restartActivity = computed(() => {
  if (props.type === "TRAINING") {
    return t("$vuetify.label.restart_training");
  }

  return t("$vuetify.label.restart_challenge");
});

const discardActivity = computed(() => {
  if (props.type === "TRAINING") {
    return t("$vuetify.label.discard_training");
  }

  if (props.type === "AVULSE") {
    return t("$vuetify.label.discard_activity");
  }

  return t("$vuetify.label.discard_challenge");
});

const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const close = () => {
  modelProxy.value = false;
};

const handleContinue = () => {
  emit("continue");
  close();
};

const handleRestart = () => {
  emit("restart");
  close();
};

const handleDiscardActivity = () => {
  emit("discard");
  close();
};
</script>