<template>
  <div
    id="social"
    class="w-100 h-100 overflow-hidden d-flex flex-column"
  >
    <header class="heading border-bottom-tertiary d-flex justify-space-between">
      <div>
        <p
          class="text-h6 font-space-grotesk font-weight-bold"
        >{{ t("$vuetify.menu.social") }}</p>

        <p
          class="text-body-2 text-grey-lighten-1"
        >{{ t("$vuetify.message.feed_connections_and_challenges") }}</p>
      </div>

      <div class="h-100 d-flex justify-center align-center ga-2">
        <v-btn
          icon=""
          color="quintet"
          class="border-sextet"
          :size="36"
          @click="search"
        >
          <v-icon :size="20" color="grey-lighten-1">
            mdi-magnify
          </v-icon>
        </v-btn>

        <v-btn
          icon=""
          color="quintet"
          class="border-sextet"
          :size="36"
          @click="openChat"
        >
          <v-icon :size="20" color="grey-lighten-1">
            mdi-chat-outline
          </v-icon>
        </v-btn>

        <v-badge
          v-if="pendantsNotifications"
          location="top right"
          color="error"
          :content="pendantsNotifications <= 99 ? String(pendantsNotifications) : `${pendantsNotifications}+`"
        >
          <v-btn
            icon=""
            color="quintet"
            class="border-sextet"
            :size="36"
            @click="openNotifications"
          >
            <v-icon :size="20" color="grey-lighten-1">
              mdi-bell-outline
            </v-icon>
          </v-btn>
        </v-badge>
        <v-btn
          v-else
          icon=""
          color="quintet"
          class="border-sextet"
          :size="36"
          @click="openNotifications"
        >
          <v-icon :size="20" color="grey-lighten-1">
            mdi-bell-outline
          </v-icon>
        </v-btn>
      </div>
    </header>

    <div class="overflow-social flex-fill overflow-y-auto px-4 py-3 d-flex flex-column">
      <div class="pa-1 mb-5 rounded-lg d-flex ga-2 bg-tertiary">
        <v-btn
          v-for="(option, i) in options"
          :key="i"
          :class="[
            'text-none flex-fill rounded-lg text-caption position-relative',
            tab === i ? 'font-weight-bold' : ''
          ]"
          :style="{ minWidth: `calc((100% / ${options.length}) - 6px)` }"
          :color="tab === i ? 'primary' : 'tertiary'"
          @click="tab = i"
        >
          <v-badge
            v-if="option.badge"
            floating
            location="top right"
            color="blue"
            :content="option.badge"
            :style="{ position: 'absolute', right: '0%', width: '100%' }"
          >
            <div class="w-100 d-flex justify-center align-center ga-2">
              <v-icon>{{ option.icon }}</v-icon>
              <span>{{ option.text }}</span>
            </div>
          </v-badge>
          <div v-else class="d-flex ga-2">
            <v-icon>{{ option.icon }}</v-icon>
            <span>{{ option.text }}</span>
          </div>
        </v-btn>
      </div>

      <div class="flex-fill">
        <v-tabs-window v-model="tab" class="h-100">
          <v-tabs-window-item class="h-100">
            <Feed v-if="tab === 0" />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100">
            <Connections v-if="tab === 1" />
          </v-tabs-window-item>

          <v-tabs-window-item class="h-100"></v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications.ts";
import { useSocialStore } from "@/stores/social.ts";

import TABS from "@/json/tabs-social.json";

/// COMPONENTS
import Feed from "./Feed/index.vue";
import Connections from "./Connections/index.vue";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();
const notificationsStore = useNotificationsStore();
const socialStore = useSocialStore();

const tab = ref(TABS.findIndex((item) => item === route.query.list));

/// COMPUTED
const options = computed(() => {
  const badgeSocial = socialStore.requests.total + socialStore.unread.chats;

  return [
    {
      icon: "mdi-newspaper-variant-outline",
      text: t("$vuetify.label.feed"),
      badge: "",
    },
    {
      icon: "mdi-link",
      text: t("$vuetify.label.connections"),
      badge: badgeSocial > 99 ? "99+" : String(badgeSocial || "")
    },
  ] as const;
});
const pendantsNotifications = computed(() => notificationsStore.pendants_notifications);

/// WATCH
watch(tab, (val) => {
  const list = TABS.find((_, i) => i === val)!;

  router.replace({
    replace: true,
    query: {
      ...route.query,
      list,
      search: list !== "connections" ? undefined : route.query.search || undefined
    }
  });
});

watch(() => route.query.list, (val) => {
  const index = TABS.findIndex((item) => item === val);
  tab.value = index >= 0 ? index : 0;
});

/// LIFE CYCLES
onMounted(async () => {
  socialStore.on_social_tab = true;

  socialStore.RESET_REQUESTS();
  socialStore.RESET_FRIENDS();
  socialStore.RESET_SUGGESTION_FRIENDS();
  socialStore.RESET_CHATS();
  socialStore.RESET_POSTS();
  socialStore.RESET_UNREAD_MESSAGES();

  await Promise.all([
    socialStore.GET_REQUESTS(),
    socialStore.GET_FRIENDS(),
    socialStore.GET_SUGGESTION_FRIENDS(),
    socialStore.GET_CHATS(),
    socialStore.GET_POSTS(),
    socialStore.GET_UNREAD_MESSAGES(),
  ]);
});

onBeforeUnmount(() => {
  socialStore.on_social_tab = false;
});

/// METHODS
const search = async () => {
  if (route.query.list !== "connections") {
    router.replace({
      replace: true,
      query: {
        ...route.query,
        option: "friends",
        list: "connections",
      }
    });

    await new Promise((accept) => setTimeout(accept, 300));
  }

  if (route.query.option !== "friends") {
    router.replace({
      replace: true,
      query: {
        ...route.query,
        option: "friends",
      }
    });

    await new Promise((accept) => setTimeout(accept, 300));
  }

  router.replace({
    replace: true,
    query: { ...route.query, search: "1" }
  });
};

const openChat = () => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      option: "chats",
      list: "connections",
    }
  });
};

const openNotifications = () => {
  router.replace({
    replace: true,
    query: { ...route.query, mode: "notification" }
  });
};
</script>

<style lang="sass">
div#social
  span.v-badge__badge
    right: 1px
    left: unset !important
</style>