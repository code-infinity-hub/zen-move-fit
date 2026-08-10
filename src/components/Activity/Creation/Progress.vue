<template>
  <div
    id="progress-activity"
    class="w-100 h-100 d-flex flex-column justify-end"
    :style="{ backgroundColor: `var(--${mapLoaded ? 'map_background' : 'tertiary'})` }"
  >
    <div
      ref="map-content"
      class="w-100 position-absolute top-0"
    >
      <div
        id="map"
        class="w-100 h-100"
        v-show="mapLoaded"
      ></div>

      <div
        v-if="!mapLoaded"
        class="w-100 h-100 position-absolute top-0 bg-tertiary d-flex justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="50"
        />
      </div>

      <div
        class="recenter bg-secondary pa-2 rounded-xl d-flex justify-center align-center text-body-2"
        :style="{ bottom: recenterBottom }"
        v-else-if="recenter"
        @click="recenterMap"
      >
        <v-icon color="white" :size="30">
          mdi-crosshairs-gps
        </v-icon>
      </div>
    </div>

    <header
      v-if="mapLoaded"
      class="position-absolute w-100 d-flex flex-column ga-2"
    >
      <div
        v-if="divInformation"
        :style="{ paddingTop: 'calc(var(--top-saved) + 0.3rem)', paddingBottom: '0.3rem', zIndex: '1000' }"
        :class="['text-center', divInformation.class]"
      >
        <v-icon class="mr-1">
          {{ divInformation.icon }}
        </v-icon>

        {{ divInformation.title }}
      </div>

      <div
        v-if="!isRunning"
        :style="{ marginTop: divInformation ? '0px' : 'var(--top-saved)' }"
        class="px-1"
      >
        <div
          @click="bottomSheet.cancel = true"
          class="close bg-secondary pa-2 rounded-xl d-flex justify-center align-center text-body-2"
        >
          <v-icon color="white">
            mdi-chevron-left
          </v-icon>
        </div>
      </div>
    </header>

    <Motion
      :animate="{ height: expanded ? '100%' : 'auto' }"
      :transition="transition"
      class="d-flex justify-center content-resumed"
    >
      <AnimatePresence mode="wait">
        <Motion
          v-if="!expanded"
          :animate="{
            borderTopRightRadius: expanded ? 0 : 24,
            borderTopLeftRadius: expanded ? 0 : 24,
            border: '2px solid var(--tertiary)',
            borderBottomWidth: '0px',
            paddingBottom: 'calc(var(--bottom-saved) + 12px) !important'
          }"
          :transition="transition"
          key="stopped"
          ref="content"
          class="w-100 px-3 py-3 bg-secondary content"
        >
          <div
            v-if="mapLoaded"
            class="d-flex justify-space-between mb-5"
          >
            <v-icon :style="{ visibility: 'hidden' }">
              mdi-arrow-expand
            </v-icon>

            <div
              class="text-h6 font-weight-bold d-flex align-center ga-2"
              @click="bottomSheet.category = !isRunning"
            >
              <v-icon :size="22">
                {{ categorySelection.icon }}
              </v-icon>

              <span>
                {{ categorySelection.label }}
              </span>

              <v-icon
                v-if="!isRunning && !continuation"
                :size="22"
              >mdi-chevron-down</v-icon>
            </div>

            <v-icon
              :style="{ visibility: isRunning ? 'visible' : 'hidden' }"
              @click="expanded = !expanded"
            >mdi-arrow-expand</v-icon>
          </div>

          <v-row class="mb-4">
            <v-col cols="4" sm="4" md="4" lg="4">
              <v-skeleton-loader
                type="text"
                :loading="!mapLoaded"
              >
                <div class="d-flex flex-column align-center">
                  <p class="text-h6 font-weight-bold mb-1 text-center">
                    {{ formatTime(activity.duration_seconds) }}
                  </p>

                  <p class="text-body-1 text-center text-grey-lighten-1">
                    {{ t("$vuetify.label.time") }}
                  </p>
                </div>
              </v-skeleton-loader>
            </v-col>

            <v-col cols="4" sm="4" md="4" lg="4">
              <v-skeleton-loader
                type="text"
                :loading="!mapLoaded"
              >
                <div class="d-flex flex-column align-center">
                  <p class="text-h6 font-weight-bold mb-1 text-center">
                    {{ distance }}

                    <span class="text-body-2">
                      {{ t("$vuetify.label.km") }}
                    </span>
                  </p>

                  <p class="text-body-1 text-center text-grey-lighten-1">
                    {{ t("$vuetify.label.distance") }}
                  </p>
                </div>
              </v-skeleton-loader>
            </v-col>

            <v-col cols="4" sm="4" md="4" lg="4">
              <v-skeleton-loader
                type="text"
                :loading="!mapLoaded"
              >
                <div class="d-flex flex-column align-center">
                  <p class="text-h6 font-weight-bold mb-1 text-center">
                    {{ rhythm }}
                  </p>

                  <p class="text-body-1 text-center text-grey-lighten-1">
                    {{ t("$vuetify.label.rhythm") }}
                  </p>
                </div>
              </v-skeleton-loader>
            </v-col>
          </v-row>

          <div class="d-flex ga-3 mb-5">
            <v-skeleton-loader
              type="text"
              :width="80"
              :loading="!mapLoaded"
            >
              <div class="bg-tertiary px-4 py-2 rounded-xl">
                <v-icon color="primary" class="mr-1">
                  mdi-map-marker
                </v-icon>

                <span>
                  {{ `${formatNumber(precision)} ${t("$vuetify.label.meters_abbreviation")}` }}
                </span>
              </div>
            </v-skeleton-loader>

            <v-skeleton-loader
              type="text"
              :width="80"
              :loading="!mapLoaded"
            >
              <div class="bg-tertiary px-4 py-2 rounded-xl">
                <v-icon color="primary" class="mr-1">
                  {{ iconBattery }}
                </v-icon>

                <span>
                  {{ formatNumber(battery * 100, "percent", 0) }}
                </span>
              </div>
            </v-skeleton-loader>
          </div>

          <v-skeleton-loader
            type="text"
            class="mb-5"
            :loading="!mapLoaded"
          >
            <div class="mb-5 d-flex ga-3 justify-center align-center pa-4 bg-tertiary rounded-xl">
              <div class="size-3rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
                <v-icon color="primary">
                  mdi-account-multiple-outline
                </v-icon>
              </div>

              <div class="flex-fill">
                <p class="d-flex align-center font-weight-bold">
                  {{ t("$vuetify.label.share_ride") }}

                  <v-icon
                    :size="18"
                    color="grey-lighten-1"
                    class="ml-1"
                    @click="bottomSheet.share_ride = true"
                  >mdi-information-outline</v-icon>
                </p>

                <p class="text-body-2 text-grey-lighten-1">
                  {{ t("$vuetify.message.detect_nearby_runners") }}
                </p>
              </div>

              <div>
                <v-switch
                  inset
                  :disabled="isRunning"
                  hide-details="auto"
                  color="primary"
                  v-model="detectNearbyRunners"
                />
              </div>
            </div>
          </v-skeleton-loader>

          <v-skeleton-loader
            type="text"
            :loading="!mapLoaded"
          >
            <v-btn
              v-if="!isRunning"
              block
              color="primary"
              class="text-black font-weight-bold text-none pa-7 text-h6"
              @click="startActivity(false)"
            >
              <v-icon color="black" class="mr-1">
                mdi-play
              </v-icon>

              {{ t("$vuetify.label.start_running") }}
            </v-btn>
            <v-btn
              v-else-if="!paused"
              block
              variant="tonal"
              color="primary"
              class="font-weight-bold text-none pa-7 text-h6"
              @click="paused = !paused"
            >
              <v-icon class="mr-1">
                mdi-pause
              </v-icon>

              {{ t("$vuetify.label.pause") }}
            </v-btn>
            <div
              v-else
              class="d-flex justify-center align-center ga-2"
            >
              <v-btn
                color="primary"
                class="flex-fill font-weight-bold text-none text-black pa-7 text-h6 d-flex"
                @click="paused = !paused"
              >
                <v-icon class="mr-1">mdi-play</v-icon>
                {{ t("$vuetify.label.resume") }}
              </v-btn>

              <v-btn
                variant="tonal"
                color="primary"
                class="flex-fill font-weight-bold text-none pa-7 text-h6 d-flex"
                @click="finish"
              >
                <v-icon class="mr-1">mdi-stop</v-icon>
                {{ t("$vuetify.label.finish") }}
              </v-btn>
            </div>
          </v-skeleton-loader>
        </Motion>
        <Motion
          v-else
          :animate="{
            borderTopRightRadius: expanded ? 0 : 24,
            borderTopLeftRadius: expanded ? 0 : 24,
          }"
          :transition="transition"
          key="running"
          class="w-100 bg-secondary"
        >
          <AnimatePresence>
            <Motion
              v-if="visible"
              class="overlay"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 0.5 }"
              :exit="{ opacity: 0 }"
            >
              <Motion
                class="count-text"
                :key="count"
                :initial="{ scale: 0.4, opacity: 0 }"
                :animate="{ scale: 1, opacity: 1 }"
                :exit="{ scale: 2, opacity: 0 }"
                :transition="{ duration: 0.35 }"
              >{{ countText }}</Motion>
            </Motion>
          </AnimatePresence>

          <div
            v-if="started"
            class="w-100 h-100 d-flex flex-column overflow-hidden position-relative top-0 left-0"
            :style="{ paddingBottom: 'var(--bottom-saved)' }"
          >
            <div
              :style="{ height: 'var(--top-saved)', backgroundColor: paused ? 'var(--yellow)' : '' }"
            ></div>

            <div class="flex-fill d-flex flex-column align-center pb-4 overflow-y-auto">
              <div
                v-if="paused"
                class="w-100 pa-2 bg-yellow"
              >
                <div class="d-flex justify-end">
                  <v-icon
                    color="black"
                    @click="collapse"
                  >mdi-arrow-collapse</v-icon>
                </div>

                <div class="mt-2 text-black font-weight-bold text-center text-h6">
                  {{ t("$vuetify.label.activity_paused") }}
                </div>
              </div>

              <div class="d-flex flex-column justify-center align-center text-center px-2 mb-8 w-100">
                <div
                  v-if="!paused"
                  class="mt-2 w-100 d-flex justify-end"
                >
                  <v-icon
                    color="white"
                    @click="collapse"
                  >mdi-arrow-collapse</v-icon>
                </div>

                <p class="mt-4 text-body-2 text-grey-lighten-1 mb-2 font-weight-bold text-uppercase">
                  {{ t("$vuetify.label.time") }}
                </p>

                <p class="text-h2 font-weight-bold font-space-grotesk">
                  {{ time }}
                </p>
              </div>

              <div class="w-100 px-2 d-flex flex-column align-center ga-2">
                <div class="w-100 d-flex ga-2">
                  <div class="bg-tertiary pa-2 rounded-lg d-flex flex-column justify-center align-center py-3 w-50">
                    <p class="text-grey-lighten-1 text-body-2 mb-1 text-center">
                      {{ t("$vuetify.label.pace") }}
                    </p>

                    <p class="font-weight-bold text-h6 text-center">
                      {{ rhythm }}
                    </p>
                  </div>

                  <div class="bg-tertiary pa-2 rounded-lg d-flex flex-column justify-center align-center py-3 w-50">
                    <p class="text-grey-lighten-1 text-body-2 mb-1 text-center">
                      {{ t("$vuetify.label.distance") }}
                    </p>

                    <p class="font-weight-bold text-h6 text-center text-lowercase">
                      {{ `${distance} ${t("$vuetify.label.km")}` }}
                    </p>
                  </div>
                </div>

                <div class="w-100 d-flex ga-2">
                  <div class="bg-tertiary pa-2 rounded-lg d-flex flex-column justify-center align-center py-3 w-50">
                    <p class="text-grey-lighten-1 text-body-2 mb-1 text-center">
                      {{ t("$vuetify.label.calories") }}
                    </p>

                    <p class="font-weight-bold text-h6 text-center">
                      {{ calories }}
                    </p>
                  </div>

                  <div class="bg-tertiary pa-2 rounded-lg d-flex flex-column justify-center align-center py-3 w-50">
                    <p class="text-grey-lighten-1 text-body-2 mb-1 text-center">
                      {{ t("$vuetify.label.avg_speed") }}
                    </p>

                    <p class="font-weight-bold text-h6 text-center">
                      {{ avg_speed }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="chartData.labels.length"
                class="w-100 mt-5 px-2"
              >
                <p class="font-weight-bold text-grey-lighten-1">
                  {{ t("$vuetify.label.splits_km") }}
                </p>

                <div :style="{ height: `${chartHeight}px` }">
                  <Bar
                    :data="chartData"
                    :options="options"
                  />
                </div>
              </div>
            </div>

            <div class="d-flex ga-2 justify-center align-center px-3 py-2">
              <v-btn
                v-if="!paused"
                block
                variant="tonal"
                color="primary"
                class="text-white font-weight-bold text-none pa-7 text-h6"
                @click="paused = !paused"
              >
                <v-icon class="mr-1">
                  mdi-pause
                </v-icon>

                {{ t("$vuetify.label.pause") }}
              </v-btn>
              <div
                v-else
                class="w-100 d-flex justify-center align-center ga-2"
              >
                <v-btn
                  color="primary"
                  class="flex-fill font-weight-bold text-none text-black pa-7 text-h6 d-flex"
                  @click="paused = !paused"
                >
                  <v-icon class="mr-1">mdi-play</v-icon>
                  {{ t("$vuetify.label.resume") }}
                </v-btn>

                <v-btn
                  variant="tonal"
                  color="primary"
                  class="flex-fill font-weight-bold text-none pa-7 text-h6 d-flex"
                  @click="finish"
                >
                  <v-icon class="mr-1">mdi-stop</v-icon>
                  {{ t("$vuetify.label.finish") }}
                </v-btn>
              </div>
            </div>
          </div>
        </Motion>
      </AnimatePresence>
    </Motion>

    <!-- PERMISSÃO DE GEOLOCALIZAÇÃO -->
    <PermissionGeolocation
      v-model="permissionGeolocation"
      :open-settings="openSettings"
    />

    <!-- EXPLICAÇÃO DE CORRIDA COMPARTILHADA -->
    <ShareRide
      v-model="bottomSheet.share_ride"
    />

    <!-- CANCELAR CORRIDA -->
    <CancelActivity
      v-model="bottomSheet.cancel"
      @cancel="cancel"
    />

    <!-- BOTTOMSHEET DE PRECISÃO DE GPS -->
    <GpsLowPrecision
      v-model="bottomSheet.gps_low_precision"
    />

    <!-- BOTTOMSHEET DE BATERIA BAIXA -->
    <BatteryLowCharge
      v-model="bottomSheet.battery_low_charge"
      @forced="startActivity(true);"
    />

    <!-- BOTTOMSHEET DE ECONOMIA DE ENERGIA ATIVADA -->
    <BatteryPowerSaveEnabled
      v-model="bottomSheet.power_save_mode"
      @forced="startActivity(true);"
    />

    <!-- BOTTOMSHEET DE ESCOLHER CATEGORIA -->
    <SelectCategory
      v-model="bottomSheet.category"
      :category="category"
      @update:category="(val) => category = val"
    />

    <!-- BOTTOM SHEET DE CONTINUAÇÃO DE ATIVIDADE -->
    <Continuation
      v-if="enableContinuation"
      v-model="bottomSheet.continuation"
      type="AVULSE"
      @continue="continueActivity"
      @discard="discardActivity"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import Utc from "dayjs/plugin/utc";
import Timezone from "dayjs/plugin/timezone";
import { v4 } from "uuid";
import { Bar } from "vue-chartjs";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { AnimatePresence, Motion } from "motion-v";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  Capacitor,
  CapacitorPedometer,
  CordovaNotifications,
  Device,
  Haptics,
  LocalNotifications,
  PowerMode,
  SystemBars, SystemBarType, SystemBarsStyle
} from "@/mobile";
import { useAccountsStore } from "@/stores/accounts";
import { useAppStore } from "@/stores/app";
import { GeolocationService } from "@/services/geolocation.service";
import { MapService } from "@/services/map.service";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { SensorsService } from "@/services/sensors.service";
import { useFormatNumber } from "@/composables/use-format-number.ts";
import { useLiveActivity } from "@/composables/use-live-activity";
import { getActivityDurationSeconds, detectSuspensionGap, date, mdiToSfSymbol } from "@/utils";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import type { Events } from "@/eventBus";
import type { Marker } from "maplibre-gl";
import type { Activity } from "@/types/activity.type";
import type { ActivitiesCategories, LocationPoint, RunningMetricsCheckpoint, RunningRealtimeMetrics } from "@/types/global.type";

dayjs.extend(Utc);
dayjs.extend(Timezone);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// JSON
import activitesCategories from "@/json/activities-categories.json";

// COMPONENTS
import PermissionGeolocation from "@/components/Permissions/Geolocation.vue";
import ShareRide from "./ShareRide.vue";
import CancelActivity from "@/components/Activity/Cancel.vue";
import BatteryPowerSaveEnabled from "./BatteryPowerSaveEnabled.vue";
import BatteryLowCharge from "./BatteryLowCharge.vue";
import GpsLowPrecision from "./GpsLowPrecision.vue";
import SelectCategory from "./SelectCategory.vue";
import Continuation from "../Continuation.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { formatTime } = date();
const emit = defineEmits(["finish"]);
const route = useRoute();
const router = useRouter();
const persistentSession = usePersistentSession();
const accountsStore = useAccountsStore();
const appStore = useAppStore();
const mapLoaded = ref(true);
const recenter = ref(false);

const isMobile = ref(false);
const hasNotificationPermission = ref(false);
const hasCreatedNotification = ref(false);
const notificationId = ref(0);
let isCreatingNotification = false;

const bottomSheet = reactive({
  cancel: false,
  category: false,
  share_ride: false,
  gps_low_precision: false,
  battery_low_charge: false,
  power_save_mode: false,
  continuation: false
});

const sensorsService = new SensorsService();

let interval: null | number = null;

const category = ref<ActivitiesCategories>("RUNNING");
const activity = ref<Activity>({
  _id: v4(),
  timezone: "",
  date_completed: "",
  duration_seconds: 0,
  calories: 0,
  started_at: "",
  ended_at: "",
  type: "AVULSE",
  status: "PENDING",
  category: "RUNNING",
  pauses: [],
  exercises: [],
  from_coords: { lat: 0, lng: 0 },
  detect_nearby_runners: false
});

const divInformation = ref<null | { class: string, icon: string, title: string }>(null);
const showedGoodSignal = ref(false);
const precision = ref(0);
const battery = ref(0);
const position = { lat: 0, lng: 0 };
let timeoutDivInformation: null | number = null;

const mapContent = useTemplateRef("map-content");
const contentDiv = useTemplateRef("content");
const recenterBottom = ref("36px");
let panelResizeObserver: ResizeObserver | null = null;

const detectNearbyRunners = ref(false);

const permissionGeolocation = ref(false);
const openSettings = ref(false);

const mapService = new MapService();
const geolocationService = new GeolocationService();
const liveActivity = useLiveActivity();
let runningService: RunningMetricsService;
let userMarker: Marker;

const isRunning = ref(false);
const expanded = ref(false);
const hasAnimated = ref(false);
const count = ref(3);
const visible = ref(true);
const started = ref(false);
const finished = ref(false);
let timer: null | number = null;

const realtime = ref<RunningRealtimeMetrics | null>(null);

const paused = ref(false);

const createdPointStart = ref(false);

const enableContinuation = ref(false);
const continuation = ref(false);
const coords = ref<LocationPoint[]>([]);

const root = document.documentElement;

const mapContentOverlap = 20;
const recenterGapAbovePanel = 24;

/// COMPUTED
const account = computed(() => accountsStore.account);
const time = computed(() => formatTime(activity.value.duration_seconds, true));
const distance = computed(() => formatNumber((realtime.value?.distance || 0) / 1000));
const rhythm = computed(() => RunningMetricsService.formatPace(realtime.value?.realtimePace || 0));
const calories = computed(() => formatNumber(realtime.value?.calories || 0));
const avg_speed = computed(() => `${formatNumber(realtime.value?.avgSpeed || 0)} ${t("$vuetify.label.km_h")}`);
const dateNow = computed(() => dayjs().tz(timezone.value).format("YYYY-MM-DD"));
const kcal = computed(() => realtime.value?.calories || 0);
const countText = computed(() => count.value === 0 ? "GO!" : count.value);
const timezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
const inProgress = computed(() => started.value && !finished.value);
const iconBattery = computed(() => {
  const charge = battery.value * 100;
  if (charge <= 10) return "mdi-battery-10";
  else if (charge > 10 && charge <= 20) return "mdi-battery-20";
  else if (charge > 20 && charge <= 30) return "mdi-battery-30";
  else if (charge > 30 && charge <= 40) return "mdi-battery-40";
  else if (charge > 40 && charge <= 50) return "mdi-battery-50";
  else if (charge > 50 && charge <= 60) return "mdi-battery-60";
  else if (charge > 60 && charge <= 70) return "mdi-battery-70";
  else if (charge > 70 && charge <= 80) return "mdi-battery-80";
  else if (charge > 80 && charge <= 90) return "mdi-battery-90";
  return "mdi-battery";
});
const listCategories = computed(() => {
  return activitesCategories.map((item) => ({
    ...item,
    type: item.type as ActivitiesCategories,
    label: t(`$vuetify.label.${item.type.toLowerCase()}`)
  }))
});
const categorySelection = computed(() => listCategories.value.find((a) => a.type === category.value)!);
const chartHeight = computed(() => {
  const total = splitChartData.value.length || 1;
  return Math.max(90, total * 52);
});
const options = computed(() => ({
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111111",
      borderColor: "#333333",
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        title(items: any) {
          const index = items[0].dataIndex;
          return splitChartData.value[index]?.originalLabel;
        },
        label(context: any) {
          return context.label;
        },
      },
    },
  },
  scales: {
    x: {
      display: false,
      min: 0,
      max: 100,
      grid: { display: false, drawBorder: false },
      border: { display: false },
    },
    y: {
      grid: { display: false, drawBorder: false },
      border: { display: false },
      ticks: {
        color: "#999999",
        font: { size: 14, weight: 600 },
      },
    },
  },
  elements: {
    bar: { borderRadius: 999 },
  },
}) as any);
const splitChartData = computed(() => {
  const splits = realtime.value?.splits || [];

  // Ainda não completou split
  const currentPace = realtime.value?.realtimePace || 0;

  const data = [
    ...splits.map((split, index) => ({
      label: `${t("$vuetify.label.km").toLowerCase()} ${index + 1}`,
      formatted: RunningMetricsService.formatPace(split.pace),
      seconds: split.pace,
      completed: true,
    })),
  ];

  // Split atual
  if (currentPace > 0) {
    data.push({
      label: `${t("$vuetify.label.km").toLowerCase()} ${splits.length + 1}`,
      formatted: RunningMetricsService.formatPace(currentPace),
      seconds: currentPace,
      completed: false,
    });
  }

  // Sem dados
  if (!data.length) return [];

  // Range
  const values = data.map((item) => item.seconds);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return data.map((item) => {
    // Pace menor = melhor
    const normalized = (max - item.seconds) / ((max - min) || 1);

    // Largura estilo strava
    const width = 55 + (normalized * 45);

    return {
      label: item.formatted,
      value: Number(width.toFixed(2)),
      originalLabel: item.label,
      completed: item.completed,
    };
  });
});
const chartData = computed(() => {
  return {
    labels: splitChartData.value.map((item) => item.label),
    datasets: [{
      data: splitChartData.value.map((item) => item.value),
      backgroundColor: splitChartData.value.map((item) =>
        item.completed ?
          getComputedStyle(root).getPropertyValue("--blue") :
          getComputedStyle(root).getPropertyValue("--primary")
      ),
      borderRadius: 999,
      borderSkipped: false,
      categoryPercentage: 0.7,
      barPercentage: 1,
      maxBarThickness: 32,
      minBarLength: 12,
    }],
  };
});
const transition = computed(() => {
  if (hasAnimated.value) {
    return {
      type: "spring" as const,
      stiffness: 120,
      damping: 18
    };
  }

  return { duration: 0 };
});

/// WATCH
watch(paused, async (val) => {
  if (val) {
    activity.value.pauses.push({
      started_at: dayjs().toISOString(),
      ended_at: "",
    });
  } else {
    const pause = activity.value.pauses.find((p) => !p.ended_at)!;
    pause.ended_at = dayjs().toISOString();
  }

  if (inProgress.value) {
    if (started.value) await persistentSession.set("paused", String(Number(val)));
    togglePaused();
  }
});

watch(activity, async (val) => {
  if (started.value) await persistentSession.set("activity", JSON.stringify(val));
}, { deep: true });

watch(() => appStore.foreground, async (val) => {
  if (val && inProgress.value) await checkSuspensionGap(dayjs().toISOString());
});

watch(notificationId, async (val) => {
  if (started.value) await persistentSession.set("notification-id", String(val));
});

watch(permissionGeolocation, async (val) => {
  if (!val) {
    const geolocationPermission = await geolocationService.checkPermissions();

    if (geolocationPermission === "granted") {
      startMap();
    } else {
      eventBus.emit("BACK_ROUTER");
    }
  }
});

watch(detectNearbyRunners, async (val) => {
  if (val) {
    const show = await persistentSession.get("showed_explanation_share_ride");

    if (!show) {
      bottomSheet.share_ride = true;
      await persistentSession.set("showed_explanation_share_ride", "true");
    }
  }
});

watch(contentDiv, () => bindPanelResizeObserver());

watch([isRunning, recenter], () => nextTick(() => bindPanelResizeObserver()));

watch(precision, (val) => {
  if (!started.value) {
    if (val > 15) {
      divInformation.value = {
        class: "bg-error text-white",
        icon: "mdi-signal-cellular-1",
        title: t("$vuetify.label.low_gps_accuracy")
      };

      if (timeoutDivInformation !== null) {
        clearTimeout(timeoutDivInformation);
        timeoutDivInformation = null;
      }

      showedGoodSignal.value = false;
    } else if (val <= 15 && !showedGoodSignal.value) {
      divInformation.value = {
        class: "bg-success text-white",
        icon: "mdi-signal",
        title: t("$vuetify.label.high_gps_accuracy")
      };

      timeoutDivInformation = setTimeout(() => {
        divInformation.value = null;
        showedGoodSignal.value = true;
      }, 3000);
    }
  }
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);

  eventBus.emit("SNACKBAR", {
    icon: "mdi-information",
    message: t("$vuetify.message.getting_a_gps_signal")
  });

  setTimeout(async () => {
    bindPanelResizeObserver();
    recenterBottom.value = `${mapContentOverlap + recenterGapAbovePanel}px`;

    mapLoaded.value = false;

    const geolocationPermission = await geolocationService.checkPermissions();

    if (geolocationPermission === "prompt" || geolocationPermission === "denied") {
      if (geolocationPermission === "denied") openSettings.value = true;
      permissionGeolocation.value = true;
    } else if (geolocationPermission === "granted") {
      startMap();
    }

    await accountsStore.GET_ACCOUNT();

    const typeTraining = await persistentSession.get("type-training");

    if (typeTraining === "ACTIVITY") {
      const tempActivity = JSON.parse(await persistentSession.get("activity") || "{}") as Activity;

      if (tempActivity?.status !== "DONE") {
        bottomSheet.continuation = true;
      }
    }
  }, 800);

  interval = setInterval(startInterval, 1000);

  const [deviceInfo, notificationPermissions] = await Promise.all([
    Device.getInfo(),
    LocalNotifications.checkPermissions()
  ]);

  isMobile.value = ["android", "ios"].includes(deviceInfo.platform);
  hasNotificationPermission.value = notificationPermissions.display === "granted";
});

onBeforeUnmount(() => {
  panelResizeObserver?.disconnect();

  eventBus.off("LOCATION", traceRoute);
  eventBus.off("BACK_BUTTON", backButton);

  CordovaNotifications.un("TOGGLE_PAUSE", togglePause);

  if (notificationId.value) {
    CordovaNotifications.cancelNotification(notificationId.value);
  }

  endLiveActivity();

  geolocationService.stopBackgroundGeolocation();

  if (timer !== null) clearTimeout(timer);
  if (timeoutDivInformation !== null) clearTimeout(timeoutDivInformation);
  if (interval !== null) clearInterval(interval);

  mapService?.destroy();
  runningService?.destroy();
  sensorsService?.destroy();
});

/// METHODS
const updateMapContentHeight = (panelEl: HTMLElement) => {
  mapContent.value!.style.height = `calc(100% - ${panelEl.clientHeight}px + ${mapContentOverlap}px)`;
};

const bindPanelResizeObserver = () => {
  panelResizeObserver?.disconnect();

  const panelEl = (contentDiv.value as any)?.$el as HTMLElement | undefined;

  if (!panelEl) return;

  updateMapContentHeight(panelEl);

  panelResizeObserver = new ResizeObserver(() => updateMapContentHeight(panelEl));
  panelResizeObserver.observe(panelEl);
};

const collapse = () => expanded.value = false;

const startInterval = async () => {
  battery.value = (await Device.getBatteryInfo()).batteryLevel || 0;
  if (inProgress.value) updateActivity();
};

const togglePaused = () => {
  if (paused.value) {
    SystemBars.setStyle({
      style: SystemBarsStyle.Light,
      bar: SystemBarType.StatusBar
    });

    divInformation.value = {
      class: "bg-yellow text-black",
      icon: "mdi-pause",
      title: t("$vuetify.label.activity_paused")
    };

    runningService!.saveCoords();

    mapService.addFinishMarker(
      [position.lng, position.lat]
    );
  } else {
    SystemBars.setStyle({
      style: SystemBarsStyle.Dark,
      bar: SystemBarType.StatusBar
    });

    divInformation.value = null;

    mapService.removeFinishMarker();
  }
};

const recenterMap = () => {
  mapService.recenter(
    [position.lng, position.lat],
    userMarker?.getRotation() || 0
  );
  recenter.value = false;
};

const continueActivity = async () => {
  activity.value = JSON.parse(
    (await persistentSession.get("activity")) || "{}"
  ) as Activity;

  if (activity.value.status !== "DONE") {
    paused.value = Boolean(Number(await persistentSession.get("paused")));

    CordovaNotifications.cancelNotification(
      Number(await persistentSession.get("notification-id"))
    );

    if (paused.value) {
      activity.value.pauses.pop();
    }

    const points = await RunningMetricsService.getPointsAndRemove(activity.value._id);

    coords.value.push(...points.map((point) => ({
      lat: point.lat,
      lng: point.lng,
      accuracy: point.accuracy,
      altitude: point.altitude,
      altitudeAccuracy: point.altitudeAccuracy,
      speed: point.speed,
      time: point.time,
      elapsedSeconds: point.elapsedSeconds,
    })));

    continuation.value = true;

    startActivity(false);
  }
};

const removeAllData = async () => {
  await Promise.all([
    persistentSession.remove("type-training"),
    persistentSession.remove("paused"),
    persistentSession.remove("activity"),
    persistentSession.remove("notification-id"),
    persistentSession.remove("running-metrics-checkpoint"),
    persistentSession.remove("last-update-time"),
  ]);
};

const discardActivity = async () => {
  const tempActivity = JSON.parse(
    (await persistentSession.get("activity")) || "{}"
  ) as Activity;

  await RunningMetricsService.removePoints(tempActivity._id);

  await removeAllData();
};

const startMap = async () => {
  const result = await geolocationService.getCurrentPosition();

  precision.value = result.accuracy;
  position.lat = result.lat;
  position.lng = result.lng;

  eventBus.on("LOCATION", traceRoute);

  await geolocationService.stopBackgroundGeolocation();

  await geolocationService.startBackgroundGeolocation();

  mapService.init([result.lng, result.lat]);

  mapService.on("ready", () => {
    if (result.lat !== 0 && result.lng !== 0) {
      mapLoaded.value = true;
      setTimeout(recenterMap, 500);
      nextTick(() => enableContinuation.value = true);
    }

    userMarker = mapService.addUserLocationMarker([result.lng, result.lat]);
  });

  mapService.on("change-recenter", () => recenter.value = true);
};

const togglePause = async () => {
  paused.value = !paused.value;
  await CordovaNotifications.cancelNotification(notificationId.value);
  notificationId.value = CordovaNotifications.createId();
  startNotification();
  updateLiveActivity();
};

const bodyNotification = () => {
  const extraMessage = paused.value ? `\n${t("$vuetify.label.activity_paused")}` : "";

  return {
    id: notificationId.value,
    title: `${categorySelection.value.label} • ${distance.value} ${t("$vuetify.label.km")}`,
    text: `${formatTime(activity.value.duration_seconds, true)} • ${formatNumber(kcal.value)} ${t("$vuetify.label.kcal_abbreviation")}${extraMessage}`,
    channel_id: hasCreatedNotification.value ? "activity_silence" as const : "activity_sound" as const,
    actions: "PAUSE"
  };
};

const startNotification = async () => {
  if (isMobile.value && hasNotificationPermission.value && Capacitor.getPlatform() !== "ios") {
    if (!hasCreatedNotification.value) {
      CordovaNotifications.on("TOGGLE_PAUSE", togglePause);
    }

    await Promise.all([
      CordovaNotifications.createActions("PAUSE", [{
        id: "TOGGLE_PAUSE",
        title: t(`$vuetify.label.${paused.value ? "resume" : "pause"}`)
      }]),
    ]);

    isCreatingNotification = true;

    await CordovaNotifications.createNotification(
      bodyNotification()
    );

    isCreatingNotification = false;
  }
};

const updateNotification = async () => {
  const triggered = await CordovaNotifications.isTriggeredNotification(notificationId.value);

  if (isMobile.value && hasNotificationPermission.value && triggered && Capacitor.getPlatform() !== "ios") {
    await CordovaNotifications.createActions("PAUSE", [{
      id: "TOGGLE_PAUSE",
      title: t(`$vuetify.label.${paused.value ? "resume" : "pause"}`)
    }]);

    await CordovaNotifications.updateNotification(bodyNotification());
  }
};

const bodyLiveActivity = () => ({
  durationSeconds: activity.value.duration_seconds,
  statusLabel: paused.value ? t("$vuetify.label.activity_paused") : "",
  stat1: `${distance.value} ${t("$vuetify.label.km")}`,
  stat2: rhythm.value
});

const startLiveActivity = async () => {
  await liveActivity.start({
    title: categorySelection.value.label,
    icon: mdiToSfSymbol(categorySelection.value.icon),
    ...bodyLiveActivity()
  });
};

const updateLiveActivity = async () => {
  await liveActivity.update(bodyLiveActivity());
};

const endLiveActivity = async () => {
  await liveActivity.end();
};

const backButton = () => {
  if (inProgress.value || continuation.value) {
    bottomSheet.cancel = true;
  } else {
    cancel();
  }
};

const cancel = async () => {
  if (isRunning.value) {
    CordovaNotifications.cancelNotification(notificationId.value);
    endLiveActivity();

    await runningService?.destroy();
    await removeAllData();
    await RunningMetricsService.removePoints(activity.value._id);
  }

  eventBus.emit("BACK_ROUTER");
};

const checkSuspensionGap = async (now: string) => {
  const lastUpdateTime = await persistentSession.get("last-update-time");
  const gap = detectSuspensionGap(lastUpdateTime, now, activity.value.pauses);

  if (gap) activity.value.pauses.push(gap);
};

const updateActivity = async () => {
  const now = dayjs().toISOString();

  await checkSuspensionGap(now);

  if (Capacitor.getPlatform() === "ios") {
    if (liveActivity.active.value) {
      updateLiveActivity();
    } else {
      await startLiveActivity();
    }
  } else {
    const triggered = await CordovaNotifications.isTriggeredNotification(notificationId.value);

    if (
      !triggered &&
      isMobile.value &&
      hasNotificationPermission.value &&
      !isCreatingNotification
    ) {
      isCreatingNotification = true;
      await CordovaNotifications.cancelNotification(notificationId.value);

      notificationId.value = CordovaNotifications.createId();

      await startNotification();
    } else if (triggered) {
      updateNotification();
    }
  }

  const isPaused = activity.value.pauses.some((p) => !p.ended_at) || paused.value;

  if (!isPaused) {
    activity.value = {
      ...activity.value,
      duration_seconds: getActivityDurationSeconds(
        activity.value,
        activity.value.ended_at || now
      ),
      calories: kcal.value
    };
  }

  await Promise.all([
    persistentSession.set("running-metrics-checkpoint", JSON.stringify(runningService!.getState())),
    persistentSession.set("last-update-time", now)
  ]);
};

const requestPermissionPedometer = async () => {
  const availability = await CapacitorPedometer.isAvailable();

  if (availability.stepCounting) {
    const { activityRecognition } = await CapacitorPedometer.checkPermissions();

    if (activityRecognition === "granted") {
      return "granted";
    } else {
      const { activityRecognition } = await CapacitorPedometer.requestPermissions();
      return activityRecognition;
    }
  }

  return "denied";
};

const startActivity = async (forced = false) => {
  if (!forced) {
    if (!mapLoaded.value) {
      eventBus.emit("SNACKBAR", { message: t("$vuetify.message.please_wait_for_the_map_load") });
      return;
    }

    if (precision.value > 15) {
      bottomSheet.gps_low_precision = true;
      return;
    }

    if ((battery.value * 100) <= 20) {
      bottomSheet.battery_low_charge = true;
      return;
    }

    const { lowPowerModeEnabled } = await PowerMode.lowPowerModeEnabled();
    if (lowPowerModeEnabled) {
      bottomSheet.power_save_mode = true;
      return;
    }
  }

  await requestPermissionPedometer();

  expanded.value = true;

  if (!isRunning.value) {
    isRunning.value = true;
    run();
  }
};

const run = () => {
  if (count.value === 0) {
    timer = setTimeout(() => {
      visible.value = false;
      hasAnimated.value = true;
      Haptics.vibrate();
      startNow();
    }, 600);

    return;
  }

  timer = setTimeout(() => {
    count.value--;
    run();
  }, 900);
};

const startNow = async () => {
  const result = await requestPermissionPedometer();

  if (result === "granted") {
    await CapacitorPedometer.startMeasurementUpdates();
  }

  if (continuation.value) {
    detectNearbyRunners.value = activity.value.detect_nearby_runners!;
    category.value = activity.value.category!;
  } else {
    activity.value.started_at = dayjs().toISOString();
    activity.value.date_completed = dateNow.value;
    activity.value.timezone = timezone.value;
    activity.value.category = category.value;
    activity.value.detect_nearby_runners = detectNearbyRunners.value;
  }

  runningService = new RunningMetricsService(
    activity.value._id,
    account.value.weight,
    account.value.height * 100,
    category.value
  );

  started.value = true;

  togglePaused();
  runningService.start();
  sensorsService.start();

  mapService.initActivityLine();

  if (continuation.value) {
    if (!paused.value) {
      activity.value.pauses.push({
        started_at: (await persistentSession.get("last-update-time")) || dayjs().toISOString(),
        ended_at: dayjs().toISOString(),
      });
    }

    for (const [i, coord] of coords.value.entries()) {
      mapService.addActivityPoint([coord.lng, coord.lat]);

      if (i === 0) {
        mapService.addStartMarker([coord.lng, coord.lat]);
        createdPointStart.value = true;
      }
    }

    realtime.value = runningService!.restorePoints(coords.value);
    runningService!.restoreState(
      JSON.parse(await persistentSession.get("running-metrics-checkpoint") || "{}") as RunningMetricsCheckpoint
    );
    runningService!.restoreSavedPoints();
  }

  await Promise.all([
    persistentSession.set("type-training", "ACTIVITY"),
    persistentSession.set("paused", String(Number(paused.value))),
    persistentSession.set("activity", JSON.stringify(activity.value)),
    persistentSession.set("notification-id", String(notificationId.value)),
    persistentSession.set("running-metrics-checkpoint", JSON.stringify(runningService!.getState())),
    persistentSession.set("last-update-time", dayjs().toISOString())
  ]);

  await startNotification();
  await startLiveActivity();
  hasCreatedNotification.value = true;
};

const traceRoute = async (location: Events["LOCATION"]) => {
  precision.value = location.accuracy;
  position.lat = location.lat;
  position.lng = location.lng;

  if (!mapLoaded.value) {
    mapLoaded.value = true;
    setTimeout(recenterMap, 500);
  }

  if (inProgress.value && !appStore.foreground) {
    updateActivity()
  }

  if (!recenter.value) {
    recenterMap();
  }

  userMarker?.setLngLat([location.lng, location.lat]);

  if (
    inProgress.value &&
    runningService!.initialized &&
    !paused.value
  ) {
    const result = runningService!.addPoint(
      location,
      getActivityDurationSeconds(
        activity.value,
        activity.value.ended_at || dayjs().toISOString()
      )
    );

    realtime.value = result;

    if (result.lastPoint) {
      mapService.addActivityPoint([
        result.lastPoint.lng,
        result.lastPoint.lat
      ]);

      if (!createdPointStart.value) {
        mapService.addStartMarker(
          [result.lastPoint.lng, result.lastPoint.lat]
        );

        createdPointStart.value = true;
      }

      mapService.rotationUser(location.speed, location.bearing);
    }
  }
};

const finish = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });

  finished.value = true;

  geolocationService.stopBackgroundGeolocation();

  const endedAt = dayjs().toISOString();

  await checkSuspensionGap(endedAt);

  activity.value.ended_at = endedAt;
  activity.value.status = "DONE";

  if (
    activity.value.pauses.length &&
    !activity.value.pauses[activity.value.pauses.length - 1]?.ended_at
  ) {
    activity.value.pauses[activity.value.pauses.length - 1]!.ended_at = endedAt;
  }

  activity.value.duration_seconds = getActivityDurationSeconds(
    activity.value,
    endedAt
  );

  if (activity.value.from_coords.lat === 0 && activity.value.from_coords.lng === 0) {
    const coord = activity.value.points?.[0];

    if (coord) {
      activity.value.from_coords.lat = coord.lat;
      activity.value.from_coords.lng = coord.lng;
    }
  }

  setTimeout(() => {
    SystemBars.setStyle({
      style: SystemBarsStyle.Dark,
      bar: SystemBarType.StatusBar
    });

    emit("finish");

    eventBus.emit("SET_LOADER", { enabled: false });
  }, 1000);
};
</script>

<style lang="sass">
div#progress-activity
  div.v-skeleton-loader__text
    width: 100%
    height: 60px
    margin: 0

  header
    top: 0

    div.close
      border: 2px solid var(--tertiary)
      width: 40px
      height: 40px
      z-index: 10000

  .content-resumed
    z-index: 10000

    div.content
      border-bottom-width: 0
      padding: 20px 12px calc(15px + var(--bottom-saved)) 12px
      position: relative

  div.recenter
    border: 2px solid var(--tertiary)
    width: 50px
    height: 50px
    position: absolute
    right: 2%
    z-index: 10000

  div.overlay
    position: fixed
    inset: 0
    z-index: 999
    display: flex
    align-items: center
    justify-content: center
    backdrop-filter: blur(8px)

  div.count-text
    font-size: 120px
    font-weight: 900
    line-height: 1
    color: var(--primary)

  div.content
    padding-bottom: var(--bottom-saved)
</style>