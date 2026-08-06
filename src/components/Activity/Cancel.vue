<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-close
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.cancel_activity") }}
        </p>

        <p class="text-center mb-5 grey-lighten-1">
          {{ t("$vuetify.message.cancel_activity") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="notNow"
        >{{ t("$vuetify.label.not_now") }}</v-btn>

        <v-btn
          block
          color="tertiary"
          class="font-weight-bold text-none pa-7"
          @click="cancel"
        >{{ t("$vuetify.label.cancel") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

const props = defineProps<{ modelValue: boolean }>();

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "cancel"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const cancel = () => {
  emit("cancel");
};

const notNow = () => {
  modelProxy.value = false;
};
</script>