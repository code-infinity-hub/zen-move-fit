<template>
  <div>
    <div
      class="px-4 py-3 rounded-pill d-flex align-center text-body-2"
      :style="{ backgroundColor: '#15181ECC', border: `1px solid ${active ? flameColor : '#272C34'}` }"
      @click="sheet = true"
    >
      <v-icon
        :color="active ? flameColor : 'grey-darken-1'"
        :class="['mr-1', active && days >= 7 ? 'flame-alive' : '']"
      >mdi-fire</v-icon>

      <span :class="active ? '' : 'text-grey'">
        {{ t("$vuetify.message.consecutive_days", formatNumber(days)) }}
      </span>

      <template v-if="freezes > 0">
        <span class="mx-2 text-grey-darken-1">·</span>
        <span class="text-blue">🧊 {{ freezes }}</span>
      </template>
    </div>

    <v-bottom-sheet v-model="sheet">
      <v-card>
        <v-card-text class="py-5 d-flex flex-column align-center text-center ga-2">
          <div
            :class="['d-flex justify-center align-center rounded-circle bg-theme-primary-15 mb-2', active && days >= 7 ? 'flame-alive' : '']"
            :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
          >{{ active ? "🔥" : "🪵" }}</div>

          <p class="text-h6 font-space-grotesk font-weight-bold">
            {{ active ? t("$vuetify.message.streak_days_title", days) : t("$vuetify.label.no_streak_yet") }}
          </p>

          <p class="text-body-2 text-grey-lighten-1">
            {{ active ? t("$vuetify.message.streak_keep_it_alive") : t("$vuetify.message.streak_start_today") }}
          </p>

          <div class="w-100 mt-4 px-3 py-3 bg-quintet border-sextet rounded-lg d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
              <span :style="{ fontSize: '1.5rem' }">🧊</span>
              <div class="text-left">
                <p class="font-weight-bold">{{ t("$vuetify.label.streak_freezes") }}</p>
                <p class="text-caption text-grey-lighten-1">{{ t("$vuetify.message.streak_freeze_hint") }}</p>
              </div>
            </div>

            <span class="text-h6 font-weight-bold text-blue">
              {{ freezes }}
            </span>
          </div>

          <v-btn
            block
            color="blue"
            variant="tonal"
            class="text-none font-weight-bold mt-2 mb-2 pa-6"
            :loading="buying"
            :disabled="freezes >= 2"
            @click="buyFreeze"
          >{{ t("$vuetify.message.buy_freeze_with_credits", FREEZE_PRICE_CREDITS) }}</v-btn>

          <v-btn
            block
            color="primary"
            class="text-none font-weight-bold pa-6 text-black"
            @click="sheet = false"
          >{{ t("$vuetify.label.got_it") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useCelebration } from "@/composables/use-celebration";
import { useFormatNumber } from "@/composables";
import { eventBus } from "@/eventBus";

// Keep in sync with backend/src/json/streak-freezes.json
const FREEZE_PRICE_CREDITS = 150;

/// DATA
const { t } = useLocale();
const accountsStore = useAccountsStore();
const { celebrate } = useCelebration();
const { formatNumber } = useFormatNumber();

const sheet = ref(false);
const buying = ref(false);

/// COMPUTED
const days = computed(() => accountsStore.account.consecutive_days ?? 0);
const freezes = computed(() => accountsStore.account.streak_freezes ?? 0);
const active = computed(() => days.value > 0);

// Visual states grow with the streak (7 / 30 / 100 days)
const flameColor = computed(() => {
  if (days.value >= 100) return "#B388FF";
  if (days.value >= 30) return "#FF5252";
  if (days.value >= 7) return "#FF9800";
  return "#FFEB3B";
});

/// METHODS
const buyFreeze = async () => {
  try {
    buying.value = true;

    const response = await accountsStore.POST("streak-freezes/purchase");

    if (!response.error) {
      celebrate("light");
      await accountsStore.GET_ACCOUNT();
      eventBus.emit("SNACKBAR", { message: t("$vuetify.message.freeze_purchased"), icon: "mdi-snowflake" });
    }
  } finally {
    buying.value = false;
  }
};
</script>

<style lang="sass" scoped>
.flame-alive
  animation: flame-pulse 1.8s ease-in-out infinite

@keyframes flame-pulse
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.12)
</style>