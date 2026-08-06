<template>
  <v-bottom-sheet v-model="model">
    <v-card v-if="result">
      <v-card-text class="py-5 d-flex flex-column align-center text-center ga-2">
        <div
          class="d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-2"
          :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
        >{{ emoji }}</div>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ title }}
        </p>

        <p class="text-body-1 text-grey-lighten-1">
          {{ t("$vuetify.message.league_result_position", result.position) }}
        </p>

        <v-btn
          block
          color="primary"
          class="text-none font-weight-bold mt-4 pa-7 d-flex text-black"
          @click="close"
        >{{ t("$vuetify.label.got_it") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useLeaguesStore } from "@/stores/leagues";
import { useCelebration } from "@/composables/use-celebration";
import { type LeagueResult } from "@/types/global.type";
import { eventBus } from "@/eventBus";

/// DATA
const { t } = useLocale();
const { celebrate } = useCelebration();
const route = useRoute();
const leaguesStore = useLeaguesStore();

const model = ref(false);
const result = ref<LeagueResult | null>(null);
const pending = ref(false);

let checking = false;

/// COMPUTED
const inActivity = computed(() => route.query.mode === "activity" || ["training", "challenge"].includes(String(route.name || "")));
const emoji = computed(() => {
  if (result.value?.movement === "PROMOTED") return "🎉";
  if (result.value?.movement === "DEMOTED") return "📉";
  return "🏁";
});
const title = computed(() => {
  if (!result.value) return "";

  const tier = t(`$vuetify.leagues.${result.value.tier_name}`);

  if (result.value.movement === "PROMOTED") return t("$vuetify.message.league_promoted_title", tier);
  if (result.value.movement === "DEMOTED") return t("$vuetify.message.league_demoted_title", tier);
  return t("$vuetify.message.league_stayed_title", tier);
});

/// WATCH
watch(inActivity, (val) => {
  if (!val && pending.value) {
    pending.value = false;
    check();
  }
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("CHECK_LEAGUE_RESULT", check);
});

onBeforeUnmount(() => {
  eventBus.off("CHECK_LEAGUE_RESULT", check);
});

/// METHODS
const check = async () => {
  if (checking || model.value) return;

  if (inActivity.value) {
    pending.value = true;
    return;
  }

  try {
    checking = true;

    const response = await leaguesStore.GET_LATEST_RESULT();

    if (response.error || !response.result) return;

    result.value = response.result as LeagueResult;
    model.value = true;

    celebrate(result.value.movement === "PROMOTED" ? "epic" : "light");
  } catch {
    ///
  } finally {
    checking = false;
  }
};

const close = () => {
  if (result.value) {
    leaguesStore.MARK_RESULT_SEEN(result.value.cohort_id);
  }

  model.value = false;
  result.value = null;
};
</script>