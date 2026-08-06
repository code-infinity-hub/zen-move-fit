<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary">
    <header class="heading border-bottom-tertiary d-flex align-center ga-3">
      <v-btn
        icon
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
        {{ t("$vuetify.label.pending_tags") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto pa-3">
      <div
        v-if="loading"
        class="w-100 h-100 d-flex justify-center align-center pa-6"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="40"
        />
      </div>
      <template v-else-if="tags.length">
        <div
          v-for="tag in tags"
          :key="tag._id"
          class="bg-quintet border-sextet rounded-lg pa-3 mb-3"
        >
          <div
            class="d-flex align-center ga-3"
            @click="openActivity(tag.activity_id)"
          >
            <div>
              <ProfileImage
                size="42px"
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
              class="flex-fill text-none font-weight-bold"
              color="primary"
              :loading="responding === tag._id"
              @click="respond(tag._id, 'APPROVED')"
            >{{ t("$vuetify.label.accept") }}</v-btn>

            <v-btn
              class="flex-fill text-none font-weight-bold"
              color="tertiary"
              :loading="responding === tag._id"
              @click="respond(tag._id, 'REJECTED')"
            >{{ t("$vuetify.label.refuse") }}</v-btn>
          </div>
        </div>
      </template>
      <p
        v-else
        class="text-center text-grey-lighten-1 pa-6"
      >{{ t("$vuetify.label.no_pending_tags") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { useActivitiesStore } from "@/stores/activities";
import { eventBus } from "@/eventBus";

/// COMPONENTS
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const router = useRouter();
const activitiesStore = useActivitiesStore();

const loading = ref(true);
const responding = ref("");

/// COMPUTED
const tags = computed(() => [...activitiesStore.pending_tags.results.values()]);

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);
  await activitiesStore.GET_PENDING_TAGS();
  loading.value = false;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const respond = async (tag_id: string, status: "APPROVED" | "REJECTED") => {
  responding.value = tag_id;
  await activitiesStore.RESPOND_PENDING_TAG(tag_id, status);
  responding.value = "";
};

const openActivity = (_id: string) => {
  router.push({ name: "activity", params: { _id } });
};

const back = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>