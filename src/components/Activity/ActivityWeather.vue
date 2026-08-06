<template>
  <div class="bg-quintet border-sextet mx-4 pa-3 rounded-lg d-flex align-center ga-3">
    <div class="d-flex align-center ga-2 flex-shrink-0">
      <v-icon :size="34" :color="iconColor">
        {{ icon }}
      </v-icon>

      <div>
        <p class="text-h6 font-weight-bold">
          {{ `${formatNumber(weather.temperature)}°` }}
        </p>

        <p
          v-if="conditionLabel"
          class="text-caption text-grey-lighten-1"
          :style="{ lineHeight: 1.1 }"
        >{{ conditionLabel }}</p>
      </div>
    </div>

    <!-- Detail chips -->
    <div class="d-flex flex-column ga-1 flex-fill align-end">
      <div v-if="weather.feels_like !== weather.temperature" class="weather-chip">
        <v-icon :size="11" color="grey-lighten-1">
          mdi-thermometer
        </v-icon>

        <span>
          {{ t("$vuetify.activity_detail.feels_like", [weather.feels_like]) }}
        </span>
      </div>

      <div v-if="weather.wind_speed" class="weather-chip">
        <v-icon :size="11" color="blue-lighten-2">
          mdi-weather-windy
        </v-icon>

        <span>
          {{ `${formatNumber(weather.wind_speed)} ${t("$vuetify.label.km_h")}${weather.wind_dir_text ? ` ${weather.wind_dir_text}` : ""}` }}
        </span>
      </div>

      <div v-if="weather.humidity" class="weather-chip">
        <v-icon :size="11" color="blue-lighten-3">
          mdi-water-percent
        </v-icon>

        <span>
          {{ formatNumber(weather.humidity, "percent") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { type ActivityDetail } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ weather: NonNullable<ActivityDetail["weather"]> }>();

const ICON_MAP: Record<string, string> = {
  clear_sky: "mdi-weather-sunny",
  mainly_clear: "mdi-weather-partly-cloudy",
  partly_cloudy: "mdi-weather-partly-cloudy",
  overcast: "mdi-weather-cloudy",
  fog: "mdi-weather-fog",
  rain: "mdi-weather-rainy",
  snow: "mdi-weather-snowy",
  rain_showers: "mdi-weather-pouring",
  thunderstorm: "mdi-weather-lightning-rainy",
};

const COLOR_MAP: Record<string, string> = {
  clear_sky: "yellow",
  mainly_clear: "orange-lighten-2",
  partly_cloudy: "orange-lighten-3",
  overcast: "grey-lighten-2",
  fog: "grey-lighten-1",
  rain: "blue-lighten-2",
  snow: "blue-lighten-4",
  rain_showers: "blue",
  thunderstorm: "purple-lighten-1",
};

/// COMPUTED
const icon = computed(() => ICON_MAP[props.weather.key] ?? "mdi-weather-cloudy");
const iconColor = computed(() => COLOR_MAP[props.weather.key] ?? "grey-lighten-1");

const conditionLabel = computed(() => {
  const key = props.weather.key;
  if (!key || key === "unknown") return "";
  return t(`$vuetify.weather_conditions.${key}`);
});
</script>

<style lang="sass" scoped>
div.weather-chip
  display: flex
  align-items: center
  gap: 4px
  font-size: 0.7rem
  color: rgba(255, 255, 255, 0.6)
  white-space: nowrap
</style>