<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-content-save-outline
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.message.do_you_want_to_save_the_changes") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
          {{ t("$vuetify.message.changes_made_on_this_screen_have_not_yet_been_saved") }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="saveAndExit"
        >{{ t("$vuetify.label.save_and_exit") }}</v-btn>

        <v-btn
          block
          color="tertiary"
          class="font-weight-bold text-none pa-7"
          @click="saveWithoutExit"
        >{{ t("$vuetify.label.exit_without_saving") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "save-and-exit", "save-without-exit"]);

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const saveAndExit = () => {
  emit("save-and-exit");
  modelProxy.value = false;
};

const saveWithoutExit = () => {
  emit("save-without-exit");
  modelProxy.value = false;
};
</script>