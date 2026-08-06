import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useWeightEvolutionsStore = defineStore("weight-evolutions", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`weight-evolutions/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return await _POST(`weight-evolutions/${url}`, body);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`weight-evolutions/${url}`, body);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return await _DELETE(`weight-evolutions/${url}`, body);
    },
  }
});