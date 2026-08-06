<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <header class="heading border-bottom-tertiary d-flex align-center">
      <v-btn
        icon=""
        size="x-small"
        color="tertiary"
        class="mr-4"
        @click="back"
      >
        <v-icon :size="18">
          mdi-arrow-left
        </v-icon>
      </v-btn>

      <p class="text-h6 font-space-grotesk font-weight-bold">
        {{ t("$vuetify.label.settings") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 pa-3">
      <div
        v-ripple
        v-for="option in options"
        :key="option.id"
        class="rounded-lg bg-tertiary d-flex align-center ga-3 pa-3"
        @click="emit('set-tab', option.id)"
      >
        <v-icon :size="20">
          {{ option.icon }}
        </v-icon>

        <span>
          {{ option.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["set-tab"]);

/// COMPUTED
const options = computed(() => [
  { id: 1, icon: "mdi-account", text: t("$vuetify.label.account") },
  { id: 2, icon: "mdi-dumbbell", text: t("$vuetify.label.plan") },
  { id: 3, icon: "mdi-lock", text: t("$vuetify.label.privacy") },
  { id: 4, icon: "mdi-bell", text: t("$vuetify.label.notifications") },
]);

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", back);
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const back = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>