<template>
  <div class="w-100 h-100 overflow-hidden bg-secondary">
    <v-tabs-window v-model="tab" class="h-100">
      <v-tabs-window-item class="h-100">
        <Initial
          v-if="tab === 0"
          @set-tab="(newTab: number) => tab = newTab"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Account
          v-if="tab === 1"
          @back="tab = 0"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Plan
          v-if="tab === 2"
          @back="tab = 0"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Privacy
          v-if="tab === 3"
          @back="tab = 0"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Notifications
          v-if="tab === 4"
          @back="tab = 0"
        />
      </v-tabs-window-item>

      <v-tabs-window-item></v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { usePersistentSession } from "@/plugins/usePersistentSession";

/// COMPONENTS
import Initial from "./Initial.vue";
import Account from "./Account.vue";
import Plan from "./Plan.vue";
import Privacy from "./Privacy.vue";
import Notifications from "./Notifications.vue";

/// DATA
const tab = ref(0);
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();

const TABS = ["account", "plan", "privacy", "notifications"];

/// WATCH
watch(tab, (val) => {
  const tab = TABS.find((_, i) => (i + 1) === val);
  router.replace({
    replace: true,
    query: { ...route.query, tab }
  });
});

/// LIFE CYCLES
onMounted(async () => {
  accountsStore._id = (await persistentSession.get("_id")) || "";
  await accountsStore.GET_ACCOUNT();

  const option = String(route.query.tab) || "";

  if (option) {
    if (!TABS.includes(option)) {
      router.replace({
        replace: true,
        query: { ...route.query, tab: undefined }
      });
    } else {
      const index = TABS.findIndex((item) => item === option);
      tab.value = index + 1;
    }
  }
});
</script>