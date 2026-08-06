<template>
  <div id="step-3">
    <div class="d-flex align-center py-2">
      <v-icon
        class="mr-4"
        @click="tab === 0 ? emit('set-tab', 0) : tab--"
      >mdi-arrow-left</v-icon>

      <img src="@/assets/images/logo.png" />

      <p class="font-weight-bold ml-2 font-space-grotesk">
        {{ t("$vuetify.company_name") }}
      </p>
    </div>

    <div class="mt-5 d-flex ga-2">
      <div
        v-for="i in 5"
        :key="i"
        :class="[
          'flex-fill rounded-lg',
          (tab + 1) > i ? 'bg-primary' : 'bg-tertiary'
        ]"
        :style="{ height: '2px' }"
      ></div>
    </div>

    <v-tabs-window v-model="tab" class="overflow-y-auto">
      <!-- CRIAR CONTA -->
      <v-tabs-window-item>
        <v-form
          ref="form1"
          class="pt-6"
          @submit.prevent="submit1"
        >
          <p
            class="text-h6 font-weight-bold mb-5"
          >{{ t("$vuetify.label.create_account") }}</p>

          <TextField
            required
            type="email"
            class="mb-5"
            :placeholder="t('$vuetify.label.placeholder_email')"
            :label="t('$vuetify.label.email')"
            :rules="[rules.email]"
            v-model="form.email"
          />

          <TextField
            required
            type="password"
            :placeholder="t('$vuetify.label.placeholder_password')"
            :label="t('$vuetify.label.password')"
            :rules="[rules.min_length_pasword]"
            v-model="form.password"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.next") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- DADOS PESSOAIS -->
      <v-tabs-window-item>
        <v-form
          ref="form2"
          class="pt-6"
          @submit.prevent="submit2"
        >
          <p
            class="text-h6 font-weight-bold mb-5"
          >{{ t("$vuetify.label.personal_data") }}</p>

          <TextField
            required
            class="mb-5"
            :label="t('$vuetify.label.name')"
            :placeholder="t('$vuetify.label.your_name')"
            v-model="form.name"
          />

          <TextField
            required
            type="tel"
            class="mb-5"
            :label="t('$vuetify.label.date_of_birth')"
            :placeholder="t('$vuetify.label.date_of_birth_format')"
            :rules="[rules.past_date]"
            :mask="'##/##/####'"
            v-model="form.date_of_birth"
          />

          <TextField
            required
            is-money
            hide-symbol
            class="mb-5"
            placeholder="75"
            :label="t('$vuetify.label.weight_kg')"
            :rules="[() => form.weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
            v-model="form.weight"
          />

          <TextField
            required
            is-money
            hide-symbol
            placeholder="1,66"
            :label="t('$vuetify.label.height_m')"
            :rules="[() => form.height > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
            v-model="form.height"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.next") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- SEU OBJETIVO -->
      <v-tabs-window-item>
        <v-form
          v-if="showForm3"
          ref="form3"
          class="pt-6"
          @submit.prevent="submit3"
        >
          <p
            class="text-h6 font-weight-bold mb-5"
          >{{ t("$vuetify.label.your_goal") }}</p>

          <v-input
            v-model="form.preferences.goal"
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
                  @click="form.preferences.goal = option"
                  :class="[
                    'text-center rounded-lg py-3',
                    form.preferences.goal === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                  ]"
                >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
              </div>
            </section>
          </v-input>

          <v-input
            v-model="form.preferences.level"
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
                  @click="form.preferences.level = option"
                  :class="[
                    'text-center rounded-lg py-3',
                    form.preferences.level === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
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
            v-model="form.preferences.personalized_goal.deadline"
          />

          <template v-if="form.preferences.goal">
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
                  v-model="form.preferences.personalized_goal.status"
                />
              </div>
            </div>

            <div class="mt-5" v-if="form.preferences.personalized_goal.status">
              <TextField
                v-if="form.preferences.goal !== 'PERFORMANCE'"
                is-money
                hide-symbol
                disabled
                class="mb-5"
                :label="t('$vuetify.label.current_weight')"
                v-model="form.weight"
              />

              <TextField
                v-if="form.preferences.goal !== 'PERFORMANCE'"
                is-money
                hide-symbol
                class="mb-5"
                placeholder="75"
                :label="t('$vuetify.label.desired_weight_kg')"
                :rules="[() => form.preferences.desired_weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                v-model="form.preferences.desired_weight"
              />

              <v-input
                v-if="form.preferences.goal === 'GAIN_MUSCLE_MASS'"
                class="mb-5"
                hide-details="auto"
                v-model="form.preferences.personalized_goal.focus_region"
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
                        form.preferences.personalized_goal.focus_region.includes(option) ?
                          form.preferences.personalized_goal.focus_region = form.preferences.personalized_goal.focus_region.filter((item) => item !== option) :
                          form.preferences.personalized_goal.focus_region.push(option)
                      "
                      :style="{ width: '48%' }"
                      :key="option"
                      :class="[
                        'text-center rounded-lg py-3',
                        form.preferences.personalized_goal.focus_region.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                      ]"
                    >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
                  </div>
                </section>
              </v-input>

              <template v-if="form.preferences.goal === 'PERFORMANCE'">
                <v-input
                  class="mb-5"
                  hide-details="auto"
                  v-model="form.preferences.personalized_goal.focus_performance"
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
                        @click="form.preferences.personalized_goal.focus_performance = option"
                        :class="[
                          'text-center rounded-lg py-3',
                          form.preferences.personalized_goal.focus_performance === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
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
                  v-model="form.preferences.personalized_goal.desired_goal"
                />
              </template>
            </div>
          </template>

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.next") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- ATIVIDADES -->
      <v-tabs-window-item>
        <v-form
          ref="form4"
          class="pt-6"
          @submit.prevent="submit4"
        >
          <p
            class="text-h6 font-weight-bold mb-5"
          >{{ t("$vuetify.label.activities") }}</p>

          <v-input
            v-model="form.preferences.training_location"
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
                  @click="form.preferences.training_location = option"
                  :class="[
                    'text-center rounded-lg py-3',
                    form.preferences.training_location === option ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                  ]"
                >{{ t(`$vuetify.label.place_${option.toLowerCase()}`) }}</div>
              </div>
            </section>
          </v-input>

          <v-input
            class="mb-5"
            hide-details="auto"
            v-model="form.preferences.sports_practiced"
          >
            <section class="w-100">
              <p class="mb-3">
                {{ t("$vuetify.label.sports_practiced") }}
              </p>

              <div class="d-flex ga-2 flex-wrap">
                <div
                  v-for="option in sports"
                  @click="
                    form.preferences.sports_practiced.includes(option) ?
                      (form.preferences.sports_practiced = form.preferences.sports_practiced.filter((i) => i !== option)) :
                      form.preferences.sports_practiced.push(option)
                  "
                  :style="{ width: '48%' }"
                  :key="option"
                  :class="[
                    'text-center rounded-lg py-3',
                    form.preferences.sports_practiced.includes(option) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                  ]"
                >{{ t(`$vuetify.label.${option.toLowerCase()}`) }}</div>
              </div>
            </section>
          </v-input>

          <v-input
            class="mb-5"
            hide-details="auto"
            v-model="form.preferences.days"
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
                  @click="form.preferences.days = option + 1"
                  :style="{ width: '48%' }"
                  :key="option"
                  :class="[
                    'text-center rounded-lg py-3',
                    form.preferences.days === (option + 1) ? 'bg-primary text-black font-weight-bold' : 'bg-tertiary'
                  ]"
                >{{ `${option + 1} ${t("$vuetify.label.days").toLowerCase()}` }}</div>
              </div>
            </section>
          </v-input>

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.next") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- ALIMENTAÇÃO -->
      <v-tabs-window-item>
        <v-form
          ref="form5"
          class="pt-6"
          @submit.prevent="submit5"
        >
          <p
            class="text-h6 font-weight-bold mb-5"
          >{{ t("$vuetify.label.food") }}</p>

          <TextField
            class="mb-5"
            :label="t('$vuetify.label.dietary_restriction')"
            :placeholder="t('$vuetify.message.dietary_restriction_placeholder')"
            v-model="form.preferences.food.dietary_restriction"
          />

          <TextField
            class="mb-5"
            :label="t('$vuetify.label.food_preferences')"
            :placeholder="t('$vuetify.message.food_preferences_placeholder')"
            v-model="form.preferences.food.preferences"
          />

          <p class="mb-3">
            {{ t("$vuetify.label.extra_meals") }}
          </p>

          <v-switch
            inset
            class="mb-1"
            hide-details="auto"
            v-model="form.preferences.food.pre_workout"
            color="primary"
            :label="t('$vuetify.label.pre_workout_with_explanation')"
          />

          <v-switch
            inset
            class="mb-1"
            hide-details="auto"
            v-model="form.preferences.food.post_workout"
            color="primary"
            :label="t('$vuetify.label.post_workout_with_explanation')"
          />

          <v-switch
            inset
            hide-details="auto"
            v-model="form.preferences.food.supper"
            color="primary"
            :label="t('$vuetify.label.supper_workout_with_explanation')"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.finish") }}</v-btn>
        </v-form>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { attestationService } from "@/services/attestation.service";
import { date } from "@/utils";
import { useForm } from "@/composables";

/// JSON
import goals from "@/json/goals.json";
import levels from "@/json/levels.json";
import regions from "@/json/regions.json";
import performances from "@/json/performances.json";
import places from "@/json/places.json";
import sports from "@/json/sports.json";

/// DATA
const { t } = useLocale();
const { toUs } = date();
const { rules, validate } = useForm();
const emit = defineEmits(["set-tab"]);
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();

const tab = ref(0);

const form = reactive({
  email: "",
  password: "",
  name: "",
  date_of_birth: "",
  weight: 0,
  height: 0,
  preferences: {
    goal: "",
    level: "",
    desired_weight: 0,
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

const form1 = ref();
const form2 = ref();
const form3 = ref();
const form4 = ref();
const form5 = ref();

const showForm3 = ref(true);

/// WATCH
watch(tab, (val) => {
  router.replace({
    replace: true,
    query: { ...route.query, step: val + 1 }
  });
});

watch(() => route.query.step, (val) => {
  tab.value = Number(val) - 1;
});

watch(() => form.preferences.goal, (val) => {
  if (val === "PERFORMANCE") {
    form.preferences.desired_weight = 0;
  }

  if (val !== "GAIN_MUSCLE_MASS") {
    form.preferences.personalized_goal.focus_region = [];
  }

  if (val !== "PERFORMANCE") {
    form.preferences.personalized_goal.focus_performance = "";
    form.preferences.personalized_goal.desired_goal = "";
  }
});

watch(() => form.preferences.personalized_goal.status, (val) => {
  showForm3.value = false;
  nextTick(() => showForm3.value = true);
});

/// LIFE CYCLES
onMounted(() => {
  router.replace({
    replace: true,
    query: { ...route.query, step: tab.value + 1 }
  });
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
  if (isValid) tab.value++;
};

const submit5 = async () => {
  const isValid = await validate(form5);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const attestationHeaders = await attestationService.getAssertionHeaders();

      const response = await accountsStore.POST("", {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        date_of_birth: toUs(form.date_of_birth),
        weight: form.weight,
        height: form.height,
        preferences: {
          ...form.preferences,
          desired_weight: form.preferences.desired_weight || 0,
          personalized_goal: {
            ...form.preferences.personalized_goal,
            deadline: toUs(form.preferences.personalized_goal.deadline),
          },
        }
      }, attestationHeaders);

      if (!response.error) {
        await persistentSession.set("tutorial", "1");

        router.replace({
          replace: true,
          query: { ...route.query, step: "1" }
        });

        emit("set-tab", 1);
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};
</script>

<style lang="sass">
div#step-3
  width: 100%
  height: 100%
  padding: calc(var(--top-saved) + 0.5rem) 1rem calc(var(--bottom-saved) + 0.5rem) 1rem

  .v-switch .v-selection-control
    min-height: auto

  img
    width: 1.8rem
</style>