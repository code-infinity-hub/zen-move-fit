<template>
  <div class="w-100 h-100 overflow-hidden bg-secondary">
    <v-tabs-window v-model="tab" class="h-100">
      <v-tabs-window-item class="h-100">
        <Informations
          v-if="tab === 0"
          @close="close"
          @my-recommendations="tab = 1"
          @bank-account="bottomSheet = true"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <MyRecommendations
          v-if="tab === 1"
          @close="tab = 0"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100"></v-tabs-window-item>
    </v-tabs-window>

    <BankAccount
      v-if="bottomSheet"
      @close="bottomSheet = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession";

/// COMPONENTS
import Informations from "./Informations.vue";
import MyRecommendations from "./MyRecommendations.vue";
import BankAccount from "./BankAccount.vue";

/// DATA
const tab = ref(0);
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();
const bottomSheet = ref(false);

/// COMPUTED
const configureRecipient = computed(() => route.query?.configure_recipient);
const myRecommendations = computed(() => route.query?.my_recommendations);

/// WATCH
watch(bottomSheet, (val) => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      configure_recipient: val ? "1" : undefined
    }
  });
});

watch(tab, (val) => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      my_recommendations: val === 1 ? "1" : undefined
    }
  });
});

watch(configureRecipient, (val) => {
  bottomSheet.value = val === "1";
}, { immediate: true });

watch(myRecommendations, (val) => {
  tab.value = val === "1" ? 1 : 0;
}, { immediate: true });

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);

  accountsStore._id = (await persistentSession.get("_id")) || "";
  await accountsStore.GET_ACCOUNT();
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", backButton);
});

/// METHODS
const close = () => {
  eventBus.emit("BACK_ROUTER");
};

const backButton = () => {
  if (bottomSheet.value) {
    ///
  } else if (tab.value === 0) {
    close();
  } else {
    tab.value = 0;
  }
};
</script>