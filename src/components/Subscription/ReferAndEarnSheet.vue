<template>
  <v-bottom-sheet v-model="model">
    <div class="refer-wrap">
      <img
        :src="WomanReferAndEarn"
        class="hero-photo"
      />

      <v-sheet class="refer-sheet" rounded="t-xl">
        <div class="hero">
          <v-btn
            icon
            size="small"
            variant="flat"
            class="close-btn"
            color="rgba(0, 0, 0, 0.45)"
            @click="close"
          >
            <v-icon :size="18" color="white">mdi-close</v-icon>
          </v-btn>

          <div class="d-flex justify-center pt-4 gift-wrap">
            <div class="gift-badge rounded-circle d-flex align-center justify-center">
              <v-icon :size="18" color="primary">mdi-gift-outline</v-icon>
            </div>
          </div>

          <div class="hero-text pl-5 pt-4 pb-4">
            <p class="text-h4 font-weight-black hero-title mb-3">
              {{ t("$vuetify.label.refer_and_earn_title_line1") }}
              <span class="text-primary d-block">{{ t("$vuetify.label.refer_and_earn_title_line2") }}</span>
            </p>

            <p class="text-caption" :style="{ color: 'rgba(255, 255, 255, 0.55)' }">
              {{ t("$vuetify.label.refer_earn_sheet_subtitle") }}
            </p>
          </div>
        </div>

        <div class="px-5 pb-5">
          <div class="steps-card mb-4 rounded-xl pa-3 d-flex align-stretch">
            <template v-for="(step, i) in steps" :key="step.title">
              <div class="step-block flex-fill d-flex flex-column align-center ga-2 px-1">
                <div
                  class="size-2rem d-flex align-center justify-center rounded-circle"
                  :style="{ background: step.bg, border: step.border }"
                >
                  <v-icon :size="16" :color="step.color">{{ step.icon }}</v-icon>
                </div>

                <p class="step-title text-center">{{ `${i + 1}. ${step.title}` }}</p>

                <p class="step-desc text-center" :style="{ color: 'rgba(255, 255, 255, 0.45)' }">
                  {{ step.message }}
                </p>
              </div>
              <div v-if="i < steps.length - 1" class="step-arrow d-flex align-center">
                <v-icon :size="16" color="primary">mdi-arrow-right</v-icon>
              </div>
            </template>
          </div>

          <div class="commission-card mb-4 pa-4 rounded-xl d-flex align-center ga-3">
            <div class="commission-icon rounded-lg d-flex align-center justify-center flex-shrink-0">
              <v-icon :size="22" color="primary">mdi-cash-multiple</v-icon>
            </div>

            <div class="flex-fill min-w-0">
              <p class="text-body-2 font-weight-bold">
                {{ t("$vuetify.label.refer_earn_commission_title") }}
              </p>
              <p class="feature-desc" :style="{ color: 'rgba(255, 255, 255, 0.45)' }">
                {{ t("$vuetify.label.refer_earn_commission_desc", currency(minimumWithdraw)) }}
              </p>
            </div>
            <div class="text-center flex-shrink-0">
              <p class="text-caption" :style="{ color: 'rgba(255, 255, 255, 0.5)' }">
                {{ t("$vuetify.label.refer_earn_up_to") }}
              </p>
              <p class="text-h4 font-weight-black text-primary" :style="{ lineHeight: 1.1 }">
                {{ formatNumber(account?.indication?.percentage ?? 0, "percent", 0) }}
              </p>
              <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold mt-1">
                {{ t("$vuetify.label.refer_earn_commission_chip") }}
              </v-chip>
            </div>
          </div>

          <v-checkbox
            v-model="dontShowAgain"
            hide-details
            density="compact"
            color="primary"
            class="dismiss-check mb-2"
            :label="t('$vuetify.label.dont_show_again')"
          />

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7"
            @click="viewRecommendations"
          >
            {{ t("$vuetify.label.refer_earn_cta") }}
            <v-icon end :size="16">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </div>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { usePublicSettingsStore } from "@/stores/public-settings";
import { useCurrency, useFormatNumber } from "@/composables";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import WomanReferAndEarn from "@/assets/images/woman-refer-and-earn.png";

/// DATA
const { t } = useLocale();
const { currency } = useCurrency();
const { formatNumber } = useFormatNumber();
const router = useRouter();
const accountsStore = useAccountsStore();
const publicSettingsStore = usePublicSettingsStore();
const persistentSession = usePersistentSession();
const model = defineModel<boolean>({ default: false });
const dontShowAgain = ref(false);

/// COMPUTED
const account = computed(() => accountsStore.account);
const minimumWithdraw = computed(() => publicSettingsStore.settings?.min_withdrawal_amount ?? 0);

const steps = computed(() => [
  {
    icon: "mdi-account-plus-outline",
    bg: "rgba(72, 242, 109, 0.15)",
    border: "none",
    color: "#48F26D",
    title: t("$vuetify.label.refer_earn_step1_title"),
    message: t("$vuetify.label.refer_earn_step1_desc"),
  },
  {
    icon: "mdi-account-check-outline",
    bg: "rgba(255, 193, 7, 0.15)",
    border: "none",
    color: "#FFC107",
    title: t("$vuetify.label.refer_earn_step2_title"),
    message: t("$vuetify.label.refer_earn_step2_desc"),
  },
  {
    icon: "mdi-currency-usd",
    bg: "rgba(168, 130, 255, 0.12)",
    border: "1px solid rgba(168, 130, 255, 0.5)",
    color: "#A882FF",
    title: t("$vuetify.label.refer_earn_step3_title"),
    message: t("$vuetify.label.refer_earn_step3_desc"),
  },
]);

/// LIFE CYCLES
onMounted(() => {
  publicSettingsStore.GET_SETTINGS();
});

/// METHODS
const persistDismissal = async () => {
  if (dontShowAgain.value) {
    await persistentSession.set("hide-refer-and-earn-sheet", "1");
  }
};

const close = async () => {
  await persistDismissal();
  model.value = false;
};

const viewRecommendations = async () => {
  await persistDismissal();
  model.value = false;
  router.push({ name: "refer_and_earn", query: { my_recommendations: "1" } });
};
</script>

<style lang="sass" scoped>
.refer-wrap
  position: relative
  padding-top: 200px
  max-height: calc(100vh - var(--top-saved))
  overflow-y: auto

.refer-sheet
  width: 95%
  margin-left: 2.5%
  background-color: var(--secondary)
  border: 2px solid var(--tertiary)
  border-bottom-width: 0
  border-top-left-radius: 24px
  border-top-right-radius: 24px
  padding-bottom: var(--bottom-saved)

.close-btn
  position: absolute
  top: 14px
  right: 14px
  z-index: 3

.hero
  position: relative

.hero-photo
  position: absolute
  top: 0
  right: 0
  width: 62%
  height: 480px
  object-fit: cover
  object-position: 50% 0
  z-index: 2
  pointer-events: none
  -webkit-mask-image: linear-gradient(to left, black 72%, transparent 100%), linear-gradient(to bottom, transparent 0, black 28px, black 72%, transparent 100%)
  -webkit-mask-composite: source-in
  mask-image: linear-gradient(to left, black 72%, transparent 100%), linear-gradient(to bottom, transparent 0, black 28px, black 72%, transparent 100%)
  mask-composite: intersect

.gift-wrap
  position: relative
  z-index: 2

.gift-badge
  width: 40px
  height: 40px
  background: rgba(14, 17, 21, 0.6)
  backdrop-filter: blur(4px)
  border: 1px solid rgba(72, 242, 109, 0.4)

.hero-text
  position: relative
  z-index: 1
  width: 52%
  min-width: 0

.hero-title
  line-height: 1.1

.steps-card
  background: rgba(255, 255, 255, 0.02)
  border: 1px solid rgba(255, 255, 255, 0.07)

.step-title
  font-size: 11px
  font-weight: 700
  line-height: 1.3

.step-desc
  font-size: 10px
  line-height: 1.3

.step-arrow
  flex-shrink: 0
  opacity: 0.6

.feature-desc
  font-size: 11px
  line-height: 1.35

.commission-icon
  width: 40px
  height: 40px
  background: rgba(72, 242, 109, 0.12)

.commission-card
  background: rgba(72, 242, 109, 0.06)
  border: 1px solid rgba(72, 242, 109, 0.25)

.dismiss-check
  opacity: 0.7
  :deep(.v-label)
    font-size: 12px
</style>