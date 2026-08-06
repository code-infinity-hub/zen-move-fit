<template>
  <div ref="rootRef" class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ `${badgeIcon} ${badgeLabel}` }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <p
      v-if="subtitle"
      class="sc-subtitle"
    >{{ subtitle }}</p>

    <div class="sc-primary">
      <div class="sc-metric-big">
        <span class="sc-metric-value">{{ primaryValue }}</span>
        <span v-if="primaryUnit" class="sc-metric-unit">{{ primaryUnit }}</span>
      </div>
      <span class="sc-metric-label">{{ primaryLabel }}</span>
    </div>

    <div class="sc-divider"></div>

    <div class="sc-secondary">
      <div
        v-for="(item, index) in secondaryMetrics"
        :key="index"
        class="sc-sec-item"
        :style="index < secondaryMetrics.length - 1 ? { borderRight: '1px solid rgba(255, 255, 255, 0.08)' } : {}"
      >
        <span class="sc-sec-value">{{ item.value }}</span>
        <span class="sc-sec-label">{{ item.label }}</span>
      </div>
    </div>

    <div v-if="activity.insight" class="sc-quote">
      <span class="sc-quote-mark">"</span>
      <span ref="quoteRef">{{ fittedText }}</span>
      <span class="sc-quote-mark">"</span>
    </div>

    <div :style="{ flex: 1 }"></div>

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
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { useFormatNumber } from "@/composables";
import { useFitText } from "@/composables/use-fit-text";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { formatDuration, getPrimaryDurationSeconds } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();
const rootRef = ref<HTMLElement | null>(null);
const quoteRef = ref<HTMLElement | null>(null);
const { fittedText } = useFitText(
  rootRef,
  quoteRef,
  () => props.activity.insight ?? "",
  { watchSources: () => props.format }
);

/// COMPUTED
const { cardStyle, initials, avatarSrc, dateLabel } = useShareCardIdentity(props);
const badgeLabel = computed(() => {
  if (props.activity.type === "TRAINING") return t("$vuetify.label.training");
  if (props.activity.type === "CHALLENGE") return t("$vuetify.label.challenge");
  const category = props.activity.category;
  if (category === "RUNNING") return t("$vuetify.label.running");
  if (category === "TRAIL_RUNNING") return t("$vuetify.label.running_trail");
  if (category === "WALKING") return t("$vuetify.label.walking");
  if (category === "CYCLING") return t("$vuetify.label.cycling");
  return t("$vuetify.label.activity");
});
const badgeIcon = computed(() => {
  if (props.activity.type === "TRAINING") return "💪";
  if (props.activity.type === "CHALLENGE") return "🔥";
  const category = props.activity.category;
  if (category === "RUNNING" || category === "TRAIL_RUNNING") return "🏃";
  if (category === "WALKING") return "🚶";
  if (category === "CYCLING") return "🚴";
  return "⚡";
});
const subtitle = computed(() => {
  if (props.activity.type === "TRAINING") return props.activity.workout_title ?? null;
  if (props.activity.type === "CHALLENGE" && props.activity.challenge_plan_progress) {
    const { ordinal, total } = props.activity.challenge_plan_progress;
    return t("$vuetify.share.day_x_of_y", [ordinal, total]);
  }
  return null;
});
const primaryValue = computed(() => {
  const activity = props.activity;
  if (activity.type === "TRAINING") {
    const totalSeries = (activity.exercises ?? []).reduce((sum, ex) => sum + ex.series.length, 0);
    return String(totalSeries);
  }
  if (activity.type === "CHALLENGE") {
    const percentage = activity.challenge_plan_progress?.percentage;
    return percentage != null ? `${percentage}%` : formatDuration(activity.duration_seconds);
  }
  return activity.metrics?.distance_meters ? formatNumber(activity.metrics.distance_meters / 1000) : formatDuration(getPrimaryDurationSeconds(activity));
});
const primaryUnit = computed(() => {
  const activity = props.activity;
  if (activity.type === "TRAINING") return t("$vuetify.label.series");
  if (activity.type === "CHALLENGE") return activity.challenge_plan_progress ? t("$vuetify.share.completed_lowercase") : "";
  return activity.metrics?.distance_meters ? t("$vuetify.label.km") : "";
});
const primaryLabel = computed(() => {
  const activity = props.activity;
  if (activity.type === "TRAINING") return t("$vuetify.share.total_series");
  if (activity.type === "CHALLENGE") return activity.challenge_plan_progress ? t("$vuetify.share.of_the_full_plan") : "";
  return activity.metrics?.distance_meters ? t("$vuetify.label.distance") : t("$vuetify.label.time");
});
const secondaryMetrics = computed(() => {
  const activity = props.activity;
  const items: { value: string; label: string }[] = [];

  if (activity.type === "TRAINING") {
    items.push({ value: formatDuration(activity.duration_seconds), label: t("$vuetify.label.time") });
    const totalReps = (activity.exercises ?? []).reduce((sum, ex) => {
      if (ex.reps.type !== "fixed") return sum;
      const reps = ex.reps.max ?? ex.reps.min ?? 0;
      return sum + ex.series.length * reps;
    }, 0);
    if (totalReps > 0) items.push({ value: String(totalReps), label: t("$vuetify.activity_detail.total_reps") });
    if (activity.calories) items.push({ value: formatNumber(activity.calories), label: t("$vuetify.label.kcal_abbreviation") });
    return items.slice(0, 3);
  }

  if (activity.type === "CHALLENGE") {
    items.push({ value: formatDuration(activity.duration_seconds), label: t("$vuetify.label.time") });
    const streak = activity.challenge_analysis?.streak;
    if (streak && streak >= 2) items.push({ value: `${streak}`, label: t("$vuetify.share.days_in_a_row_label") });
    if (activity.calories) items.push({ value: formatNumber(activity.calories), label: t("$vuetify.label.kcal_abbreviation") });
    return items.slice(0, 3);
  }

  items.push({ value: formatDuration(getPrimaryDurationSeconds(activity)), label: t("$vuetify.label.time") });
  if (activity.metrics?.avg_pace) items.push({ value: RunningMetricsService.formatPace(activity.metrics.avg_pace), label: t("$vuetify.share.pace_km_label") });
  if (activity.metrics?.elevation?.gain) items.push({ value: `+${formatNumber(activity.metrics.elevation.gain)}${t("$vuetify.label.meters_abbreviation")}`, label: t("$vuetify.share.elevation_label") });
  else if (activity.calories) items.push({ value: formatNumber(activity.calories), label: t("$vuetify.label.kcal_abbreviation") });
  return items.slice(0, 3);
});
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: #0E1115
  display: flex
  flex-direction: column
  padding: 0 32px 28px
  position: relative
  overflow: hidden
  box-sizing: border-box

.sc-glow
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: radial-gradient(circle at 15% 15%, rgba(72, 242, 109, 0.07) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 28px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 8px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80
  text-transform: uppercase

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-subtitle
  font-size: 18px
  font-weight: 700
  color: #FFFFFFE6
  margin-bottom: 16px
  margin-top: 4px
  font-family: "Space Grotesk", system-ui, sans-serif
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-primary
  display: flex
  flex-direction: column
  margin-top: 12px
  margin-bottom: 16px

.sc-metric-big
  display: flex
  align-items: baseline
  gap: 8px

.sc-metric-value
  font-size: 80px
  font-weight: 800
  line-height: 1
  color: #FFFFFFF2
  font-family: "Space Grotesk", system-ui, sans-serif
  letter-spacing: -2px

.sc-metric-unit
  font-size: 24px
  font-weight: 600
  color: #48F26D
  line-height: 1

.sc-metric-label
  font-size: 13px
  font-weight: 500
  color: #FFFFFF61
  margin-top: 4px
  text-transform: lowercase

.sc-divider
  width: 48px
  height: 2px
  background: #48F26D
  margin-bottom: 20px
  border-radius: 1px

.sc-secondary
  display: flex
  gap: 0
  margin-bottom: 20px

.sc-sec-item
  flex: 1
  display: flex
  flex-direction: column
  padding-right: 20px
  &:not(:first-child)
    padding-left: 20px
    padding-right: 0

.sc-sec-value
  font-size: 22px
  font-weight: 700
  color: #FFFFFFE6
  font-family: "Space Grotesk", system-ui, sans-serif
  line-height: 1.2

.sc-sec-label
  font-size: 11px
  color: #FFFFFF61
  margin-top: 3px

.sc-quote
  font-size: 13px
  font-style: italic
  color: #FFFFFF80
  line-height: 1.55
  padding: 12px 16px
  background: #48F26D0D
  border-left: 2px solid rgba(72, 242, 109, 0.4)
  border-radius: 0 6px 6px 0
  margin-bottom: 8px

.sc-quote-mark
  color: #48F26D
  font-style: normal
  font-size: 16px

.sc-footer
  display: flex
  align-items: center
  justify-content: space-between
  padding-top: 16px
  border-top: 1px solid rgba(255, 255, 255, 0.07)

.sc-user
  display: flex
  align-items: center
  gap: 10px

.sc-avatar
  width: 32px
  height: 32px
  border-radius: 50%
  background: #48F26D26
  border: 1.5px solid rgba(72, 242, 109, 0.3)
  display: flex
  align-items: center
  justify-content: center
  font-size: 14px
  font-weight: 700
  color: #48F26D

.sc-avatar-img
  width: 100%
  height: 100%
  border-radius: 50%
  object-fit: cover

.sc-username
  font-size: 13px
  font-weight: 600
  color: #FFFFFFBF
  max-width: 240px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.05em
  opacity: 0.7
</style>