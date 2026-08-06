import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const usePrsStore = defineStore("prs", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`prs/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return await _POST(`prs/${url}`, body);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`prs/${url}`, body);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return await _DELETE(`prs/${url}`, body);
    },
  }
});