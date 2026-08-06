<template>
  <div class="w-100 h-100 d-flex flex-column">
    <div class="mb-6 w-100 d-flex ga-2 flex-wrap">
      <v-btn
        v-for="(button, i) in buttons.filter((b) => b.enabled)"
        :key="i"
        :class="[
          'rounded-pill text-none text-caption px-3 d-flex',
          tab === i ? 'text-black' : ''
        ]"
        :style="{ height: '30px' }"
        :color="tab === i ? 'primary' : 'tertiary'"
        @click="tab = i"
      >
        <v-icon class="mr-2">
          {{ button.icon }}
        </v-icon>

        {{ button.text }}

        <div class="ml-1">
          {{ button.value }}
        </div>
      </v-btn>
    </div>

    <div class="flex-fill">
      <v-tabs-window v-model="tab" class="h-100">
        <v-tabs-window-item class="h-100">
          <Friends />
        </v-tabs-window-item>

        <v-tabs-window-item class="h-100">
          <Chats />
        </v-tabs-window-item>

        <v-tabs-window-item class="h-100">
          <Requests v-if="Boolean(socialStore.requests.total)" />
        </v-tabs-window-item>

        <v-tabs-window-item></v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useFormatNumber } from "@/composables";
import { useSocialStore } from "@/stores/social.ts";

/// COMPONENTS
import Friends from "./Friends.vue";
import Chats from "./Chats.vue";
import Requests from "./Requests.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const tab = ref(0);
const route = useRoute();
const router = useRouter();
const socialStore = useSocialStore();

const options = ["friends", "chats", "requests"];

/// COMPUTED
const buttons = computed(() => [
  {
    enabled: true,
    icon: "mdi-account-plus-outline",
    text: `${t("$vuetify.label.friends")}:`,
    value: formatNumber(socialStore.friends.total),
  },
  {
    enabled: true,
    icon: "mdi-chat-outline",
    text: `${t("$vuetify.label.chats")}:`,
    value: formatNumber(socialStore.chats.total),
  },
  {
    enabled: Boolean(socialStore.requests.total),
    icon: "mdi-account-alert-outline",
    text: `${t("$vuetify.label.friend_requests")}:`,
    value: formatNumber(socialStore.requests.total),
  }
] as const);

/// WATCH
watch(tab, (val, oldVal) => {
  let option = route.query.option as string;

  if (!options.includes(option)) {
    option = options[0]!;
  }

  val = oldVal === undefined ?
    options.findIndex((item) => item === option) :
    val;

  option = options[val]!;

  tab.value = options.findIndex((item) => item === option);

  router.replace({
    replace: true,
    query: {
      ...route.query,
      list: "connections",
      option
    }
  });

  if (tab.value === 2 && socialStore.requests.total === 0) {
    nextTick(() => tab.value = 0);
  }
}, { immediate: true });

watch(() => route.query.option, (val) => {
  const index = options.findIndex((item) => item === val);
  if (index > -1) tab.value = index;
});

watch(() => socialStore.requests.total, (val) => {
  if (tab.value === 2 && val === 0) {
    nextTick(() => tab.value = 0);
  }
});
</script>