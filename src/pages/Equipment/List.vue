<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <header class="heading border-bottom-tertiary d-flex align-center ga-2">
      <span class="flex-fill d-flex">
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
          {{ t("$vuetify.label.equipments") }}
        </p>
      </span>

      <v-btn
        icon=""
        size="x-small"
        color="transparent"
        @click="newEquipment"
      >
        <v-icon :size="18">
          mdi-plus
        </v-icon>
      </v-btn>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 px-3 py-5">
      <!-- CARREGAMENTO -->
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

      <!-- NÃO TEM EQUIPAMENTOS CADASTRADOS -->
      <div
        v-else-if="!results.length"
        class="w-100 h-100 d-flex flex-column align-center justify-center px-5 ga-7"
      >
        <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
          <v-icon color="primary" :size="65">
            mdi-package-variant
          </v-icon>
        </div>

        <p class="text-center font-weight-bold text-h5 font-space-grotesk">
          {{ t("$vuetify.message.there_are_no_registered_equipments") }}
        </p>

        <v-btn
          color="primary"
          class="w-100 pa-7 d-flex text-h6 font-weight-bold"
          @click="newEquipment"
        >{{ t("$vuetify.label.create_now") }}</v-btn>
      </div>

      <!-- LISTAGEM -->
      <template v-else>
        <div class="d-flex flex-column ga-4">
          <div
            v-for="date in Object.keys(equipments)"
            :key="date"
          >
            <p class="mb-2 text-body-2 text-grey-lighten-1">
              {{ date }}
            </p>

            <div class="d-flex flex-column ga-3">
              <v-btn
                v-for="equipment in equipments[date]"
                class="position-relative rounded-lg text-none"
                :key="equipment._id"
                :style="{ height: '72px', backgroundColor: 'color-mix(in srgb, var(--tertiary) 56%, transparent)' }"
                @click="equipmentId = equipment._id; bottomSheet = true;"
              >
                <div class="text-left position-absolute top-0 left-0 right-0 bottom-0 px-4 py-3 d-flex align-center ga-4">
                  <div>
                    <v-icon :size="30">
                      {{
                        equipment.type === "tennis" ? "mdi-shoe-sneaker" : "mdi-bicycle"
                      }}
                    </v-icon>
                  </div>

                  <div class="d-flex flex-column">
                    <p class="mb-1 font-weight-bold">
                      {{
                        `${equipment.nickname}${equipment.retiree ? ` (${t("$vuetify.label.retiree").toLowerCase()})` : ""}`
                      }}
                    </p>

                    <p class="text-caption text-grey-lighten-1">
                      {{
                        `${formatNumber(equipment.used)} ${t("$vuetify.label.km").toLowerCase()}`
                      }}
                    </p>
                  </div>
                </div>
              </v-btn>
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
            <div class="d-flex justify-center align-center mb-5">
              <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
                <v-icon color="primary" :size="30">
                  {{ icon }}
                </v-icon>
              </div>
            </div>

            <p class="text-center font-weight-bold text-h6 mb-3">
              {{ nickname }}
            </p>

            <v-btn
              block
              color="primary"
              class="font-weight-bold text-none pa-7 mb-3"
              @click="edit"
            >{{ t("$vuetify.label.view_edit") }}</v-btn>

            <v-btn
              block
              variant="outlined"
              color="primary"
              class="font-weight-bold text-none pa-7 mb-3"
              @click="toggleRetiree"
            >{{ retireeLabel }}</v-btn>

            <v-btn
              block
              variant="text"
              color="error"
              class="font-weight-bold text-none pa-7"
              @click="deleteEquipment"
            >{{ t("$vuetify.label.delete_equipment") }}</v-btn>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { date } from "@/utils";
import { eventBus } from "@/eventBus";
import { useEquipmentsStore } from "@/stores/equipments";
import { type Equipment } from "@/types/equipment.type";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";

/// DATA
const { t } = useLocale();
const { toBr } = date();
const { formatNumber }  = useFormatNumber();
const equipamentsStore = useEquipmentsStore();
const loading = ref(true);
const results = ref<Equipment[]>([]);
const loadingData = ref(false);
const router = useRouter();
const page = ref(1);
const pages = ref(1);
const equipmentId = ref("");
const bottomSheet = ref(false);

/// COMPUTED
const equipments = computed(() => {
  return results.value.reduce((acc, equipment) => {
    const date = toBr(dayjs(equipment.created_at).format("YYYY-MM-DD"));
    if (!acc[date]) acc[date] = [];
    acc[date].push(equipment);
    return acc;
  }, { } as Record<string, Equipment[]>);
});

const icon = computed(() => {
  const equipment = results.value.find((e) => e._id === equipmentId.value);
  return !equipment ?
    "" :
    (equipment.type === "tennis" ? "mdi-shoe-sneaker" : "mdi-bicycle");
});

const nickname = computed(() => {
  const equipment = results.value.find((e) => e._id === equipmentId.value);
  return equipment?.nickname || "";
});

const retireeLabel = computed(() => {
  const equipment = results.value.find((e) => e._id === equipmentId.value);
  return !equipment ?
    "" :
    (equipment.retiree ? t(`$vuetify.label.back_to_wearing_${equipment.type}`) : t(`$vuetify.label.retire_${equipment.type}`));
});

const retiree = computed(() => {
  const equipment = results.value.find((e) => e._id === equipmentId.value);
  return equipment?.retiree || false;
});

/// WATCH
watch(page, async (val) => {
  loadingData.value = true;
  await loadList();
  loadingData.value = false;
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);
  await loadList();
  loading.value = false;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const back = () => {
  eventBus.emit("BACK_ROUTER");
};

const loadList = async () => {
  const response = await equipamentsStore.GET(`?page=${page.value}&limit=15`);

  if (!response.error) {
    pages.value = response.result.pages;

    results.value.push(
      ...response.result.results.filter((result: Equipment) =>
        !results.value.some((equipment) => equipment._id === result._id)
      )
    );
  }
};

const newEquipment = () => {
  router.replace({
    replace: true,
    query: { operation: "new" }
  });
};

const edit = () => {
  router.replace({
    replace: true,
    query: { _id: equipmentId.value, operation: "edit" }
  });
};

const toggleRetiree = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });

    const response = await equipamentsStore.PATCH(equipmentId.value, { retiree: !retiree.value });

    if (!response.error) {
      results.value = results.value.filter((equipment) => equipment._id !== equipmentId.value);
      await loadList();
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const deleteEquipment = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });

    const response = await equipamentsStore.DELETE(equipmentId.value);

    if (!response.error) {
      results.value = results.value.filter((equipment) => equipment._id !== equipmentId.value);
      bottomSheet.value = false;
      await loadList();
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>