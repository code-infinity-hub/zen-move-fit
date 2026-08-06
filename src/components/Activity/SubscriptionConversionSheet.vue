<template>
  <v-bottom-sheet v-model="model">
    <div class="conversion-wrap">
      <img :src="ManLookingWatch" class="hero-photo" />

      <v-sheet class="conversion-sheet" rounded="t-xl">
        <div class="hero">
          <v-btn
            icon
            size="small"
            variant="flat"
            class="close-btn"
            color="rgba(0, 0, 0, 0.45)"
            @click="model = false"
          >
            <v-icon :size="18" color="white">mdi-close</v-icon>
          </v-btn>

          <div class="stat-badge stat-performance rounded-lg pa-2">
            <p class="stat-label text-grey-lighten-1">
              {{ t("$vuetify.activity_analysis.premium_conversion_stat_performance") }}
            </p>

            <div class="d-flex align-center ga-1">
              <v-icon :size="16" color="primary">mdi-arrow-up</v-icon>
              <span class="stat-value text-primary">
                {{ t("$vuetify.activity_analysis.premium_conversion_stat_performance_value") }}
              </span>
            </div>
          </div>

          <div class="stat-badge stat-level rounded-lg pa-2 d-flex align-center ga-2">
            <div class="stat-icon rounded-md d-flex align-center justify-center flex-shrink-0">
              <v-icon :size="14" color="primary">mdi-lightning-bolt-outline</v-icon>
            </div>

            <div class="min-w-0">
              <p class="stat-label text-grey-lighten-1">
                {{ t("$vuetify.activity_analysis.premium_conversion_stat_level") }}
              </p>

              <p class="stat-value">
                {{ t("$vuetify.activity_analysis.premium_conversion_stat_level_value") }}
              </p>
            </div>
          </div>

          <div class="hero-text pt-5 pl-5 pb-4">
            <v-chip
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-weight-bold mb-3"
            >
              <v-icon start :size="12">mdi-crown-outline</v-icon>
              {{ t("$vuetify.activity_analysis.premium_conversion_badge") }}
            </v-chip>

            <p class="text-h5 font-weight-black hero-title mb-2">
              {{ t("$vuetify.activity_analysis.premium_conversion_title") }}

              <span class="text-primary d-block">
                {{ t("$vuetify.activity_analysis.premium_conversion_title_highlight") }}
              </span>
            </p>

            <p class="text-caption text-grey-lighten-1">
              {{ t("$vuetify.activity_analysis.premium_conversion_subtitle") }}
            </p>
          </div>
        </div>

        <div class="px-5 pb-5">
          <!-- Features -->
          <div class="features-grid mb-4 rounded-xl">
            <div
              v-for="feat in features"
              :key="feat.titleKey"
              class="feature-block d-flex align-start ga-3"
            >
              <div
                class="feature-icon rounded-lg d-flex align-center justify-center flex-shrink-0"
                :style="{ background: feat.bg, color: feat.color }"
              >
                <v-icon :size="18" :color="feat.color">{{ feat.icon }}</v-icon>
              </div>

              <div class="flex-fill min-w-0">
                <p class="text-caption font-weight-bold">
                  {{ t(feat.titleKey) }}
                </p>

                <p class="feature-desc text-grey-lighten-1">
                  {{ t(feat.descKey) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pricing card -->
          <div class="pricing-card mb-5 pa-4 rounded-xl">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-chip
                size="x-small"
                color="primary"
                variant="flat"
                class="font-weight-bold text-black"
              >{{ t("$vuetify.activity_analysis.premium_conversion_price_badge") }}</v-chip>

              <span v-if="showDiscount" class="original-price text-caption text-grey-lighten-1">
                {{ `${currency(originalPrice)} /${t("$vuetify.label.month").toLowerCase()}` }}
              </span>
            </div>

            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <div class="d-flex align-center flex-wrap ga-2 min-w-0">
                <p class="font-weight-bold">
                  {{ t("$vuetify.activity_analysis.premium_conversion_plan_name") }}
                </p>

                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="#A882FF"
                  class="font-weight-bold"
                >
                  <v-icon start :size="12">mdi-fire</v-icon>
                  {{ t("$vuetify.activity_analysis.premium_conversion_best_value") }}
                </v-chip>
              </div>

              <div>
                <span class="text-h5 font-weight-bold font-space-grotesk">
                  {{ currency(price) }}
                </span>

                <span class="text-caption text-lowercase ml-1 text-grey-lighten-1">
                  {{ `/${t("$vuetify.label.month")}` }}
                </span>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <div class="d-flex flex-wrap ga-4">
                <div class="d-flex align-center ga-2">
                  <v-icon :size="14" color="primary">mdi-infinity</v-icon>
                  <span class="feature-desc">
                    {{ t("$vuetify.activity_analysis.premium_conversion_perk_access") }}
                  </span>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-icon :size="14" color="primary">mdi-timer-sand</v-icon>
                  <span class="feature-desc">
                    {{ t("$vuetify.activity_analysis.premium_conversion_perk_cancel") }}
                  </span>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-icon :size="14" color="primary">mdi-shield-check-outline</v-icon>
                  <span class="feature-desc">
                    {{ t("$vuetify.activity_analysis.premium_conversion_perk_no_lock_in") }}
                  </span>
                </div>
              </div>

              <v-chip
                v-if="showDiscount"
                size="small"
                variant="tonal"
                color="primary"
                class="font-weight-bold flex-shrink-0"
              >{{ t("$vuetify.activity_analysis.premium_conversion_save_badge", savings) }}</v-chip>
            </div>
          </div>

          <v-btn
            block
            color="primary"
            variant="flat"
            rounded="xl"
            height="48"
            class="font-weight-bold text-none"
            @click="subscribe"
          >
            <v-icon start :size="16">mdi-lightning-bolt</v-icon>
            {{ t("$vuetify.activity_analysis.premium_conversion_cta") }}
            <v-icon end size="16">mdi-chevron-right</v-icon>
          </v-btn>

          <p class="text-caption text-center text-grey-lighten-1 mt-3">
            <v-icon :size="14" class="mr-1">mdi-cached</v-icon>
            {{ t("$vuetify.activity_analysis.premium_conversion_trust") }}
          </p>
        </div>
      </v-sheet>
    </div>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useOffersStore } from "@/stores/offers";
import { useCurrency } from "@/composables";
import { eventBus } from "@/eventBus";
import { type Offer } from "@/types/offer.type";
import ManLookingWatch from "@/assets/images/man-looking-watch.png";

/// DATA
const { t } = useLocale();
const { currency } = useCurrency();
const offersStore = useOffersStore();
const model = defineModel<boolean>({ default: false });
const features = [
  {
    icon: "mdi-creation",
    bg: "rgba(168, 130, 255, 0.15)",
    color: "#A882FF",
    titleKey: "$vuetify.activity_analysis.premium_conversion_feat_ai_title",
    descKey: "$vuetify.activity_analysis.premium_conversion_feat_ai_desc",
  },
  {
    icon: "mdi-chart-box-outline",
    bg: "rgba(59, 130, 246, 0.15)",
    color: "#3B82F6",
    titleKey: "$vuetify.activity_analysis.premium_conversion_feat_plans_title",
    descKey: "$vuetify.activity_analysis.premium_conversion_feat_plans_desc",
  },
  {
    icon: "mdi-chart-bar",
    bg: "rgba(244, 67, 54, 0.15)",
    color: "#F44336",
    titleKey: "$vuetify.activity_analysis.premium_conversion_feat_evolution_title",
    descKey: "$vuetify.activity_analysis.premium_conversion_feat_evolution_desc",
  },
  {
    icon: "mdi-lock-outline",
    bg: "rgba(168, 130, 255, 0.15)",
    color: "#A882FF",
    titleKey: "$vuetify.activity_analysis.premium_conversion_feat_premium_title",
    descKey: "$vuetify.activity_analysis.premium_conversion_feat_premium_desc",
  },
];

/// COMPUTED
const originalPrice = computed(() => offersStore.amount_original);
const price = computed(() => offersStore.amount);
const showDiscount = computed(() => originalPrice.value > price.value);
const savings = computed(() => `${Math.round((1 - price.value / originalPrice.value) * 100)}%`);

/// LIFE CYCLES
onMounted(async () => {
  if (!offersStore.amount) {
    const response = await offersStore.GET("default");

    if (!response.error) {
      const offer = response.offer as Offer;

      offersStore._id = offer._id;
      offersStore.cta_now = t("$vuetify.label.start_now_for", currency(offer.amount));
      offersStore.cta_subscription = t("$vuetify.label.start_now_for", currency(offer.amount));
      offersStore.amount = offer.amount || Number(import.meta.env.VITE_PRICE_SUBSCRIPTION);
      offersStore.amount_original = offer.amount_original || Number(import.meta.env.VITE_PRICE_SUBSCRIPTION_ORIGINAL);
      offersStore.credits = offer.credits;
      offersStore.payment_methods = offer.payment_methods;
    }
  }
});

/// METHODS
const subscribe = () => {
  model.value = false;
  eventBus.emit("START_SUBSCRIPTION");
};
</script>

<style lang="sass" scoped>
.conversion-wrap
  position: relative
  padding-top: 80px
  max-height: calc(100vh - var(--top-saved))
  overflow-y: auto

.conversion-sheet
  width: 95%
  margin-left: 2.5%
  background: var(--secondary)
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
  min-height: 280px

.hero-photo
  position: absolute
  top: 0
  right: 0
  width: 58%
  height: 360px
  object-fit: cover
  object-position: 50% 0
  z-index: 2
  pointer-events: none
  -webkit-mask-image: linear-gradient(to left, black 72%, transparent 100%), linear-gradient(to bottom, transparent 0, black 28px, black 72%, transparent 100%)
  -webkit-mask-composite: source-in
  mask-image: linear-gradient(to left, black 72%, transparent 100%), linear-gradient(to bottom, transparent 0, black 28px, black 72%, transparent 100%)
  mask-composite: intersect

.hero-text
  position: relative
  z-index: 1
  width: 55%
  min-width: 0

.hero-title
  line-height: 1.15

.stat-badge
  position: absolute
  z-index: 2
  background: rgba(14, 17, 21, 0.72)
  backdrop-filter: blur(6px)
  border: 1px solid rgba(255, 255, 255, 0.1)
  max-width: calc(100% - 24px)

.stat-performance
  top: 40%
  right: 12px

.stat-level
  top: 66%
  right: 16px

.stat-label
  font-size: 10px
  line-height: 1.3

.stat-value
  font-size: 13px
  font-weight: 800
  line-height: 1.3
  white-space: nowrap

.stat-icon
  width: 24px
  height: 24px
  background: rgba(72, 242, 109, 0.12)
  border: 1px solid rgba(72, 242, 109, 0.3)

.features-grid
  display: grid
  grid-template-columns: 1fr 1fr
  background: rgba(255, 255, 255, 0.02)
  border: 1px solid rgba(255, 255, 255, 0.07)
  overflow: hidden

.feature-block
  padding: 12px 10px
  &:nth-child(odd)
    border-right: 1px solid rgba(255, 255, 255, 0.06)
  &:not(:nth-last-child(-n+2))
    border-bottom: 1px solid rgba(255, 255, 255, 0.06)

.feature-icon
  width: 34px
  height: 34px

.feature-desc
  font-size: 11px
  line-height: 1.35

.original-price
  text-decoration: line-through

.pricing-card
  border: 1px solid rgba(72, 242, 109, 0.35)
  background: rgba(72, 242, 109, 0.06)
</style>