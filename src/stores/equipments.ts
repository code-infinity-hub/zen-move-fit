import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useEquipmentsStore = defineStore("equipments", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`equipments/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return await _POST(`equipments/${url}`, body);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`equipments/${url}`, body);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return await _DELETE(`equipments/${url}`, body);
    },
  }
});