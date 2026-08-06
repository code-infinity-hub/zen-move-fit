<template>
  <div class="w-100 h-100 overflow-hidden bg-secondary">
    <v-tabs-window v-model="tab" class="h-100">
      <v-tabs-window-item class="h-100">
        <List v-if="tab === 0" />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <HandleEquipament
          v-if="tab === 1"
          :operation="operation"
          @back="resetRoute"
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
import List from "./List.vue";
import HandleEquipament from "./HandleEquipament.vue";

/// DATA
const tab = ref(0);
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();

/// COMPUTED
const operation = computed(() => String(route.query.operation || "") as "new" | "edit");

/// WATCH
watch(operation, (val) => {
  tab.value = val ? 1 : 0;
}, { immediate: true });

/// LIFE CYCLES
onMounted(async () => {
  accountsStore._id = (await persistentSession.get("_id")) || "";
  await accountsStore.GET_ACCOUNT();
});

/// METHODS
const resetRoute = () => {
  router.replace({
    replace: true,
    query: undefined
  });
};
</script>