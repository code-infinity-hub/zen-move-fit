<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <header class="heading border-bottom-tertiary d-flex align-center">
      <v-btn
        icon=""
        size="x-small"
        color="tertiary"
        class="mr-4"
        @click="back"
      >
        <v-icon :size="18">
          mdi-arrow-left
        </v-icon>
      </v-btn>

      <p class="text-h6 font-space-grotesk font-weight-bold">
        {{ t("$vuetify.label.plan_settings") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 px-3 pt-5">
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

      <v-tabs-window v-model="tab" class="overflow-y-auto">
        <!-- DADOS PESSOAIS -->
        <v-tabs-window-item>
          <v-form ref="form1" @submit.prevent="submit1">
            <p
              class="text-h6 font-weight-bold mb-5"
            >{{ t("$vuetify.label.personal_data") }}</p>

            <TextField
              required
              is-money
              hide-symbol
              class="mb-5"
              placeholder="75"
              :label="t('$vuetify.label.weight_kg')"
              :rules="[() => bodyForm.weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
              v-model="bodyForm.weight"
            />

            <TextField
              required
              is-money
              hide-symbol
              placeholder="1,66"
              :label="t('$vuetify.label.height_m')"
              :rules="[() => bodyForm.height > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
              v-model="bodyForm.height"
            />

            <input type="submit" v-show="false" />
          </v-form>
        </v-tabs-window-item>

        <!-- SEU OBJETIVO -->
        <v-tabs-window-item>
          <v-form
            v-if="showForm2"
            ref="form2"
            @submit.prevent="submit2"
          >
            <p
              class="text-h6 font-weight-bold mb-5"
            >{{ t("$vuetify.label.your_goal") }}</p>

            <v-input
              v-model="bodyForm.preferences.goal"
              class="mb-5"
              hide-details="auto"
              :rules="[rules.required]"
            >
              <section class="w-100">
                <p class="mb-3">
                  {{ t("$vuetify.message.what_is_your_goal") }}
                  <span class="text-error">*</span>
                </p>

                <div class="d-flex flex-column ga-2">
                  <div
                    v-for="option in goals"
                    :key="option"
                    @click="bodyForm.preferences.goal = option"
                    :class="[
                      'text-center rounded-lg py-3',
                      bodyForm.preferences.goal === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                    ]"
                  >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                </div>
              </section>
            </v-input>

            <v-input
              v-model="bodyForm.preferences.level"
              hide-details="auto"
              class="mb-5"
              :rules="[rules.required]"
            >
              <section class="w-100">
                <p class="mb-3">
                  {{ t("$vuetify.message.whats_your_fitness_level") }}
                  <span class="text-error">*</span>
                </p>

                <div class="d-flex flex-column ga-2">
                  <div
                    v-for="option in levels"
                    :key="option"
                    @click="bodyForm.preferences.level = option"
                    :class="[
                      'text-center rounded-lg py-3',
                      bodyForm.preferences.level === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
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
              v-model="bodyForm.preferences.personalized_goal.deadline"
            />

            <template v-if="bodyForm.preferences.goal">
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
                    v-model="bodyForm.preferences.personalized_goal.status"
                  />
                </div>
              </div>

              <div class="mt-5" v-if="bodyForm.preferences.personalized_goal.status">
                <TextField
                  v-if="bodyForm.preferences.goal !== 'PERFORMANCE'"
                  is-money
                  hide-symbol
                  disabled
                  class="mb-5"
                  :label="t('$vuetify.label.current_weight')"
                  v-model="bodyForm.weight"
                />

                <TextField
                  v-if="bodyForm.preferences.goal !== 'PERFORMANCE'"
                  is-money
                  hide-symbol
                  class="mb-5"
                  placeholder="75"
                  :label="t('$vuetify.label.desired_weight_kg')"
                  :rules="[() => bodyForm.preferences.desired_weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                  v-model="bodyForm.preferences.desired_weight"
                />

                <v-input
                  v-if="bodyForm.preferences.goal === 'GAIN_MUSCLE_MASS'"
                  class="mb-5"
                  hide-details="auto"
                  v-model="bodyForm.preferences.personalized_goal.focus_region"
                  :rules="[(val: string[]) => !!val.length || t('$vuetify.errors.it_must_have_at_least_1_item')]"
                >
                  <section class="w-100">
                    <p class="mb-3">
                      {{ t("$vuetify.label.focus_region") }}
                      <span class="text-error">*</span>
                    </p>

                    <div class="d-flex ga-2 flex-wrap">
                      <div
                        v-for="option in regions"
                        @click="
                          bodyForm.preferences.personalized_goal.focus_region.includes(option) ?
                            bodyForm.preferences.personalized_goal.focus_region = bodyForm.preferences.personalized_goal.focus_region.filter((item) => item !== option) :
                            bodyForm.preferences.personalized_goal.focus_region.push(option)
                        "
                        :style="{ width: '48%' }"
                        :key="option"
                        :class="[
                          'text-center rounded-lg py-3',
                          bodyForm.preferences.personalized_goal.focus_region.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                        ]"
                      >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                    </div>
                  </section>
                </v-input>

                <template v-if="bodyForm.preferences.goal === 'PERFORMANCE'">
                  <v-input
                    class="mb-5"
                    hide-details="auto"
                    v-model="bodyForm.preferences.personalized_goal.focus_performance"
                    :rules="[rules.required]"
                  >
                    <section class="w-100">
                      <p class="mb-3">
                        {{ t("$vuetify.label.type_of_performance") }}
                        <span class="text-error">*</span>
                      </p>

                      <div class="d-flex flex-column ga-2">
                        <div
                          v-for="option in performances"
                          :key="option"
                          @click="bodyForm.preferences.personalized_goal.focus_performance = option"
                          :class="[
                            'text-center rounded-lg py-3',
                            bodyForm.preferences.personalized_goal.focus_performance === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                          ]"
                        >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                      </div>
                    </section>
                  </v-input>

                  <TextField
                    required
                    class="mb-5"
                    :label="t('$vuetify.label.desired_goal')"
                    :placeholder="t('$vuetify.message.desired_goal_placeholder')"
                    v-model="bodyForm.preferences.personalized_goal.desired_goal"
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
              class="text-h6 font-weight-bold mb-5"
            >{{ t("$vuetify.label.activities") }}</p>

            <v-input
              v-model="bodyForm.preferences.training_location"
              hide-details="auto"
              class="mb-5"
              :rules="[rules.required]"
            >
              <section class="w-100">
                <p class="mb-3">
                  {{ t("$vuetify.message.where_do_you_prefer_to_train") }}
                  <span class="text-error">*</span>
                </p>

                <div class="d-flex flex-column ga-2">
                  <div
                    v-for="option in places"
                    :key="option"
                    @click="bodyForm.preferences.training_location = option"
                    :class="[
                      'text-center rounded-lg py-3',
                      bodyForm.preferences.training_location === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                    ]"
                  >{{ t(`$vuetify.label.place_${option.toLowerCase()}`) }}</div>
                </div>
              </section>
            </v-input>

            <v-input
              class="mb-5"
              hide-details="auto"
              v-model="bodyForm.preferences.sports_practiced"
            >
              <section class="w-100">
                <p class="mb-3">
                  {{ t("$vuetify.label.sports_practiced") }}
                </p>

                <div class="d-flex ga-2 flex-wrap">
                  <div
                    v-for="option in sports"
                    @click="
                      bodyForm.preferences.sports_practiced.includes(option) ?
                        (bodyForm.preferences.sports_practiced = bodyForm.preferences.sports_practiced.filter((i) => i !== option)) :
                        bodyForm.preferences.sports_practiced.push(option)
                    "
                    :style="{ width: '48%' }"
                    :key="option"
                    :class="[
                      'text-center rounded-lg py-3',
                      bodyForm.preferences.sports_practiced.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                    ]"
                  >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                </div>
              </section>
            </v-input>

            <v-input
              class="mb-5"
              hide-details="auto"
              v-model="bodyForm.preferences.days"
              :rules="[rules.required]"
            >
              <section class="w-100">
                <p class="mb-3">
                  {{ t("$vuetify.message.how_many_days_a_week_do_you_train") }}
                  <span class="text-error">*</span>
                </p>

                <div class="d-flex ga-2 flex-wrap">
                  <div
                    v-for="option in 6"
                    @click="bodyForm.preferences.days = option + 1"
                    :style="{ width: '48%' }"
                    :key="option"
                    :class="[
                      'text-center rounded-lg py-3',
                      bodyForm.preferences.days === (option + 1) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                    ]"
                  >{{ `${option + 1} ${t("$vuetify.label.days").toLowerCase()}` }}</div>
                </div>
              </section>
            </v-input>
          </v-form>
        </v-tabs-window-item>

        <!-- ALIMENTAÇÃO -->
        <v-tabs-window-item>
          <v-form ref="form4" @submit.prevent="submit4">
            <p
              class="text-h6 font-weight-bold mb-5"
            >{{ t("$vuetify.label.food") }}</p>

            <TextField
              class="mb-5"
              :label="t('$vuetify.label.dietary_restriction')"
              :placeholder="t('$vuetify.message.dietary_restriction_placeholder')"
              v-model="bodyForm.preferences.food.dietary_restriction"
            />

            <TextField
              class="mb-5"
              :label="t('$vuetify.label.food_preferences')"
              :placeholder="t('$vuetify.message.food_preferences_placeholder')"
              v-model="bodyForm.preferences.food.preferences"
            />

            <p class="mb-3">
              {{ t("$vuetify.label.extra_meals") }}
            </p>

            <v-switch
              inset
              class="mb-1"
              hide-details="auto"
              v-model="bodyForm.preferences.food.pre_workout"
              color="primary"
              :label="t('$vuetify.label.pre_workout_with_explanation')"
            />

            <v-switch
              inset
              class="mb-1"
              hide-details="auto"
              v-model="bodyForm.preferences.food.post_workout"
              color="primary"
              :label="t('$vuetify.label.post_workout_with_explanation')"
            />

            <v-switch
              inset
              hide-details="auto"
              v-model="bodyForm.preferences.food.supper"
              color="primary"
              :label="t('$vuetify.label.supper_workout_with_explanation')"
            />
          </v-form>
        </v-tabs-window-item>

        <v-tabs-window-item></v-tabs-window-item>
      </v-tabs-window>
    </div>

    <div
      class="d-flex flex-column px-2 pt-3"
      :style="{ paddingBottom: 'calc(var(--bottom-saved) + 0.5rem)' }"
    >
      <v-btn
        block
        class="text-none pa-7 font-weight-bold"
        color="primary"
        @click="submit"
      >
        {{
          tab === 3 ?
            t("$vuetify.label.save") :
            t("$vuetify.label.next")
        }}
      </v-btn>

      <v-btn
        v-if="accountsStore.isSubscriber && saved"
        disabled
        block
        class="text-none mt-4 pa-7 font-weight-bold border-sextet"
        type="button"
        color="quintet"
      >{{ t("$vuetify.label.redo_training_plan") }}</v-btn>
    </div>

    <BottomSheetSaveChanges
      v-model="bottomSheetChanges"
      @save-and-exit="save(true)"
      @save-without-exit="emit('back')"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { useForm } from "@/composables";
import { isDeepEqual, date } from "@/utils";

/// COMPONENTS
import BottomSheetSaveChanges from "@/components/BottomSheetSaveChanges.vue";

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
const { toBr, toUs  } = date();
const emit = defineEmits(["back"]);
const accountsStore = useAccountsStore();
const tab = ref(0);

const bottomSheetChanges = ref(false);

const saved = ref(false);

const showForm2 = ref(true);

const form1 = ref();
const form2 = ref();
const form3 = ref();
const form4 = ref();

const bodyForm = reactive({
  weight: 0,
  height: 0,
  preferences: {
    desired_weight: 0,
    goal: "",
    level: "",
    training_location: "",
    sports_practiced: [] as string[],
    days: 0,
    personalized_goal: {
      status: true,
      focus_region: [] as string[],
      focus_performance: "",
      desired_goal: "",
      deadline: "",
    },
    food: {
      dietary_restriction: "",
      preferences: "",
      pre_workout: true,
      post_workout: true,
      supper: true,
    }
  }
});

/// COMPUTED
const account = computed(() => accountsStore.account);

const body = computed(() => {
  return {
    weight: bodyForm.weight,
    height: bodyForm.height,
    preferences: {
      ...bodyForm.preferences,
      personalized_goal: {
        ...bodyForm.preferences.personalized_goal,
        deadline: toUs(bodyForm.preferences.personalized_goal.deadline),
      },
    }
  };
});

const isEdited = computed(() => {
  const preferences = account.value.preferences;
  const original = {
    weight: account.value.weight,
    height: account.value.height,
    preferences: {
      ...preferences,
      desired_weight: preferences.desired_weight || 0,
    }
  };

  return !isDeepEqual(original, body.value);
});

/// WATCH
watch(() => bodyForm.preferences.personalized_goal.status, (val) => {
  showForm2.value = false;
  nextTick(() => showForm2.value = true);
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", back);

  bodyForm.weight = account.value.weight;
  bodyForm.height = account.value.height;

  const preferences = structuredClone(toRaw(unref(account.value.preferences)));

  bodyForm.preferences = {
    ...preferences,
    personalized_goal: {
      ...preferences.personalized_goal,
      deadline: toBr(preferences.personalized_goal.deadline)
    }
  };
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const back = () => {
  if (tab.value === 0) {
    if (isEdited.value) {
      bottomSheetChanges.value = true;
      return;
    }

    emit("back");
    return;
  }

  tab.value--;
};

const submit = async () => {
  if (tab.value === 0) {
    submit1();
    return;
  }

  if (tab.value === 1) {
    submit2();
    return;
  }

  if (tab.value === 2) {
    submit3();
    return;
  }

  submit4();
};

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
  if (isValid) save(false);
};

const save = async (exit = false) => {
  if (!isEdited.value) {
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.there_are_no_changes_made")
    });
    return;
  }

  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await accountsStore.UPDATE_ACCOUNT(body.value, false);

    if (!response.error) {
      saved.value = true;
      if (exit) emit("back");
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>