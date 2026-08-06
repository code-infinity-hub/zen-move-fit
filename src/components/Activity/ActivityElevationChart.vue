<template>
  <div :style="{ height: '160px', width: '100%' }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { Line } from "vue-chartjs";
import { useFormatNumber } from "@/composables";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface ElevationPoint {
  distance: number,
  elevation: number,
};

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<{ stream: ElevationPoint[] }>();
const SAMPLE_SIZE = 100;

/// COMPUTED
const sampled = computed(() => {
  if (props.stream.length <= SAMPLE_SIZE) return props.stream;
  const step = Math.floor(props.stream.length / SAMPLE_SIZE);
  return props.stream.filter((_, i) => i % step === 0);
});
const chartData = computed(() => {
  const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();

  return {
    labels: sampled.value.map((p) => `${formatNumber(p.distance / 1000)}${t("$vuetify.label.km")}`.toLowerCase()),
    datasets: [{
      data: sampled.value.map((p) => p.elevation),
      borderColor: orange,
      backgroundColor: `${orange}22`,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        color: "rgba(255, 255, 255, 0.6)",
        callback: (value: number) => `${formatNumber(value)}${t("$vuetify.label.meters_abbreviation")}`,
      },
      grid: { color: "rgba(255, 255, 255, 0.05)" },
    },
    x: {
      ticks: {
        color: "rgba(255, 255, 255, 0.6)",
        maxTicksLimit: 6,
      },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => `${formatNumber(ctx.parsed.y)}${t("$vuetify.label.meters_abbreviation")}`,
      },
    },
  },
} as any;
</script>