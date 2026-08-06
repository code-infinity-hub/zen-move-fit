<template>
  <v-bottom-sheet v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div>
            <v-icon color="blue" :size="50">
              mdi-shield-check
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.authenticated_account") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1">
          {{ t("$vuetify.message.authenticated_account") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="modelProxy = false"
        >{{ t("$vuetify.label.ok") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});
</script>