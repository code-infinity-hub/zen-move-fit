import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _PATCH } from "@/plugins/Fetcher";
import { type League } from "@/types/global.type";

setActivePinia(pinia);

export const useLeaguesStore = defineStore("leagues", {
  state: () => ({
    league: null as League | null,
    loaded: false,
  }),
  actions: {
    async GET_CURRENT() {
      const response = await _GET("leagues/current");
      if (!response.error) {
        this.league = (response.league ?? null) as League | null;
        this.loaded = true;
      }
      return response;
    },
    async GET_LATEST_RESULT() {
      return await _GET("leagues/latest-result");
    },
    async MARK_RESULT_SEEN(cohort_id: string) {
      return await _PATCH(`leagues/results/${cohort_id}/seen`);
    }
  }
});