<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column">
    <header class="heading border-bottom-tertiary">
      <p
        class="text-h6 font-space-grotesk font-weight-bold"
      >{{ t("$vuetify.menu.training") }}</p>

      <p
        class="text-body-2 text-grey-lighten-1"
      >{{ t("$vuetify.message.choose_your_workout_and_get_started_now") }}</p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column px-4 pt-3">
      <!-- MARCAÇÕES PENDENTES -->
      <div
        v-if="pendingTags.length"
        class="mb-4 d-flex flex-column ga-3"
      >
        <p class="font-weight-bold">
          <v-icon class="mr-1">mdi-account-multiple-outline</v-icon>
          {{ t("$vuetify.label.pending_tags") }}
        </p>

        <div
          v-for="tag in pendingTags"
          :key="tag._id"
          class="bg-quintet border-sextet rounded-lg pa-3"
        >
          <div class="d-flex ga-3">
            <div>
              <ProfileImage
                size="36px"
                :image="tag.account.image"
                :name="tag.account.name"
              />
            </div>

            <div class="flex-fill">
              <p class="text-body-2">
                <span class="font-weight-bold">{{ tag.account.name }}</span>
                {{ t("$vuetify.label.tagged_you_in_an_activity") }}
              </p>

              <p
                v-if="tag.activity?.title"
                class="text-caption text-grey-lighten-1 mt-1"
              >{{ tag.activity.title }}</p>
            </div>
          </div>

          <div class="d-flex ga-2 mt-3">
            <v-btn
              class="flex-fill text-none font-weight-bold pa-5 d-flex"
              color="primary"
              size="small"
              :loading="respondingTag === tag._id"
              @click="respondTag(tag._id, 'APPROVED')"
            >{{ t("$vuetify.label.accept") }}</v-btn>

            <v-btn
              class="flex-fill text-none font-weight-bold pa-5 d-flex"
              color="tertiary"
              size="small"
              :loading="respondingTag === tag._id"
              @click="respondTag(tag._id, 'REJECTED')"
            >{{ t("$vuetify.label.refuse") }}</v-btn>
          </div>
        </div>
      </div>

      <div
        v-if="!accountsStore.isSubscriber"
        class="pa-4 rounded-lg d-flex flex-column mb-4"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)'
        }"
      >
        <div class="size-3rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center mb-4">
          <v-icon color="primary">
            mdi-crown-outline
          </v-icon>
        </div>

        <p class="font-weight-bold font-space-grotesk mb-3">
          {{ t("$vuetify.message.personalized_training_for_your_goal") }}
        </p>

        <p class="text-body-2 text-grey-lighten-1 mb-4">
          {{ t("$vuetify.message.complete_progressive_plans_designed_for_your_growth") }}
        </p>

        <v-btn
          block
          color="primary"
          class="pa-6 text-black font-weight-bold text-none"
          @click="eventBus.emit('START_SUBSCRIPTION')"
        >
          <v-icon class="mr-2">mdi-crown-outline</v-icon>
          {{ t("$vuetify.label.subscribe_now") }}
        </v-btn>

        <p
          v-if="account.guarantee_activated"
          class="mt-5 text-body-2 text-grey-lighten-1 text-center"
        >
          <v-icon class="mr-1">mdi-shield-check-outline</v-icon>
          {{ t("$vuetify.message.s7_day_money_back_guarantee") }}
        </p>
      </div>

      <div
        v-ripple
        class="bg-quintet border-sextet mb-5 rounded-lg d-flex align-center ga-3 pa-4"
        @click="startActivity"
      >
        <div class="d-flex justify-center align-center">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="40">
              mdi-pulse
            </v-icon>
          </div>
        </div>

        <div
          class="flex-fill d-flex flex-column text-left"
          :style="{ whiteSpace: 'normal' }"
        >
          <p class="font-weight-bold font-space-grotesk text-body-2 mb-1">
            {{ t("$vuetify.label.register_activity") }}
          </p>

          <p class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.message.track_your_activity_with_time_distance_and_calories") }}
          </p>
        </div>

        <div class="d-flex justify-center align-center">
          <v-icon>mdi-chevron-right</v-icon>
        </div>
      </div>

      <!-- NÃO TEM PLANO -->
      <div
        v-if="!accountsStore.isSubscriber"
        class="pa-4 bg-quintet border-sextet rounded-lg mb-4"
      >
        <p class="font-weight-bold font-space-grotesk mb-6">
          {{ `${t("$vuetify.message.what_you_unlock")}:` }}
        </p>

        <div class="d-flex flex-column ga-4 mb-6">
          <div
            v-for="(item, i) in unlockList"
            :key="`unlock_${i}`"
            class="d-flex align-center ga-2"
          >
            <div class="mr-1">
              <div class="size-2rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
                <v-icon color="primary" :size="18">
                  {{ item.icon }}
                </v-icon>
              </div>
            </div>

            {{ item.text }}
          </div>
        </div>

        <v-btn
          block
          color="primary"
          class="pa-6 text-black font-weight-bold text-none"
          @click="eventBus.emit('START_SUBSCRIPTION')"
        >
          <v-icon class="mr-2">mdi-lock-outline</v-icon>
          {{ t("$vuetify.label.unlock_workouts") }}
        </v-btn>
      </div>

      <!-- PREPARANDO PLANO -->
      <div
        v-else-if="account.preparing_plan"
        class="w-100 flex-fill"
      >
        <CreatingPlan  />
      </div>

      <!-- CRIAR PLANO -->
      <div
        v-else-if="!account.plan.status"
        class="w-100 flex-fill d-flex flex-column justify-center align-center mb-4"
      >
        <div class="w-100 px-5 py-5 border-sm border-primary border-opacity-100 rounded-xl d-flex flex-column align-center justify-center bg-theme-primary-background-10">
          <div class="mb-4">
            <div class="size-3-5rem bg-primary rounded-lg d-flex justify-center align-center">
              <v-icon color="black" :size="35">
                mdi-flash-outline
              </v-icon>
            </div>
          </div>

          <p class="font-weight-bold text-h6 font-space-grotesk mb-2 text-center">
            {{ t("$vuetify.message.create_your_workout_plan") }}
          </p>

          <p class="text-body-2 text-grey-lighten-1 text-center mb-5">
            {{ t("$vuetify.message.we_will_create_personalized_training_programs_based_on_your_goals_and_fitness_level") }}
          </p>

          <div class="d-flex flex-column ga-3 mb-5 w-100">
            <div
              v-for="(item, i) in createPlanList"
              :key="`create_plan_${i}`"
              class="px-3 py-3 rounded-lg d-flex align-center ga-3 bg-tertiary"
            >
              <div>
                <div class="size-2-2rem rounded-lg bg-theme-primary-15 d-flex justify-center align-center">
                  <v-icon color="primary" :size="18">
                    {{ item.icon }}
                  </v-icon>
                </div>
              </div>

              <p>
                {{ item.text }}
              </p>
            </div>
          </div>

          <v-btn
            block
            color="primary"
            class="pa-6 text-black font-weight-bold text-none"
            @click="eventBus.emit('CREATE_PLAN')"
          >{{ t("$vuetify.label.create_my_plan_now") }}</v-btn>
        </div>
      </div>

      <!-- LISTAGEM DE TREINOS E DESAFIOS -->
      <template v-else>
        <!-- LISTAGEM DE TREINOS -->
        <template v-if="workout">
          <div
            v-if="today === workout.date && workout.status === 'PENDING'"
            class="pa-4 bg-quintet border-sextet rounded-lg mb-5"
          >
            <div class="d-flex ga-3 mb-5">
              <div>
                <div class="d-flex justify-center align-center">
                  <div
                    class="bg-primary rounded-lg d-flex justify-center align-center"
                    :style="{ width: '2.8rem', height: '2.8rem' }"
                  >
                    <v-icon color="black" :size="25">
                      mdi-dumbbell
                    </v-icon>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-column justify-center align-center">
                <p class="font-weight-bold font-space-grotesk w-100">
                  {{ workout.title }}
                </p>

                <div class="text-caption text-grey-lighten-1 d-flex ga-2">
                  <div class="text-lowercase">
                    {{
                      `${workout.exercises.length} ${t(`$vuetify.label.${workout.exercises.length > 1 ? "exercises" : "exercise"}`)}`
                    }}
                  </div>

                  <span>•</span>

                  <div>
                    {{
                      `~${fromSecondsToMinutes(workout.estimated_duration_seconds)} ${t("$vuetify.label.min_abbreviation")}`
                    }}
                  </div>

                  <span>•</span>

                  <div>
                    {{
                      `~${formatNumber(workout.estimated_calories)} ${t("$vuetify.label.kcal_abbreviation")}`
                    }}
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column ga-2 mb-5">
              <div
                v-for="(exercise, i) in workout.exercises"
                :key="`exercise_${i}`"
                class="d-flex justify-space-between align-center"
              >
                <div class="d-flex align-center ga-2">
                  <div>
                    <div
                      class="rounded-lg d-flex justify-center align-center text-caption bg-tertiary text-grey-lighten-1"
                      :style="{ width: '1.5rem', height: '1.5rem' }"
                    >{{ i + 1 }}</div>
                  </div>

                  <span class="text-body-2">
                    {{ exercise.name }}
                  </span>
                </div>

                <div class="text-caption text-grey-lighten-1">
                  {{
                    `${exercise.sets} x ${exercise.reps.type === "fixed" ? exercise.reps.max : `${exercise.reps.time}${getAbbreviationTime(exercise.reps.time_type)}`}`
                  }}
                </div>
              </div>
            </div>

            <v-btn
              block
              color="primary"
              class="pa-6 text-black font-weight-bold text-none"
              @click="router.push({ name: 'training' })"
            >
              <v-icon class="mr-2">
                mdi-play
              </v-icon>
              {{ t("$vuetify.label.start_training") }}
            </v-btn>
          </div>
          <div
            v-else
            class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
          >
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-dumbbell</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.current_workout") }}
              </span>
            </div>

            <template v-if="today === workout.date">
              <div class="d-flex flex-column align-center px-3 py-3">
                <div
                  :style="{ width: '56px', height: '56px' }"
                  class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
                >
                  <v-icon :size="30" color="primary">
                    mdi-weather-night
                  </v-icon>
                </div>

                <p class="text-center font-weight-bold font-space-grotesk mb-1">
                  {{ t("$vuetify.label.training_completed_today") }}
                </p>

                <p class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.message.training_completed_today") }}
                </p>
              </div>
            </template>
            <div
              v-else
              class="d-flex flex-column align-center px-3 py-3"
            >
              <div
                :style="{ width: '56px', height: '56px' }"
                class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
              >
                <v-icon :size="30" color="primary">
                  mdi-sleep
                </v-icon>
              </div>

              <p class="text-center font-weight-bold font-space-grotesk mb-1">
                {{ t("$vuetify.label.day_off") }}
              </p>

              <p class="text-center text-caption text-grey-lighten-1 mb-2">
                {{ t("$vuetify.message.day_off") }}
              </p>

              <p class="text-center text-caption text-grey-lighten-1">
                {{ t("$vuetify.message.your_next_workout_will_be", dateNextTraining) }}
              </p>
            </div>
          </div>
        </template>

        <!-- LISTAGEM DE DESAFIOS -->
        <div
          v-if="challenge"
          class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
        >
          <div class="d-flex ga-3 mb-3">
            <v-icon color="primary">mdi-bullseye</v-icon>

            <span class="font-weight-bold">
              {{ t("$vuetify.label.challenge_of_the_day") }}
            </span>
          </div>

          <template v-if="today === challenge.date">
            <template v-if="challenge.status === 'PENDING'">
              <div class="d-flex flex-column ga-2 mb-4">
                <div
                  v-for="exercise in challenge.exercises"
                  :key="exercise.exercise_id"
                  class="pa-3 bg-tertiary rounded-lg d-flex"
                >
                  <span class="flex-fill">
                    {{ exercise.name }}
                  </span>

                  <span class="text-grey-lighten-1">
                    {{
                      `${exercise.sets} x ${exercise.reps.type === "fixed" ? exercise.reps.max : `${exercise.reps.time}${getAbbreviationTime(exercise.reps.time_type)}`}`
                    }}
                  </span>
                </div>
              </div>

              <v-btn
                block
                color="primary"
                class="pa-6 text-black font-weight-bold text-none"
                @click="router.push({ name: 'challenge' })"
              >
                {{ t("$vuetify.label.start_challenge") }}
                <v-icon class="ml-1">mdi-chevron-right</v-icon>
              </v-btn>
            </template>
            <div
              v-else
              class="d-flex flex-column align-center px-3 py-3"
            >
              <div
                :style="{ width: '56px', height: '56px' }"
                class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
              >
                <v-icon :size="30" color="primary">
                  mdi-weather-night
                </v-icon>
              </div>

              <p class="text-center font-weight-bold font-space-grotesk mb-1">
                {{ t("$vuetify.label.challenge_completed_today") }}
              </p>

              <p class="text-center text-caption text-grey-lighten-1">
                {{ t("$vuetify.message.challenge_completed_today") }}
              </p>
            </div>
          </template>
          <div
            v-else
            class="d-flex flex-column align-center px-3 py-3"
          >
            <div
              :style="{ width: '56px', height: '56px' }"
              class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
            >
              <v-icon :size="30" color="primary">
                mdi-sleep
              </v-icon>
            </div>

            <p class="text-center font-weight-bold font-space-grotesk mb-1">
              {{ t("$vuetify.label.day_off") }}
            </p>

            <p class="text-center text-caption text-grey-lighten-1 mb-2">
              {{ t("$vuetify.message.day_off_challenge") }}
            </p>

            <p class="text-center text-caption text-grey-lighten-1">
              {{ t("$vuetify.message.your_next_challenge_will_be", dateNextChallenge) }}
            </p>
          </div>
        </div>
      </template>

      <!-- HISTÓRICO DE ATIVIDADES -->
      <div
        v-if="activites && !account.preparing_plan"
        class="mb-3 d-flex flex-column"
      >
        <p class="mb-5">
          <v-icon class="mr-1">
            mdi-history
          </v-icon>

          {{ t("$vuetify.label.activity_history") }}
        </p>

        <div
          v-if="!Object.keys(activites).length"
          class="d-flex flex-column justify-center align-center py-5 ga-2"
        >
          <v-icon :size="50">
            mdi-package-variant
          </v-icon>

          <p class="text-center">
            {{ t("$vuetify.message.there_are_no_registered_activities_yet") }}
          </p>
        </div>
        <template v-else>
          <div class="d-flex flex-column ga-4">
            <div
              v-for="date in Object.keys(activites)"
              :key="date"
            >
              <p class="mb-2 text-body-2 text-grey-lighten-1">
                {{ date }}
              </p>

              <div class="d-flex flex-column ga-3">
                <div
                  v-ripple
                  v-for="activity in activites[date]"
                  class="rounded-lg"
                  :key="activity._id"
                  :style="{ backgroundColor: 'color-mix(in srgb, var(--tertiary) 56%, transparent)' }"
                  @click="router.push({ name: 'activity', params: { _id: activity._id } })"
                >
                  <div class="text-left px-4 py-3 d-flex flex-column justify-center">
                    <p class="mb-1 font-weight-bold d-flex align-center ga-1">
                      {{
                        activity.type === "TRAINING" ?
                          activity.workout_title :
                          activity.title
                      }}

                      <v-icon
                        v-if="activity.is_shared"
                        :size="14"
                        color="grey-lighten-1"
                        :title="t('$vuetify.label.shared_activity')"
                      >mdi-account-multiple</v-icon>
                    </p>

                    <div class="text-caption text-grey-lighten-1 d-flex ga-2">
                      <span>
                        {{
                          `${fromSecondsToMinutes(getPrimaryDurationSeconds(activity))} ${t("$vuetify.label.min_abbreviation")}`
                        }}
                      </span>

                      <span>•</span>

                      <span>
                        {{
                          `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}`
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <LoadingData v-if="loadingData" />

          <v-btn
            v-if="(page + 1) <= pages"
            color="primary"
            class="mt-5 mb-3 pa-6 text-black font-weight-bold text-none d-flex"
            @click="page += 1"
          >{{ t("$vuetify.label.load_more") }}</v-btn>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import Utc from "dayjs/plugin/utc";
import Timezone from "dayjs/plugin/timezone";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useFormatNumber } from "@/composables";
import { date, getAbbreviationTime, getPrimaryDurationSeconds } from "@/utils";
import { eventBus } from "@/eventBus";
import { type Activity } from "@/types/activity.type";

dayjs.extend(Utc);
dayjs.extend(Timezone);

/// COMPONENTS
import CreatingPlan from "@/components/CreatingPlan.vue";
import LoadingData from "@/components/LoadingData.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { fromSecondsToMinutes, toBr } = date();
const { formatNumber } = useFormatNumber();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();

const loadingData = ref(false);
const respondingTag = ref("");

const page = ref(1);
const pages = ref(1);
const results = ref<null | Activity[]>(null);

/// COMPUTED
const account = computed(() => accountsStore.account);
const workout = computed(() => account.value.plan.workout);
const challenge = computed(() => account.value.plan.challenge);
const timezone = computed(() => account.value.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const pendingTags = computed(() => [...activitiesStore.pending_tags.results.values()]);
const today = computed(() => dayjs().tz(timezone.value).format("YYYY-MM-DD"));
const dateNextTraining = computed(() => {
  const workout = account.value.plan.workout;

  if (!workout) return "";

  const now = dayjs().tz(timezone.value);

  if (workout.date === now.add(1, "day").format("YYYY-MM-DD")) return t("$vuetify.label.tomorrow").toLowerCase();
  if (workout.date === now.add(2, "day").format("YYYY-MM-DD")) return t("$vuetify.label.the_day_after_tomorrow").toLowerCase();
  return toBr(workout.date);
});
const dateNextChallenge = computed(() => {
  const challenge = account.value.plan.challenge;

  if (!challenge) return "";

  const now = dayjs().tz(timezone.value);

  if (challenge.date === now.add(1, "day").format("YYYY-MM-DD")) return t("$vuetify.label.tomorrow").toLowerCase();
  if (challenge.date === now.add(2, "days").format("YYYY-MM-DD")) return t("$vuetify.label.the_day_after_tomorrow").toLowerCase();
  return toBr(challenge.date);
});
const unlockList = computed(() => [
  { icon: "mdi-dumbbell", text: t("$vuetify.label.personalized_training") },
  { icon: "mdi-star-four-points-outline", text: t("$vuetify.label.automatic_progression") },
  { icon: "mdi-play-outline", text: t("$vuetify.label.explanatory_videos") },
  { icon: "mdi-fire", text: t("$vuetify.label.monitoring_progress") },
]);
const createPlanList = computed(() => [
  { icon: "mdi-calendar-outline", text: t("$vuetify.label.workouts_organized_by_day") },
  { icon: "mdi-trending-up", text: t("$vuetify.label.progressive_evolution") },
  { icon: "mdi-bullseye", text: t("$vuetify.label.tailored_for_you") },
]);
const activites = computed(() => {
  if (!results.value) return null;

  return results.value.reduce((acc, activity) => {
    const date = toBr(dayjs(activity.created_at!).format("YYYY-MM-DD"));
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, { } as Record<string, Activity[]>);
});

/// WATCH
watch(page, async (val) => {
  loadingData.value = true;
  await loadList();
  loadingData.value = false;
});

/// LIFE CYCLES
onMounted(async () => {
  loadList();
});

/// METHODS
const respondTag = async (tag_id: string, status: "APPROVED" | "REJECTED") => {
  respondingTag.value = tag_id;
  await activitiesStore.RESPOND_PENDING_TAG(tag_id, status);
  respondingTag.value = "";
};

const loadList = async () => {
  const response = await activitiesStore.GET(`?page=${page.value}&limit=15`);

  if (!response.error) {
    pages.value = response.result.pages;
    if (!results.value) results.value = [];
    results.value.push(
      ...response.result.results.filter((result: Activity) =>
        !results.value!.some((activity) => activity._id === result._id)
      )
    );
  }
};

const startActivity = () => {
  router.replace({
    replace: true,
    query: { ...route.query, mode: "activity" }
  });
};
</script>