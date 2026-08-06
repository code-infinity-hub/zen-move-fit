<template>
  <div id="step-1">
    <div
      class="overlay position-absolute top-0 left-0 right-0 bottom-0"
    ></div>

    <div class="informations position-absolute top-0 left-0 right-0 bottom-0 d-flex flex-column">
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex justify-center align-center">
          <img src="@/assets/images/logo.png"  />

          <p class="text-h5 font-weight-bold font-space-grotesk ml-3">
            {{ t("$vuetify.company_name") }}
          </p>
        </div>
      </div>

      <div class="mt-10">
        <p class="text-h4 font-weight-bold">
          {{ slogan }}
        </p>

        <p
          class="mt-3 subheadline"
          :style="{ fontSize: '1.1rem' }"
        >{{ subslogan }}</p>
      </div>

      <div class="flex-fill d-flex flex-column justify-end">
        <div class="mb-3">
          <v-btn
            block
            variant="outlined"
            class="d-flex pa-7 text-none font-weight-bold"
            color="primary"
            @click="emit('set-tab', 1)"
          >
            <v-icon class="mr-2">mdi-login</v-icon>
            {{ t("$vuetify.label.log_in_to_account") }}
          </v-btn>
        </div>

        <div>
          <v-btn
            block
            class="d-flex pa-7 text-none font-weight-bold"
            color="primary"
            @click="emit('set-tab', 2)"
          >
            <v-icon class="mr-2">mdi-account-plus</v-icon>
            {{ t("$vuetify.label.create_account") }}
          </v-btn>
        </div>

        <div class="mt-5 mb-2 d-flex justify-center ga-2">
          <span class="font-weight-bold" @click="openTermsOfUse">
            {{ t("$vuetify.label.terms_of_use") }}
          </span>
          <span>•</span>
          <span class="font-weight-bold" @click="openPrivacyPolicies">
            {{ t("$vuetify.label.privacy_policies") }}
          </span>
        </div>

        <p class="mb-0 text-center mt-2 px-2 text-subtitle-2 text-grey-lighten-1">
          {{ t("$vuetify.message.agree_terms") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useWebView } from "@/composables";

/// Files
import ManRunning from "@/assets/images/man-running.jpeg";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["set-tab"]);
const WV = useWebView();

/// COMPUTED
const manRunning = computed(() => `url(${ManRunning})`);
const slogan = computed(() => localStorage.getItem("slogan") || t("$vuetify.message.slogan"));
const subslogan = computed(() => localStorage.getItem("subslogan") || t("$vuetify.message.subslogan"));

/// METHODS
const openTermsOfUse = () => {
  WV.open(`${import.meta.env.VITE_API_FRONTEND}terms-of-use`);
};

const openPrivacyPolicies = () => {
  WV.open(`${import.meta.env.VITE_API_FRONTEND}privacy-policies`);
};
</script>

<style lang="sass" scoped>
div#step-1
  width: 100%
  height: 100%
  background-image: v-bind(manRunning)
  background-position: center
  background-size: cover
  position: relative

  div.overlay
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65))

  div.informations
    padding: calc(var(--top-saved) + 0.5rem) 1rem calc(var(--bottom-saved) + 0.5rem) 1rem

    img
      width: 2.2rem
</style>