<template>
  <div class="d-flex flex-column w-100 h-100 pb-3">
    <div class="mb-5 d-flex justify-space-between align-center">
      <div>
        <p class="font-weight-bold font-space-grotesk">
          {{ t("$vuetify.label.personal_records") }}
        </p>

        <p class="text-caption text-grey-lighten-1">
          {{ t("$vuetify.message.your_best_results") }}
        </p>
      </div>

      <v-btn
        v-if="!loading"
        class="text-none d-flex pa-5"
        color="primary"
        @click="bottomSheet = true"
      >
        <v-icon class="mr-2">mdi-plus</v-icon>
        {{ t("$vuetify.label.new_pr") }}
      </v-btn>
    </div>

    <div
      v-if="loading"
      class="flex-fill d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <div
      v-else-if="!results.length"
      class="flex-fill rounded-lg d-flex flex-column justify-center align-center ga-2 px-3"
    >
      <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
        <v-icon color="primary" :size="65">
          mdi-package-variant
        </v-icon>
      </div>

      <p class="text-center font-weight-bold text-h5 font-space-grotesk">
        {{ t("$vuetify.message.no_records_registered") }}
      </p>
    </div>
    <div v-else>
      <div class="d-flex flex-column ga-4">
        <div
          v-for="date in Object.keys(prs)"
          :key="date"
        >
          <p class="mb-2 text-body-2 text-grey-lighten-1">
            {{ date }}
          </p>

          <div class="d-flex flex-column ga-3">
            <div
              v-ripple
              v-for="pr in prs[date]"
              :key="pr._id"
              class="pa-3 d-flex justify-center align-center ga-3 bg-tertiary rounded-lg"
              @click="selectPr(pr)"
              @touchstart="touchStart(pr._id)"
              @touchend="touchEnd"
            >
              <div class="size-3-5rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
                <v-icon color="primary" :size="25">
                  mdi-trophy-outline
                </v-icon>
              </div>

              <div class="flex-fill d-flex flex-column justify-center text-left">
                <p class="font-weight-black font-space-grotesk">
                  {{ pr.name }}
                </p>

                <div>
                  <span class="font-weight-bold text-h6 text-primary mr-1">
                    {{ formatNumber(pr.value) }}
                  </span>

                  <span class="text-grey-lighten-1">
                    {{ pr.unit }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingData v-if="loadingData" />

      <v-btn
        block
        v-if="(page + 1) <= pages"
        color="primary"
        class="mt-5 mb-3 pa-6 text-black font-weight-bold text-none d-flex"
        @click="page += 1"
      >{{ t("$vuetify.label.load_more") }}</v-btn>
    </div>

    <!-- BOTTOM SHEET DE REGISTRAR/EDITAR PR -->
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
        <v-card-text class="py-5">
          <p class="text-center mb-5">
            {{
              _id ?
                t("$vuetify.label.edit_pr") :
                t("$vuetify.label.register_new_pr")
            }}
          </p>

          <v-form
            ref="form"
            @submit.prevent="submit"
          >
            <TextField
              v-if="!useExercises"
              required
              class="mb-2"
              :label="t('$vuetify.label.exercise')"
              v-model="name"
            />
            <ItemSelect
              v-else
              required
              class="mb-2"
              :label="t('$vuetify.label.exercise')"
              :items="exercises"
              v-model="name"
            />

            <v-checkbox
              v-if="results.length"
              color="primary"
              :label="t('$vuetify.message.use_pre_existing_exercises')"
              v-model="useExercises"
            />

            <v-row class="mb-5">
              <v-col cols="8" sm="8" md="8" lg="8">
                <TextField
                  required
                  is-money
                  hide-symbol
                  :label="t('$vuetify.label.value')"
                  v-model="value"
                />
              </v-col>

              <v-col cols="4" sm="4" md="4" lg="4">
                <TextField
                  required
                  :label="t('$vuetify.label.unit')"
                  v-model="unit"
                />
              </v-col>
            </v-row>

            <TextField
              required
              type="tel"
              mask="##/##/####"
              class="mb-5"
              :label="t('$vuetify.label.date')"
              :rules="[rules.past_date]"
              v-model="date"
            />

            <v-btn
              block
              class="text-none mt-6 pa-7 font-weight-bold"
              type="submit"
              color="primary"
            >
              <v-icon class="mr-2">mdi-trophy-outline</v-icon>

              {{
                _id ?
                  t("$vuetify.label.save_pr") :
                  t("$vuetify.label.register_pr")
              }}
            </v-btn>

            <v-btn
              v-if="_id"
              block
              variant="outlined"
              class="text-none mt-3 pa-7 font-weight-bold"
              color="error"
              @click="bottomSheetRemove = true"
            >
              <v-icon class="mr-2">mdi-trash-can-outline</v-icon>
              {{ t("$vuetify.label.delete_pr") }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE DELETAR PR -->
    <v-bottom-sheet v-model="bottomSheetRemove">
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
            {{ t("$vuetify.label.delete_pr") }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
            v-html="t('$vuetify.message.delete_pr')"
          ></p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheetRemove = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="deletePr"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { useLocale } from "vuetify";
import { usePrsStore } from "@/stores/prs";
import { useForm, useFormatNumber } from "@/composables";
import { eventBus } from "@/eventBus";
import { Haptics } from "@/mobile";
import { date as dateUtil } from "@/utils";
import { type Pr } from "@/types/pr.type";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";

/// DATA
const { t } = useLocale();
const { rules, validate } = useForm();
const { formatNumber }  = useFormatNumber();
const { toBr, toUs } = dateUtil();
const route = useRoute();
const router = useRouter();
const prsStore = usePrsStore();
const results = ref<Pr[]>([]);

const page = ref(1);
const pages = ref(1);

const loading = ref(true);
const loadingData = ref(false);

const bottomSheet = ref(false);

const _id = ref("");
const form = ref();
const name = ref("");
const value = ref(0);
const unit = ref("Kg");
const date = ref(dayjs().format("DD/MM/YYYY"));
const useExercises = ref(false);

const timeout = ref<null | number>(null);

const bottomSheetRemove = ref(false);

/// COMPUTED
const prs = computed(() => {
  return results.value.reduce((acc, pr) => {
    const date = toBr(dayjs(pr.created_at).format("YYYY-MM-DD"));
    if (!acc[date]) acc[date] = [];
    acc[date].push(pr);
    return acc;
  }, { } as Record<string, Pr[]>);
});

const exercises = computed(() => [...(new Map(results.value.map((pr) => [pr.name, pr.name]))).keys()]);

/// WATCH
watch(bottomSheet, (val) => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      new: _id.value ? undefined : (val ? "true" : undefined),
      _id: !_id.value ? undefined : (val ? _id.value : undefined)
    }
  });

  if (!val) {
    _id.value = "";
    name.value = "";
    value.value = 0;
    unit.value = "Kg";
    date.value = dayjs().format("DD/MM/YYYY");
    useExercises.value = false;
  }
});

watch(page, async (val) => {
  loadingData.value = true;
  await loadList();
  loadingData.value = false;
});

/// LIFE CYCLES
onMounted(async () => {
  await loadList()

  loading.value = false

  if (route.query.new === "true") {
    bottomSheet.value = true;
  } else if (route.query._id) {
    const pr = results.value.find((p) => p._id === route.query._id);

    if (pr) {
      selectPr(pr)
    } else {
      router.replace({
        replace: true,
        query: { ...route.query, _id: undefined }
      });
    }
  }
});

onBeforeUnmount(() => {
  if (timeout.value !== null) {
    clearInterval(timeout.value);
  };
});

/// METHODS
const loadList = async () => {
  const response = await prsStore.GET(`?page=${page.value}&limit=15`);

  if (!response.error) {
    pages.value = response.result.pages;

    results.value.push(
      ...response.result.results.filter((result: Pr) =>
        !results.value.some((pr) => pr._id === result._id)
      )
    );
  }
};

const selectPr = (pr: Pr) => {
  _id.value = pr._id;
  name.value = pr.name;
  value.value = pr.value;
  unit.value = pr.unit;
  date.value = dayjs(pr.date, "YYYY-MM-DD").format("DD/MM/YYYY");
  useExercises.value = true;
  bottomSheet.value = true;
};

const touchStart = (prId: string) => {
  _id.value = prId;

  if (timeout.value !== null) {
    clearInterval(timeout.value);
  };

  timeout.value = setTimeout(async () => {
    bottomSheetRemove.value = true;
    timeout.value = null;
    Haptics.vibrate();
  }, 1000);
};

const touchEnd = () => {
  if (timeout.value !== null) {
    clearInterval(timeout.value);
    timeout.value = null;
  };

  if (!bottomSheetRemove.value) _id.value = "";
};

const deletePr = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await prsStore.DELETE(_id.value);

    if (!response.error) {
      results.value = results.value.filter((pr) => pr._id !== _id.value);
      bottomSheet.value = false;
      bottomSheetRemove.value = false;
      loadList();
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const submit = async () => {
  const isValid = await validate(form);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const body = {
        name: name.value.trim(),
        value: value.value,
        unit: unit.value,
        date: toUs(date.value),
      };

      const response = _id.value ?
        await prsStore.PATCH(_id.value, body) :
        await prsStore.POST("", body);

      if (!response.error) {
        results.value = results.value.filter((pr) => pr._id !== _id.value);
        bottomSheet.value = false;
        loadList();
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};
</script>