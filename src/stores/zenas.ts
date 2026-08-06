import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _DELETE } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useZenaConversationsStore = defineStore("zenas", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`zenas/${url}`);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return await _DELETE(`zenas/${url}`, body);
    },
  }
});