<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-crosshairs-gps
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.allow_location") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1">
          {{
            t(`$vuetify.message.${!props.openSettings ? "allow_location" : "cant_access_location"}`)
          }}
        </p>

        <v-btn
          block
          color="primary"
          class="font-weight-bold text-none pa-7 mb-3"
          @click="allow"
        >
          {{
            t(`$vuetify.label.${!props.openSettings ? "allow_location" : "open_settings"}`)
          }}
        </v-btn>

        <v-btn
          block
          color="tertiary"
          class="font-weight-bold text-none pa-7"
          @click="notNow"
        >{{ t("$vuetify.label.not_now") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { GeolocationService } from "@/services/geolocation.service";

const props = defineProps<{
  modelValue: boolean,
  openSettings: boolean,
}>();

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue"]);
const geolocationService = new GeolocationService();

/// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// METHODS
const allow = async () => {
  if (props.openSettings) {
    await geolocationService.openSettings();
  } else {
    await geolocationService.requestPermission();
  }

  modelProxy.value = false;
};

const notNow = () => {
  modelProxy.value = false;
};
</script>