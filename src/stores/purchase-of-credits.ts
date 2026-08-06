import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST } from "@/plugins/Fetcher";

setActivePinia(pinia);

export const usePurchaseOfCreditsStore = defineStore("purchase-of-credits", {
  actions: {
    async GET(url: string = "") {
      return _GET(`purchase-of-credits/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}, headers?: Record<string, string>) {
      return _POST(`purchase-of-credits/${url}`, body, headers);
    },
  }
});