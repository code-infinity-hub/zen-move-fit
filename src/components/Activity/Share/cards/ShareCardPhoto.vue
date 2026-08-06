<template>
  <div ref="rootRef" class="sc-root" :style="cardStyle">
    <div
      class="sc-photo-bg"
      :class="{ 'sc-photo-bg--half': layout === 'map' }"
      :style="{
        backgroundImage: `url('${photoSrc}')`,
        filter: layout === 'data' ? 'brightness(0.3) blur(2px) saturate(0.4)' : 'brightness(0.82) saturate(0.85)',
      }"
    ></div>

    <div
      v-if="layout === 'map'"
      class="sc-map-panel"
      :style="{ backgroundImage: `url('${mapSrc}')` }"
    ></div>

    <div
      class="sc-overlay"
      :class="layout === 'fullscreen' ? 'sc-overlay--light' : layout === 'data' ? 'sc-overlay--none' : ''"
    ></div>

    <div class="sc-content">
      <div class="sc-header">
        <span class="sc-badge">{{ `📸 ${photoLabel}` }}</span>
        <span class="sc-date">{{ dateLabel }}</span>
      </div>

      <template v-if="layout === 'fullscreen'">
        <div :style="{ flex: 1 }"></div>
        <div v-if="activity.title" class="sc-big-title">{{ activity.title }}</div>
      </template>

      <template v-else-if="layout === 'data'">
        <div class="sc-data-grid">
          <div v-if="distanceValue" class="sc-data-cell">
            <span class="sc-data-val">{{ distanceValue }}</span>
            <span class="sc-data-unit">{{ t("$vuetify.label.km") }}</span>
          </div>
          <div v-if="activity.duration_seconds" class="sc-data-cell">
            <span class="sc-data-val">{{ formatDuration(getPrimaryDurationSeconds(activity)) }}</span>
            <span class="sc-data-unit">{{ t("$vuetify.share.time_label") }}</span>
          </div>
          <div v-if="paceValue" class="sc-data-cell">
            <span class="sc-data-val">{{ paceValue }}</span>
            <span class="sc-data-unit">{{ t("$vuetify.share.pace_km_label") }}</span>
          </div>
          <div v-if="elevationValue" class="sc-data-cell">
            <span class="sc-data-val">{{ `+${elevationValue}` }}</span>
            <span class="sc-data-unit">{{ t("$vuetify.share.m_elevation_label") }}</span>
          </div>
          <div v-if="activity.calories" class="sc-data-cell">
            <span class="sc-data-val">{{ formatNumber(activity.calories) }}</span>
            <span class="sc-data-unit">{{ t("$vuetify.label.kcal_abbreviation") }}</span>
          </div>
        </div>
        <div :style="{ flex: 1 }"></div>
      </template>

      <template v-else-if="layout === 'ai'">
        <div :style="{ flex: 1 }"></div>
        <div v-if="activity.insight" class="sc-ai-box">
          <span class="sc-ai-icon">🤖</span>
          <p ref="insightTextRef" class="sc-ai-text">
            {{ fittedText }}
          </p>
        </div>
      </template>

      <template v-else-if="layout === 'record'">
        <div :style="{ flex: 1 }"></div>
        <div v-if="prRecord" class="sc-record-box">
          <span class="sc-record-trophy">🏆</span>
          <div>
            <p class="sc-record-label">{{ prRecord.label }}</p>
            <p class="sc-record-val">{{ prRecord.value }}</p>
          </div>
        </div>
      </template>

      <template v-else-if="layout === 'goal'">
        <div :style="{ flex: 1 }"></div>
        <div v-if="activity.analysis?.next_goal" class="sc-goal-box">
          <span class="sc-goal-icon">🎯</span>
          <div>
            <p class="sc-goal-label">{{ t("$vuetify.activity_analysis.next_goal_title") }}</p>
            <p class="sc-goal-val">{{ goalLabel }}</p>
          </div>
        </div>
      </template>

      <template v-else-if="layout === 'map'">
        <div :style="{ flex: 1 }"></div>
        <div v-if="distanceValue" class="sc-map-metric">
          <span class="sc-map-val">{{ distanceValue }}</span>
          <span class="sc-map-unit">{{ t("$vuetify.label.km") }}</span>
        </div>
      </template>

      <template v-else>
        <div :style="{ flex: 1 }"></div>
        <div class="sc-info">
          <p v-if="activity.title" class="sc-title">{{ activity.title }}</p>
          <div class="sc-metrics-row">
            <span v-if="distanceValue" class="sc-metric">
              <span class="sc-metric-v">{{ distanceValue }}</span>
              <span class="sc-metric-u">{{ t("$vuetify.label.km") }}</span>
            </span>
            <span v-if="activity.duration_seconds" class="sc-metric">
              <span class="sc-metric-v">{{ formatDuration(getPrimaryDurationSeconds(activity)) }}</span>
              <span class="sc-metric-u">{{ t("$vuetify.share.time_label") }}</span>
            </span>
            <span v-if="elevationValue" class="sc-metric">
              <span class="sc-metric-v">{{ `+${elevationValue}${t("$vuetify.label.meters_abbreviation")}` }}</span>
              <span class="sc-metric-u">{{ t("$vuetify.share.elevation_label") }}</span>
            </span>
          </div>
        </div>
      </template>

      <div class="sc-footer">
        <div class="sc-user">
          <div class="sc-avatar">
            <img v-if="avatarSrc" :src="avatarSrc" class="sc-avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
          <span class="sc-username">{{ activity.account.name }}</span>
        </div>
        <span class="sc-brand">
          <ShareCardBrand />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { useFitText } from "@/composables/use-fit-text";
import { type PhotoLayout } from "@/types/share.type";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { formatNumber } = useFormatNumber();
const { t } = useLocale();
const props = defineProps<ShareCardProps & { photoIndex?: number, layout?: PhotoLayout }>();
const rootRef = ref<HTMLElement | null>(null);
const insightTextRef = ref<HTMLElement | null>(null);
const { fittedText } = useFitText(
  rootRef,
  insightTextRef,
  () => props.activity.insight ?? "",
  { watchSources: () => props.format }
);

/// COMPUTED
const { cardStyle, initials, avatarSrc, dateLabel } = useShareCardIdentity(props);
const layout = computed(() => props.layout ?? "metrics");
const photoUrl = computed(() => props.activity.files?.[props.photoIndex ?? 0]?.url ?? null);
const photoSrc = computed(() => (photoUrl.value ? props.imageCache?.[photoUrl.value] ?? photoUrl.value : ""));
const mapSrc = computed(() => {
  const image = props.activity.map_picture;
  return image ? props.imageCache?.[image] ?? image : "";
});
const photoLabel = computed(() => {
  const index = props.photoIndex ?? 0;
  return (props.activity.files?.length ?? 0) > 1 ? t("$vuetify.share.photo_numbered", [index + 1]) : t("$vuetify.share.photo_badge");
});
const distanceValue = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  return meters ? formatNumber(meters / 1000) : null;
});
const paceValue = computed(() => {
  const pace = props.activity.metrics?.avg_pace;
  return pace ? RunningMetricsService.formatPace(pace) : null;
});
const elevationValue = computed(() => {
  const gain = props.activity.metrics?.elevation?.gain;
  return gain ? formatNumber(gain) : null;
});
const prRecord = computed(() => {
  const record = props.activity.analysis?.records?.find((r) => r.is_pr);
  if (!record) return null;
  const label = t(`$vuetify.activity_analysis.${record.title_key}`);
  const value =
    record.value !== undefined
      ? t(`$vuetify.activity_analysis.${record.description_key}`, [record.value])
      : record.rank !== undefined
        ? t(`$vuetify.activity_analysis.${record.description_key}`, [record.rank])
        : t(`$vuetify.activity_analysis.${record.description_key}`);
  return { label, value };
});
const goalLabel = computed(() => {
  const goal = props.activity.analysis?.next_goal;
  return goal ? `${formatGoalPart(goal.current_value, goal.unit)} → ${formatGoalPart(goal.target_value, goal.unit)}` : "";
});

/// METHODS
const formatGoalPart = (value: number, unit: string) => unit === "s_per_km" ? `${RunningMetricsService.formatPace(value)}/${t("$vuetify.label.km")}` : `${formatNumber(value / 1000)} ${t("$vuetify.label.km")}`;
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  position: relative
  overflow: hidden
  background: #111
  box-sizing: border-box

.sc-photo-bg
  position: absolute
  inset: 0
  background-size: cover
  background-position: center

.sc-photo-bg--half
  right: 50%

.sc-map-panel
  position: absolute
  top: 0
  right: 0
  bottom: 0
  width: 50%
  background-size: cover
  background-position: center
  filter: brightness(0.7) saturate(0.5)
  &:after
    content: ""
    position: absolute
    inset: 0
    background: linear-gradient(to right, rgba(10, 12, 15, 0.8) 0%, transparent 30%)

.sc-overlay
  position: absolute
  inset: 0
  background: linear-gradient(to top, #0A0C0FF5, #0A0C0F4D 45%, #0A0C0F14)

.sc-overlay--light
  background: linear-gradient(to top, rgba(10, 12, 15, 0.85) 0%, rgba(10, 12, 15, 0.15) 60%, transparent 100%)

.sc-overlay--none
  background: none

.sc-content
  position: relative
  z-index: 2
  height: 100%
  display: flex
  flex-direction: column
  padding: 0 28px 28px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  padding-top: 28px
  margin-bottom: 12px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFFB3
  text-transform: uppercase
  background: #00000073
  padding: 4px 12px
  border-radius: 20px
  backdrop-filter: blur(4px)

.sc-date
  font-size: 11px
  color: #FFFFFF80

.sc-big-title
  font-size: 28px
  font-weight: 800
  color: #FFF
  line-height: 1.15
  margin-bottom: 20px
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6)

.sc-data-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 16px
  padding: 20px
  background: #FFFFFF0A
  border: 1px solid rgba(255, 255, 255, 0.08)
  border-radius: 16px
  margin-top: 8px

.sc-data-cell
  display: flex
  flex-direction: column

.sc-data-val
  font-size: 28px
  font-weight: 800
  color: #FFF
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1

.sc-data-unit
  font-size: 11px
  color: #FFF6
  margin-top: 2px
  text-transform: uppercase
  letter-spacing: 0.05em

.sc-ai-box
  display: flex
  gap: 14px
  align-items: flex-start
  padding: 18px 20px
  background: #0000008C
  border: 1px solid rgba(255, 255, 255, 0.12)
  border-radius: 14px
  backdrop-filter: blur(8px)
  margin-bottom: 16px

.sc-ai-icon
  font-size: 24px
  flex-shrink: 0

.sc-ai-text
  font-size: 14px
  color: #FFFFFFE0
  line-height: 1.5
  font-style: italic

.sc-record-box
  display: flex
  gap: 14px
  align-items: center
  padding: 16px 20px
  background: #0000008C
  border: 1.5px solid var(--sc-accent, #48F26D)
  border-radius: 14px
  backdrop-filter: blur(8px)
  margin-bottom: 16px

.sc-record-trophy
  font-size: 32px
  flex-shrink: 0

.sc-record-label
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: var(--sc-accent, #48F26D)
  text-transform: uppercase
  margin-bottom: 4px

.sc-record-val
  font-size: 18px
  font-weight: 700
  color: #FFF

.sc-goal-box
  display: flex
  gap: 14px
  align-items: center
  padding: 16px 20px
  background: #0000008C
  border: 1.5px solid rgba(72, 242, 109, 0.4)
  border-radius: 14px
  backdrop-filter: blur(8px)
  margin-bottom: 16px

.sc-goal-icon
  font-size: 28px
  flex-shrink: 0

.sc-goal-label
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #48F26DCC
  text-transform: uppercase
  margin-bottom: 4px

.sc-goal-val
  font-size: 18px
  font-weight: 700
  color: #FFF

.sc-map-metric
  display: flex
  align-items: baseline
  gap: 6px
  margin-bottom: 16px

.sc-map-val
  font-size: 64px
  font-weight: 800
  color: #FFF
  line-height: 1
  font-family: "Space Grotesk", system-ui, sans-serif
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8)
  letter-spacing: -2px

.sc-map-unit
  font-size: 20px
  font-weight: 600
  color: #48F26DE6

.sc-info
  margin-bottom: 16px

.sc-title
  font-size: 20px
  font-weight: 700
  color: #FFF
  margin-bottom: 10px
  line-height: 1.2

.sc-metrics-row
  display: flex
  gap: 20px
  margin-bottom: 4px

.sc-metric
  display: flex
  align-items: baseline
  gap: 4px

.sc-metric-v
  font-size: 18px
  font-weight: 700
  color: #FFFFFFEB
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-metric-u
  font-size: 11px
  color: #FFFFFF73

.sc-footer
  display: flex
  align-items: center
  justify-content: space-between

.sc-user
  display: flex
  align-items: center
  gap: 10px

.sc-avatar
  width: 30px
  height: 30px
  border-radius: 50%
  background: #48F26D33
  border: 1.5px solid rgba(72, 242, 109, 0.5)
  display: flex
  align-items: center
  justify-content: center
  font-size: 13px
  font-weight: 700
  color: var(--sc-accent, #48F26D)

.sc-avatar-img
  width: 100%
  height: 100%
  border-radius: 50%
  object-fit: cover

.sc-username
  font-size: 13px
  font-weight: 600
  color: #FFFFFFD9

.sc-brand
  font-size: 11px
  font-weight: 700
  color: var(--sc-accent, #48F26D)
  letter-spacing: 0.05em
  opacity: 0.75
</style>