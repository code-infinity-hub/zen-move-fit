import type { ActivityDetail } from "@/types/activity.type";
import type { ShareTemplateDef, ShareTemplateGroupDef } from "@/types/global.type";
export type { ShareTemplateDef, ShareTemplateGroupDef } from "@/types/global.type";

import ShareCardSummary from "@/components/Activity/Share/cards/ShareCardSummary.vue";
import ShareCardPhoto from "@/components/Activity/Share/cards/ShareCardPhoto.vue";
import ShareCardMap from "@/components/Activity/Share/cards/ShareCardMap.vue";
import ShareCardRecords from "@/components/Activity/Share/cards/ShareCardRecords.vue";
import ShareCardRecordSingle from "@/components/Activity/Share/cards/ShareCardRecordSingle.vue";
import ShareCardInsights from "@/components/Activity/Share/cards/ShareCardInsights.vue";
import ShareCardPredictions from "@/components/Activity/Share/cards/ShareCardPredictions.vue";
import ShareCardNextGoal from "@/components/Activity/Share/cards/ShareCardNextGoal.vue";
import ShareCardStats from "@/components/Activity/Share/cards/ShareCardStats.vue";
import ShareCardSplits from "@/components/Activity/Share/cards/ShareCardSplits.vue";
import ShareCardTrainingLoad from "@/components/Activity/Share/cards/ShareCardTrainingLoad.vue";
import ShareCardEfficiency from "@/components/Activity/Share/cards/ShareCardEfficiency.vue";
import ShareCardComparison from "@/components/Activity/Share/cards/ShareCardComparison.vue";
import ShareCardEvolution from "@/components/Activity/Share/cards/ShareCardEvolution.vue";
import ShareCardWeather from "@/components/Activity/Share/cards/ShareCardWeather.vue";
import ShareCardRecommendations from "@/components/Activity/Share/cards/ShareCardRecommendations.vue";
import ShareCardWorkout from "@/components/Activity/Share/cards/ShareCardWorkout.vue";
import ShareCardEquipment from "@/components/Activity/Share/cards/ShareCardEquipment.vue";
import ShareCardRecovery from "@/components/Activity/Share/cards/ShareCardRecovery.vue";
import ShareCardWorkoutVolume from "@/components/Activity/Share/cards/ShareCardWorkoutVolume.vue";
import ShareCardWorkoutHighlights from "@/components/Activity/Share/cards/ShareCardWorkoutHighlights.vue";
import ShareCardWorkoutSets from "@/components/Activity/Share/cards/ShareCardWorkoutSets.vue";
import ShareCardTransparentDistance from "@/components/Activity/Share/cards/ShareCardTransparentDistance.vue";
import ShareCardTransparentMetrics from "@/components/Activity/Share/cards/ShareCardTransparentMetrics.vue";
import ShareCardTransparentPace from "@/components/Activity/Share/cards/ShareCardTransparentPace.vue";
import ShareCardTransparentRecord from "@/components/Activity/Share/cards/ShareCardTransparentRecord.vue";
import ShareCardTransparentInsight from "@/components/Activity/Share/cards/ShareCardTransparentInsight.vue";
import ShareCardTransparentGoal from "@/components/Activity/Share/cards/ShareCardTransparentGoal.vue";
import ShareCardTransparentStreak from "@/components/Activity/Share/cards/ShareCardTransparentStreak.vue";
import ShareCardTransparentWorkout from "@/components/Activity/Share/cards/ShareCardTransparentWorkout.vue";
import ShareCardTransparentRoute from "@/components/Activity/Share/cards/ShareCardTransparentRoute.vue";
import ShareCardTransparentRouteMetrics from "@/components/Activity/Share/cards/ShareCardTransparentRouteMetrics.vue";
import ShareCardTransparentRouteRecord from "@/components/Activity/Share/cards/ShareCardTransparentRouteRecord.vue";
import ShareCardTransparentRouteInsight from "@/components/Activity/Share/cards/ShareCardTransparentRouteInsight.vue";
import ShareCardTransparentRouteInfo from "@/components/Activity/Share/cards/ShareCardTransparentRouteInfo.vue";
import ShareCardChallenge from "@/components/Activity/Share/cards/ShareCardChallenge.vue";
import ShareCardChallengeStreak from "@/components/Activity/Share/cards/ShareCardChallengeStreak.vue";
import ShareCardChallengePercent from "@/components/Activity/Share/cards/ShareCardChallengePercent.vue";
import ShareCardChallengeHighlight from "@/components/Activity/Share/cards/ShareCardChallengeHighlight.vue";
import ShareCardChallengeComplete from "@/components/Activity/Share/cards/ShareCardChallengeComplete.vue";

const isPremium = (activity: ActivityDetail) => activity.show_complete === true;

// "Destaques": the small curated set shown first — summary, first photo, map, PR highlight, AI insight
const buildHighlightsGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [];

  templates.push({ id: "summary", labelKey: "$vuetify.share.card_summary", component: ShareCardSummary, formats: ["feed", "story"] });

  if ((activity.files?.length ?? 0) > 0) {
    templates.push({ id: "photo-0", labelKey: "$vuetify.share.layout_data", component: ShareCardPhoto, formats: ["feed", "story"], props: { photoIndex: 0, layout: "data" } });
  }

  if (activity.map_picture) {
    templates.push({ id: "map", labelKey: "$vuetify.share.card_map", component: ShareCardMap, formats: ["feed", "story"] });
  }

  if (premium && (activity.analysis?.records?.filter((r) => r.is_pr)?.length ?? 0) > 0) {
    templates.push({ id: "records", labelKey: "$vuetify.share.card_records", component: ShareCardRecords, formats: ["feed", "story"] });
  }

  if (activity.insight) {
    templates.push({ id: "insights", labelKey: "$vuetify.share.card_insights", component: ShareCardInsights, formats: ["feed", "story"] });
  }

  return templates;
};

// "Fotos": one data-layout card per uploaded photo
const buildPhotosGroup = (activity: ActivityDetail): ShareTemplateDef[] =>
  (activity.files ?? []).map((_, index) => ({
    id: `photo-${index}`,
    labelKey: "$vuetify.share.layout_data",
    component: ShareCardPhoto,
    formats: ["feed", "story"],
    props: { photoIndex: index, layout: "data" },
  }));

// "IA": AI-derived cards (insight is available to everyone; predictions/next-goal are premium-only)
const buildAiGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [];

  if (activity.insight) {
    templates.push({ id: "insights", labelKey: "$vuetify.share.card_insights", component: ShareCardInsights, formats: ["feed", "story"] });
  }

  if (premium && (activity.analysis?.predictions?.items?.length ?? 0) > 0) {
    templates.push({ id: "predictions", labelKey: "$vuetify.share.card_predictions", component: ShareCardPredictions, formats: ["feed"] });
  }

  if (premium && activity.analysis?.next_goal) {
    templates.push({ id: "next_goal", labelKey: "$vuetify.share.card_next_goal", component: ShareCardNextGoal, formats: ["feed"] });
  }

  return templates;
};

// "Estatísticas": metric-heavy cards, most gated behind premium analysis
const buildStatsGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [];

  templates.push({ id: "summary", labelKey: "$vuetify.share.card_summary", component: ShareCardSummary, formats: ["feed", "story"] });

  if (activity.metrics) {
    templates.push({ id: "stats", labelKey: "$vuetify.share.card_stats", component: ShareCardStats, formats: ["feed"] });
  }

  if ((activity.metrics?.splits?.length ?? 0) >= 2) {
    templates.push({ id: "splits", labelKey: "$vuetify.share.card_splits", component: ShareCardSplits, formats: ["feed"] });
  }

  if (activity.map_picture) {
    templates.push({ id: "map", labelKey: "$vuetify.share.card_map", component: ShareCardMap, formats: ["feed", "story"] });
  }

  if (premium && activity.analysis?.training_load) {
    templates.push({ id: "training_load", labelKey: "$vuetify.share.card_training_load", component: ShareCardTrainingLoad, formats: ["feed"] });
  }

  if (premium && activity.analysis?.efficiency) {
    templates.push({ id: "efficiency", labelKey: "$vuetify.share.card_efficiency", component: ShareCardEfficiency, formats: ["feed"] });
  }

  if (premium && (activity.analysis?.compared_to_you?.periods?.filter((p) => p.available)?.length ?? 0) > 0) {
    templates.push({ id: "comparison", labelKey: "$vuetify.share.card_comparison", component: ShareCardComparison, formats: ["feed"] });
  }

  if (premium && ((activity.analysis?.evolution?.length ?? 0) > 0 || activity.analysis?.score)) {
    templates.push({ id: "evolution", labelKey: "$vuetify.share.card_evolution", component: ShareCardEvolution, formats: ["feed"] });
  }

  if (activity.weather) {
    templates.push({ id: "weather", labelKey: "$vuetify.share.card_weather", component: ShareCardWeather, formats: ["feed"] });
  }

  if (premium && (activity.analysis?.recommendations?.length ?? 0) > 0) {
    templates.push({ id: "recommendations", labelKey: "$vuetify.share.card_recommendations", component: ShareCardRecommendations, formats: ["feed"] });
  }

  return templates;
};

// "Recordes": premium-only — one summary card plus one card per broken PR
const buildRecordsGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  if (!premium) return [];

  const prs = (activity.analysis?.records ?? []).filter((r) => r.is_pr);
  if (!prs.length) return [];

  const templates: ShareTemplateDef[] = [
    { id: "records", labelKey: "$vuetify.share.card_records", component: ShareCardRecords, formats: ["feed", "story"] },
  ];

  for (const record of prs) {
    templates.push({
      id: `pr-${record.title_key}`,
      labelKey: "$vuetify.share.card_pr",
      component: ShareCardRecordSingle,
      formats: ["feed", "story"],
      props: { recordKey: record.title_key },
    });
  }

  return templates;
};

// "Treino": TRAINING-only cards, not premium-gated
const buildWorkoutGroup = (activity: ActivityDetail): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [
    { id: "workout", labelKey: "$vuetify.share.card_workout", component: ShareCardWorkout, formats: ["feed", "story"] },
  ];

  if (activity.equipment) {
    templates.push({ id: "equipment", labelKey: "$vuetify.share.card_equipment", component: ShareCardEquipment, formats: ["feed"] });
  }

  if (activity.analysis?.recovery) {
    templates.push({ id: "recovery", labelKey: "$vuetify.share.card_recovery", component: ShareCardRecovery, formats: ["feed"] });
  }

  if ((activity.training_analysis?.volume?.muscles_worked?.length ?? 0) > 0) {
    templates.push({ id: "workout_volume", labelKey: "$vuetify.share.card_workout_volume", component: ShareCardWorkoutVolume, formats: ["feed"] });
  }

  if ((activity.training_analysis?.highlights?.length ?? 0) > 0) {
    templates.push({ id: "workout_highlights", labelKey: "$vuetify.share.card_workout_highlights", component: ShareCardWorkoutHighlights, formats: ["feed"] });
  }

  if ((activity.exercises?.length ?? 0) > 0) {
    templates.push({ id: "workout_sets", labelKey: "$vuetify.share.card_workout_sets", component: ShareCardWorkoutSets, formats: ["feed"] });
  }

  return templates;
};

// "Transparentes": single-metric story-style overlay cards (mostly ungated; record/goal need premium data)
const buildTransparentGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [];

  const hasMetrics = !!activity.metrics;
  const hasPace = !!activity.metrics?.avg_pace;
  const hasDistance = !!activity.metrics?.distance_meters;
  const hasPrRecord = premium && (activity.analysis?.records?.filter((r) => r.is_pr)?.length ?? 0) > 0;
  const hasInsight = !!activity.insight;
  const hasNextGoal = premium && !!activity.analysis?.next_goal;
  const hasStreak = (activity.challenge_analysis?.streak ?? 0) > 1 ||
    (activity.training_analysis?.consistency?.streak ?? 0) > 1 ||
    (activity.analysis?.consistency?.streak ?? 0) > 1;
  const isTraining = activity.type === "TRAINING";

  if (hasDistance) templates.push({ id: "transparent-distance", labelKey: "$vuetify.share.transparent_distance", component: ShareCardTransparentDistance, formats: ["feed", "story"], transparent: true });
  if (hasMetrics) templates.push({ id: "transparent-metrics", labelKey: "$vuetify.share.transparent_metrics", component: ShareCardTransparentMetrics, formats: ["feed", "story"], transparent: true });
  if (hasPace) templates.push({ id: "transparent-pace", labelKey: "$vuetify.share.transparent_pace", component: ShareCardTransparentPace, formats: ["feed", "story"], transparent: true });
  if (hasPrRecord) templates.push({ id: "transparent-record", labelKey: "$vuetify.share.transparent_record", component: ShareCardTransparentRecord, formats: ["feed", "story"], transparent: true });
  if (hasInsight) templates.push({ id: "transparent-insight", labelKey: "$vuetify.share.transparent_insight", component: ShareCardTransparentInsight, formats: ["feed", "story"], transparent: true });
  if (hasNextGoal) templates.push({ id: "transparent-goal", labelKey: "$vuetify.share.transparent_goal", component: ShareCardTransparentGoal, formats: ["feed", "story"], transparent: true });
  if (hasStreak) templates.push({ id: "transparent-streak", labelKey: "$vuetify.share.transparent_streak", component: ShareCardTransparentStreak, formats: ["feed", "story"], transparent: true });
  if (isTraining) templates.push({ id: "transparent-workout", labelKey: "$vuetify.share.transparent_workout", component: ShareCardTransparentWorkout, formats: ["feed", "story"], transparent: true });

  return templates;
};

// "Trajeto": route-line overlay cards, only offered when GPS elevation-stream points exist
const buildRouteGroup = (activity: ActivityDetail, premium: boolean): ShareTemplateDef[] => {
  const hasPrRecord = premium && (activity.analysis?.records?.filter((r) => r.is_pr)?.length ?? 0) > 0;
  const hasInsight = !!activity.insight;
  const hasMetrics = !!activity.metrics;

  const templates: ShareTemplateDef[] = [
    { id: "route", labelKey: "$vuetify.share.route_card", component: ShareCardTransparentRoute, formats: ["feed", "story"], transparent: true },
  ];

  if (hasMetrics) templates.push({ id: "route-metrics", labelKey: "$vuetify.share.route_metrics", component: ShareCardTransparentRouteMetrics, formats: ["feed", "story"], transparent: true });
  if (hasPrRecord) templates.push({ id: "route-record", labelKey: "$vuetify.share.route_record", component: ShareCardTransparentRouteRecord, formats: ["feed", "story"], transparent: true });
  if (hasInsight) templates.push({ id: "route-insight", labelKey: "$vuetify.share.route_insight", component: ShareCardTransparentRouteInsight, formats: ["feed", "story"], transparent: true });
  templates.push({ id: "route-info", labelKey: "$vuetify.share.route_info", component: ShareCardTransparentRouteInfo, formats: ["feed", "story"], transparent: true });

  return templates;
};

// "Desafio": CHALLENGE-only cards, not premium-gated
const buildChallengeGroup = (activity: ActivityDetail): ShareTemplateDef[] => {
  const templates: ShareTemplateDef[] = [
    { id: "challenge", labelKey: "$vuetify.share.card_challenge", component: ShareCardChallenge, formats: ["feed", "story"] },
  ];

  if ((activity.challenge_analysis?.streak ?? 0) >= 2) {
    templates.push({ id: "challenge_streak", labelKey: "$vuetify.share.card_challenge_streak", component: ShareCardChallengeStreak, formats: ["feed", "story"] });
  }

  if (activity.challenge_plan_progress) {
    templates.push({ id: "challenge_percent", labelKey: "$vuetify.share.card_challenge_percent", component: ShareCardChallengePercent, formats: ["feed"] });
  }

  if ((activity.challenge_analysis?.coach_bullets?.length ?? 0) > 0) {
    templates.push({ id: "challenge_highlight", labelKey: "$vuetify.share.card_challenge_highlight", component: ShareCardChallengeHighlight, formats: ["feed"] });
  }

  if ((activity.challenge_plan_progress?.percentage ?? 0) >= 100) {
    templates.push({ id: "challenge_complete", labelKey: "$vuetify.share.card_challenge_complete", component: ShareCardChallengeComplete, formats: ["feed", "story"] });
  }

  return templates;
};

// Builds every offered template group for this activity, gating premium-only cards by
// the OWNER's show_complete (never the viewer's own subscription — see feed-activity-posts spec)
export const ShareTemplateProvider = (activity: ActivityDetail, routePoints?: unknown[]): ShareTemplateGroupDef[] => {
  const groups: ShareTemplateGroupDef[] = [];
  const premium = isPremium(activity);

  const highlights = buildHighlightsGroup(activity, premium);
  if (highlights.length) groups.push({ id: "highlights", labelKey: "$vuetify.share.group_highlights", templates: highlights });

  const photos = buildPhotosGroup(activity);
  if (photos.length) groups.push({ id: "photos", labelKey: "$vuetify.share.group_photos", templates: photos });

  const ai = buildAiGroup(activity, premium);
  if (ai.length) groups.push({ id: "ai", labelKey: "$vuetify.share.group_ai", templates: ai });

  const stats = buildStatsGroup(activity, premium);
  if (stats.length) groups.push({ id: "stats", labelKey: "$vuetify.share.group_stats", templates: stats });

  const records = buildRecordsGroup(activity, premium);
  if (records.length) groups.push({ id: "records", labelKey: "$vuetify.share.group_records", templates: records });

  const transparent = buildTransparentGroup(activity, premium);
  if (transparent.length) groups.push({ id: "transparent", labelKey: "$vuetify.share.group_transparent", templates: transparent });

  if ((routePoints?.length ?? 0) > 0) {
    const route = buildRouteGroup(activity, premium);
    if (route.length) groups.push({ id: "route", labelKey: "$vuetify.share.group_route", templates: route });
  }

  if (activity.type === "TRAINING") {
    const workout = buildWorkoutGroup(activity);
    if (workout.length) groups.push({ id: "workout", labelKey: "$vuetify.share.group_workout", templates: workout });
  }

  if (activity.type === "CHALLENGE") {
    const challenge = buildChallengeGroup(activity);
    if (challenge.length) groups.push({ id: "challenge", labelKey: "$vuetify.share.group_challenge", templates: challenge });
  }

  return groups;
};

// All image URLs referenced across templates, used to pre-resolve/proxy them before rendering
export const getAllTemplateImages = (activity: ActivityDetail): string[] => {
  const images: string[] = [];
  if (activity.map_picture) images.push(activity.map_picture);
  if (activity.account.image) images.push(activity.account.image);
  for (const file of activity.files ?? []) {
    if (file.url) images.push(file.url);
  }
  return images;
};