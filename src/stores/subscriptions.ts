import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useSubscriptionsStore = defineStore("subscriptions", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`subscriptions/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}, headers?: Record<string, string>) {
      return await _POST(`subscriptions/${url}`, body, headers);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`subscriptions/${url}`, body);
    },
  }
});