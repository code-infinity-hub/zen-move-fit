<template>
  <div
    id="finish-activity"
    class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary"
  >
    <header class="heading border-bottom-tertiary d-flex ga-4">
      <div
        v-if="props.edit"
        class="h-100 d-flex justify-center align-center"
      >
        <v-btn
          icon=""
          size="x-small"
          color="tertiary"
          @click="eventBus.emit('BACK_ROUTER')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </div>

      <div class="flex-fill">
        <p
          class="text-h6 font-space-grotesk font-weight-bold"
        >{{ titlePage }}</p>

        <p class="text-body-2 text-grey-lighten-1">
          {{ timeActivity }}
        </p>
      </div>
    </header>

    <div class="flex-fill overflow-y-auto">
      <div class="d-flex flex-column px-3 pt-6 pb-3">
        <v-form
          ref="form"
          @submit.prevent="submit"
        >
          <template v-if="props.activity.type === 'AVULSE'">
            <div
              v-if="!isEdit"
              v-show="showBigMap"
              class="position-fixed top-0 left-0 right-0 bottom-0"
              :style="{ zIndex: 1 }"
            >
              <div
                id="map2"
                class="position-absolute top-0 left-0 right-0 bottom-0"
              ></div>

              <div
                class="position-absolute px-2"
                :style="{ top: 'var(--top-saved)' }"
              >
                <div
                  class="bg-secondary pa-2 rounded-xl d-flex justify-center align-center text-body-2"
                  :style="{ border: '2px solid var(--tertiary)', width: '40px', height: '40px', zIndex: 10000 }"
                  @click="showBigMap = false"
                >
                  <v-icon color="white">
                    mdi-chevron-left
                  </v-icon>
                </div>
              </div>
            </div>
            <div
              v-if="isEdit && edit?.map_picture"
              class="d-flex justify-center align-center px-3 mb-6"
            >
              <img
                class="w-100 rounded-lg"
                :style="{ height: '12rem', objectFit: 'cover', border: '2px solid var(--tertiary)' }"
                :src="edit.map_picture"
              />
            </div>

            <div
              v-else-if="!isEdit"
              class="d-flex justify-center align-center px-3 mb-6"
            >
              <v-btn
                block
                color="transparent"
                :style="{ height: '12rem', border: '2px solid var(--tertiary)' }"
                class="rounded-lg position-relative"
                @click="showBigMap = mapLoaded"
              >
                <div
                  v-if="!mapLoaded"
                  class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg d-flex justify-center align-center"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    :size="50"
                  />
                </div>

                <div
                  :style="{ visibility: mapLoaded ? 'visible' : 'hidden' }"
                  id="map"
                  :class="[
                    'position-absolute top-0 left-0 right-0 bottom-0',
                    roundMap ? 'rounded-lg' : ''
                  ]"
                ></div>
              </v-btn>
            </div>

            <div class="d-flex justify-center align-center ga-4 mb-4">
              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ rhythm }}

                  <span class="text-caption text-lowercase">
                    {{ `/${t("$vuetify.label.km")}` }}
                  </span>
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.pace") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ calories }}

                  <span class="text-caption">
                    {{ t("$vuetify.label.kcal_abbreviation") }}
                  </span>
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.calories") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ formatTime(primaryDurationSeconds) }}
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.time") }}
                </p>
              </div>
            </div>

            <div class="d-flex justify-center align-center ga-4 mb-8">
              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ distance }}

                  <span class="text-caption text-lowercase">
                    {{ t("$vuetify.label.km") }}
                  </span>
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.distance") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ avg_speed }}

                  <span class="text-caption">
                    {{ t("$vuetify.label.km_h") }}
                  </span>
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.avg_speed") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ steps }}
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.steps") }}
                </p>
              </div>
            </div>
          </template>
          <template v-else-if="['TRAINING', 'CHALLENGE'].includes(props.activity.type)">
            <div class="d-flex justify-center align-center ga-4 mb-8">
              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ props.activity.exercises!.length }}
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.exercises") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ formatTime(props.activity.duration_seconds) }}
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.time") }}
                </p>
              </div>

              <v-divider vertical></v-divider>

              <div class="d-flex flex-column align-center justify-center text-center">
                <p class="font-weight-bold">
                  {{ `${formatNumber(props.activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                </p>

                <p class="text-grey-lighten-1 text-body-2">
                  {{ t("$vuetify.label.calories") }}
                </p>
              </div>
            </div>
          </template>

          <TextField
            required
            class="mb-7"
            :label="titleField"
            :placeholder="titlePlaceholder"
            v-model="title"
          />

          <template v-if="props.activity.type === 'AVULSE'">
            <ItemSelect
              required
              disabled
              class="mb-5"
              :label="t('$vuetify.label.type_of_activity')"
              :items="listCategories"
              v-model="props.activity.category"
            />

            <div class="w-100 d-flex flex-column mb-7">
              <label class="mb-2 text-subtitle-2">
                {{ t("$vuetify.label.tags") }}
              </label>

              <div class="d-flex flex-wrap ga-2">
                <div
                  v-for="tab in allTags"
                  :key="tab"
                  :style="{
                    ...(
                      tags.includes(tab) ?
                        { border: '1px solid var(--primary)', color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' } :
                        { border: '1px solid #272C34' }
                    )
                  }"
                  class="py-2 px-4 rounded-xl"
                  @click="tags.includes(tab) ? (tags = tags.filter((item) => item !== tab)) : tags.push(tab)"
                >{{ t(`$vuetify.label.${tab}`) }}</div>
              </div>
            </div>
          </template>

          <div class="w-100 d-flex flex-column mb-7">
            <label class="mb-2 text-subtitle-2 d-flex justify-space-between">
              <span>
                {{ t("$vuetify.label.perceived_effort") }}
              </span>

              <span class="text-grey-darken-1">
                {{ `${perceivedEffort}/${totalEfforts}` }}
              </span>
            </label>

            <v-slider
              :min="1"
              :max="totalEfforts"
              :step="1"
              hide-details="auto"
              color="primary"
              v-model="perceivedEffort"
            />

            <p class="mt-1 text-body-2 text-grey-lighten-1">
              {{ t(`$vuetify.efforts.effort_${perceivedEffort}`)  }}
            </p>
          </div>

          <div class="mb-5">
            <div class="w-100 d-flex ga-2 overflow-x-auto overflow-y-hidden">
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    :style="{
                      width: (files.length || existingFiles.length) ? '10rem' : '100%',
                      height: '10rem'
                    }"
                    color="tertiary"
                    class="rounded-lg border-md border-dotted border-primary border-opacity-100 position-relative text-none"
                    v-bind="props"
                  >
                    <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex flex-column justify-center align-center px-2">
                      <v-icon color="primary" :size="30">
                        mdi-image-outline
                      </v-icon>

                      <span
                        class="mt-2 text-body-2 text-primary"
                        :style="{ textWrap: 'wrap' }"
                      >{{ t("$vuetify.label.add_photos_videos") }}</span>
                    </div>
                  </v-btn>
                </template>

                <Picker @handle-files="addFiles" />
              </v-menu>

              <div
                v-for="file in existingFiles"
                :key="file.url"
                :style="{ height: '10rem' }"
                class="position-relative"
              >
                <img
                  v-if="file.mimetype.startsWith('image')"
                  class="h-100 rounded-lg"
                  :src="file.url"
                  @click="eventBus.emit('SHOW_IMAGE', { images: [file.url] })"
                />
                <Player
                  v-else
                  class="h-100"
                  :style="{ width: '20rem' }"
                  :video-id="[{ src: file.url, type: file.mimetype }]"
                />

                <v-btn
                  icon=""
                  size="x-small"
                  color="tertiary"
                  class="position-absolute"
                  :style="{ top: '0.2rem', right: '0.2rem' }"
                  @click="removeExistingFile(file.url)"
                >
                  <v-icon>
                    mdi-trash-can
                  </v-icon>
                </v-btn>
              </div>

              <div
                v-for="file in files"
                :key="file.id"
                :style="{ height: '10rem' }"
                class="position-relative"
              >
                <img
                  v-if="file.type === 'image'"
                  class="h-100 rounded-lg"
                  :src="file.path"
                  @click="eventBus.emit('SHOW_IMAGE', { images: [file.path] })"
                />
                <Player
                  v-else
                  class="h-100"
                  :style="{ width: '20rem' }"
                  :video-id="[{ src: file.path, type: '' }]"
                />

                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon=""
                      size="x-small"
                      color="tertiary"
                      class="position-absolute"
                      :style="{ top: '0.2rem', right: '0.2rem' }"
                      v-bind="props"
                    >
                      <v-icon>
                        mdi-dots-vertical
                      </v-icon>
                    </v-btn>
                  </template>

                  <List :style="{ minWidth: '17rem' }">
                    <v-list-item v-if="file.type === 'image'">
                      <v-list-item-title>
                        <div
                          v-ripple
                          class="rounded-lg bg-secondary pa-2 d-flex align-center ga-3"
                          @click="editFile(file.id)"
                        >
                          <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                            <v-icon :size="25">
                              mdi-pencil
                            </v-icon>
                          </div>

                          <span class="text-h6">
                            {{ t("$vuetify.label.edit_photo") }}
                          </span>
                        </div>
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-title>
                        <div
                          v-ripple
                          class="rounded-lg bg-secondary pa-2 d-flex align-center ga-3"
                          @click="removeFile(file.id)"
                        >
                          <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                            <v-icon :size="25">
                              mdi-trash-can
                            </v-icon>
                          </div>

                          <span class="text-h6">
                            {{ t("$vuetify.label.remove_file") }}
                          </span>
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                  </List>
                </v-menu>
              </div>
            </div>
          </div>

          <p class="mb-7 text-body-2 text-grey-lighten-1">
            <v-icon class="mr-1">
              mdi-information
            </v-icon>

            {{ t("$vuetify.message.each_video_can_only_be_a_maximum_of_mb", maximumMbVideo) }}
          </p>

          <template v-if="props.activity.type === 'AVULSE' && !isEdit">
            <ItemSelect
              class="mb-3"
              :label="t('$vuetify.label.equipment_used')"
              :items="equipments"
              v-model="equipment"
            />

            <v-btn
              block
              variant="text"
              class="text-none mb-5 py-5"
              @click="emit('add-equipment')"
            >
              <v-icon class="mr-2">
                mdi-plus
              </v-icon>

              {{ t("$vuetify.label.add_equipment") }}
            </v-btn>
          </template>

          <TextareaField
            no-resize
            enable-emoji
            class="mb-7"
            :label="descriptationPlaceholder"
            v-model="description"
          />

          <TextareaField
            enable-emoji
            no-resize
            persistent-hint
            class="mb-7"
            :label="t('$vuetify.label.private_observations')"
            :placeholder="t('$vuetify.message.only_you_will_see_these_observations')"
            :hint="privateObservations ? t('$vuetify.message.only_you_will_see_these_observations') : undefined"
            v-model="privateObservations"
          />

          <TagPeople
            v-if="!isEdit && props.activity.type === 'AVULSE'"
            class="mb-7"
            v-model="taggedPeople"
          />

          <template
            v-if="
              (currentWorkout && props.activity.type === 'TRAINING') ||
              (currentChallenge && props.activity.type === 'CHALLENGE') ||
              (isEdit && ['TRAINING', 'CHALLENGE'].includes(props.activity.type))
            "
          >
            <p class="mb-1 font-weight-bold text-h6">
              {{ t("$vuetify.label.exercises") }}
            </p>

            <p
              v-if="props.activity.type === 'TRAINING'"
              class="mb-3 font-weight-bold"
            >{{ isEdit ? (edit?.workout_title || "") : currentWorkout!.title }}</p>

            <div
              v-for="(exercise, i) in props.activity.exercises!"
              :key="exercise.exercise_id"
              :class="[
                'pa-3 rounded-lg bg-tertiary d-flex justify-center align-center',
                i === (props.activity.exercises!.length - 1) ? 'mb-7' : 'mb-2'
              ]"
            >
              <span class="flex-fill">
                {{ getExerciseName(exercise.exercise_id) }}
              </span>

              <span class="text-grey-lighten-1">
                {{
                  `${exercise.series.length} x ${exercise.reps.type === "fixed" ? exercise.reps.max : `${exercise.reps.time}${getAbbreviationTime(exercise.reps.time_type)}`}`
                }}
              </span>
            </div>
          </template>

          <p class="mb-2 font-weight-bold text-h6">
            {{ t("$vuetify.label.visibility") }}
          </p>

          <ItemSelect
            persistent-hint
            class="mb-7"
            :label="t('$vuetify.label.who_can_see')"
            :items="[
              { title: t('$vuetify.label.all'), value: 'ALL', icon: 'mdi-earth' },
              { title: t('$vuetify.label.followers'), value: 'FOLLOWERS', icon: 'mdi-account-multiple' },
              { title: t('$vuetify.label.only_you'), value: 'NONE', icon: 'mdi-lock' },
            ]"
            :hint="t(`$vuetify.message.visibility_${visibility.toLowerCase()}`)"
            v-model="visibility"
          />

          <ItemSelect
            v-if="visibility !== 'NONE'"
            multiple
            class="mb-7"
            :label="t('$vuetify.label.hidden_details')"
            :items="listHiddenDetails"
            v-model="hiddenDetails"
          />

          <v-checkbox
            class="pt-0 mb-5"
            hide-details="auto"
            color="primary"
            :disabled="isEdit"
            v-model="post"
            :label="t('$vuetify.label.post_to_social_feed')"
          />

          <v-btn
            v-if="!isEdit"
            block
            variant="outlined"
            color="error"
            class="font-weight-bold text-none pa-6 d-flex"
            @click="bottomSheet.discard = true"
          >
            <v-icon class="mr-2">
              mdi-trash-can-outline
            </v-icon>

            {{ t("$vuetify.label.discard_activity") }}
          </v-btn>

          <input type="submit" v-show="false" />
        </v-form>
      </div>
    </div>

    <footer
      class="pa-3"
      :style="{ paddingBottom: 'calc(6px + var(--bottom-saved)) !important', borderTop: '1px solid var(--tertiary)' }"
    >
      <v-btn
        block
        color="primary"
        class="text-black font-weight-bold text-none pa-7 text-h6 d-flex"
        @click="submit"
      >{{ isEdit ? t("$vuetify.label.save") : t("$vuetify.label.save_activity") }}</v-btn>
    </footer>

    <Completed
      v-if="showUI"
      :activity="activity"
    />

    <!-- BOTTOM SHEET DE DESISTIR DA ATIVIDADE -->
    <v-bottom-sheet v-model="bottomSheet.discard">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-close
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ titleBottomSheet }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
            v-html="messageBottomSheet"
          ></p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.discard = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="exit"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE SEM CONEXÃO COM A INTERNET -->
    <v-bottom-sheet v-model="bottomSheet.no_connection">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-wifi-remove
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.label.activity_saved_offline") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1">
            {{ t("$vuetify.message.activity_saved_offline_no_connection") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="saveAfter"
          >{{ t("$vuetify.label.back_to_home") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="bottomSheet.no_connection = false"
          >{{ t("$vuetify.label.try_again") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE ERRO NO SERVIDOR -->
    <v-bottom-sheet v-model="bottomSheet.error_server">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-alert-circle
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.message.the_activity_could_not_be_submitted") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1">
            {{ t("$vuetify.message.the_activity_could_not_be_submitted_retry") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="saveAfter"
          >{{ t("$vuetify.label.back_to_home") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="bottomSheet.error_server = false"
          >{{ t("$vuetify.label.try_again") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useActivitiesStore } from "@/stores/activities";
import { useAppStore } from "@/stores/app";
import { useChallengesStore } from "@/stores/challenges";
import { useEquipmentsStore } from "@/stores/equipments";
import { useWorkoutsStore } from "@/stores/workouts";
import { MapService } from "@/services/map.service";
import { MediaService } from "@/services/media.service";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { SqliteService } from "@/services/sqlite.service";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { useAppReview, useForm } from "@/composables";
import { useFormatNumber } from "@/composables/use-format-number.ts";
import { getAbbreviationTime, date } from "@/utils";
import type { Activity, ActivityDetail } from "@/types/activity.type";
import type { Challenge } from "@/types/challenge.type";
import type { Equipment } from "@/types/equipment.type";
import type { Workout } from "@/types/workout.type";
import type { MediaResult, RunningMetricsCheckpoint } from "@/types/global.type";
import type { MentionUser } from "@/types/social.type";

/// COMPONENTS
import List from "@/components/List.vue";
import Player from "@/components/Player.vue";
import Completed from "./Completed.vue";
import Picker from "./Picker.vue";
import TagPeople from "./TagPeople.vue";

/// JSON
import activitesCategories from "@/json/activities-categories.json";
import allTags from "@/json/all-tags.json";

/// DATA
const { t } = useLocale();
const { formatDateTimeLong, formatTime } = date();
const { formatNumber } = useFormatNumber();
const { validate } = useForm();
const { requestAfterActivityCompleted } = useAppReview();
const props = defineProps<{ activity: Activity, edit?: ActivityDetail }>();
const emit = defineEmits(["clear-data", "add-equipment"]);
const persistentSession = usePersistentSession();
const activitiesStore = useActivitiesStore();
const appStore = useAppStore();
const challengesStore = useChallengesStore();
const equipmentsStore = useEquipmentsStore();
const workoutsStore = useWorkoutsStore();

const mediaService = new MediaService();
const totalEfforts = 10;
const maximumMbVideo = +import.meta.env.VITE_MAXIMUM_MB_VIDEO;

const activity = ref<Activity>(JSON.parse(JSON.stringify(props.activity)));

const currentWorkout = ref<Workout>();
const currentChallenge = ref<Challenge>();

const bottomSheet = reactive({
  discard: false,
  no_connection: false,
  error_server: false,
});

const menu = ref(false);
const form = ref();
const title = ref("");
const perceivedEffort = ref(1);
const tags = ref<string[]>([]);
const equipment = ref("");
const files = ref<Omit<MediaResult, "base64">[]>([]);
const existingFiles = ref<{ url: string, mimetype: string }[]>([]);
const taggedPeople = ref<MentionUser[]>([]);
const description = ref("");
const privateObservations = ref("");
const visibility = ref("");
const hiddenDetails = ref<string[]>([]);
const post = ref(true);
const mapLoaded = ref(false);
const showUI = ref(false);

let mapService: MapService | null = null;
let mapService2: MapService | null = null;
let sqliteService: SqliteService | null = null;

const roundMap = ref(true);

const points = ref<NonNullable<Activity["points"]>>([]);

const metricsCheckpoint = ref<RunningMetricsCheckpoint>();

const showBigMap = ref(false);

const listEquipments = ref<Equipment[]>([]);

/// COMPUTED
const isEdit = computed(() => !!props.edit);
const titlePage = computed(() => {
  return props.activity.type === "TRAINING" ?
    t("$vuetify.label.training_singular") :
    props.activity.type === "CHALLENGE" ?
      t("$vuetify.label.challenge") :
      t(`$vuetify.label.${props.activity.category!.toLocaleLowerCase()}`);
});
const titleField = computed(() => {
  return props.activity.type === "TRAINING" ?
    t("$vuetify.label.training_title") :
    props.activity.type === "CHALLENGE" ?
      t("$vuetify.label.challenge_title") :
      t("$vuetify.label.activity_title");
});
const descriptationPlaceholder = computed(() => {
  return props.activity.type === "TRAINING" ?
    t("$vuetify.label.how_was_your_workout") :
    props.activity.type === "CHALLENGE" ?
      t("$vuetify.label.how_was_your_challenge") :
      t("$vuetify.label.how_was_your_activity");
});
const listHiddenDetails = computed(() => {
  const list = [
    { title: t("$vuetify.label.start_date_and_time"), value: "started_at" },
    { title: t("$vuetify.label.perceived_effort"), value: "perceived_effort" },
  ];

  if (["TRAINING", "CHALLENGE"].includes(props.activity.type)) {
    list.push(
      { title: t("$vuetify.label.calories"), value: "calories" },
      { title: t("$vuetify.label.exercises"), value: "exercises" },
    );
  }

  return list;
});
const titleBottomSheet = computed(() => {
  return props.activity.type === "TRAINING" ?
    t("$vuetify.label.giving_up_on_training") :
    props.activity.type === "CHALLENGE" ?
      t("$vuetify.label.giving_up_on_challenge") :
      t("$vuetify.label.cancel_activity");
});
const messageBottomSheet = computed(() => {
  return props.activity.type === "TRAINING" ?
    t("$vuetify.message.giving_up_on_training") :
    props.activity.type === "CHALLENGE" ?
      t("$vuetify.message.giving_up_on_challenge") :
      t("$vuetify.message.cancel_activity");
});
const listCategories = computed(() => {
  return activitesCategories.map((item) => ({
    title: t(`$vuetify.label.${item.type.toLowerCase()}`),
    value: item.type,
    icon: item.icon
  }))
});
const titlePlaceholder = computed(() =>
  props.activity.type === "AVULSE" ?
    t("$vuetify.label.easy_run_in_the_neighborhood") :
    ""
);
const timeActivity = computed(() => formatDateTimeLong(props.activity.ended_at));
const rhythm = computed(() => RunningMetricsService.formatPace(metricsCheckpoint.value?.avgPace || 0));
const calories = computed(() => formatNumber(metricsCheckpoint.value?.calories || 0));
const distance = computed(() => formatNumber((metricsCheckpoint.value?.distance || 0) / 1000));
const avg_speed = computed(() => formatNumber(metricsCheckpoint.value?.avgSpeed || 0));
const steps = computed(() => formatNumber(metricsCheckpoint.value?.steps || 0));
const primaryDurationSeconds = computed(() => {
  if (props.activity.type !== "AVULSE" || metricsCheckpoint.value?.movingDuration === undefined) {
    return props.activity.duration_seconds;
  }
  return Math.min(metricsCheckpoint.value.movingDuration, props.activity.duration_seconds);
});
const equipments = computed(() => {
  return listEquipments.value
    .filter((equipment) =>
      !equipment.standard_sports.length ||
      (
        equipment.type === "tennis" ?
          props.activity.category !== "CYCLING" :
          props.activity.category === "CYCLING"
      )
    )
    .map((equipment) => ({
      title: `${equipment.nickname}${equipment.warn ? ` - ${formatNumber(equipment.used)} ${t("$vuetify.label.km")} / ${formatNumber(equipment.mileage || 0)} ${t("$vuetify.label.km")}` : ""}`.toLowerCase(),
      value: equipment._id,
      icon: equipment.type === "tennis" ? "mdi-shoe-sneaker" : "mdi-bicycle"
    }));
});

/// WATCH
watch(title, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("title", val);
});

watch(perceivedEffort, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("perceived-effort", String(val));
});

watch(tags, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("tags", JSON.stringify(val));
}, { deep: true });

watch(equipment, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("equipment", val);
});

watch(files, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("files", JSON.stringify(
    val.map((file) => ({ ...file, base64: undefined }))
  ));
}, { deep: true });

watch(description, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("description", val);
});

watch(privateObservations, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("private-observations", val);
});

watch(visibility, async (val) => {
  if (val === "NONE") hiddenDetails.value = [];
  if (isEdit.value) return;
  await persistentSession.set("visibility", val);
});

watch(hiddenDetails, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("hidden-details", JSON.stringify(val));
}, { deep: true });

watch(post, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("post", String(Number(val)));
});

watch(taggedPeople, async (val) => {
  if (isEdit.value) return;
  await persistentSession.set("tagged-people", JSON.stringify(val));
}, { deep: true });

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);

  if (isEdit.value) {
    const detail = props.edit!;

    title.value = detail.title || "";
    perceivedEffort.value = detail.perceived_effort ?? 1;
    tags.value = [...(detail.tags ?? [])];
    description.value = detail.description || "";
    privateObservations.value = detail.private_observations || "";
    visibility.value = detail.visibility || "ALL";
    hiddenDetails.value = detail.visibility === "NONE" ? [] : [...(detail.hidden_details ?? [])];
    post.value = detail.post ?? false;
    existingFiles.value = [...(detail.files ?? [])];

    if (detail.type === "AVULSE" && detail.metrics) {
      metricsCheckpoint.value = {
        avgPace: detail.metrics.avg_pace,
        avgSpeed: detail.metrics.avg_speed,
        distance: detail.metrics.distance_meters,
        steps: detail.metrics.steps,
        elapsedSeconds: detail.metrics.elapsed_seconds,
        calories: detail.calories ?? 0,
        movingDuration: detail.metrics.moving_seconds ?? 0,
        realtimePace: 0,
        currentSpeed: 0,
        currentSplitDistance: 0,
        currentSplitStartedAt: 0,
        cadence: 0,
        splits: [],
      };
    }

    return;
  }

  if (props.activity.type === "TRAINING") {
    const workoutResponse = await workoutsStore.GET(props.activity.workout_id);

    if (!workoutResponse.error) {
      currentWorkout.value = workoutResponse.workout;
    }
  } else if (props.activity.type === "CHALLENGE") {
    const challengeResponse = await challengesStore.GET(props.activity.challenge_id);

    if (!challengeResponse.error) {
      currentChallenge.value = challengeResponse.challenge;
    }
  } else {
    const responseEquipments = await equipmentsStore.GET();

    if (!responseEquipments.error) {
      listEquipments.value = responseEquipments.result.results;
    }

    mapService = new MapService("map");
    mapService2 = new MapService("map2");
    sqliteService = new SqliteService();

    await sqliteService.init();

    const coords = await sqliteService.getWorkoutPoints(props.activity._id);

    points.value.push(...coords.map((point, i) => ({
      id: i + 1,
      accuracy: point.accuracy,
      altitude: point.altitude,
      altitudeAccuracy: point.altitudeAccuracy,
      lat: point.lat,
      lng: point.lng,
      speed: point.speed,
      time: point.time,
    })));

    mapService.init([coords[0]!.lng, coords[0]!.lat]);

    mapService.on("ready", () => {
      mapService!.initActivityLine(2);
      mapService!.showWorkoutRoute(
        coords.map((point) => ({
          lat: point.lat,
          lng: point.lng,
          accuracy: point.accuracy,
          speed: point.speed
        }))
      );

      mapLoaded.value = true;
    });

    mapService2.init([coords[0]!.lng, coords[0]!.lat]);

    mapService2.on("ready", () => {
      mapService2!.initActivityLine(2);
      mapService2!.showWorkoutRoute(
        coords.map((point) => ({
          lat: point.lat,
          lng: point.lng,
          accuracy: point.accuracy,
          speed: point.speed
        })),
        false
      );
    });

    metricsCheckpoint.value = JSON.parse(
      (await persistentSession.get("running-metrics-checkpoint")) || "{}"
    ) as RunningMetricsCheckpoint;
  }

  title.value = (await persistentSession.get("title")) || "";
  perceivedEffort.value = Number((await persistentSession.get("perceived-effort")) || 1);
  tags.value = JSON.parse((await persistentSession.get("tags")) || "[]");
  equipment.value = (await persistentSession.get("equipment")) || "";
  description.value = (await persistentSession.get("description")) || "";
  privateObservations.value = (await persistentSession.get("private-observations")) || "";
  visibility.value = (await persistentSession.get("visibility")) || "ALL";
  hiddenDetails.value = JSON.parse((await persistentSession.get("hidden-details")) || "[]");
  post.value = Boolean(Number((await persistentSession.get("post")) || "1"));
  taggedPeople.value = JSON.parse((await persistentSession.get("tagged-people")) || "[]");

  let tempFiles = JSON.parse(
    (await persistentSession.get("files")) || "[]"
  ) as Omit<MediaResult, "base64">[];

  for (const file of tempFiles) {
    const exists = await mediaService.fileExists(file.uri);
    if (!exists) tempFiles = tempFiles.filter((f) => f.id !== file.id);
  }

  files.value = tempFiles;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", backButton);

  mapService?.destroy();
  mapService?.destroy();
  sqliteService?.close();
});

/// METHODS
const backButton = () => {
  if (isEdit.value) {
    eventBus.emit("BACK_ROUTER");
  } else if (showBigMap.value) {
    showBigMap.value = false;
  } else if (!showUI.value) {
    bottomSheet.discard = true;
  } else {
    exit();
  }
};

const editFile = async (id: string) => {
  try {
    const file = JSON.parse(JSON.stringify(
      files.value.find((f) => f.id === id)!
    )) as MediaResult;

    const index = files.value.findIndex((f) => f.id === id);

    const result = await mediaService.editPhoto(file.uri);

    files.value[index] = result;
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  }
};

const removeFile = (id: string) => {
  files.value = files.value.filter((file) => file.id !== id);
};

const removeExistingFile = (url: string) => {
  existingFiles.value = existingFiles.value.filter((file) => file.url !== url);
};

const addFiles = async (tempFiles: MediaResult[]) => {
  menu.value = false;

  const allFiles = await Promise.all(
    files.value.map(async (file) => ({
      ...file,
      base64: await mediaService.getBase64(file.path)
    }))
  );

  for (const file of tempFiles) {
    const exists = allFiles.some((f) => f.base64 === file.base64);

    if (!exists) {
      delete (file as any).base64;
      files.value.push(file);
    }
  }
};

const getExerciseName = (exercise_id: string) => {
  if (isEdit.value) {
    return props.edit?.exercises?.find((exercise) =>
      exercise.exercise_id === exercise_id
    )?.name || "";
  }

  const list = props.activity.type === "TRAINING" ? currentWorkout.value : currentChallenge.value;

  const exercise = list?.exercises?.find((exercise) => exercise.exercise_id === exercise_id);

  return exercise?.name || "";
};

const clearAll = async () => {
  emit("clear-data");

  await Promise.all([
    persistentSession.remove("title"),
    persistentSession.remove("perceived-effort"),
    persistentSession.remove("tags"),
    persistentSession.remove("equipments"),
    persistentSession.remove("files"),
    persistentSession.remove("description"),
    persistentSession.remove("private-observations"),
    persistentSession.remove("visibility"),
    persistentSession.remove("hidden-details"),
    persistentSession.remove("post"),
    persistentSession.remove("tagged-people"),
  ]);
};

const clearAllData = async () => {
  await Promise.all([
    persistentSession.remove("title"),
    persistentSession.remove("perceived-effort"),
    persistentSession.remove("tags"),
    persistentSession.remove("equipments"),
    persistentSession.remove("files"),
    persistentSession.remove("description"),
    persistentSession.remove("private-observations"),
    persistentSession.remove("visibility"),
    persistentSession.remove("hidden-details"),
    persistentSession.remove("post"),
    persistentSession.remove("tagged-people"),
    persistentSession.remove("type-training"),
    persistentSession.remove("paused"),
    persistentSession.remove("activity"),
    persistentSession.remove("notification-id"),
    persistentSession.remove("running-metrics-checkpoint"),
    persistentSession.remove("last-update-time"),
  ]);
};

const exit = async () => {
  await clearAll();
  eventBus.emit("BACK_ROUTER");
};

const saveAfter = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });

  let metrics: Activity["metrics"];

  if (activity.value.type === "AVULSE") {
    const activityStartedAt = dayjs(props.activity.started_at);

    metrics = {
      avg_pace: metricsCheckpoint.value!.avgPace,
      avg_speed: metricsCheckpoint.value!.avgSpeed,
      distance_meters: metricsCheckpoint.value!.distance,
      steps: metricsCheckpoint.value!.steps,
      elapsed_seconds: metricsCheckpoint.value!.elapsedSeconds,
      moving_seconds: Math.min(metricsCheckpoint.value!.movingDuration, props.activity.duration_seconds),
      splits: metricsCheckpoint.value!.splits.map((split, index, arr) => {
        const startedSeconds = arr
          .slice(0, index)
          .reduce((acc, item) => acc + item.duration, 0);

        const endedSeconds = startedSeconds + split.duration;

        return {
          km: split.km,
          started_at: activityStartedAt.add(startedSeconds, "second").toISOString(),
          ended_at: activityStartedAt.add(endedSeconds, "second").toISOString(),
          duration_seconds: split.duration,
        };
      })
    };
  }

  const body = {
    ...props.activity,
    ...(props.activity.type === "AVULSE" && {
      metrics,
      tags: tags.value,
      equipment: equipment.value,
    }),
    title: title.value,
    perceived_effort: perceivedEffort.value,
    description: description.value,
    private_observations: privateObservations.value,
    visibility: visibility.value,
    hidden_details: hiddenDetails.value,
    post: post.value,
    tagged_ids: taggedPeople.value.map((user) => user._id),
  };

  const key = Date.now();

  const list = JSON.parse(
    (await persistentSession.get("offline-activity")) || "[]"
  );

  await Promise.all([
    persistentSession.set("offline-activity", JSON.stringify(
      [...list, key]
    )),
    persistentSession.set(`offline-activity-${key}`, JSON.stringify(
      body
    )),
    persistentSession.set(`offline-medias-${key}`, JSON.stringify(
      files.value.map((file) => ({ ...file, base64: undefined }))
    )),
  ]);

  await clearAllData();

  eventBus.emit("SAVE_OFFLINE_ACTIVITY");
  eventBus.emit("SET_LOADER", { enabled: false });
  eventBus.emit("BACK_ROUTER");
};

// Edit mode: partial update via PATCH — new medias go as base64, kept medias by URL
const submitEdit = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });

  const formattedFiles = await Promise.all(
    files.value.map(async (file) => {
      const base64 = await mediaService.getBase64(file.path);
      return { base64, ...file };
    })
  );

  const body = {
    title: title.value,
    description: description.value,
    private_observations: privateObservations.value,
    perceived_effort: perceivedEffort.value,
    visibility: visibility.value,
    hidden_details: hiddenDetails.value,
    ...(props.activity.type === "AVULSE" && { tags: tags.value }),
    keep_files: existingFiles.value.map((file) => file.url),
    files: formattedFiles
      .filter((file) => file.base64)
      .map((file) => ({
        base64: file.base64,
        format: file.format,
        mimetype: file.mimetype,
        type: file.type
      })),
  };

  const response = await activitiesStore.PATCH(props.activity._id, body);

  eventBus.emit("SET_LOADER", { enabled: false });

  if (!response.error) {
    eventBus.emit("BACK_ROUTER");
  }
};

const submit = async () => {
  const isValid = await validate(form);

  if (!isValid) {
    return;
  }

  if (isEdit.value) {
    return submitEdit();
  }

  if (!appStore.internet) {
    bottomSheet.no_connection = true;
    return;
  }

  eventBus.emit("SET_LOADER", { enabled: true });

  let metrics: Activity["metrics"];
  let map_picture: Record<string, string> = { };

  if (activity.value.type === "AVULSE") {
    const activityStartedAt = dayjs(props.activity.started_at);

    metrics = {
      avg_pace: metricsCheckpoint.value!.avgPace,
      avg_speed: metricsCheckpoint.value!.avgSpeed,
      distance_meters: metricsCheckpoint.value!.distance,
      steps: metricsCheckpoint.value!.steps,
      elapsed_seconds: metricsCheckpoint.value!.elapsedSeconds,
      moving_seconds: Math.min(metricsCheckpoint.value!.movingDuration, props.activity.duration_seconds),
      splits: metricsCheckpoint.value!.splits.map((split, index, arr) => {
        const startedSeconds = arr
          .slice(0, index)
          .reduce((acc, item) => acc + item.duration, 0);

        const endedSeconds = startedSeconds + split.duration;

        return {
          km: split.km,
          started_at: activityStartedAt.add(startedSeconds, "second").toISOString(),
          ended_at: activityStartedAt.add(endedSeconds, "second").toISOString(),
          duration_seconds: split.duration,
        };
      })
    };

    activity.value.metrics = metrics;

    map_picture = await new Promise(async (resolve) => {
      roundMap.value = false;

      await new Promise((accept) => setTimeout(accept, 300));

      const result = {
        base64: (await mapService!.getMapImage()) || "",
        format: "png",
        mimetype: "image/png",
        type: "image"
      }

      roundMap.value = true;

      resolve(result);
    });
  }

  const formattedFiles = await Promise.all(
    files.value.map(async (file) => {
      const base64 = await mediaService.getBase64(file.path);
      return { base64, ...file };
    })
  );

  const body = {
    ...props.activity,
    ...(props.activity.type === "AVULSE" && {
      map_picture,
      metrics,
      points: points.value,
      tags: tags.value,
      equipment: equipment.value,
    }),
    title: title.value,
    perceived_effort: perceivedEffort.value,
    files: formattedFiles
      .filter((file) => file.base64)
      .map((file) => ({
        base64: file.base64,
        format: file.format,
        mimetype: file.mimetype,
        type: file.type
      })),
    description: description.value,
    private_observations: privateObservations.value,
    visibility: visibility.value,
    hidden_details: hiddenDetails.value,
    post: post.value,
    tagged_ids: taggedPeople.value.map((user) => user._id),
  };

  const response = await activitiesStore.POST("", body);

  eventBus.emit("SET_LOADER", { enabled: false });

  if (!response.error) {
    clearAll();
    showUI.value = true;
    requestAfterActivityCompleted();
  } else if (response.server_error) {
    bottomSheet.error_server = true;
  }
};
</script>

<style lang="sass">
div#finish-activity
  .v-checkbox .v-selection-control
    min-height: auto
</style>