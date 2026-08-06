<template>
  <v-bottom-sheet v-model="model">
    <v-card>
      <div class="pa-5 d-flex flex-column ga-4">
        <div class="d-flex align-center ga-3">
          <v-icon
            color="red"
            :size="28"
          >mdi-trash-can-outline</v-icon>

          <p class="text-subtitle-1 font-weight-bold">
            {{ t("$vuetify.activity_detail.delete_confirm_title") }}
          </p>
        </div>

        <p
          class="text-body-2 text-grey-lighten-1"
          :style="{ lineHeight: '1.6' }"
        >{{ t("$vuetify.activity_detail.delete_confirm_text") }}</p>

        <v-alert
          v-if="hasPost"
          type="warning"
          variant="tonal"
          density="compact"
          class="rounded-lg"
          :text="t('$vuetify.activity_detail.delete_confirm_post')"
        />

        <div class="d-flex flex-column ga-2 mt-1">
          <v-btn
            block
            color="red"
            class="text-none pa-7"
            :loading="loading"
            @click="confirm"
          >{{ t("$vuetify.activity_detail.confirm_delete") }}</v-btn>

          <v-btn
            block
            variant="text"
            class="text-none pa-7"
            @click="model = false"
          >{{ t("$vuetify.label.cancel") }}</v-btn>
        </div>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useActivitiesStore } from "@/stores/activities";
import { type ActivityDetail } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
const activitiesStore = useActivitiesStore();
const loading = ref(false);
const props = defineProps<{ activity: ActivityDetail }>();
const emit = defineEmits<{ deleted: [] }>();
const model = defineModel<boolean>({ default: false });

/// COMPUTED
const hasPost = computed(() => !!props.activity.post_id);

const confirm = async () => {
  try {
    loading.value = true;
    const result = await activitiesStore.DELETE(props.activity._id);
    if (!result.error) {
      model.value = false;
      emit("deleted");
    }
  } catch {
    ///
  } finally {
    loading.value = false;
  }
};
</script>