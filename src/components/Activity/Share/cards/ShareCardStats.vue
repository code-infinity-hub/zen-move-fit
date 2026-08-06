<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_stats") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.stats_subtitle") }}</p>

    <div class="sc-grid">
      <div v-for="stat in stats" :key="stat.label" class="sc-stat-card">
        <span class="sc-stat-emoji">{{ stat.emoji }}</span>
        <span class="sc-stat-val">{{ stat.value }}</span>
        <span class="sc-stat-lbl">{{ stat.label }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();
const WEATHER_EMOJI: Record<string, string> = {
  clear_sky: "☀️",
  mainly_clear: "🌤️",
  partly_cloudy: "⛅",
  overcast: "☁️",
  fog: "🌫️",
  rain: "🌧️",
  snow: "❄️",
  rain_showers: "🌦️",
  thunderstorm: "⛈️",
};

/// COMPUTED
const { cardStyle, dateLabel } = useShareCardIdentity(props);
const stats = computed(() => {
  const activity = props.activity;
  const items: { emoji: string; value: string; label: string }[] = [];

  items.push({ emoji: "⏱️", value: formatDuration(getPrimaryDurationSeconds(activity)), label: t("$vuetify.label.time") });

  if (activity.metrics?.elapsed_seconds && Math.abs(activity.metrics.elapsed_seconds - activity.duration_seconds) > 10) {
    items.push({ emoji: "🕐", value: formatDuration(activity.metrics.elapsed_seconds), label: t("$vuetify.share.elapsed_label") });
  }

  if (activity.calories) {
    items.push({ emoji: "🔥", value: `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}`, label: t("$vuetify.label.calories") });
  }

  if (activity.metrics?.avg_pace) {
    items.push({ emoji: "⚡", value: `${RunningMetricsService.formatPace(activity.metrics.avg_pace)}/${t("$vuetify.label.km")}`, label: t("$vuetify.share.avg_pace_stat_label") });
  }

  if (activity.metrics?.avg_speed) {
    items.push({ emoji: "💨", value: `${formatNumber(activity.metrics.avg_speed)} ${t("$vuetify.label.km_h")}`, label: t("$vuetify.label.speed") });
  }

  if (activity.metrics?.elevation?.gain) {
    items.push({ emoji: "⛰️", value: `+${formatNumber(activity.metrics.elevation.gain)}${t("$vuetify.label.meters_abbreviation")}`, label: t("$vuetify.share.elevation_label") });
  }

  if (activity.metrics?.steps) {
    items.push({ emoji: "👟", value: formatNumber(activity.metrics.steps), label: t("$vuetify.label.steps") });
  }

  if (activity.weather?.temperature != null) {
    const emoji = WEATHER_EMOJI[activity.weather.key] ?? "🌡️";
    items.push({ emoji, value: `${Math.round(activity.weather.temperature)}°C`, label: t("$vuetify.share.temperature_label") });
  }

  if (activity.perceived_effort) {
    items.push({ emoji: "💪", value: `${activity.perceived_effort}/10`, label: t("$vuetify.share.effort_label") });
  }

  return items.slice(0, 6);
});
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
  background: radial-gradient(circle at 85% 85%, rgba(72, 242, 109, 0.06) 0%, transparent 50%)
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

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 24px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-grid
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  gap: 12px

.sc-stat-card
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  padding: 16px 12px
  display: flex
  flex-direction: column
  align-items: center
  gap: 6px

.sc-stat-emoji
  font-size: 20px
  line-height: 1

.sc-stat-val
  font-size: 17px
  font-weight: 700
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif
  text-align: center
  line-height: 1.2

.sc-stat-lbl
  font-size: 10px
  color: #FFFFFF59
  text-align: center
</style>