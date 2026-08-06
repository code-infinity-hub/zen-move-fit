<template>
  <div class="sc-root" :style="cardStyle">
    <div v-if="goal" class="sc-body">
      <div class="sc-icon">🎯</div>
      <p class="sc-label">{{ t(`$vuetify.activity_analysis.${goal.label_key}`) }}</p>
      <div class="sc-progress-row">
        <span class="sc-cur">{{ formatGoalValue(goal.current_value) }}</span>
        <span class="sc-arrow">→</span>
        <span class="sc-target">{{ formatGoalValue(goal.target_value) }}</span>
        <span class="sc-unit">{{ unit }}</span>
      </div>
      <div class="sc-track">
        <div class="sc-fill" :style="{ width: `${Math.min(100, progressPct)}%` }"></div>
        <span class="sc-pct">{{ `${progressPct}%` }}</span>
      </div>
      <div class="sc-brand">
        <ShareCardBrand />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { getCardStyle } from "@/composables/use-share-renderer";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
const goal = computed(() => props.activity.analysis?.next_goal ?? null);
const unit = computed(() => (goal.value?.unit === "s_per_km" ? `/${t("$vuetify.label.km")}` : t("$vuetify.label.km")));

const progressPct = computed(() => {
  const g = goal.value;
  if (!g) return 0;
  if (g.type === "distance") return Math.round((g.current_value / g.target_value) * 100);
  if (g.type === "pace") {
    const diff = g.current_value - g.target_value;
    const range = g.current_value * 0.2;
    return Math.max(0, Math.round(((range - diff) / range) * 100));
  }
  return 0;
});

/// METHODS
const formatGoalValue = (value: number) => {
  const g = goal.value;
  if (!g) return "";
  return g.unit === "s_per_km" ? RunningMetricsService.formatPace(value) : formatNumber(value / 1000);
};
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: transparent
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  box-sizing: border-box
  overflow: hidden

.sc-body
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  gap: 8px
  padding: 32px
  background: #00000080
  border-radius: 20px
  backdrop-filter: blur(12px)
  border: 1px solid rgba(255, 255, 255, 0.1)
  box-shadow: 0 8px 40px #00000080
  min-width: 340px

.sc-icon
  font-size: 40px
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))

.sc-label
  font-size: 13px
  font-weight: 700
  color: #FFF9
  text-transform: uppercase
  letter-spacing: 0.1em
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8)

.sc-progress-row
  display: flex
  align-items: baseline
  gap: 8px

.sc-cur
  font-size: 36px
  font-weight: 800
  color: #FFFFFFB3
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)

.sc-arrow
  font-size: 20px
  color: #FFFFFF59

.sc-target
  font-size: 48px
  font-weight: 900
  color: #48F26D
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(72, 242, 109, 0.3)

.sc-unit
  font-size: 16px
  font-weight: 700
  color: #FFFFFF80
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8)

.sc-track
  width: 280px
  height: 8px
  background: #FFFFFF1F
  border-radius: 4px
  overflow: hidden
  position: relative
  margin-top: 4px

.sc-fill
  height: 100%
  background: linear-gradient(to right, #48F26D99, #48F26D)
  border-radius: 4px

.sc-pct
  position: absolute
  right: 0
  top: -20px
  font-size: 12px
  font-weight: 800
  color: #48F26D
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9)

.sc-brand
  font-size: 10px
  font-weight: 700
  color: #48F26D99
  letter-spacing: 0.08em
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9)
  margin-top: 4px
</style>