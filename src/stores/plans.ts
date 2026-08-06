import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const usePlansStore = defineStore("plans", {
  actions: {
    async GET(url: string) {
      return _GET(`plans/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return _POST(`plans/${url}`, body);
    },
  }
});