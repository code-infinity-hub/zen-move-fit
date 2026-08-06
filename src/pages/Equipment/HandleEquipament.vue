<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary">
    <header class="d-flex align-center heading border-bottom-tertiary">
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
        {{ title }}
      </p>
    </header>

    <v-form
      class="flex-fill overflow-y-auto px-3 py-3"
      ref="form"
      @submit.prevent="submit"
    >
      <div class="mb-5">
        <p class="mb-2 text-subtitle-2">
          {{ t("$vuetify.label.type") }}
        </p>

        <v-radio-group
          :disabled="props.operation === 'edit'"
          v-model="body.type"
          hide-details="auto"
        >
          <v-radio
            :label="t('$vuetify.label.tennis')"
            value="tennis"
            color="primary"
          />

          <v-radio
            :label="t('$vuetify.label.bicycle')"
            value="bicycle"
            color="primary"
          />
        </v-radio-group>
      </div>

      <ItemSelect
        multiple
        class="mb-5"
        :label="t('$vuetify.label.standard_sports')"
        :items="sports"
        v-model="body.standard_sports"
      />

      <template v-if="body.type === 'tennis'">
        <TextField
          class="mb-5"
          :label="t('$vuetify.label.mark')"
          v-model="body.mark"
        />

        <TextField
          class="mb-5"
          :label="t('$vuetify.label.model')"
          v-model="body.model"
        />

        <TextField
          required
          class="mb-5"
          :label="t('$vuetify.label.nickname')"
          v-model="body.nickname"
        />

        <TextareaField
          no-resize
          class="mb-5"
          :label="t('$vuetify.label.notes')"
          v-model="body.notes"
        />

        <v-switch
          inset
          class="mb-5"
          hide-details="auto"
          color="primary"
          v-model="body.warn"
          :label="t('$vuetify.message.let_me_know_when_i_arrive')"
        />

        <ItemSelect
          persistent-hint
          class="mb-5"
          :required="body.warn"
          :disabled="!body.warn"
          :label="t('$vuetify.label.mileage')"
          :items="mileageList"
          :hint="t('$vuetify.message.mileage_message')"
          v-model="body.mileage"
        />
      </template>
      <template v-else>
        <TextField
          required
          class="mb-5"
          :label="t('$vuetify.label.nickname')"
          v-model="body.nickname"
        />

        <ItemSelect
          required
          class="mb-5"
          :label="t('$vuetify.label.type_of_bicycle')"
          :items="bikeTypesSelect"
          v-model="body.bicycle_type"
        />

        <TextField
          class="mb-5"
          :label="t('$vuetify.label.mark')"
          v-model="body.mark"
        />

        <TextField
          class="mb-5"
          :label="t('$vuetify.label.model')"
          v-model="body.model"
        />

        <TextField
          is-money
          hide-symbol
          class="mb-5"
          placeholder="75"
          :label="t('$vuetify.label.weight_kg')"
          v-model="body.weight"
        />

        <TextareaField
          no-resize
          class="mb-5"
          :label="t('$vuetify.label.notes')"
          v-model="body.notes"
        />
      </template>
    </v-form>

    <footer
      class="pa-3"
      :style="{ paddingBottom: 'calc(6px + var(--bottom-saved)) !important', borderTop: '1px solid var(--tertiary)' }"
    >
      <v-btn
        block
        color="primary"
        class="text-black font-weight-bold text-none pa-7 text-h6 d-flex"
        @click="submit"
      >{{ t("$vuetify.label.save") }}</v-btn>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useLocale } from "vuetify";
import { useEquipmentsStore } from "@/stores/equipments";
import { eventBus } from "@/eventBus";
import { useForm, useFormatNumber } from "@/composables";
import { type Equipment } from "@/types/equipment.type";

import activitiesCategories from "@/json/activities-categories.json";
import bikeTypes from "@/json/bike-types.json";

const props = withDefaults(
  defineProps<{ operation?: "new" | "edit" }>(),
  { operation: "new" }
);

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { validate } = useForm();
const route = useRoute();
const emit = defineEmits(["back"]);
const equipmentsStore = useEquipmentsStore();

const form = ref();

const body = reactive({
  type: "tennis" as Equipment["type"],
  standard_sports: [] as string[],
  bicycle_type: "" as Equipment["bicycle_type"],
  nickname: "",
  mark: "",
  model: "",
  notes: "",
  weight: 0,
  warn: true,
  mileage: 0
});

/// COMPUTED
const _id = computed(() => String(route.query._id) || "");

const title = computed(() => {
  return props.operation === "new" ?
    t("$vuetify.label.create_equipment") :
    t("$vuetify.label.edit_equipment");
});

const bikeTypesSelect = computed(() => {
  return bikeTypes.map((value) => ({
    title: t(`$vuetify.bike_types.${value}`),
    value
  }));
});

const sports = computed(() => {
  return activitiesCategories
    .filter((category) =>
      body.type === "tennis" ? category.type !== "CYCLING" : category.type === "CYCLING"
    )
    .map((category) => ({
      title: t(`$vuetify.label.${category.type.toLowerCase()}`),
      value: category.type,
      icon: category.icon
    }));
});

const mileageList = computed(() => {
  const list = [400, 500, 600, 700, 800, 1000, 1200];
  return list.map((value) => ({
    title: `${formatNumber(value)} ${t("$vuetify.label.km").toLowerCase()}`,
    value
  }));
});

/// WATCH
watch(() => body.type, (val) => {
  body.standard_sports = [];

  if (body.type === "tennis") {
    body.weight = 0;
    body.warn = true;
    body.mileage = 0;
  }
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);

  if (props.operation === "edit") {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const response = await equipmentsStore.GET(_id.value);

      if (!response.error) {
        const equipment = response.equipment as Equipment;

        body.type = equipment.type;
        body.standard_sports = equipment.standard_sports;
        body.bicycle_type = equipment.bicycle_type;
        body.nickname = equipment.nickname;
        body.mark = equipment.mark;
        body.model = equipment.model;
        body.notes = equipment.notes;
        body.weight = equipment.weight || 0;
        body.warn = equipment.warn || false;
        body.mileage = equipment.mileage || 0;
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const back = () => {
  emit("back");
};

const submit = async () => {
  const isValid = await validate(form);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const bodyForm = {
        type: body.type,
        standard_sports: body.standard_sports,
        nickname: body.nickname,
        mark: body.mark,
        model: body.model,
        notes: body.notes,
        ...(
          body.type === "tennis" ?
            { warn: body.warn, mileage: body.mileage } :
            { bicycle_type: body.bicycle_type, weight: body.weight }
        )
      };

      const response = props.operation === "new" ?
        await equipmentsStore.POST("", bodyForm) :
        await equipmentsStore.PATCH(_id.value, bodyForm);

      if (!response.error) back();
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};
</script>