<template>
  <div class="w-100 h-100 d-flex flex-column overflow-y-auto">
    <div>
      <div :style="{ width: '100%', height: '15rem', overflow: 'hidden', position: 'relative' }">
        <img
          src="@/assets/images/woman-running.jpg"
          :style="{ objectFit: 'cover' }"
          class="w-100 h-100 position-absolute top-0 left-0 right-0 bottom-0"
        />

        <div
          class="position-absolute top-0 left-0 right-0 bottom-0"
          :style="{ backgroundImage: 'linear-gradient(to top, var(--secondary), #0E1115B3, transparent)' }"
        ></div>

        <div
          class="position-absolute top-0 left-0 right-0 bottom-0"
          :style="{ backgroundImage: 'linear-gradient(to right, #0E111599, transparent)' }"
        ></div>

        <div class="position-absolute top-0 left-0 right-0 bottom-0 pa-5 d-flex flex-column justify-space-between">
          <div class="d-flex justify-end">
            <v-badge
              v-if="pendantsNotifications > 0"
              location="top right"
              color="error"
              :content="pendantsNotifications > 99 ? '99+' : pendantsNotifications"
              :offset-x="pendantsNotifications > 99 ? 8 : 0"
            >
              <v-btn
                icon=""
                color="quintet"
                class="border-sextet"
                :size="36"
                @click="goToNotifications"
              >
                <v-icon :size="20" color="white">
                  mdi-bell-outline
                </v-icon>
              </v-btn>
            </v-badge>
            <v-btn
              v-else
              icon=""
              color="quintet"
              class="border-sextet"
              :size="36"
              @click="goToNotifications"
            >
              <v-icon :size="20" color="white">
                mdi-bell-outline
              </v-icon>
            </v-btn>
          </div>

          <div class="flex-fill d-flex flex-column justify-end">
            <div>
              <p
                class="text-h5 font-space-grotesk font-weight-bold"
                v-html="t('$vuetify.message.welcome_name', name)"
              ></p>

              <p class="mt-1 text-grey-lighten-1">
                {{ t("$vuetify.message.ready_for_your_next_workout") }}
              </p>
            </div>

            <div class="mt-3 d-flex ga-2">
              <StreakFlame />

              <div
                class="px-4 py-3 rounded-pill d-flex align-center text-body-2"
                :style="{ backgroundColor: '#15181ECC', border: '1px solid #272C34' }"
                @click="router.push({ name: 'league' })"
              >
                <v-icon color="primary" class="mr-2">mdi-trophy-outline</v-icon>
                {{ t("$vuetify.label.league") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="['px-4 flex-fill', account.preparing_plan ? '' : 'mt-3']">
      <!-- SEM INTERNET -->
      <NoConnection
        v-if="!appStore.internet && !account.plan?.workout?._id"
      />

      <template v-else>
        <!-- MISSÕES DIÁRIAS -->
        <DailyQuestsCard />

        <!-- NÃO É ASSINANTE -->
        <template v-if="!accountsStore.isSubscriber">
          <div class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5">
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-dumbbell</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.personalized_training") }}
              </span>
            </div>

            <p class="text-caption text-grey-lighten-1 mb-2">
              {{ t("$vuetify.message.unlock_complete_workouts_designed_for_your_goal") }}
            </p>

            <p class="text-caption text-primary mb-3">
              {{ `🎁 ${t("$vuetify.message.subscriber_chest_perk")}` }}
            </p>

            <v-btn
              block
              color="primary"
              class="pa-6 text-black font-weight-bold text-none"
              @click="eventBus.emit('START_SUBSCRIPTION')"
            >
              <v-icon class="mr-2">mdi-crown</v-icon>
              {{ offersStore.cta_now }}
            </v-btn>

            <p
              v-if="account.guarantee_activated"
              class="text-body-2 text-grey-lighten-1 mt-5 mb-1 text-center"
            >
              <v-icon class="mr-1">mdi-shield-check-outline</v-icon>
              {{ t("$vuetify.message.s7_day_money_back_guarantee") }}
            </p>
          </div>

          <div class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-3">
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-trending-up</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.weekly_progress") }}
              </span>
            </div>

            <div class="d-flex ga-2 mb-4">
              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-dumbbell</v-icon>

                <span class="text-h6 font-weight-bold text-center">
                  N/A
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.training") }}
                </span>
              </div>

              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-clock-outline</v-icon>

                <span class="text-h6 font-weight-bold text-center">
                  N/A
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.active_minutes") }}
                </span>
              </div>

              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-fire</v-icon>

                <span class="text-h6 font-weight-bold text-center">
                  N/A
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.calories") }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-grey-lighten-1">
                  {{ t("$vuetify.label.weekly_goal") }}
                </span>

                <span class="text-body-2 text-primary">
                  0%
                </span>
              </div>

              <div
                :style="{ height: '1rem' }"
                class="rounded-lg bg-secondary"
              >
                <div
                  :style="{ width: '0%' }"
                  class="bg-primary h-100 rounded-lg"
                ></div>
              </div>
            </div>

            <v-divider class="mb-4"></v-divider>

            <div class="mb-1 text-caption text-grey-lighten-1">
              <v-icon color="primary" class="mr-1">
                mdi-star-four-points-outline
              </v-icon>

              {{ t("$vuetify.message.subscribe_to_follow_the_complete_evolution") }}
            </div>
          </div>
        </template>

        <!-- CRIANDO PLANO -->
        <div
          v-else-if="account.preparing_plan"
          class="h-100"
        >
          <CreatingPlan class="py-0" />
        </div>

        <!-- CRIAR PLANO -->
        <div
          v-else-if="!account.plan.status"
          class="h-100 mb-3 d-flex flex-column align-center justify-center"
        >
          <div class="w-100 px-5 py-5 border-sm border-primary border-opacity-100 rounded-xl d-flex flex-column align-center justify-center bg-theme-primary-background-10">
            <div class="mb-4">
              <div class="size-3-5rem bg-primary rounded-lg d-flex justify-center align-center">
                <v-icon color="black" :size="35">
                  mdi-star-four-points-outline
                </v-icon>
              </div>
            </div>

            <p class="font-weight-bold text-h6 font-space-grotesk mb-2 text-center">
              {{ t("$vuetify.message.lets_build_your_plan") }}
            </p>

            <p class="text-body-2 text-grey-lighten-1 text-center mb-6">
              {{ t("$vuetify.message.lets_build_your_plan_message") }}
            </p>

            <div class="w-100 d-flex flex-column ga-2 mb-5">
              <div
                v-for="(item, i) in createPlanList"
                :key="`create_plan_${i}`"
                class="pa-1 d-flex align-center ga-3 px-3 py-3 rounded-lg bg-tertiary"
              >
                <div>
                  <div class="size-2rem bg-theme-primary-15 d-flex justify-center align-center rounded-circle">
                    <v-icon color="primary" :size="20">
                      {{ item.icon }}
                    </v-icon>
                  </div>
                </div>

                <span>
                  {{ item.text }}
                </span>
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

        <!-- LISTAGEM DO PLANO -->
        <template v-else>
          <!-- TREINO ATUAL -->
          <div
            v-if="account.plan.workout"
            class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
          >
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-dumbbell</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.current_workout") }}
              </span>
            </div>

            <template v-if="today === account.plan.workout.date">
              <template v-if="account.plan.workout.status === 'PENDING'">
                <p class="text-h6 text-white font-weight-bold font-space-grotesk mb-2">
                  {{ account.plan.workout.title }}
                </p>

                <div class="text-caption text-grey-lighten-1 mb-4 d-flex justify-start align-center ga-2">
                  <div class="d-flex justify-center align-center ga-2 text-lowercase flex-fill">
                    <v-icon>mdi-dumbbell</v-icon>
                    {{
                      `${account.plan.workout.exercises.length} ${t(`$vuetify.label.${account.plan.workout.exercises.length > 1 ? "exercises" : "exercise"}`)}`
                    }}
                  </div>

                  <span>•</span>

                  <div class="d-flex justify-center align-center ga-2 flex-fill">
                    <v-icon>mdi-clock-outline</v-icon>
                    {{
                      `~${fromSecondsToMinutes(account.plan.workout.estimated_duration_seconds)} ${t("$vuetify.label.min_abbreviation")}`
                    }}
                  </div>

                  <span>•</span>

                  <div class="d-flex justify-center align-center ga-1 flex-fill">
                    <v-icon>mdi-fire</v-icon>
                    {{
                      `~${formatNumber(account.plan.workout.estimated_calories)} ${t("$vuetify.label.kcal_abbreviation")}`
                    }}
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

          <!-- PROGRESSO SEMANAL -->
          <div
            v-if="account.plan.weekly_progress"
            class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
          >
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-trending-up</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.weekly_progress") }}
              </span>
            </div>

            <div class="d-flex ga-2 mb-4">
              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-dumbbell</v-icon>

                <span class="text-h6 font-weight-bold text-center">
                  {{ `${account.plan.weekly_progress.total}/${account.preferences.days}` }}
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.training") }}
                </span>
              </div>

              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-clock-outline</v-icon>

                <span class="text-h6 font-weight-bold text-center">
                  {{ account.plan.weekly_progress.minutes }}
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.active_minutes") }}
                </span>
              </div>

              <div
                class="px-2 py-3 bg-tertiary rounded-lg d-flex flex-column align-center ga-2"
                :style="{ width: '33%' }"
              >
                <v-icon color="primary">mdi-fire</v-icon>

                <span class="text-h6 font-weight-bold">
                  {{ formatNumber(account.plan.weekly_progress.calories) }}
                </span>

                <span class="text-center text-caption text-grey-lighten-1">
                  {{ t("$vuetify.label.calories") }}
                </span>
              </div>
            </div>

            <div class="mb-1">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-grey-lighten-1">
                  {{ t("$vuetify.label.weekly_goal") }}
                </span>

                <span class="text-body-2 text-primary">
                  {{ formatNumber(account.plan.weekly_progress.percentage, "percent") }}
                </span>
              </div>

              <div
                :style="{ height: '1rem' }"
                class="rounded-lg bg-secondary"
              >
                <div
                  :style="{ width: `${account.plan.weekly_progress.percentage}%` }"
                  class="bg-primary h-100 rounded-lg"
                ></div>
              </div>
            </div>
          </div>

          <!-- DESAFIO ATUAL -->
          <div
            v-if="account.plan.challenge"
            class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
          >
            <div class="d-flex ga-3 mb-3">
              <v-icon color="primary">mdi-bullseye</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.challenge_of_the_day") }}
              </span>
            </div>

            <template v-if="today === account.plan.challenge.date">
              <template v-if="account.plan.challenge.status === 'PENDING'">
                <div class="d-flex flex-column ga-2 mb-4">
                  <div
                    v-for="exercise in account.plan.challenge.exercises"
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

          <!-- RANKING SEMANAL -->
          <div
            v-if="ranking"
            class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-3"
          >
            <div class="d-flex ga-3 mb-4">
              <v-icon color="yellow">mdi-trophy</v-icon>

              <span class="font-weight-bold">
                {{ t("$vuetify.label.weekly_ranking") }}
              </span>
            </div>

            <div
              v-if="account.settings.privacy.visibility === 'private'"
              class="d-flex flex-column align-center px-3 py-3"
            >
              <div
                :style="{ width: '56px', height: '56px' }"
                class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
              >
                <v-icon :size="30" color="primary">
                  mdi-lock
                </v-icon>
              </div>

              <p class="text-center font-weight-bold font-space-grotesk mb-1">
                {{ t("$vuetify.label.your_profile_is_private") }}
              </p>

              <p class="text-center text-caption text-grey-lighten-1 mb-5">
                {{ t("$vuetify.message.your_profile_is_private") }}
              </p>

              <v-btn
                block
                color="primary"
                class="pa-6 text-black font-weight-bold text-none"
                @click="makePublic"
              >{{ t("$vuetify.label.make_public") }}</v-btn>
            </div>
            <div
              v-else-if="ranking.length"
              class="d-flex flex-column ga-2"
            >
              <div
                v-ripple
                v-for="(person, i) in ranking"
                :key="person.account_id"
                class="bg-tertiary rounded-lg"
                @click="person.account_id === account._id ? goToAccount() : router.push({ name: 'profile', params: { _id: person.account_id } })"
              >
                <div class="pa-3 d-flex justify-space-between">
                  <div
                    :style="{ width: '75%' }"
                    class="d-flex align-center ga-3"
                  >
                    <div>
                      {{ getPlace(i + 1) }}
                    </div>

                    <div>
                      <ProfileImage
                        :size="'2rem'"
                        :image="person.image"
                        :name="person.name"
                      />
                    </div>

                    <div class="text-truncate">
                      {{ person.name }}
                    </div>
                  </div>

                  <div class="text-body-2 d-flex align-center text-primary text-lowercase">
                    {{
                      `${formatNumber(person.total_xp)} ${t("$vuetify.label.pts")}`
                    }}
                  </div>
                </div>
              </div>

            </div>
            <div
              v-else
              class="d-flex flex-column align-center px-3 py-3"
            >
              <div
                :style="{ width: '56px', height: '56px' }"
                class="bg-theme-primary-15 rounded-circle d-flex justify-center align-center mb-5 border-sm border-primary border-opacity-100"
              >
                <v-icon :size="30" color="primary">
                  mdi-medal-outline
                </v-icon>
              </div>

              <p class="text-center font-weight-bold font-space-grotesk mb-1">
                {{ t("$vuetify.message.theres_still_time_to_break_into_the_top_5") }}
              </p>

              <p class="text-center text-caption text-grey-lighten-1 mb-5">
                {{ t("$vuetify.message.earn_xp_today_and_start_climbing_the_rankings") }}
              </p>

              <v-btn
                v-if="today === account?.plan?.workout?.date && account?.plan?.workout?.status === 'PENDING'"
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
              <v-btn
                v-else-if="today === account?.plan?.challenge?.date && account?.plan?.challenge?.status === 'PENDING'"
                block
                color="primary"
                class="pa-6 text-black font-weight-bold text-none"
                @click="router.push({ name: 'challenge' })"
              >
                {{ t("$vuetify.label.start_challenge") }}
                <v-icon class="ml-1">mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn
                v-else
                block
                color="primary"
                class="pa-6 text-black font-weight-bold text-none"
                @click="startActivity"
              >{{ t("$vuetify.label.register_activity") }}</v-btn>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import Utc from "dayjs/plugin/utc";
import Timezone from "dayjs/plugin/timezone";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { SystemBars, SystemBarType } from "@/mobile";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useAppStore } from "@/stores/app";
import { useOffersStore } from "@/stores/offers";
import { useNotificationsStore } from "@/stores/notifications";
import { useFormatNumber } from "@/composables";
import { date, getAbbreviationTime } from "@/utils";
import { eventBus } from "@/eventBus";
import { type AccountRanking } from "@/types/account.type";

dayjs.extend(Utc);
dayjs.extend(Timezone);

/// COMPONENTS
import CreatingPlan from "@/components/CreatingPlan.vue";
import DailyQuestsCard from "@/components/DailyQuestsCard.vue";
import NoConnection from "@/components/NoConnection.vue";
import ProfileImage from "@/components/ProfileImage.vue";
import StreakFlame from "@/components/StreakFlame.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { fromSecondsToMinutes, toBr } = date();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();
const appStore = useAppStore();
const offersStore = useOffersStore();
const notificationsStore = useNotificationsStore();
const ranking = ref<null | AccountRanking[]>(null);

/// COMPUTED
const account = computed(() => accountsStore.account);
const name = computed(() => account.value?.name?.split(" ")[0]);
const timezone = computed(() => account.value.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
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
const createPlanList = computed(() => [
  { icon: "mdi-check", text: t("$vuetify.message.workouts_designed_for_you") },
  { icon: "mdi-check", text: t("$vuetify.label.personalized_meal_plan") },
  { icon: "mdi-check", text: t("$vuetify.message.smart_challenges_with_ai") },
]);
const pendantsNotifications = computed(() => notificationsStore.pendants_notifications);

/// LIFE CYCLES
onMounted(async () => {
  await SystemBars.hide({
    bar: SystemBarType.StatusBar,
    animation: "NONE"
  });

  if (accountsStore.isSubscriber) {
    if (account.value.settings.privacy.visibility === "public") {
      loadRanking();
    } else {
      ranking.value = [];
    }
  }
});

onBeforeUnmount(async () => {
  await SystemBars.show({
    bar: SystemBarType.StatusBar,
    animation: "NONE"
  });
});

/// METHODS
const loadRanking = async () => {
  const response = await activitiesStore.GET("ranking/weekly");
  if (!response.error) ranking.value = response.ranking;
};

const getPlace = (index: number) => {
  switch(index) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `${index}ª`;
  };
};

const makePublic = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const settings = structuredClone(toRaw(unref(account.value.settings)));
    settings.privacy.visibility = "public";
    const response = await accountsStore.UPDATE_ACCOUNT({ settings });
    if (!response.error) loadRanking();
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const startActivity = () => {
  router.replace({
    replace: true,
    query: { ...route.query, mode: "activity" }
  });
};

const goToAccount = () => {
  router.replace({
    replace: true,
    query: { ...route.query, tab: "account" }
  });
};

const goToNotifications = () => {
  router.replace({
    replace: true,
    query: { ...route.query, mode: "notification" }
  });
};
</script>