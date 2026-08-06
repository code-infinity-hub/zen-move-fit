import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET } from "@/plugins/Fetcher";
import { type Offer, type OffersCredits } from "@/types/offer.type";

setActivePinia(pinia);

export const useOffersStore = defineStore("offers", {
  state: () => ({
    _id: "",
    cta_now: "",
    cta_subscription: "",
    amount: 0,
    amount_original: 0,
    credits: 0,
    payment_methods: [] as Offer["payment_methods"],
    offers_credits: [] as OffersCredits,
  }),
  actions: {
    async GET(url: string = "") {
      return await _GET(`offers/${url}`);
    },
    async GET_OFFERS_CREDITS() {
      const response = await this.GET("credits");
      if (!response.error) this.offers_credits = response.offers;
    }
  }
});