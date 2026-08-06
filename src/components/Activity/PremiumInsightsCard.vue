<template>
  <Motion
    class="insights-card pa-4"
    :initial="{ opacity: 0, y: 10 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.35 }"
  >
    <!-- Label -->
    <div class="d-flex align-center ga-2 mb-2">
      <v-icon :size="14" color="primary">mdi-creation</v-icon>

      <span
        class="text-caption font-weight-bold text-primary text-uppercase"
        :style="{ letterSpacing: '0.08em' }"
      >{{ t("$vuetify.activity_analysis.insights_card_title") }}</span>
    </div>

    <!-- Tagline -->
    <p class="text-subtitle-2 font-weight-black text-white mb-1">
      {{ t("$vuetify.activity_analysis.insights_card_tagline") }}
    </p>

    <v-divider class="my-3"></v-divider>

    <!-- Checklist 2-col -->
    <div class="features-grid mb-4">
      <div
        v-for="key in FEATURES"
        :key="key"
        class="d-flex align-center ga-2"
      >
        <v-icon
          :size="15"
          color="primary"
        >mdi-check-circle</v-icon>

        <span
          class="text-body-2"
          :style="{ color: 'rgba(255, 255, 255, 0.65)' }"
        >{{ t(`$vuetify.activity_analysis.${key}`) }}</span>
      </div>
    </div>

    <v-divider class="my-3"></v-divider>

    <!-- CTA -->
    <v-btn
      block
      color="primary"
      class="text-none font-weight-bold pa-6"
      variant="flat"
      :height="42"
      @click="eventBus.emit('START_SUBSCRIPTION')"
    >
      {{ t("$vuetify.activity_analysis.premium_hero_cta") }}
      <v-icon end :size="15">mdi-arrow-right</v-icon>
    </v-btn>
  </Motion>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";

/// DATA
const { t } = useLocale();
const FEATURES = [
  "premium_hero_feat_score",
  "premium_hero_feat_evolution",
  "premium_hero_feat_predictions",
  "insights_feat_recovery",
  "premium_hero_feat_recommendations",
  "insights_feat_comparison",
  "premium_hero_feat_training_load",
  "premium_hero_feat_next_goal",
  "insights_feat_consistency",
] as const;
</script>

<style lang="sass" scoped>
.insights-card
  background: linear-gradient(135deg, #1A2420 0%, #1E2820 55%, #14191E 100%)
  border: 1px solid rgba(72, 242, 109, 0.18)
  animation: card-pulse 3.5s ease-in-out infinite

.features-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 8px 6px

@keyframes card-pulse
  0%, 100%
    border-color: rgba(72, 242, 109, 0.18)
  50%
    border-color: rgba(72, 242, 109, 0.32)
</style>