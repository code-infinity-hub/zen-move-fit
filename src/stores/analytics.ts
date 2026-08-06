import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _POST } from "@/plugins/Fetcher";
import { type AppEvent } from "@/types/global.type";

setActivePinia(pinia);

export const useAnalyticsStore = defineStore("analytics", {
  actions: {
    async TRACK(event: AppEvent["event"], props: Record<string, any> = { }) {
      try {
        await _POST("analytics/events", { events: [{ event, props }] });
      } catch { }
    }
  }
});