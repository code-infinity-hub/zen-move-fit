<template>
  <div
    v-if="dailyQuestsStore.quests.length"
    class="px-3 py-3 bg-quintet border-sextet rounded-lg mb-5"
  >
    <div class="d-flex align-center ga-3 mb-3">
      <v-icon color="primary">mdi-sword-cross</v-icon>

      <span class="font-weight-bold flex-fill">
        {{ t("$vuetify.label.daily_quests") }}
      </span>

      <span class="text-caption text-grey-lighten-1">
        {{ `${completedCount}/${dailyQuestsStore.quests.length}` }}
      </span>
    </div>

    <div class="d-flex flex-column ga-3">
      <div
        v-for="quest in dailyQuestsStore.quests"
        :key="quest.id"
        class="d-flex align-center ga-3"
      >
        <v-icon
          :color="quest.completed ? 'primary' : 'grey-darken-1'"
          :size="22"
        >{{ quest.completed ? "mdi-check-circle" : "mdi-circle-outline" }}</v-icon>

        <div class="flex-fill">
          <p :class="['text-body-2', quest.completed ? 'text-grey text-decoration-line-through' : '']">
            {{ t(`$vuetify.daily_quests.${quest.id}`, quest.target) }}
          </p>

          <v-progress-linear
            v-if="!quest.completed && quest.target > 1"
            rounded
            :model-value="(quest.progress / quest.target) * 100"
            color="primary"
            bg-color="tertiary"
            height="4"
            class="mt-1"
          />
        </div>

        <span class="text-caption text-primary font-weight-bold">
          {{ `+${formatNumber(quest.xp)} ${t("$vuetify.label.xp")}` }}
        </span>
      </div>
    </div>
    <p
      v-if="dailyQuestsStore.all_completed"
      class="text-caption text-primary mt-3 mb-0 text-center"
    >{{ t("$vuetify.message.daily_quests_completed") }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useDailyQuestsStore } from "@/stores/daily-quests";
import { useCelebration } from "@/composables/use-celebration";
import { eventBus } from "@/eventBus";
import { useFormatNumber } from "@/composables";

/// DATA
const { t } = useLocale();
const { celebrate } = useCelebration();
const { formatNumber } = useFormatNumber();
const dailyQuestsStore = useDailyQuestsStore();

/// COMPUTED
const completedCount = computed(() => dailyQuestsStore.quests.filter((quest) => quest.completed).length);

/// WATCH
watch(completedCount, (val, old) => {
  if (old !== undefined && val > old) {
    celebrate("light");
    if (dailyQuestsStore.all_completed) eventBus.emit("CHECK_CHESTS");
  }
});

/// LIFE CYCLES
onMounted(() => {
  dailyQuestsStore.GET_TODAY();
  eventBus.on("CHECK_CHESTS", refresh);
});

onBeforeUnmount(() => {
  eventBus.off("CHECK_CHESTS", refresh);
});

/// METHODS
const refresh = () => dailyQuestsStore.GET_TODAY();
</script>