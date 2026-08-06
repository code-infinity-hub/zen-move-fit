<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ `${weatherEmoji} ${t("$vuetify.share.badge_weather")}` }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.weather_conditions_title") }}</p>

    <div class="sc-temp-row">
      <span class="sc-temp-val">{{ Math.round(weather.temperature) }}</span>
      <div class="sc-temp-right">
        <span class="sc-temp-unit">°C</span>
        <span v-if="feelsLikeDiff !== 0" class="sc-feels">{{ t("$vuetify.activity_detail.feels_like", [Math.round(weather.feels_like)]) }}</span>
      </div>
    </div>

    <div class="sc-grid">
      <div class="sc-stat-card">
        <span class="sc-stat-emoji">💧</span>
        <span class="sc-stat-val">{{ `${weather.humidity}%` }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.share.humidity_label") }}</span>
      </div>
      <div class="sc-stat-card">
        <span class="sc-stat-emoji">💨</span>
        <span class="sc-stat-val">{{ Math.round(weather.wind_speed) }}</span>
        <span class="sc-stat-lbl">{{ `${t("$vuetify.label.km_h")} ${weather.wind_dir_text}` }}</span>
      </div>
      <div v-if="activity.metrics?.distance_meters" class="sc-stat-card">
        <span class="sc-stat-emoji">🏃</span>
        <span class="sc-stat-val">{{ distanceKm }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.share.km_covered_label") }}</span>
      </div>
      <div v-else class="sc-stat-card">
        <span class="sc-stat-emoji">⏱️</span>
        <span class="sc-stat-val">{{ formatDuration(getPrimaryDurationSeconds(activity)) }}</span>
        <span class="sc-stat-lbl">{{ t("$vuetify.share.total_time_label") }}</span>
      </div>
    </div>

    <div class="sc-condition-pill">{{ conditionLabel }}</div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
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
const WEATHER_EMOJIS: Record<string, string> = {
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
const { cardStyle, dateLabel: formattedDate } = useShareCardIdentity(props);
const weather = computed(() => props.activity.weather!);
const weatherEmoji = computed(() => WEATHER_EMOJIS[weather.value.key] ?? "🌡️");
const conditionLabel = computed(() => t(`$vuetify.weather_conditions.${weather.value.key}`));
const feelsLikeDiff = computed(() => Math.round(weather.value.feels_like) - Math.round(weather.value.temperature));
const distanceKm = computed(() => {
  const distance = props.activity.metrics?.distance_meters;
  return distance ? formatNumber(distance / 1000) : null;
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
  background: radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #3B82F6, transparent)
  margin-bottom: 22px

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
  font-size: 16px
  font-weight: 600
  color: #FFFFFF80
  margin-bottom: 14px

.sc-temp-row
  display: flex
  align-items: flex-start
  gap: 8px
  margin-bottom: 24px

.sc-temp-val
  font-size: 100px
  font-weight: 900
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 0.9
  color: #FFFFFFEB
  letter-spacing: -4px

.sc-temp-right
  display: flex
  flex-direction: column
  padding-top: 8px
  gap: 6px

.sc-temp-unit
  font-size: 36px
  font-weight: 700
  color: #FFFFFF80
  line-height: 1

.sc-feels
  font-size: 12px
  color: #FFFFFF59
  white-space: nowrap

.sc-grid
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  gap: 10px
  margin-bottom: 18px

.sc-stat-card
  background: #FFFFFF08
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 12px
  padding: 14px 10px
  display: flex
  flex-direction: column
  align-items: center
  gap: 5px

.sc-stat-emoji
  font-size: 18px
  line-height: 1

.sc-stat-val
  font-size: 16px
  font-weight: 700
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-stat-lbl
  font-size: 10px
  color: #FFFFFF59
  text-align: center

.sc-condition-pill
  display: inline-block
  font-size: 12px
  font-weight: 600
  color: #3B82F6E6
  background: #3B82F614
  border: 1px solid rgba(59, 130, 246, 0.2)
  padding: 5px 16px
  border-radius: 20px
</style>