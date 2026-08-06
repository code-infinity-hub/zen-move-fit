<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-account-multiple-outline
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.share_ride") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
          {{ t("$vuetify.message.share_ride_1") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2 font-weight-bold">
          {{ t("$vuetify.message.share_ride_2") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
          {{ t("$vuetify.message.share_ride_3") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
          {{ t("$vuetify.message.share_ride_4") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7"
          @click="modelProxy = false"
        >{{ t("$vuetify.label.ok") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

const props = defineProps<{ modelValue: boolean }>();

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});
</script>