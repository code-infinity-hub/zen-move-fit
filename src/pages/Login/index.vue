<template>
  <div id="main-page" class="bg-secondary">
    <v-tabs-window v-model="tab">
      <!-- TELA INICIAL -->
      <v-tabs-window-item>
        <Step1 @set-tab="setTab" />
      </v-tabs-window-item>

      <!-- LOGIN DO USUÁRIO -->
      <v-tabs-window-item>
        <Step2
          v-if="tab === 1"
          @set-tab="setTab"
        />
      </v-tabs-window-item>

      <!-- CRIAR CONTA -->
      <v-tabs-window-item>
        <Step3
          v-if="tab === 2"
          @set-tab="setTab"
        />
      </v-tabs-window-item>

      <v-tabs-window-item></v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts" setup>
import { App } from "@/mobile";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from "@/eventBus";

/// COMPONENTS
import Step1 from "./Step1.vue";
import Step2 from "./Step2.vue";
import Step3 from "./Step3.vue";

/// DATA
const route = useRoute();
const router = useRouter();
const tab = ref(0);

/// COMPUTED
const mode = computed(() => route.query.mode);

/// WATCH
watch(tab, (val) => {
  const mode = val === 0 ?
    undefined :
    val === 1 ? "login" : "register";

  setTimeout(() => {
    router.replace({
      replace: true,
      query: { ...route.query, mode }
    });
  }, 300);
});

watch(mode, (val) => {
  if (val === "login") {
    tab.value = 1;
  } else if (val === "register") {
    tab.value = 2;
  }
}, { immediate: true });

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", backButton);
});

onUnmounted(() => {
  eventBus.off("BACK_BUTTON", backButton);
});

/// METHODS
const backButton = () => {
  if (tab.value === 0) {
    closeApp();
  } else {
    const step = Number(route.query.step);

    if (tab.value === 1) {
      // Login
      if (step === 3 || step === 4) {
        closeApp();
      } else if (step === 1) {
        tab.value = 0;
      } else {
        router.replace({
          replace: true,
          query: { ...route.query, step: step - 1 }
        });
      }
    } else {
      // Cadastro
      if (step === 1) {
        tab.value = 0;
      } else {
        router.replace({
          replace: true,
          query: { ...route.query, step: step - 1 }
        });
      }
    }
  }
};

const closeApp = () => {
  App.exitApp();
};

const setTab = (val: number) => {
  tab.value = val;
};
</script>

<style lang="sass">
div#main-page
  width: 100%
  height: 100%
  overflow: hidden

  div.icon
    border-radius: 10px
    width: 2.2rem
    height: 2.2rem
    background-image: url("@/assets/images/icon-black.png")
    background-position: center
    background-size: 70%

  .v-window, .v-window-item
    width: 100%
    height: 100%

  div#step-2, div#step-3
    display: flex
    flex-direction: column
</style>