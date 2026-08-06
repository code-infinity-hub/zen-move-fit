<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column">
    <header class="heading border-bottom-tertiary">
      <p
        class="text-h6 font-space-grotesk font-weight-bold"
      >{{ t("$vuetify.menu.progress") }}</p>

      <p
        class="text-body-2 text-grey-lighten-1"
      >{{ t("$vuetify.message.evolution_nutrition_and_statistics") }}</p>
    </header>

    <div class="flex-fill d-flex flex-column overflow-y-auto px-3 pt-3">
      <div class="pa-1 mb-5 rounded-lg d-flex ga-2 bg-tertiary">
        <v-btn
          v-for="(option, i) in options"
          :key="i"
          :class="[
            'text-none flex-fill rounded-lg text-caption',
            tab === i ? 'font-weight-bold' : ''
          ]"
          :style="{ minWidth: `calc((100% / ${options.length}) - 6px)` }"
          :color="tab === i ? 'primary' : 'tertiary'"
          @click="tab = i"
        >
          <div class="d-flex ga-2">
            <v-icon>
              {{ option.icon }}
            </v-icon>

            <span>
              {{ option.text }}
            </span>
          </div>
        </v-btn>
      </div>

      <div class="flex-fill">
        <v-tabs-window
          v-model="tab"
          class="h-100"
        >
          <v-tabs-window-item class="h-100">
            <Metrics />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <Nutrition />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <Prs />
          </v-tabs-window-item>

          <v-tabs-window-item></v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";

import TABS from "@/json/tabs-progress.json";

/// COMPONENTS
import Nutrition from "./Nutrition.vue";
import Metrics from "./Metrics.vue";
import Prs from "./Prs.vue";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();

const tab = ref(TABS.findIndex((item) => item === route.query.list));

/// COMPUTED
const options = computed(() => [
  {
    icon: "mdi-file-chart-outline",
    text: t("$vuetify.label.metrics"),
  },
  {
    icon: "mdi-food-apple-outline",
    text: t("$vuetify.label.nutrition"),
  },
  {
    icon: "mdi-trophy-outline",
    text: t("$vuetify.label.prs"),
  },
]);

/// WATCH
watch(tab, (val) => {
  const list = TABS.find((_, i) => i === val)!;

  router.replace({
    replace: true,
    query: { ...route.query, list }
  });
});

watch(() => route.query.list, (val) => {
  const index = TABS.findIndex((item) => item === val);
  tab.value = index >= 0 ? index : 0;
});
</script>