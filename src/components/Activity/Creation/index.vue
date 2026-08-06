<template>
  <div class="w-100 h-100">
    <v-tabs-window
      v-model="tab"
      class="h-100"
    >
      <v-tabs-window-item class="h-100">
        <Progress
          v-if="tab === 0"
          @finish="finish"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Finish
          v-if="tab === 1"
          :activity="activity!"
          @clear-data="clearAllData"
          @add-equipment="tab = 2"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <AddEquipment
          v-if="tab === 2"
          @back="tab = 1"
        />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100"></v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts" setup>
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { SqliteService } from "@/services/sqlite.service";
import { type Activity } from "@/types/activity.type";

/// COMPONENTS
import Progress from "./Progress.vue";
import Finish from "@/components/Activity/Finish/index.vue";
import AddEquipment from "@/pages/Equipment/HandleEquipament.vue";

/// DATA
const tab = ref(-1);
const persistentSession = usePersistentSession();
const activity = ref<Activity>();

/// LIFE CYCLES
onMounted(async () => {
  let newActivity = true;

  const typeTraining = await persistentSession.get("type-training");

  if (typeTraining === "ACTIVITY") {
    const tempActivity = JSON.parse(await persistentSession.get("activity") || "{}") as Activity;

    if (tempActivity?.status === "DONE") {
      newActivity = false;
    }
  }

  if (newActivity) tab.value = 0;
  else finish();
});

/// METHODS
const finish = async () => {
  activity.value = JSON.parse(await persistentSession.get("activity") || "{}") as Activity;
  tab.value = 1;
};

const clearAllData = async () => {
  const sqliteService = new SqliteService();

  await sqliteService.init();

  await Promise.all([
    persistentSession.remove("type-training"),
    persistentSession.remove("paused"),
    persistentSession.remove("activity"),
    persistentSession.remove("notification-id"),
    persistentSession.remove("running-metrics-checkpoint"),
    persistentSession.remove("last-update-time"),
    sqliteService.deleteWorkoutPoints(activity.value!._id)
  ]);

  await sqliteService.close();
};
</script>