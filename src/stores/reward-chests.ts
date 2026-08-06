import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST } from "@/plugins/Fetcher";
import { type PendingChest } from "@/types/global.type";

setActivePinia(pinia);

export const useRewardChestsStore = defineStore("reward-chests", {
  state: () => ({
    pending: [] as PendingChest[],
    pity: { opened_without_rare: 0, threshold: 5 },
  }),
  actions: {
    async GET_PENDING() {
      const response = await _GET("reward-chests/pending");
      if (!response.error) {
        this.pending = (response.chests ?? []) as PendingChest[];
        if (response.pity) this.pity = response.pity;
      }
      return response;
    },
    async OPEN(chest_id: string) {
      const response = await _POST(`reward-chests/${chest_id}/open`);
      if (!response.error) {
        this.pending = this.pending.filter((chest) => chest._id !== chest_id);

        // Keep the pity bar honest between refetches
        const rarity = response.chest?.reward?.rarity;
        this.pity.opened_without_rare = rarity === "common" ? this.pity.opened_without_rare + 1 : 0;
      }
      return response;
    }
  }
});