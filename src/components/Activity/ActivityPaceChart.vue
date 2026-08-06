<template>
  <div :style="{ height: '200px', width: '100%' }">
    <Chart type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { Chart } from "vue-chartjs";
import { RunningMetricsService } from "@/services/running-metrics.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  LineController,
  BarController,
} from "chart.js";
import { type Activity } from "@/types/activity.type";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  LineController,
  BarController,
);

/// DATA
const { t } = useLocale();
const props = defineProps<{ splits: NonNullable<Activity["metrics"]>["splits"] }>();
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      reverse: true,
      ticks: {
        color: "rgba(255, 255, 255, 0.5)",
        callback: (value: number) => formatPace(value),
        maxTicksLimit: 5,
      },
      grid: { color: "rgba(255, 255, 255, 0.05)" },
      border: { display: false },
    },
    x: {
      ticks: { color: "rgba(255, 255, 255, 0.5)" },
      grid: { display: false },
      border: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => `${formatPace(ctx.parsed.y)}/${t("$vuetify.label.km")}`.toLowerCase(),
      },
    },
  },
} as any;

/// COMPUTED
const avgPace = computed(() => {
  if (!props.splits.length) return 0;
  return props.splits.reduce((sum, s) => sum + s.duration_seconds, 0) / props.splits.length;
});

const chartData = computed(() => {
  const blue = getComputedStyle(document.documentElement).getPropertyValue("--blue");

  return {
    labels: props.splits.map((s) => `${s.km}`),
    datasets: [
      {
        type: "bar" as const,
        data: props.splits.map((s) => s.duration_seconds),
        backgroundColor: `${blue}CC`,
        borderRadius: 4,
        borderSkipped: false,
        order: 2,
      },
      {
        type: "line" as const,
        data: props.splits.map(() => avgPace.value),
        borderColor: "rgba(255, 255, 255, 0.45)",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0,
        order: 1,
      },
    ],
  };
});

/// METHODS
const formatPace = (seconds: number) => RunningMetricsService.formatPace(seconds);
</script>