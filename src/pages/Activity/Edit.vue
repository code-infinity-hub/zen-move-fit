<template>
  <div class="w-100 h-100 bg-secondary">
    <div
      v-if="loading"
      class="w-100 h-100 d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <Finish
      v-else-if="detail && activityForm"
      :activity="activityForm"
      :edit="detail"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useActivitiesStore } from "@/stores/activities";
import { eventBus } from "@/eventBus";
import type { Activity, ActivityDetail } from "@/types/activity.type";

/// COMPONENTS
import Finish from "@/components/Activity/Finish/index.vue";

/// DATA
const route = useRoute();
const activitiesStore = useActivitiesStore();
const loading = ref(true);
const detail = ref<ActivityDetail | null>(null);

/// COMPUTED
const _id = computed(() => route.params._id as string);
const activityForm = computed<Activity | null>(() => {
  if (!detail.value) return null;

  return {
    _id: detail.value._id,
    workout_id: detail.value.workout_id ?? undefined,
    timezone: "",
    date_completed: "",
    duration_seconds: detail.value.duration_seconds,
    calories: detail.value.calories ?? 0,
    started_at: detail.value.started_at ?? "",
    ended_at: detail.value.ended_at,
    type: detail.value.type,
    status: detail.value.status,
    pauses: [],
    exercises: (detail.value.exercises ?? []).map((exercise) => ({
      started_at: "",
      ended_at: "",
      exercise_id: exercise.exercise_id,
      reps: exercise.reps,
      series: exercise.series.map((serie) => ({
        set: serie.set,
        started_at: serie.started_at,
        ended_at: serie.ended_at,
        rest: { seconds: serie.rest.seconds, created_at: "", ended_at: "", jump: false },
        load: serie.load,
      })),
    })),
    from_coords: { lat: 0, lng: 0 },
    workout_title: detail.value.workout_title ?? undefined,
    title: detail.value.title ?? undefined,
    category: detail.value.category ?? undefined,
  };
});

/// LIFE CYCLES
onMounted(async () => {
  const activity = await activitiesStore.GET_ACTIVITY(_id.value);

  if (!activity || !activity.is_own) {
    eventBus.emit("BACK_ROUTER");
    return;
  }

  detail.value = activity;
  loading.value = false;
});
</script>