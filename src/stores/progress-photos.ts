import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _DELETE } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useProgressPhotosStore = defineStore("progress-photos", {
  actions: {
    async GET(url: string = "") {
      return _GET(`progress-photos/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return _POST(`progress-photos/${url}`, body);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return _DELETE(`progress-photos/${url}`, body);
    },
  }
});