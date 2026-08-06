<template>
  <v-bottom-sheet persistent v-model="modelProxy">
    <div class="d-flex justify-end px-4 mb-3">
      <v-btn
        icon=""
        color="tertiary"
        size="small"
        @click="modelProxy = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-card>
      <v-card-text class="py-5">
        <div class="text-center">
          <span class="text-h6">
            {{ `${t("$vuetify.message.choose_the_category")}:` }}
          </span>
        </div>

        <v-divider class="my-3"></v-divider>

        <div class="d-flex flex-column ga-2">
          <v-btn
            v-for="item in listCategories"
            block
            variant="tonal"
            :key="item.type"
            :color="item.type === category ? 'primary' : ''"
            :style="{ height: '4rem' }"
            class="position-relative text-none"
            @click="category = item.type"
          >
            <div class="position-absolute top-0 left-0 right-0 bottom-0 pa-2 d-flex align-center ga-1">
              <div class="size-3rem rounded-circle d-flex justify-center align-center">
                <v-icon :size="25">
                  {{ item.icon }}
                </v-icon>
              </div>

              <span class="text-h6">
                {{ item.label }}
              </span>
            </div>
          </v-btn>
        </div>

        <v-divider class="my-3"></v-divider>

        <v-btn
          block
          color="primary"
          class="text-black font-weight-bold text-none pa-7 text-h6"
          @click="modelProxy = false"
        >{{ t("$vuetify.label.select") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { type ActivitiesCategories } from "@/types/global.type";

import activitiesCategories from "@/json/activities-categories.json";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "update:category"]);
const props = defineProps<{ modelValue: boolean, category: ActivitiesCategories }>();

/// COMPUTED
const listCategories = computed(() => {
  return activitiesCategories.map((item) => ({
    ...item,
    type: item.type as ActivitiesCategories,
    label: t(`$vuetify.label.${item.type.toLowerCase()}`)
  }))
});

const category = computed({
  get: () => props.category,
  set: (val: ActivitiesCategories) => emit("update:category", val)
});

const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});
</script>