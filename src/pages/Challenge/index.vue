<template>
  <div
    :style="{ paddingTop: masterTab === 0 ? 'var(--top-saved)' : '' }"
    class="w-100 h-100"
  >
    <div
      v-if="!challenge"
      class="w-100 h-100 d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <v-tabs-window
      v-else
      v-model="masterTab"
      class="h-100"
    >
      <v-tabs-window-item class="h-100">
        <div class="d-flex flex-column h-100 overflow-hidden">
          <header class="pa-2 border-bottom-tertiary">
            <div class="d-flex justify-space-between mb-3">
              <div
                class="d-flex justify-start align-center ga-2"
                :style="{ width: '7rem' }"
                @click="back"
              >
                <v-icon color="grey-lighten-1" :size="20">
                  mdi-chevron-left
                </v-icon>

                <span class="text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.exit") }}
                </span>
              </div>

              <div class="d-flex justify-center align-center ga-2 px-2 py-1 rounded-xl bg-tertiary">
                <v-icon color="primary" :size="20">
                  mdi-clock-outline
                </v-icon>

                <span class="text-caption text-white font-space-grotesk">
                  {{ formatTime(activity.duration_seconds) }}
                </span>
              </div>

              <div
                class="d-flex justify-end align-center ga-1"
                :style="{ width: '7rem' }"
              >
                <v-icon color="orange" :size="20">
                  mdi-fire
                </v-icon>

                <span class="text-caption text-grey-lighten-1">
                  {{ `${formatNumber(kcal)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                </span>
              </div>
            </div>

            <div class="mb-2">
              <div
                :style="{ height: '0.5rem' }"
                class="bg-tertiary rounded-xl"
              >
                <div
                  :style="{ width: `${calculatePercentage}%` }"
                  class="h-100 bg-primary rounded-xl"
                ></div>
              </div>
            </div>

            <div class="d-flex justify-space-between">
              <v-btn
                size="x-small"
                class="text-none text-white"
                variant="tonal"
                :color="paused ? 'success' : 'orange'"
                :style="{ visibility: 'hidden' }"
              >
                <v-icon>
                  {{ paused ? "mdi-play" : "mdi-pause" }}
                </v-icon>
                <span class="ml-2">
                  {{ t(`$vuetify.label.${paused ? "resume" : "pause"}`) }}
                </span>
              </v-btn>

              <div class="d-flex justify-center align-center text-center text-caption text-grey-lighten-1">
                {{ t("$vuetify.label.from_count_exercises", indexExercise, totalExercises) }}
              </div>

              <v-btn
                size="x-small"
                class="text-none text-white"
                variant="tonal"
                :color="paused ? 'success' : 'orange'"
                :disabled="tab === 1 || !started || resting"
                @click="paused = !paused"
              >
                <v-icon>
                  {{ paused ? "mdi-play" : "mdi-pause" }}
                </v-icon>
                <span class="ml-2">
                  {{ t(`$vuetify.label.${paused ? "resume" : "pause"}`) }}
                </span>
              </v-btn>
            </div>
          </header>

          <div
            v-if="paused && tab === 0"
            class="text-center text-body-2 py-1 bg-orange text-white"
          >{{ t("$vuetify.label.training_paused") }}</div>

          <div class="flex-fill overflow-hidden">
            <v-tabs-window
              v-model="tab"
              class="h-100"
            >
              <v-tabs-window-item class="h-100">
                <div class="d-flex flex-column px-4 py-5 h-100 overflow-y-auto">
                  <div
                    v-if="!currentExercise"
                    :style="{ border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', boxShadow: '0 0 30px -10px color-mix(in srgb, var(--primary) 30%, transparent)' }"
                    class="px-5 py-7 rounded-xl mb-7 d-flex justify-center align-center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      :size="50"
                    />
                  </div>
                  <div
                    v-else
                    :style="{ border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', boxShadow: '0 0 30px -10px color-mix(in srgb, var(--primary) 30%, transparent)' }"
                    class="px-5 py-4 rounded-xl mb-7"
                  >
                    <p class="text-caption font-weight-bold font-space-grotesk text-primary text-uppercase mb-1">
                      {{ t("$vuetify.label.current_exercise") }}
                    </p>

                    <p class="text-h5 font-weight-bold mb-1">
                      {{ currentExercise.name }}
                    </p>

                    <div
                      v-if="currentExercise.equipments.length"
                      class="d-flex ga-2 text-caption text-grey-lighten-1 mt-1 mb-2"
                    >
                      <v-icon
                        v-for="(equipment, e) in currentExercise.equipments"
                        :key="`equipment_c_${e}`"
                        @click="detailEquipment(equipment.icon, equipment.title, equipment.description)"
                      >{{ equipment.icon }}</v-icon>
                    </div>

                    <div class="d-flex ga-1 text-caption text-grey-lighten-1 mb-4">
                      <span>
                        {{
                          `${currentExercise.sets} x ${currentExercise.reps.type === "fixed" ? currentExercise.reps.max : `${currentExercise.reps.time}${getAbbreviationTime(currentExercise.reps.time_type)}`}`
                        }}
                      </span>
                    </div>

                    <p class="text-caption text-grey-lighten-1 text-uppercase font-weight-bold mb-2">
                      {{ t("$vuetify.label.series") }}
                    </p>

                    <div class="d-flex ga-2 flex-wrap mb-4">
                      <div
                        v-for="s in currentExercise.sets"
                        :key="`serie_${s}`"
                        :style="{ width: `calc((100% / ${currentExercise.sets >= 4 ? 4 : currentExercise.sets}) - 8px)` }"
                        :class="[
                          'px-2 py-3 d-flex justify-center align-center rounded-lg font-weight-bold',
                          executionCurrentExercise.series.length === s ?
                            'bg-theme-primary-15 text-primary border-md border-primary border-opacity-100' :
                            executionCurrentExercise.series.length > s ? 'bg-primary' : 'bg-tertiary'
                        ]"
                      >
                        <v-icon
                          v-if="executionCurrentExercise.series.length > s"
                          color="tertiary"
                        >mdi-check</v-icon>
                        <span v-else>
                          {{ s }}
                        </span>
                      </div>
                    </div>

                    <v-btn
                      v-if="!started"
                      block
                      color="primary"
                      class="mb-4 px-6 py-7 text-black font-weight-bold text-none"
                      @click="startTraining(true)"
                    >{{ t("$vuetify.label.start_challenge") }}</v-btn>
                    <v-btn
                      v-else-if="!resting"
                      block
                      color="primary"
                      class="mb-4 px-6 py-7 text-black font-weight-bold text-none"
                      @click="finishSerie"
                    >
                      <v-icon class="mr-2">
                        mdi-check
                      </v-icon>

                      {{ t("$vuetify.label.finish_series", executionCurrentExercise.series.length) }}
                    </v-btn>
                    <div
                      v-else
                      class="mb-4 bg-theme-primary-15 rounded-xl d-flex flex-column align-center justify-center py-5"
                      :style="{ border: '0.1rem solid var(--primary)' }"
                    >
                      <p
                        class="font-weight-bold text-primary mb-1"
                      >{{ t("$vuetify.label.rest") }}</p>

                      <p class="text-h3 font-weight-bold mb-3">
                        {{ `${timeResting}s` }}
                      </p>

                      <v-btn
                        class="text-none"
                        color="secondary"
                        @click="jumpRest"
                      >
                        <v-icon class="mr-2">
                          mdi-play-pause
                        </v-icon>

                        {{ t("$vuetify.label.skip_rest") }}
                      </v-btn>
                    </div>

                    <v-btn
                      block
                      :style="{ height: '5rem' }"
                      color="tertiary"
                      class="position-relative"
                      @click="tab = 1"
                    >
                      <div class="position-absolute top-0 left-0 right-0 bottom-0 pa-2 d-flex ga-2">
                        <div
                          :style="{ width: '6.5rem' }"
                          class="rounded-lg position-relative"
                        >
                          <template v-if="currentExercise.video_source === 'own'">
                            <div
                              v-if="!videoPreviewLoaded"
                              class="position-absolute top-0 left-0 right-0 bottom-0 d-flex justify-center align-center"
                            >
                              <v-progress-circular
                                indeterminate
                                color="primary"
                                :size="30"
                              />
                            </div>
                            <video
                              v-show="videoPreviewLoaded"
                              ref="videoRef"
                              :src="thumb!"
                              :style="{ objectFit: 'cover' }"
                              class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg w-100 h-100"
                              @loadedmetadata="seekToStart"
                            ></video>
                          </template>
                          <div
                            v-else
                            :style="{ backgroundImage: `url(${thumb})`, backgroundPosition: 'center', backgroundSize: 'cover' }"
                            class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg"
                          ></div>

                          <div
                            :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
                            class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg"
                          ></div>

                          <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex justify-center align-center rounded-lg">
                            <v-icon :size="30" color="white">
                              mdi-play
                            </v-icon>
                          </div>
                        </div>

                        <div
                          :style="{ textWrap: 'wrap' }"
                          class="flex-fill d-flex flex-column justify-center align-start"
                        >
                          <p
                            class="text-caption font-weight-bold"
                            :style="{ fontSize: '14px !important' }"
                          >{{ t("$vuetify.label.view_execution") }}</p>

                          <p
                            class="text-left text-body-2 text-grey-lighten-1"
                            :style="{ lineHeight: '1rem', fontSize: '0.7rem !important' }"
                          >{{ t("$vuetify.message.video_of_the_exercise_tips_and_instructions") }}</p>
                        </div>

                        <div class="d-flex justify-center align-center px-2">
                          <v-icon color="primary" :size="20">
                            mdi-video-outline
                          </v-icon>
                        </div>
                      </div>
                    </v-btn>
                  </div>

                  <template v-if="challenge.exercises">
                    <p class="text-uppercase text-caption text-grey-lighten-1 font-weight-bold mb-2">
                      {{ t("$vuetify.label.nexts") }}
                    </p>

                    <div class="d-flex flex-column ga-3">
                      <div
                        v-for="(exercise, i) in challenge.exercises"
                        :key="exercise.exercise_id"
                        class="d-flex align-center ga-4 rounded-xl px-4 py-3 d-flex bg-quintet border-sextet position-relative"
                      >
                        <div>
                          <div class="d-flex justify-center align-center">
                            <div
                              :style="{ width: '36px', height: '36px' }"
                              :class="[
                                'rounded-circle d-flex justify-center align-center text-caption text-grey-darken-1 font-weight-bold',
                                activityExercises.length > (i + 1) ? 'bg-success' : 'bg-blue'
                              ]"
                            >
                              <v-icon
                                v-if="activityExercises.length > (i + 1)"
                                color="tertiary"
                              >
                                mdi-check
                              </v-icon>
                              <span v-else>
                                {{ i + 1 }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="flex-fill d-flex flex-column align-start ga-1">
                          <p
                            :class="[
                              'font-weight-bold font-space-grotesk',
                              activityExercises.length > (i + 1) ? 'text-decoration-line-through' : ''
                            ]"
                          >{{ exercise.name }}</p>

                          <span
                            v-if="activityExercises.length === (i + 1) && started"
                            class="text-caption pa-1 rounded-lg bg-theme-primary-15 text-primary border-sm border-primary border-opacity-100"
                          >{{ t("$vuetify.label.in_progress") }}</span>

                          <p class="text-caption text-grey-lighten-1 d-flex ga-1">
                            <span>
                              {{
                                `${exercise.sets} x ${exercise.reps.type === "fixed" ? exercise.reps.max : `${exercise.reps.time}${getAbbreviationTime(exercise.reps.time_type)}`}`
                              }}
                            </span>
                          </p>

                          <div
                            v-if="exercise.equipments.length"
                            class="d-flex ga-2 text-caption text-grey-lighten-1 mt-1"
                          >
                            <v-icon
                              v-for="(equipment, e) in exercise.equipments"
                              :key="`equipment_cs_${e}`"
                            >{{ equipment.icon }}</v-icon>
                          </div>
                        </div>

                        <div
                          v-if="activityExercises.length > (i + 1)"
                          :style="{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }"
                          class="position-absolute top-0 left-0 right-0 bottom-0 rounded-xl"
                        ></div>
                      </div>
                    </div>
                  </template>
                </div>
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100">
                <div
                  v-if="tab === 1 && currentExercise"
                  class="d-flex flex-column overflow-y-hidden h-100"
                >
                  <div class="flex-fill overflow-y-auto">
                    <div
                      :style="{ height: '230px' }"
                      class="w-100 position-relative bg-black"
                    >
                      <div
                        v-if="!videoUrl"
                        class="w-100 h-100 d-flex justify-center align-center px-2"
                      >
                        <p class="text-center">
                          {{ t("$vuetify.message.this_workout_doesnt_have_an_explanatory_video") }}
                        </p>
                      </div>
                      <template v-else>
                        <div
                          v-if="!video_loaded"
                          class="position-absolute top-0 left-0 right-0 bottom-0 d-flex justify-center align-center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="primary"
                            :size="50"
                          />
                        </div>

                        <Player
                          class="h-100"
                          v-show="video_loaded"
                          :video-id="videoSources"
                          :start-second="videoTime"
                          @load="video_loaded = true"
                        />

                        <div
                          v-if="videoSource === 'own'"
                          class="position-absolute d-flex ga-1 pa-1 rounded-xl bg-theme-background-80"
                          :style="{ top: '0.5rem', right: '0.5rem' }"
                        >
                          <v-btn
                            icon
                            size="x-small"
                            :variant="videoGender === 'female' ? 'flat' : 'text'"
                            :color="videoGender === 'female' ? 'primary' : 'white'"
                            @click="setVideoGender('female')"
                          >
                            <v-icon :size="16">
                              mdi-gender-female
                            </v-icon>
                          </v-btn>

                          <v-btn
                            icon
                            size="x-small"
                            :variant="videoGender === 'male' ? 'flat' : 'text'"
                            :color="videoGender === 'male' ? 'primary' : 'white'"
                            @click="setVideoGender('male')"
                          >
                            <v-icon :size="16">
                              mdi-gender-male
                            </v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </div>

                    <div class="px-2 py-3">
                      <p class="text-h6 font-weight-bold mb-2 font-space-grotesk">
                        {{ currentExercise.name }}
                      </p>

                      <p class="d-flex align-center ga-2 text-caption text-grey-lighten-1 mb-5">
                        <v-icon>mdi-pause</v-icon>
                        {{ t("$vuetify.label.training_paused") }}
                      </p>

                      <div
                        v-if="currentExercise?.instructions?.length"
                        class="mb-6"
                      >
                        <p class="font-weight-bold text-h6 mb-2 d-flex align-center ga-2">
                          <v-icon :size="22" color="green">
                            mdi-format-list-bulleted
                          </v-icon>

                          {{ `${t("$vuetify.label.instructions")}:` }}
                        </p>

                        <div class="d-flex flex-column ga-2">
                          <div
                            v-for="(instruction, i) in currentExercise.instructions"
                            :key="instruction"
                          >
                            <div class="d-flex align-center ga-3">
                              <span>•</span>
                              <span>
                                {{ `${instruction}${(i + 1) === currentExercise.instructions.length ? "." : ";"}` }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="currentExercise?.tips?.length"
                        class="mb-6"
                      >
                        <p class="font-weight-bold text-h6 mb-2 d-flex align-center ga-2">
                          <v-icon :size="22" color="yellow">
                            mdi-lightbulb
                          </v-icon>

                          {{ `${t("$vuetify.label.tips")}:` }}
                        </p>

                        <div class="d-flex flex-column ga-2">
                          <div
                            v-for="(tip, i) in currentExercise.tips"
                            :key="tip"
                          >
                            <div class="d-flex align-center ga-3">
                              <span>•</span>
                              <span>
                                {{ `${tip}${(i + 1) === currentExercise.tips.length ? "." : ";"}` }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="currentExercise?.common_mistakes?.length">
                        <p class="font-weight-bold text-h6 mb-2 d-flex align-center ga-2">
                          <v-icon :size="22" color="error">
                            mdi-close
                          </v-icon>

                          {{ `${t("$vuetify.label.common_mistakes")}:` }}
                        </p>

                        <div class="d-flex flex-column ga-2">
                          <div
                            v-for="(common_mistake, i) in currentExercise.common_mistakes"
                            :key="common_mistake"
                          >
                            <div class="d-flex align-center ga-3">
                              <span>•</span>
                              <span>
                                {{ `${common_mistake}${(i + 1) === currentExercise.common_mistakes.length ? "." : ";"}` }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div :style="{ padding: `12px 8px calc(var(--bottom-saved) + 0.5rem) 8px` }" >
                    <v-btn
                      block
                      color="primary"
                      class="px-6 py-7 text-black font-weight-bold text-none"
                      @click="tab = 0"
                    >{{ t("$vuetify.label.back_button") }}</v-btn>
                  </div>
                </div>
              </v-tabs-window-item>

              <v-tabs-window-item></v-tabs-window-item>
            </v-tabs-window>
          </div>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <FinishActivity
          :activity="activity"
          @clear-data="removeAllData"
        />
      </v-tabs-window-item>

      <v-tabs-window-item></v-tabs-window-item>
    </v-tabs-window>

    <!-- BOTTOM SHEET DE DESISTIR DO TREINO -->
    <CancelActivity
      v-model="bottomSheet.exit"
      @cancel="exit"
    />

    <!-- BOTTOM SHEET DE DETALHES DE EQUIPAMENTO -->
    <v-bottom-sheet v-model="bottomSheet.equipment">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                {{ equipamentIcon }}
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ equipamentTitle }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
          >{{ equipamentDescription }}</p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7"
            @click="bottomSheet.equipment = false"
          >{{ t("$vuetify.label.ok") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE CONTINUAÇÃO DE EXERCÍCIO -->
    <ContinuationActivity
      v-model="bottomSheet.continuation"
      type="CHALLENGE"
      :allow-restart="allowRestart"
      @continue="continueChallenge"
      @restart="restartChallenge"
      @discard="discardChallenge"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import Utc from "dayjs/plugin/utc";
import Timezone from "dayjs/plugin/timezone";
import { v4 } from "uuid";
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useAppStore } from "@/stores/app";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { eventBus } from "@/eventBus";
import { GeolocationService } from "@/services/geolocation.service";
import { WorkoutService } from "@/services/workout.service";
import { Capacitor, CordovaNotifications, Device, LocalNotifications } from "@/mobile";
import { useFormatNumber, useLiveActivity } from "@/composables";
import {
  getActivityDurationSeconds,
  getAbbreviationTime,
  date,
  youtube
} from "@/utils";
import type { Activity, Exercise } from "@/types/activity.type";

dayjs.extend(Utc);
dayjs.extend(Timezone);

/// COMPONENTS
import Player from "@/components/Player.vue";
import FinishActivity from "@/components/Activity/Finish/index.vue";
import CancelActivity from "@/components/Activity/Cancel.vue";
import ContinuationActivity from "@/components/Activity/Continuation.vue";

/// DATA
const { t } = useLocale();
const { formatTime } = date();
const { extractId, extractTime } = youtube();
const { formatNumber } = useFormatNumber();
const accountsStore = useAccountsStore();
const appStore = useAppStore();
const persistentSession = usePersistentSession();

const videoRef = ref<HTMLVideoElement | null>(null);
const videoPreviewLoaded = ref(false);

const VIDEO_GENDER_STORAGE_KEY = "exercise-video-gender";
const videoGender = ref<"male" | "female">("male");

const masterTab = ref(0);
const tab = ref(0);

const bottomSheet = reactive({
  equipment: false,
  exit: false,
  continuation: false,
});

const allowRestart = ref(false);

const equipamentIcon = ref("");
const equipamentTitle = ref("");
const equipamentDescription = ref("");

const started = ref(false);
const paused = ref(false);

const video_loaded = ref(false);

const activity = ref<Activity>({
  _id: v4(),
  challenge_id: "",
  timezone: "",
  date_completed: "",
  duration_seconds: 0,
  calories: 0,
  started_at: "",
  ended_at: "",
  type: "CHALLENGE",
  status: "PENDING",
  pauses: [],
  exercises: [],
  from_coords: { lat: 0, lng: 0 }
});

const executionCurrentExercise = ref<Exercise>({
  exercise_id: "",
  started_at: "",
  ended_at: "",
  series: [],
  reps: {} as Exercise["reps"]
});

const resting = ref(false);
const timeResting = ref(0);

const kcal = ref(0);

const interval = ref<null | number>(null);

const isMobile = ref(false);

const hasNotificationPermission = ref(false);
const hasCreatedNotification = ref(false);
const notificationId = ref(0);
let isCreatingNotification = false;

const geolocationService = new GeolocationService;
const workoutService = new WorkoutService;
const liveActivity = useLiveActivity();

let startedBackgroundGeolocation = false;

const isLastExerciseFromSet = ref(false);

/// COMPUTED
const timezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
const dateNow = computed(() => dayjs().tz(timezone.value).format("YYYY-MM-DD"));
const account = computed(() => accountsStore.account);
const challenge = computed(() => account.value?.plan?.challenge);
const activityExercises = computed(() => activity.value.exercises!);
const indexExercise = computed(() => activityExercises.value.length);
const currentExercise = computed(() => challenge.value?.exercises?.[indexExercise.value - 1]);
const totalExercises = computed(() => challenge.value?.exercises?.length || 0);
const calculatePercentage = computed(() => Math.min((indexExercise.value / totalExercises.value) * 100, 100));
const videoSource = computed(() => currentExercise.value?.video_source || "");
const thumb = computed(() => {
  const exercise = currentExercise.value!;

  if (exercise.thumb) return exercise.thumb;
  if (!videoSource.value || videoSource.value === "own") return videoUrl.value;

  const id = extractId(exercise.video_link || "");

  return `https://img.youtube.com/vi/${id || "NONE"}/hqdefault.jpg`;
});
const videoUrl = computed(() => {
  const exercise = currentExercise.value;

  if (!exercise) return "";
  if (videoSource.value === "youtube") return extractId(exercise.video_link || "") || "";

  return `${import.meta.env.VITE_AWS_CLOUDFRONT_URL}exercises/${exercise.exercise_id}/${videoGender.value}_front.mp4`;
});
const videoTime = computed(() => {
  const exercise = currentExercise.value!;
  return exercise.video_source === "youtube" ?
    extractTime(exercise.video_link || "") :
    0;
});
const videoSources = computed(() => [{ src: videoUrl.value || "", type: "video/mp4" }]);
const isInProgress = computed(() => {
  const isPaused = activity.value.pauses.some((p) => !p.ended_at) || paused.value;
  if (!started.value || isPaused) return false;
  return true;
});

/// WATCH
watch(videoUrl, () => {
  videoPreviewLoaded.value = false;
  video_loaded.value = false;
});

watch(masterTab, (val) => {
  if (val === 1) {
    eventBus.off("BACK_BUTTON", backButton);
    CordovaNotifications.cancelNotification(notificationId.value);
  }
});

watch(tab, async (val) => {
  if (val === 1) {
    if (started.value && !resting.value) paused.value = true;
    video_loaded.value = false;
  }

  if (started.value) await persistentSession.set("tab", String(val));
});

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

  if (started.value) await persistentSession.set("paused", String(Number(val)));
});

watch(activity, async (val) => {
  if (started.value) await persistentSession.set("activity", JSON.stringify(val));
}, { deep: true });

watch(executionCurrentExercise, async (val) => {
  if (started.value) await persistentSession.set("execution-current-exercise", JSON.stringify(val));

  const exists = activityExercises.value.some(
    (exercise) => exercise.exercise_id === val.exercise_id
  );

  if (exists) {
    const index = activityExercises.value.findIndex(
      (exercise) => exercise.exercise_id === val.exercise_id
    );

    activityExercises.value[index] = JSON.parse(JSON.stringify((executionCurrentExercise.value)));
  }
}, { deep: true });

watch(resting, async (val) => {
  if (started.value) await persistentSession.set("resting", String(Number(val)));

  if (!val && tab.value === 1) {
    tab.value = 0;
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.the_rest_period_is_over")
    });
  }
});

watch(timeResting, async (val) => {
  if (started.value) await persistentSession.set("time-resting", String(val));
});

watch(notificationId, async (val) => {
  if (started.value) await persistentSession.set("notification-id", String(val));
});

watch(isLastExerciseFromSet, async (val) => {
  await persistentSession.set("is-last-exercise-from-set", String(Number(val)));
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);
  eventBus.on("LOCATION", handleReceivedLocation);

  const storedVideoGender = await persistentSession.get(VIDEO_GENDER_STORAGE_KEY);
  if (storedVideoGender === "male" || storedVideoGender === "female") videoGender.value = storedVideoGender;

  interval.value = setInterval(handleInterval, 1000);

  await loadAccount();

  const typeTraining = await persistentSession.get("type-training");

  if (typeTraining === "CHALLENGE") {
    const tempActivity = JSON.parse(await persistentSession.get("activity") || "{}") as Activity;
    allowRestart.value = tempActivity.date_completed === dateNow.value;

    if (tempActivity?.status === "DONE") {
      activity.value = tempActivity as Activity;
      masterTab.value = 1;
    } else {
      bottomSheet.continuation = true;
    }
  } else {
    await createInitialData();
  }

  const [deviceInfo, notificationPermissions] = await Promise.all([
    Device.getInfo(),
    LocalNotifications.checkPermissions()
  ]);

  isMobile.value = ["android", "ios"].includes(deviceInfo.platform);
  hasNotificationPermission.value = notificationPermissions.display === "granted";
});

onBeforeUnmount(() => {
  if (masterTab.value === 0) {
    eventBus.off("BACK_BUTTON", backButton);
  }

  CordovaNotifications.un("TOGGLE_PAUSE", togglePause);
  CordovaNotifications.un("JUMP_REST", jumpRest);

  CordovaNotifications.cancelNotification(notificationId.value);
  endLiveActivity();

  eventBus.off("LOCATION", handleReceivedLocation);

  if (interval.value !== null) clearInterval(interval.value);

  if (startedBackgroundGeolocation) {
    geolocationService.stopBackgroundGeolocation();
  }
});

/// METHODS
const setVideoGender = async (gender: "male" | "female") => {
  if (videoGender.value === gender) return;

  videoGender.value = gender;
  await persistentSession.set(VIDEO_GENDER_STORAGE_KEY, gender);
};

const seekToStart = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = 1;
    setTimeout(() => videoPreviewLoaded.value = true, 1_500);
  }
};

const calculateCalories = () => {
  return workoutService.calculateTotalCalories(
    workoutService.buildActivityTimeline(
      activity.value,
      challenge.value!.exercises!.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        sets: exercise.sets,
        calories_per_min: exercise.calories_per_min,
        thumb: exercise.thumb,
        video_source: exercise.video_source,
        video_link: exercise.video_link,
        instructions: exercise.instructions,
        tips: exercise.tips,
        common_mistakes: exercise.common_mistakes,
        equipments: exercise.equipments,
        reps: exercise.reps,
        estimated_duration_seconds: exercise.estimated_duration_seconds,
        rest_after_exercise_seconds: exercise.rest_after_exercise_seconds,
        rest_seconds: isLastExerciseFromSet.value ? exercise.rest_after_exercise_seconds : exercise.rest_between_sets_seconds
      })),
      account.value
    )
  );
};

const handleReceivedLocation = () => {
  if (!appStore.foreground) handleInterval();
};

const handleInterval = async () => {
  if (isInProgress.value) {
    kcal.value = calculateCalories();

    activity.value = {
      ...activity.value,
      duration_seconds: getActivityDurationSeconds(
        activity.value,
        activity.value.ended_at || dayjs().toISOString()
      ),
      calories: kcal.value
    };
  }

  if (started.value) {
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
        isMobile &&
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

    persistentSession.set("last-update-time", dayjs().toISOString());
  }

  if (timeResting.value >= 0 && isInProgress.value) {
    timeResting.value--;
    if (timeResting.value === 0) nextStep(false);
  }
};

const createDefaultExercise = (ind: number = 0) => {
  const exercise = challenge.value!.exercises[ind]!;

  executionCurrentExercise.value = {
    started_at: ind === 0 ? "" : dayjs().toISOString(),
    ended_at: "",
    exercise_id: exercise.exercise_id,
    reps: exercise.reps,
    series: [{
      set: 1,
      started_at: ind === 0 ? "" : dayjs().toISOString(),
      ended_at: "",
      rest: { seconds: 0, created_at: "", ended_at: "", jump: false },
    }]
  };

  activityExercises.value.push(
    JSON.parse(JSON.stringify((executionCurrentExercise.value)))
  );
};

const createInitialData = async () => {
  createDefaultExercise(0);

  const permission = await geolocationService.checkPermissions();

  if (permission === "granted") {
    const { lat, lng } = await geolocationService.getCurrentPosition();
    activity.value.from_coords = { lat, lng };
  }
};

const detailEquipment = (icon: string, title: string, description: string) => {
  equipamentIcon.value = icon;
  equipamentTitle.value = title;
  equipamentDescription.value = description;
  bottomSheet.equipment = true;
};

const loadAccount = async () => {
  await accountsStore.GET_ACCOUNT();
};

const startTraining = async (fromZero = true) => {
  started.value = true;

  if (fromZero) {
    activity.value.started_at = dayjs().toISOString();
    activity.value.challenge_id = challenge.value!._id;
    activity.value.date_completed = dateNow.value;
    activity.value.timezone = timezone.value;

    executionCurrentExercise.value.started_at = dayjs().toISOString();
    executionCurrentExercise.value.series[0]!.started_at = dayjs().toISOString();

    notificationId.value = CordovaNotifications.createId();
  }

  await Promise.all([
    persistentSession.set("type-training", "CHALLENGE"),
    persistentSession.set("tab", String(tab.value)),
    persistentSession.set("paused", String(Number(paused.value))),
    persistentSession.set("activity", JSON.stringify(activity.value)),
    persistentSession.set("execution-current-exercise", JSON.stringify(executionCurrentExercise.value)),
    persistentSession.set("resting", String(Number(resting.value))),
    persistentSession.set("time-resting", String(timeResting.value)),
    persistentSession.set("last-update-time", dayjs().toISOString()),
    persistentSession.set("notification-id", String(notificationId.value)),
    persistentSession.set("is-last-exercise-from-set", String(Number(isLastExerciseFromSet.value)))
  ]);

  await startNotification();
  await startLiveActivity();
  hasCreatedNotification.value = true;

  const permission = await geolocationService.checkPermissions();
  if (permission === "granted") {
    await geolocationService.startBackgroundGeolocation(
      t("$vuetify.message.challenge_in_progress"),
      t("$vuetify.message.your_challenge_is_active")
    );
    startedBackgroundGeolocation = true;
  }
};

const removeAllData = async () => {
  await Promise.all([
    persistentSession.remove("type-training"),
    persistentSession.remove("tab"),
    persistentSession.remove("paused"),
    persistentSession.remove("activity"),
    persistentSession.remove("execution-current-exercise"),
    persistentSession.remove("resting"),
    persistentSession.remove("time-resting"),
    persistentSession.remove("last-update-time"),
    persistentSession.remove("notification-id"),
    persistentSession.remove("is-last-exercise-from-set"),
  ]);
};

const exit = async () => {
  await removeAllData();
  eventBus.emit("BACK_ROUTER");
};

const togglePause = async () => {
  if (!resting.value) {
    paused.value = !paused.value;
    await CordovaNotifications.cancelNotification(notificationId.value);
    notificationId.value = CordovaNotifications.createId();
    startNotification();
    updateLiveActivity();
  }
};

const bodyNotification = () => {
  const extraMessage = resting.value ?
    `\n${t("$vuetify.label.resting")}: ${timeResting.value}s` :
    paused.value ? `\n${t("$vuetify.label.training_paused")}` : "";

  return {
    id: notificationId.value,
    title: t("$vuetify.label.challenge_of_the_day"),
    text: `${currentExercise.value?.name} • ${formatTime(activity.value.duration_seconds)} • ${formatNumber(kcal.value)} ${t("$vuetify.label.kcal_abbreviation")}${extraMessage}`,
    channel_id: hasCreatedNotification.value ? "activity_silence" as const : "activity_sound" as const,
    actions: resting.value ? "REST" : "PAUSE",
    android_auto_cancel: false,
    ongoing: true,
  };
};

const bodyLiveActivity = () => ({
  durationSeconds: activity.value.duration_seconds,
  statusLabel: resting.value ?
    `${t("$vuetify.label.resting")}: ${timeResting.value}s` :
    paused.value ? t("$vuetify.label.training_paused") : "",
  subtitle: currentExercise.value?.name || "",
  stat1: `${indexExercise.value}/${totalExercises.value}`,
  stat2: `${formatNumber(kcal.value, "decimal")} ${t("$vuetify.label.kcal_abbreviation")}`
});

const startLiveActivity = async () => {
  await liveActivity.start({
    title: t("$vuetify.label.challenge_of_the_day"),
    icon: "trophy.fill",
    ...bodyLiveActivity()
  });
};

const updateLiveActivity = async () => {
  await liveActivity.update(bodyLiveActivity());
};

const endLiveActivity = async () => {
  await liveActivity.end();
};

const startNotification = async () => {
  if (isMobile.value && hasNotificationPermission.value && Capacitor.getPlatform() !== "ios") {
    if (!hasCreatedNotification.value) {
      CordovaNotifications.on("TOGGLE_PAUSE", togglePause);
      CordovaNotifications.on("JUMP_REST", jumpRest);
    }

    await Promise.all([
      CordovaNotifications.createActions("PAUSE", [{
        id: "TOGGLE_PAUSE",
        title: t(`$vuetify.label.${paused.value ? "resume" : "pause"}`)
      }]),
      CordovaNotifications.createActions("REST", [{
        id: "JUMP_REST",
        title: t("$vuetify.label.skip_rest")
      }])
    ]);

    isCreatingNotification = true;

    await CordovaNotifications.createNotification(bodyNotification());

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

const back = () => {
  if (started.value) {
    bottomSheet.exit = true;
  } else {
    exit();
  }
};

const backButton = () => {
  if (masterTab.value === 0 && tab.value === 1) {
    tab.value = 0;
  } else {
    back();
  }
};

const finishSerie = () => {
  paused.value = false;

  const { series } = executionCurrentExercise.value;

  const serie = series[series.length - 1];
  serie!.ended_at = dayjs().toISOString();
  serie!.rest.created_at = dayjs().toISOString();

  isLastExerciseFromSet.value = (currentExercise.value!.sets - 1) === (series.length - 1);

  timeResting.value = isLastExerciseFromSet.value ? currentExercise.value!.rest_after_exercise_seconds : currentExercise.value!.rest_between_sets_seconds;
  resting.value = true;
};

const jumpRest = () => {
  paused.value = false;
  nextStep(true);
};

const continueChallenge = async () => {
  bottomSheet.continuation = false;

  activity.value = JSON.parse((await persistentSession.get("activity")) || "{}") as Activity;

  if (activity.value.status === "DONE") {
    endActivity();
  } else {
    tab.value = Number(await persistentSession.get("tab"));
    paused.value = Boolean(Number(await persistentSession.get("paused")));
    executionCurrentExercise.value = JSON.parse((await persistentSession.get("execution-current-exercise")) || "{}") as Exercise;
    resting.value = Boolean(Number(await persistentSession.get("resting")));
    timeResting.value = Number(await persistentSession.get("time-resting"));
    isLastExerciseFromSet.value = Boolean(Number(await persistentSession.get("is-last-exercise-from-set")));

    CordovaNotifications.cancelNotification(
      Number(await persistentSession.get("notification-id"))
    );

    started.value = true;

    if (paused.value) {
      kcal.value = calculateCalories();
      activity.value.pauses.pop();
    }

    if (!paused.value) {
      activity.value.pauses.push({
        started_at: (await persistentSession.get("last-update-time")) || dayjs().toISOString(),
        ended_at: dayjs().toISOString(),
      });
    }

    startTraining(false);
  }
};

const restartChallenge = async () => {
  bottomSheet.continuation = false;

  tab.value = Number(await persistentSession.get("tab"));
  activity.value = JSON.parse((await persistentSession.get("activity")) || "{}") as Activity;
  executionCurrentExercise.value = JSON.parse((await persistentSession.get("execution-current-exercise")) || "{}") as Exercise;
  resting.value = Boolean(Number(await persistentSession.get("resting")));
  timeResting.value = Number(await persistentSession.get("time-resting"));
  isLastExerciseFromSet.value = Boolean(Number(await persistentSession.get("is-last-exercise-from-set")));

  CordovaNotifications.cancelNotification(
    Number(await persistentSession.get("notification-id"))
  );

  activity.value.started_at = dayjs().toISOString();
  activity.value.challenge_id = challenge.value!._id;
  activity.value.date_completed = dateNow.value;
  activity.value.timezone = timezone.value;
  activity.value.duration_seconds = 0;

  activity.value.exercises = [];
  await createInitialData();

  executionCurrentExercise.value.started_at = dayjs().toISOString();
  executionCurrentExercise.value.series[0]!.started_at = dayjs().toISOString();

  startTraining(false);
};

const discardChallenge = async () => {
  bottomSheet.continuation = false;
  await createInitialData();
  await removeAllData();
};

const nextStep = (jump: boolean) => {
  resting.value = false;

  const { series } = executionCurrentExercise.value;

  const serie = series[series.length - 1];
  serie!.rest.ended_at = dayjs().toISOString();
  serie!.rest.jump = jump;

  const time = isLastExerciseFromSet.value ? currentExercise.value!.rest_after_exercise_seconds : currentExercise.value!.rest_between_sets_seconds;

  serie!.rest.seconds = time - timeResting.value;

  if (series.length < currentExercise.value!.sets) {
    series.push({
      started_at: dayjs().toISOString(),
      ended_at: "",
      set: series.length + 1,
      rest: { seconds: 0, created_at: "", ended_at: "", jump: false },
    });
  }

  if (series[currentExercise.value!.sets - 1]?.rest?.ended_at) {
    const nextExercise = challenge.value!.exercises[indexExercise.value];
    executionCurrentExercise.value.ended_at = dayjs().toISOString();

    if (nextExercise) {
      const index = activityExercises.value.findIndex(
        (exercise) => exercise.exercise_id === executionCurrentExercise.value.exercise_id
      );

      activityExercises.value[index] = JSON.parse(JSON.stringify((executionCurrentExercise.value)));

      createDefaultExercise(indexExercise.value);
    } else {
      endActivity();
    }
  }
};

const endActivity = () => {
  const endedAt = dayjs().toISOString();

  if (interval.value !== null) {
    clearInterval(interval.value);
    interval.value = null;
  }

  CordovaNotifications.cancelNotification(notificationId.value);
  endLiveActivity();

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

  masterTab.value = 1;

  if (startedBackgroundGeolocation) {
    geolocationService.stopBackgroundGeolocation();
    startedBackgroundGeolocation = false;
  }
};
</script>