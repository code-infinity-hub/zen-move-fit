import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET } from "@/plugins/Fetcher";
import { type DailyQuest } from "@/types/global.type";

setActivePinia(pinia);

export const useDailyQuestsStore = defineStore("daily-quests", {
  state: () => ({
    quests: [] as DailyQuest[],
    date: "",
    all_completed: false,
  }),
  actions: {
    async GET_TODAY() {
      const response = await _GET("daily-quests/today");
      if (!response.error) {
        this.quests = (response.quests ?? []) as DailyQuest[];
        this.date = response.date ?? "";
        this.all_completed = Boolean(response.all_completed);
      }
      return response;
    }
  }
});