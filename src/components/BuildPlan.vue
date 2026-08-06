<template>
  <v-bottom-sheet v-model="bottomSheet">
    <div class="d-flex justify-end px-4 mb-3">
      <v-btn
        icon=""
        color="tertiary"
        size="small"
        @click="bottomSheet = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-card>
      <v-card-text class="pt-5 pb-3 px-4 d-flex flex-column overflow-y-hidden">
        <p class="text-h6 font-weight-bold text-center font-space-grotesk mb-2">
          {{ t("$vuetify.label.creating_a_plan") }}
        </p>

        <p class="text-body-2 text-center text-grey-lighten-1 mb-3">
          {{ t("$vuetify.message.before_we_create_your_personalized_plan_lets_double_check_that_everything_is_correct") }}
        </p>

        <div class="mb-3 d-flex ga-2">
          <div
            v-for="i in 4"
            :key="i"
            :class="[
              'flex-fill rounded-lg',
              (tab + 1) > i ? 'bg-primary' : 'bg-tertiary'
            ]"
            :style="{ height: '2px' }"
          ></div>
        </div>

        <v-tabs-window
          v-model="tab"
          class="flex-fill overflow-y-auto py-2"
        >
          <!-- DADOS PESSOAIS -->
          <v-tabs-window-item>
            <v-form ref="form1" @submit.prevent="submit1">
              <p
                class="font-weight-bold mb-3"
              >{{ t("$vuetify.label.personal_data") }}</p>

              <TextField
                required
                is-money
                hide-symbol
                class="mb-5"
                placeholder="75"
                :label="t('$vuetify.label.weight_kg')"
                :rules="[() => body.weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                v-model="body.weight"
              />

              <TextField
                required
                is-money
                hide-symbol
                placeholder="1,66"
                :label="t('$vuetify.label.height_m')"
                :rules="[() => body.height > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                v-model="body.height"
              />

              <input type="submit" v-show="false" />
            </v-form>
          </v-tabs-window-item>

          <!-- SEU OBJETIVO -->
          <v-tabs-window-item>
            <v-form
              v-if="showForm1"
              ref="form2"
              @submit.prevent="submit2"
            >
              <p
                class="font-weight-bold mb-3"
              >{{ t("$vuetify.label.your_goal") }}</p>

              <v-input
                v-model="body.preferences.goal"
                class="mb-5"
                hide-details="auto"
                :rules="[rules.required]"
              >
                <section class="w-100">
                  <p class="mb-3">
                    {{ t("$vuetify.message.what_is_your_goal") }}
                  </p>

                  <div class="d-flex flex-column ga-2">
                    <div
                      v-for="option in goals"
                      :key="option"
                      @click="body.preferences.goal = option"
                      :class="[
                        'text-center rounded-lg py-3',
                        body.preferences.goal === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                  </div>
                </section>
              </v-input>

              <v-input
                v-model="body.preferences.level"
                hide-details="auto"
                class="mb-5"
                :rules="[rules.required]"
              >
                <section class="w-100">
                  <p class="mb-3">
                    {{ t("$vuetify.message.whats_your_fitness_level") }}
                  </p>

                  <div class="d-flex flex-column ga-2">
                    <div
                      v-for="option in levels"
                      :key="option"
                      @click="body.preferences.level = option"
                      :class="[
                        'text-center rounded-lg py-3',
                        body.preferences.level === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                  </div>
                </section>
              </v-input>

              <TextField
                required
                type="tel"
                class="mb-5"
                :placeholder="t('$vuetify.label.date_of_birth_format')"
                :label="t('$vuetify.label.goal_deadline')"
                :rules="[rules.future_date]"
                :mask="'##/##/####'"
                v-model="body.preferences.personalized_goal.deadline"
              />

              <template v-if="body.preferences.goal">
                <v-divider class="my-5"></v-divider>

                <div class="d-flex justify-space-between align-center">
                  <div class="d-flex justify-center ga-3">
                    <v-icon color="primary">mdi-bullseye</v-icon>
                    <span>{{ t("$vuetify.label.personalized_goal") }}</span>
                  </div>

                  <div>
                    <v-switch
                      inset
                      color="primary"
                      hide-details="auto"
                      class="py-0"
                      v-model="body.preferences.personalized_goal.status"
                    />
                  </div>
                </div>

                <div class="mt-5" v-if="body.preferences.personalized_goal.status">
                  <TextField
                    v-if="body.preferences.goal !== 'PERFORMANCE'"
                    is-money
                    hide-symbol
                    disabled
                    class="mb-5"
                    :label="t('$vuetify.label.current_weight')"
                    v-model="body.weight"
                  />

                  <TextField
                    v-if="body.preferences.goal !== 'PERFORMANCE'"
                    is-money
                    hide-symbol
                    class="mb-5"
                    placeholder="75"
                    :label="t('$vuetify.label.desired_weight_kg')"
                    :rules="[() => body.preferences.desired_weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                    v-model="body.preferences.desired_weight"
                  />

                  <v-input
                    v-if="body.preferences.goal === 'GAIN_MUSCLE_MASS'"
                    class="mb-5"
                    hide-details="auto"
                    v-model="body.preferences.personalized_goal.focus_region"
                    :rules="[(val: string[]) => !!val.length || t('$vuetify.errors.it_must_have_at_least_1_item')]"
                  >
                    <section class="w-100">
                      <p class="mb-3">
                        {{ t("$vuetify.label.focus_region") }}
                      </p>

                      <div class="d-flex ga-2 flex-wrap">
                        <div
                          v-for="option in regions"
                          @click="
                            body.preferences.personalized_goal.focus_region.includes(option) ?
                              body.preferences.personalized_goal.focus_region = body.preferences.personalized_goal.focus_region.filter((item) => item !== option) :
                              body.preferences.personalized_goal.focus_region.push(option)
                          "
                          :style="{ width: '48%' }"
                          :key="option"
                          :class="[
                            'text-center rounded-lg py-3',
                            body.preferences.personalized_goal.focus_region.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                          ]"
                        >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                      </div>
                    </section>
                  </v-input>

                  <template v-if="body.preferences.goal === 'PERFORMANCE'">
                    <v-input
                      class="mb-5"
                      hide-details="auto"
                      v-model="body.preferences.personalized_goal.focus_performance"
                      :rules="[rules.required]"
                    >
                      <section class="w-100">
                        <p class="mb-3">
                          {{ t("$vuetify.label.type_of_performance") }}
                        </p>

                        <div class="d-flex flex-column ga-2">
                          <div
                            v-for="option in performances"
                            :key="option"
                            @click="body.preferences.personalized_goal.focus_performance = option"
                            :class="[
                              'text-center rounded-lg py-3',
                              body.preferences.personalized_goal.focus_performance === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                            ]"
                          >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                        </div>
                      </section>
                    </v-input>

                    <TextField
                      :label="t('$vuetify.label.desired_goal')"
                      :placeholder="t('$vuetify.message.desired_goal_placeholder')"
                      :rules="[rules.required]"
                      v-model="body.preferences.personalized_goal.desired_goal"
                    />
                  </template>
                </div>
              </template>

              <input type="submit" v-show="false" />
            </v-form>
          </v-tabs-window-item>

          <!-- ATIVIDADES -->
          <v-tabs-window-item>
            <v-form ref="form3" @submit.prevent="submit3">
              <p
                class="font-weight-bold mb-3"
              >{{ t("$vuetify.label.activities") }}</p>

              <v-input
                v-model="body.preferences.training_location"
                hide-details="auto"
                class="mb-5"
                :rules="[rules.required]"
              >
                <section class="w-100">
                  <p class="mb-3">
                    {{ t("$vuetify.message.where_do_you_prefer_to_train") }}
                  </p>

                  <div class="d-flex flex-column ga-2">
                    <div
                      v-for="option in places"
                      :key="option"
                      @click="body.preferences.training_location = option"
                      :class="[
                        'text-center rounded-lg py-3',
                        body.preferences.training_location === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ t(`$vuetify.label.place_${option.toLowerCase()}`) }}</div>
                  </div>
                </section>
              </v-input>

              <v-input
                class="mb-5"
                hide-details="auto"
                v-model="body.preferences.sports_practiced"
              >
                <section class="w-100">
                  <p class="mb-3">
                    {{ t("$vuetify.label.sports_practiced") }}
                  </p>

                  <div class="d-flex ga-2 flex-wrap">
                    <div
                      v-for="option in sports"
                      @click="
                        body.preferences.sports_practiced.includes(option) ?
                          (body.preferences.sports_practiced = body.preferences.sports_practiced.filter((i) => i !== option)) :
                          body.preferences.sports_practiced.push(option)
                      "
                      :style="{ width: '48%' }"
                      :key="option"
                      :class="[
                        'text-center rounded-lg py-3',
                        body.preferences.sports_practiced.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                  </div>
                </section>
              </v-input>

              <v-input
                hide-details="auto"
                v-model="body.preferences.days"
                :rules="[rules.required]"
              >
                <section class="w-100">
                  <p class="mb-3">
                    {{ t("$vuetify.message.how_many_days_a_week_do_you_train") }}
                  </p>

                  <div class="d-flex ga-2 flex-wrap">
                    <div
                      v-for="option in 6"
                      @click="body.preferences.days = option + 1"
                      :style="{ width: '48%' }"
                      :key="option"
                      :class="[
                        'text-center rounded-lg py-3',
                        body.preferences.days === (option + 1) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ `${option + 1} ${t("$vuetify.label.days").toLowerCase()}` }}</div>
                  </div>
                </section>
              </v-input>

              <input type="submit" v-show="false" />
            </v-form>
          </v-tabs-window-item>

          <!-- ALIMENTAÇÃO -->
          <v-tabs-window-item>
            <v-form ref="form4" @submit.prevent="submit4">
              <p
                class="font-weight-bold mb-3"
              >{{ t("$vuetify.label.food") }}</p>

              <TextField
                class="mb-5"
                :label="t('$vuetify.label.dietary_restriction')"
                :placeholder="t('$vuetify.message.dietary_restriction_placeholder')"
                v-model="body.preferences.food.dietary_restriction"
              />

              <TextField
                class="mb-5"
                :label="t('$vuetify.label.food_preferences')"
                :placeholder="t('$vuetify.message.food_preferences_placeholder')"
                v-model="body.preferences.food.preferences"
              />

              <p class="mb-3">
                {{ t("$vuetify.label.extra_meals") }}
              </p>

              <v-switch
                inset
                class="mb-1"
                hide-details="auto"
                v-model="body.preferences.food.pre_workout"
                color="primary"
                :label="t('$vuetify.label.pre_workout_with_explanation')"
              />

              <v-switch
                inset
                class="mb-1"
                hide-details="auto"
                v-model="body.preferences.food.post_workout"
                color="primary"
                :label="t('$vuetify.label.post_workout_with_explanation')"
              />

              <v-switch
                inset
                hide-details="auto"
                v-model="body.preferences.food.supper"
                color="primary"
                :label="t('$vuetify.label.supper_workout_with_explanation')"
              />

              <input type="submit" v-show="false" />
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>

        <div>
          <v-divider class="my-4"></v-divider>

          <v-btn
            v-if="tab === 0"
            block
            class="text-none pa-7 font-weight-bold"
            type="submit"
            color="primary"
            @click="next"
          >{{ t("$vuetify.label.next") }}</v-btn>
          <v-row v-else>
            <v-col cols="6" sm="6" md="6" lg="6">
              <v-btn
                block
                class="text-none pa-7 font-weight-bold"
                color="tertiary"
                @click="back"
              >{{ t("$vuetify.label.back_button") }}</v-btn>
            </v-col>

            <v-col cols="6" sm="6" md="6" lg="6">
              <v-btn
                block
                class="text-none pa-7 font-weight-bold"
                type="submit"
                color="primary"
                @click="next"
              >
                {{
                  tab === 3 ?
                    t("$vuetify.label.create_plan") :
                    t("$vuetify.label.next")
                }}
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- ERRO AO GERAR O PLANO -->
    <v-bottom-sheet v-model="bottomSheetFail">
      <v-card>
        <v-card-text class="py-5">
          <p class="text-h6 font-weight-bold text-center font-space-grotesk mb-4">
            {{ t("$vuetify.label.error_generating_your_plan") }}
          </p>

          <p class="text-body-2 mb-3">
            <strong>
              {{ `${t("$vuetify.label.reason")}:` }}
            </strong>
            {{ reason }}
          </p>

          <p class="text-body-2 mb-5">
            <strong>
              {{ `${t("$vuetify.label.suggestion")}:` }}
            </strong>
            {{ suggestion }}
          </p>

          <v-btn
            block
            class="text-none pa-7 font-weight-bold"
            type="submit"
            color="primary"
            @click="bottomSheetFail = false"
          >{{ t("$vuetify.label.close")}}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useForm } from "@/composables";
import { eventBus } from "@/eventBus";
import { date } from "@/utils";
import { useAccountsStore } from "@/stores/accounts";
import { usePlansStore } from "@/stores/plans";

/// JSON
import goals from "@/json/goals.json";
import levels from "@/json/levels.json";
import regions from "@/json/regions.json";
import performances from "@/json/performances.json";
import places from "@/json/places.json";
import sports from "@/json/sports.json";

/// DATA
const { t } = useLocale();
const { rules, validate } = useForm();

const { toBr, toUs } = date();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);
const tab = ref(0);
const accountsStore = useAccountsStore();
const plansStore = usePlansStore();

const form1 = ref();
const form2 = ref();
const form3 = ref();
const form4 = ref();

const body = reactive({
  weight: 0,
  height: 0,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  preferences: {
    desired_weight: 0,
    goal: "",
    level: "",
    training_location: "",
    sports_practiced: [] as string[],
    days: 0,
    personalized_goal: {
      status: false,
      focus_region: [] as string[],
      focus_performance: "",
      desired_goal: "",
      deadline: "",
    },
    food: {
      dietary_restriction: "",
      preferences: "",
      pre_workout: false,
      post_workout: false,
      supper: false,
    }
  },
});

const showForm1 = ref(true);

const bottomSheetFail = ref(false);
const reason = ref("");
const suggestion = ref("");

/// COMPUTED
const bottomSheet = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// WATCH
watch(bottomSheet, (val) => {
  if (val) {
    const account = accountsStore.account;
    const preferences = structuredClone(toRaw(unref(account.preferences)));

    body.weight = account.weight;
    body.height = account.height;
    body.preferences = {
      ...preferences,
      personalized_goal: {
        ...preferences.personalized_goal,
        deadline: toBr(preferences.personalized_goal.deadline)
      }
    };
  } else {
    tab.value = 0;
  }
}, { immediate: true });

watch(() => body.preferences.goal, (val) => {
  if (val === "PERFORMANCE") {
    body.preferences.desired_weight = 0;
  }

  if (val !== "GAIN_MUSCLE_MASS") {
    body.preferences.personalized_goal.focus_region = [];
  }

  if (val !== "PERFORMANCE") {
    body.preferences.personalized_goal.focus_performance = "";
    body.preferences.personalized_goal.desired_goal = "";
  }
});

watch(() => body.preferences.personalized_goal.status, (val) => {
  showForm1.value = false;
  nextTick(() => showForm1.value = true);
});

/// METHODS
const submit1 = async () => {
  const isValid = await validate(form1);
  if (isValid) tab.value++;
};

const submit2 = async () => {
  const isValid = await validate(form2);
  if (isValid) tab.value++;
};

const submit3 = async () => {
  const isValid = await validate(form3);
  if (isValid) tab.value++;
};

const submit4 = async () => {
  const isValid = await validate(form4);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const response = await plansStore.POST("", {
        ...body,
        preferences: {
          ...body.preferences,
          personalized_goal: {
            ...body.preferences.personalized_goal,
            desired_weight: body.preferences.desired_weight || 0,
            deadline: toUs(body.preferences.personalized_goal.deadline)
          },
        }
      });

      if (!response.error) {
        if (response.is_valid) {
          accountsStore.GET_ACCOUNT();
          emit("update:modelValue", false);
        } else if ("reason" in response && "suggestion" in response) {
          reason.value = response.reason;
          suggestion.value = response.suggestion;
          bottomSheetFail.value = true;
        }
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const back = () => {
  tab.value--;
};

const next = () => {
  switch(tab.value) {
    case 0:
      submit1();
      break;
    case 1:
      submit2();
      break;
    case 2:
      submit3();
      break;
    case 3:
      submit4();
      break;
  };
};
</script>