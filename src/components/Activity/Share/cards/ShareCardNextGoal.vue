<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_next_goal") }}</span>
      <span class="sc-premium">{{ t("$vuetify.share.premium_tag") }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.next_goal_subtitle") }}</p>

    <div v-if="goal" class="sc-goal-box">
      <p class="sc-goal-label">{{ goalTitle }}</p>

      <div class="sc-comparison">
        <div class="sc-comp-item">
          <span class="sc-comp-val current">{{ formatGoalValue(goal.current_value) }}</span>
          <span class="sc-comp-unit">{{ unitLabel }}</span>
          <span class="sc-comp-label">{{ t("$vuetify.share.current_label") }}</span>
        </div>
        <div class="sc-arrow">→</div>
        <div class="sc-comp-item target">
          <span class="sc-comp-val">{{ formatGoalValue(goal.target_value) }}</span>
          <span class="sc-comp-unit">{{ unitLabel }}</span>
          <span class="sc-comp-label">{{ t("$vuetify.share.target_label") }}</span>
        </div>
      </div>

      <div class="sc-progress-wrap">
        <div class="sc-progress-bar" :style="{ width: `${progressPct}%` }"></div>
      </div>

      <div class="sc-progress-label">
        <span>{{ t("$vuetify.share.progress_pct_of_the_way", [progressPct]) }}</span>
        <span>{{ remainingLabel }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const goal = computed(() => props.activity.analysis?.next_goal ?? null);
const unitLabel = computed(() => (goal.value?.unit === "s_per_km" ? "/km" : "km"));
const goalTitle = computed(() => {
  const g = goal.value;
  if (!g) return "";
  if (g.type === "pace") return t("$vuetify.share.goal_type_pace");
  if (g.type === "distance") return t("$vuetify.share.goal_type_distance");
  return t("$vuetify.activity_analysis.next_goal_title");
});
const progressPct = computed(() => {
  const g = goal.value;
  if (!g) return 0;
  const { current_value, target_value } = g;
  if (g.type === "pace") {
    const worst = Math.max(current_value, target_value) * 1.2;
    const pct = Math.round(((worst - current_value) / (worst - target_value)) * 100);
    return Math.min(Math.max(pct, 5), 99);
  }
  const pct = Math.round((current_value / target_value) * 100);
  return Math.min(Math.max(pct, 5), 99);
});
const remainingLabel = computed(() => {
  const g = goal.value;
  if (!g) return "";
  const diff = Math.abs(g.target_value - g.current_value);
  if (g.type === "pace") {
    const m = Math.floor(diff / 60);
    const s = Math.round(diff % 60);
    return t("$vuetify.share.remaining_pace", [`${m}:${String(s).padStart(2, "0")}`]);
  }
  return t("$vuetify.share.remaining_distance", [formatNumber(diff), g.unit]);
});

/// METHODS
const formatGoalValue = (value: number) => {
  const g = goal.value;
  if (!g) return "";
  if (g.type === "pace") {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  return formatNumber(value);
};
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: linear-gradient(145deg, #111419, #0E1115)
  display: flex
  flex-direction: column
  padding: 0 32px 28px
  position: relative
  overflow: hidden
  box-sizing: border-box

.sc-glow
  position: absolute
  inset: 0
  background: radial-gradient(circle at 90% 10%, rgba(72, 242, 109, 0.07) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 24px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 6px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-premium
  font-size: 10px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.12em
  opacity: 0.7

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 28px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-goal-box
  background: #48F26D08
  border: 1px solid rgba(72, 242, 109, 0.12)
  border-radius: 20px
  padding: 28px 28px 24px

.sc-goal-label
  font-size: 12px
  font-weight: 700
  color: #FFFFFF66
  text-transform: uppercase
  letter-spacing: 0.1em
  margin-bottom: 20px

.sc-comparison
  display: flex
  align-items: center
  gap: 20px
  margin-bottom: 28px

.sc-comp-item
  display: flex
  flex-direction: column
  gap: 4px
  flex: 1
  &.target .sc-comp-val
    color: #48F26D

.sc-comp-val
  font-size: 40px
  font-weight: 800
  color: #FFFFFFBF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1
  &.current
    color: #FFFFFFBF

.sc-comp-unit
  font-size: 12px
  font-weight: 600
  color: #FFFFFF66

.sc-comp-label
  font-size: 11px
  color: #FFFFFF59

.sc-arrow
  font-size: 24px
  color: #48F26D
  font-weight: 300
  opacity: 0.5
  flex-shrink: 0

.sc-progress-wrap
  height: 6px
  background: #FFFFFF0F
  border-radius: 3px
  overflow: hidden
  margin-bottom: 10px

.sc-progress-bar
  height: 100%
  background: linear-gradient(to right, #48F26D80, #48F26D)
  border-radius: 3px

.sc-progress-label
  display: flex
  justify-content: space-between
  font-size: 11px
  color: #FFFFFF66
</style>