import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET } from "@/plugins/Fetcher";
import { type Response } from "@/types/global.type";
import { type PublicSettings } from "@/types/public-settings.type";

setActivePinia(pinia);

export const usePublicSettingsStore = defineStore("public-settings", {
  state: () => ({
    settings: null as PublicSettings | null,
  }),
  actions: {
    async GET_SETTINGS(): Promise<Response> {
      if (this.settings) return { error: false };

      const response = await _GET("public-settings");

      if (!response.error) {
        this.settings = {
          pixel_id: response.pixel_id ?? null,
          invite_only_enabled: Boolean(response.invite_only_enabled),
          min_withdrawal_amount: Number(response.min_withdrawal_amount) || 0,
          withdrawal_fee: Number(response.withdrawal_fee) || 0,
        };
      }

      return response;
    },
  }
});