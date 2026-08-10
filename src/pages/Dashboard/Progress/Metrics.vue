<template>
  <div class="d-flex flex-column w-100 h-100">
    <div
      v-if="loading"
      class="w-100 h-100 d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <template v-else-if="metrics">
      <p class="font-weight-bold font-space-grotesk text-h6 mb-3">
        {{ t("$vuetify.label.weekly_data") }}
      </p>

      <div class="d-flex flex-column ga-2 mb-5">
        <div class="d-flex ga-2">
          <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet">
            <p class="text-body-2 text-grey-lighten-1 mb-1">
              {{ t("$vuetify.label.streak") }}
            </p>

            <p class="font-weight-bold text-h6 text-lowercase">
              {{ `${metrics.consecutive_days} ${t(`$vuetify.label.${metrics.consecutive_days > 1 ? "days" : "day"}`)}` }}
            </p>
          </div>

          <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet">
            <p class="text-body-2 text-grey-lighten-1 mb-1">
              {{ `${t("$vuetify.label.training")}/${t("$vuetify.label.challenges")}` }}
            </p>

            <p class="font-weight-bold text-h6">
              {{ formatNumber(metrics.number_training + metrics.number_challenges) }}
            </p>
          </div>
        </div>

        <div class="d-flex ga-2">
          <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet">
            <p class="text-body-2 text-grey-lighten-1 mb-1">
              {{ t("$vuetify.label.calories") }}
            </p>

            <p class="font-weight-bold text-h6">
              {{ formatNumber(metrics.calories) }}

              <span class="text-caption">
                {{ t("$vuetify.label.kcal_abbreviation") }}
              </span>
            </p>
          </div>

          <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet">
            <p class="text-body-2 text-grey-lighten-1 mb-1">
              {{ t("$vuetify.label.kilometers_traveled") }}
            </p>

            <p class="font-weight-bold text-h6">
              {{ formatNumber(metrics.kms) }}
            </p>
          </div>
        </div>
      </div>

      <!-- META SEMANAL -->
      <div
        v-if="metrics.weekly_progress"
        class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5"
      >
        <div class="d-flex ga-3 mb-3">
          <v-icon color="primary">
            mdi-bullseye
          </v-icon>

          <span class="font-weight-bold">
            {{ t("$vuetify.label.weekly_goal") }}
          </span>
        </div>

        <div class="d-flex justify-space-between mb-2">
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.message.from_to_workouts", metrics.weekly_progress.total, metrics.weekly_progress.target) }}
          </span>

          <span class="text-caption text-primary">
            {{ formatNumber(metrics.weekly_progress.percentage, "percent") }}
          </span>
        </div>

        <div
          :style="{ height: '1rem' }"
          class="rounded-lg bg-secondary"
        >
          <div
            :style="{ width: `${metrics.weekly_progress.percentage}%` }"
            class="bg-primary h-100 rounded-lg"
          ></div>
        </div>

        <div class="d-flex justify-space-between mt-2">
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.label.goal") }}
          </span>

          <span class="text-body-2 font-weight-bold text-primary">
            {{ t(`$vuetify.label.${metrics.weekly_progress.goal.toLowerCase()}`) }}
          </span>
        </div>
      </div>

      <!-- EVOLUÇÃO DE PESO -->
      <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5">
        <div class="d-flex justify-space-between mb-3">
          <div class="d-flex ga-3">
            <v-icon color="primary">
              mdi-trending-up
            </v-icon>

            <span class="font-weight-bold">
              {{ t("$vuetify.label.weight_evolution") }}
            </span>
          </div>

          <span
            class="text-caption d-flex ga-1 text-primary"
            @click="newWeight"
          >
            <v-icon>mdi-plus</v-icon>
            {{ t("$vuetify.label.register") }}
          </span>
        </div>

        <div
          v-if="!weightEvolutions.length"
          class="py-7 d-flex flex-column justify-center align-center ga-3"
        >
          <v-icon :size="40">
            mdi-package-variant
          </v-icon>

          <p class="text-center">
            {{ t("$vuetify.message.there_are_no_weights_registered_yet") }}
          </p>
        </div>
        <template v-else>
          <div class="d-flex ga-1 mb-4">
            <v-chip
              :color="listTypeWeightEvolution === 'WEEK' ? 'primary' : ''"
              size="small"
              @click="listTypeWeightEvolution = 'WEEK'"
            >{{ t("$vuetify.label.week") }}</v-chip>

            <v-chip
              :color="listTypeWeightEvolution === 'MONTH' ? 'primary' : ''"
              size="small"
              @click="listTypeWeightEvolution = 'MONTH'"
            >{{ t("$vuetify.label.month") }}</v-chip>

            <v-chip
              :color="listTypeWeightEvolution === 'YEAR' ? 'primary' : ''"
              size="small"
              @click="listTypeWeightEvolution = 'YEAR'"
            >{{ t("$vuetify.label.year") }}</v-chip>
          </div>

          <div
            class="mb-3"
            :style="{ height: '160px' }"
          >
            <Line
              :data="weightChartData"
              :options="weightChartOptions"
            />
          </div>

          <v-divider class="my-2"></v-divider>

          <div class="d-flex flex-column ga-2">
            <div
              v-for="item in weightEvolutions"
              :key="item._id"
              class="d-flex justify-space-between"
            >
              <div class="d-flex ga-2 align-center">
                <span class="text-caption text-grey-lighten-1">
                  {{ getDateFormatted(item) }}
                </span>

                <span class="font-weight-bold text-lowercase">
                  {{ `${formatNumber(item.weight)} ${t("$vuetify.label.kg_abbreviation")}` }}
                </span>
              </div>

              <div class="d-flex align-center ga-3">
                <v-icon
                  :size="15"
                  color="blue"
                  @click="editWeightEvolution(item)"
                >mdi-pencil</v-icon>

                <v-icon
                  :size="15"
                  color="error"
                  @click="weightId = item._id; bottomSheet.delete_weight_evolution = true"
                >mdi-trash-can</v-icon>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- TREINOS POR DIA -->
      <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5">
        <div class="d-flex ga-3 mb-4">
          <v-icon color="primary">
            mdi-trophy-outline
          </v-icon>

          <span class="font-weight-bold">
            {{ t("$vuetify.label.daily_workouts") }}
          </span>
        </div>

        <div :style="{ height: '160px' }">
          <Bar
            :data="getBarChartData(metrics.daily_workouts, 'primary')"
            :options="getBarChartOptions('training')"
          />
        </div>
      </div>

      <!-- CALORIAS POR DIA -->
      <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5">
        <div class="d-flex ga-1 mb-4">
          <v-icon color="yellow">
            mdi-fire
          </v-icon>

          <span class="font-weight-bold">
            {{ t("$vuetify.label.calories_per_day") }}
          </span>
        </div>

        <div :style="{ height: '160px' }">
          <Bar
            :data="getBarChartData(metrics.calories_per_day.map((item) => item.total), 'yellow')"
            :options="getBarChartOptions('calories_per_day')"
          />
        </div>
      </div>

      <!-- QUILOMETROS PERCORRIDOS -->
      <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5">
        <div class="d-flex ga-1 mb-4">
          <v-icon color="blue">
            mdi-map-marker
          </v-icon>

          <span class="font-weight-bold">
            {{ t("$vuetify.label.kilometers_traveled_full") }}
          </span>
        </div>

        <div :style="{ height: '160px' }">
          <Line
            :data="getLineChartData(metrics.kilometers_traveled, 'blue')"
            :options="getLineChartOptions()"
          />
        </div>
      </div>

      <p class="font-weight-bold font-space-grotesk text-h6 mb-3">
        {{ t("$vuetify.label.history") }}
      </p>

      <!-- FOTOS DO PROGRESSO -->
      <div class="w-100 px-3 py-3 rounded-lg bg-quintet border-sextet mb-5">
        <div class="d-flex justify-space-between mb-3">
          <div class="d-flex ga-3">
            <v-icon color="primary">
              mdi-camera-outline
            </v-icon>

            <span class="font-weight-bold">
              {{ t("$vuetify.label.progress_photos") }}
            </span>
          </div>

          <v-menu
            v-model="menu"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ props }">
              <span
                v-bind="props"
                class="text-caption d-flex ga-1 text-primary"
              >
                <v-icon>mdi-plus</v-icon>
                {{ t("$vuetify.label.add") }}
              </span>
            </template>

            <List>
              <v-list-item
                v-for="(option, i) in options"
                :key="i"
              >
                <v-list-item-title>
                  <div
                    v-ripple
                    class="pa-2 d-flex align-center ga-3 bg-secondary rounded-lg"
                    :style="{ height: '4rem' }"
                    @click="option.method"
                  >
                    <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                      <v-icon :size="25">
                        {{ option.icon }}
                      </v-icon>
                    </div>

                    <span class="text-h6">
                      {{ option.text }}
                    </span>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </List>
          </v-menu>
        </div>

        <div>
          <div
            v-if="!photos.length"
            class="py-7 d-flex flex-column justify-center align-center ga-3"
          >
            <v-icon :size="40">
              mdi-package-variant
            </v-icon>

            <p class="text-center">
              {{ t("$vuetify.message.no_photos_have_been_added_yet") }}
            </p>
          </div>
          <template v-else>
            <p
              v-if="photos.length >= 2"
              class="text-caption text-grey-lighten-1 mb-3"
            >{{ t("$vuetify.message.tap_on_2_photos_to_compare_them_side_by_side") }}</p>

            <div class="d-flex overflow-x-auto overflow-y-hidden">
              <div class="d-flex ga-3">
                <div
                  v-for="photo in photos"
                  :key="photo._id"
                  :style="{ height: '10rem', width: 'auto' }"
                  class="rounded-lg position-relative"
                >
                  <img
                    :src="photo.url"
                    :style="{ height: '10rem', width: 'auto' }"
                    :class="[
                      'rounded-lg',
                      photoId === photo._id || selectedPhotos.find((p) => p._id === photo._id) ? 'border-sm border-primary border-opacity-100' : ''
                    ]"
                    @click="handleClickPhoto(photo)"
                  />

                  <v-btn
                    v-if="photoId === photo._id"
                    icon=""
                    color="transparent"
                    size="x-small"
                    class="position-absolute right-0 top-0"
                    @click="bottomSheet.delete_photo = true"
                  >
                    <v-icon color="error">
                      mdi-trash-can
                    </v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <template v-if="selectedPhotos.length === 2">
              <v-divider class="my-5"></v-divider>

              <div
                class="d-flex ga-2"
                :style="{ height: '20rem' }"
              >
                <div
                  :style="{ backgroundImage: `url(${selectedPhotos[0]!.url})`, backgroundPosition: 'center', backgroundSize: 'contain' }"
                  class="flex-fill"
                ></div>

                <div
                  :style="{ backgroundImage: `url(${selectedPhotos[1]!.url})`, backgroundPosition: 'center', backgroundSize: 'contain' }"
                  class="flex-fill"
                ></div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </template>

    <!-- BOTTOM SHEET DE DELETAR FOTO DE PROGRESSO -->
    <v-bottom-sheet v-model="bottomSheet.delete_photo">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-trash-can-outline
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.label.delete_progress_photo") }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
            v-html="t('$vuetify.message.delete_progress_photo')"
          ></p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.delete_photo = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="deleteProgressPhoto"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE ADICIONAR/EDITAR PESO -->
    <v-bottom-sheet v-model="bottomSheet.weight_evolution">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.weight_evolution = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5">
          <p class="text-center mb-5">
            {{
              weightId ?
                t("$vuetify.label.edit_weight") :
                t("$vuetify.label.register_new_weight")
            }}
          </p>

          <v-form
            ref="form"
            @submit.prevent="submit"
          >
            <TextField
              required
              is-money
              hide-symbol
              class="mb-5"
              :label="t('$vuetify.label.weight_kg')"
              :rules="[() => weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
              v-model="weight"
            />

            <TextField
              required
              class="mb-5"
              type="tel"
              :mask="'##/##/####'"
              :label="t('$vuetify.label.date')"
              :rules="[rules.past_date]"
              v-model="date"
            />

            <v-btn
              block
              class="text-none mt-6 pa-7 font-weight-bold"
              type="submit"
              color="primary"
            >{{ t("$vuetify.label.save") }}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE DELETAR EVOLUÇÃO DE PESO -->
    <v-bottom-sheet v-model="bottomSheet.delete_weight_evolution">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-trash-can-outline
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.label.delete_weight") }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
            v-html="t('$vuetify.message.delete_weight')"
          ></p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.delete_weight_evolution = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="deleteWeight"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import "dayjs/locale/pt";
import "dayjs/locale/en";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import { useLocale } from "vuetify";
import { Bar, Line } from "vue-chartjs";
import { useAccountsStore } from "@/stores/accounts";
import { useProgressPhotosStore } from "@/stores/progress-photos";
import { useWeightEvolutionsStore } from "@/stores/weight-evolutions";
import { useFormatNumber, useForm } from "@/composables";
import { date as dateUtil, mobileEvents } from "@/utils";
import { eventBus } from "@/eventBus";
import { MediaService } from "@/services/media.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import { type AccountMetrics } from "@/types/account.type";
import { type ProgressPhoto } from "@/types/progress-photo.type";
import { type WeightEvolution } from "@/types/weight-evolution.type";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

/// COMPONENTS
import List from "@/components/List.vue";

/// DATA
const { t, current } = useLocale();
const { formatNumber } = useFormatNumber();
const { doubleTap } = mobileEvents();
const { toUs, toBr } = dateUtil();
const { rules, validate } = useForm();
const loading = ref(true);
const accountsStore = useAccountsStore();
const progressPhotosStore = useProgressPhotosStore();
const weightEvolutionsStore = useWeightEvolutionsStore();

const weightId = ref("");
const photoId = ref("");

const listTypeWeightEvolution = ref("WEEK");

const menu = ref(false);

const photos = ref<ProgressPhoto[]>([]);
const selectedPhotos = ref<{ _id: string, url: string }[]>([]);

const weightEvolutions = ref<WeightEvolution[]>([]);

const metrics = ref<AccountMetrics>();

const mediaService = new MediaService;

const bottomSheet = reactive({
  delete_photo: false,
  weight_evolution: false,
  delete_weight_evolution: false,
});

const form = ref();
const weight = ref(0);
const date = ref(dayjs().format("DD/MM/YYYY"));

/// COMPUTED
const timezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
const days = computed(() => {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((item) => t(`$vuetify.days_abbreviation.${item}`));
});
const options = computed(() => [
  {
    icon: "mdi-camera-outline",
    text: t("$vuetify.label.take_a_picture"),
    method: takePicture
  },
  {
    icon: "mdi-image-outline",
    text: t("$vuetify.label.select_photo"),
    method: selectPhotos
  },
]);
const weightChartData = computed(() => {
  const now = dayjs();
  const data = weightEvolutions.value
    .filter((item) => {
      const date = dayjs(item.date);

      if (listTypeWeightEvolution.value === "WEEK") {
        return date.isSameOrAfter(now.startOf("isoWeek")) && date.isSameOrBefore(now.endOf("isoWeek"));
      }

      if (listTypeWeightEvolution.value === "MONTH") {
        return dayjs(item.date).isSame(now, "month");
      }

      return dayjs(item.date).isSame(now, "year");
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    labels: data.map((item) => dayjs(item.date).format(t("$vuetify.label.date_format"))),
    datasets: [{
      data: data.map((item) => item.weight),
      borderColor: getColor("primary"),
      pointBackgroundColor: getColor("primary"),
      fill: false,
      tension: 0.45,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 0,
      borderWidth: 3
    }]
  }
});
const weightChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: getColor("quintet"),
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: getColor("sextet"),
        borderWidth: 1,
        callbacks: {
          label(context: any) {
            return `${formatNumber(context.raw)} ${t("$vuetify.label.kg_abbreviation")}`.toLowerCase();
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 12 }
        },
        border: { display: false }
      },
      y: {
        display: false,
        beginAtZero: true,
        grid: { display: false },
        border: { display: false }
      }
    }
  }
});

/// LIFE CYCLES
onMounted(async () => {
  await Promise.all([
    getMetrics(),
    getWeights(),
    getPhotos()
  ]);

  loading.value = false;
});

/// METHODS
const getColor = (color: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${color}`);

const getMetrics = async () => {
  const response = await accountsStore.GET(`${accountsStore._id}/metrics?timezone=${timezone.value}`);
  if (!response.error) metrics.value = response.metrics;
};

const getWeights = async () => {
  const response = await weightEvolutionsStore.GET();
  if (!response.error) weightEvolutions.value = response.weight_evolutions;
};

const getPhotos = async () => {
  const response = await progressPhotosStore.GET();
  if (!response.error) photos.value = response.progress_photos;
};

const getBarChartData = (data: number[], color: string) => {
  return {
    labels: days.value,
    datasets: [{
      data,
      borderRadius: 12,
      backgroundColor: getColor(color),
      borderSkipped: false,
      barThickness: 36
    }]
  };
};

const getBarChartOptions = (type: "training" | "calories_per_day") => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: getColor("quintet"),
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: getColor("sextet"),
        borderWidth: 1,
        callbacks: {
          label(context: any) {
            if (type === "training") {
              return `${context.raw} ${t(`$vuetify.label.${context.raw > 1 ? "training" : "training_singular"}`)}`.toLowerCase();
            }

            const data = metrics.value!.calories_per_day[context.dataIndex]!;

            return [
              `${t("$vuetify.label.training")}: ${formatNumber(data.training)} ${t("$vuetify.label.kcal_abbreviation")}`,
              `${t("$vuetify.label.challenges")}: ${formatNumber(data.challenge)} ${t("$vuetify.label.kcal_abbreviation")}`,
              `${t("$vuetify.label.activities")}: ${formatNumber(data.avulse)} ${t("$vuetify.label.kcal_abbreviation")}`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 12 }
        },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { display: false },
        grid: { display: false },
        border: { display: false }
      }
    }
  }
};

const getLineChartData = (data: number[], color: string) => {
  return {
    labels: days.value,
    datasets: [{
      data,
      borderColor: getColor(color),
      pointBackgroundColor: getColor(color),
      fill: false,
      tension: 0.45,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 0,
      borderWidth: 3
    }]
  };
};

const getLineChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: getColor("quintet"),
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: getColor("sextet"),
        borderWidth: 1,
        callbacks: {
          label(context: any) {
            return `${formatNumber(context.raw)} ${t("$vuetify.label.km")}`.toLowerCase();
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 12 }
        },
        border: { display: false }
      },
      y: {
        display: false,
        beginAtZero: true,
        grid: { display: false },
        border: { display: false }
      }
    }
  };
};

const takePicture = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });
  try {
    const { base64, format, mimetype } = await mediaService.takePicture();
    await savePhoto(base64, format, mimetype);
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const selectPhotos = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });
  try {
    const results = await mediaService.getFiles("Photo", 1);
    const { base64, format, mimetype } = results[0]!;
    await savePhoto(base64, format, mimetype);
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const savePhoto = async (base64: string, format: string, mimetype: string) => {
  try {
    menu.value = false;
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await progressPhotosStore.POST("", { base64, format, mimetype });
    if (!response.error) await getPhotos();
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const deleteProgressPhoto = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await progressPhotosStore.DELETE(photoId.value);
    if (!response.error) {
      selectedPhotos.value = selectedPhotos.value.filter((p) => p._id !== photoId.value);
      bottomSheet.delete_photo = false;
      await getPhotos();
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const handleClickPhoto = (photo: ProgressPhoto) => {
  doubleTap({
    onDoubleTap: () => eventBus.emit("SHOW_IMAGE", { images: [photo.url] })
  });

  const find = selectedPhotos.value.find((p) => p._id === photo._id);

  if (find) {
    selectedPhotos.value = selectedPhotos.value.filter((p) => p._id !== photo._id);
    photoId.value = "";
    return;
  }

  photoId.value = photoId.value === photo._id ? "" : photo._id;

  if (selectedPhotos.value.length < 2) {
    selectedPhotos.value.push({
      _id: photo._id,
      url: photo.url
    });
  }
};

const getDateFormatted = (weightEvolution: WeightEvolution) => {
  return dayjs(weightEvolution.date).locale(current.value).format(t("$vuetify.label.date_extense"));
};

const newWeight = () => {
  weightId.value = "";
  weight.value = 0;
  date.value = dayjs().format("DD/MM/YYYY");
  bottomSheet.weight_evolution = true;
};

const editWeightEvolution = (weightEvolution: WeightEvolution) => {
  weight.value = weightEvolution.weight;
  date.value = toBr(weightEvolution.date);
  weightId.value = weightEvolution._id;
  bottomSheet.weight_evolution = true;
};

const submit = async () => {
  const isValid = await validate(form);

  if (isValid) {
    try {
      const body = {
        weight: weight.value,
        date: toUs(date.value)
      };

      eventBus.emit("SET_LOADER", { enabled: true });

      const response = weightId.value ?
        await weightEvolutionsStore.PATCH(weightId.value, body) :
        await weightEvolutionsStore.POST("", body);

      if (!response.error) {
        bottomSheet.weight_evolution = false;
        await getWeights();
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const deleteWeight = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await weightEvolutionsStore.DELETE(weightId.value);
    if (!response.error) {
      bottomSheet.delete_weight_evolution = false;
      await getWeights();
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>