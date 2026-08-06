<template>
  <v-bottom-sheet v-model="model">
    <v-card v-if="current">
      <v-card-text class="py-5 d-flex flex-column align-center text-center ga-2">
        <div
          class="d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-2"
          :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
        >{{ current.emoji }}</div>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ t("$vuetify.label.achievement_unlocked") }}
        </p>

        <p class="text-body-1 font-weight-bold text-primary">
          {{ t(`$vuetify.achievements.${current.id}`) }}
        </p>

        <v-btn
          block
          color="primary"
          class="text-none font-weight-bold mt-4 pa-7 d-flex text-black"
          @click="model = false"
        >{{ t("$vuetify.label.got_it") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useCelebration } from "@/composables/use-celebration";
import { eventBus } from "@/eventBus";

type UnseenAchievement = {
  id: string,
  emoji: string,
  earned_at: string,
};

/// DATA
const { t } = useLocale();
const route = useRoute();
const accountsStore = useAccountsStore();
const { celebrate } = useCelebration();

const model = ref(false);
const queue = ref<UnseenAchievement[]>([]);
const pending = ref(false);

let checking = false;

/// COMPUTED
const current = computed(() => queue.value[0] ?? null);

const inActivity = computed(() =>
  route.query.mode === "activity" || ["training", "challenge"].includes(String(route.name || ""))
);

/// WATCH
watch(model, (val) => {
  if (val || !current.value) return;

  accountsStore.PATCH("achievements/seen", { ids: [current.value.id] });

  queue.value = queue.value.slice(1);

  if (queue.value.length) {
    nextTick(() => {
      model.value = true;
      celebrate("success");
    });
  }
});

watch(inActivity, (val) => {
  if (!val && pending.value) {
    pending.value = false;
    check();
  }
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("CHECK_ACHIEVEMENTS", check);
});

onBeforeUnmount(() => {
  eventBus.off("CHECK_ACHIEVEMENTS", check);
});

/// METHODS
const check = async () => {
  if (checking || model.value) return;

  // Never interrupt an ongoing activity; celebrate right after it ends
  if (inActivity.value) {
    pending.value = true;
    return;
  }

  try {
    checking = true;

    const response = await accountsStore.GET("achievements/unseen");

    if (response.error) return;

    const unseen = (response.achievements ?? []) as UnseenAchievement[];

    if (unseen.length) {
      queue.value = unseen;
      model.value = true;
      celebrate("success");
    }
  } catch {
    ///
  } finally {
    checking = false;
    accountsStore.GET_ACCOUNT();
  }
};
</script>