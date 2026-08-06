<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_evolution") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <div v-if="score" class="sc-score-wrap">
      <div class="sc-score-ring" :style="{ borderColor: `${scoreColor}55`, boxShadow: `0 0 20px ${scoreColor}22` }">
        <span class="sc-score-emoji">{{ scoreEmoji }}</span>
        <span class="sc-score-val" :style="{ color: scoreColor }">{{ score.score }}</span>
      </div>
      <div class="sc-score-info">
        <span class="sc-score-label" :style="{ color: scoreColor }">{{ scoreLabel }}</span>
        <span class="sc-score-context">{{ scoreContext }}</span>
      </div>
    </div>

    <div class="sc-evos">
      <div v-for="evo in evolutions" :key="evo.key" class="sc-evo-row">
        <span class="sc-evo-icon" :style="{ color: trendColor(evo.trend) }">{{ trendIcon(evo.trend) }}</span>
        <span class="sc-evo-text">{{ describeEvolution(evo) }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();
const SCORE_EMOJIS: Record<string, string> = {
  score_excellent: "🔥",
  score_great: "⚡",
  score_good: "🏃",
  score_average: "👟",
  score_below_average: "💪",
};
const SCORE_COLORS: Record<string, string> = { green: "#48F26D", blue: "#3B82F6", orange: "#FF9800", red: "#F44336" };

/// COMPUTED
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const score = computed(() => props.activity.analysis?.score ?? null);
const evolutions = computed(() => (props.activity.analysis?.evolution ?? []).slice(0, 4));
const scoreColor = computed(() => (score.value ? SCORE_COLORS[score.value.color] ?? "#48F26D" : "#48F26D"));
const scoreLabel = computed(() => (score.value ? t(`$vuetify.activity_analysis.${score.value.label_key}`) : ""));
const scoreContext = computed(() => (score.value ? t(`$vuetify.activity_analysis.${score.value.label_key.replace("score_", "score_context_")}`) : ""));
const scoreEmoji = computed(() => (score.value ? SCORE_EMOJIS[score.value.label_key] ?? "💪" : "💪"));

/// METHODS
const trendIcon = (trend: string) => (trend === "up" ? "↑" : trend === "down" ? "↓" : "→");
const trendColor = (trend: string) => (trend === "up" ? "#48F26D" : trend === "down" ? "#F44336" : "rgba(255, 255, 255, 0.4)");
const describeEvolution = (evo: { key: string; streak?: number }) =>
  evo.streak && evo.key === "evo_pace_improving"
    ? t(`$vuetify.activity_analysis.${evo.key}`, [evo.streak])
    : t(`$vuetify.activity_analysis.${evo.key}`);
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
  background: radial-gradient(circle at 15% 85%, rgba(72, 242, 109, 0.06) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 22px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 16px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-score-wrap
  display: flex
  align-items: center
  gap: 18px
  margin-bottom: 22px
  padding: 16px 18px
  background: #FFFFFF06
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 14px

.sc-score-ring
  width: 80px
  height: 80px
  border-radius: 50%
  border: 3px solid
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  flex-shrink: 0
  background: #FFFFFF08
  gap: 0

.sc-score-emoji
  font-size: 18px
  line-height: 1

.sc-score-val
  font-size: 28px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1

.sc-score-info
  display: flex
  flex-direction: column
  gap: 4px

.sc-score-label
  font-size: 16px
  font-weight: 800
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-score-context
  font-size: 12px
  color: #FFFFFF73

.sc-evos
  display: flex
  flex-direction: column
  gap: 10px

.sc-evo-row
  display: flex
  align-items: center
  gap: 12px
  padding: 10px 14px
  background: #FFFFFF06
  border-radius: 10px

.sc-evo-icon
  font-size: 20px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  width: 20px
  flex-shrink: 0
  text-align: center

.sc-evo-text
  font-size: 13px
  font-weight: 500
  color: #FFFFFFBF
</style>