import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const useWorkoutsStore = defineStore("workouts", {
  actions: {
    async GET(url: string = "") {
      return await _GET(`workouts/${url}`);
    },
  }
});