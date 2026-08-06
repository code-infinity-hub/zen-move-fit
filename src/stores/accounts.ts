import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH } from "@/plugins/Fetcher";
import { useAppStore } from "./app";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { eventBus } from "@/eventBus";
import type { Account, AccountAggregateIndication, AccountIndication, AccountIndicationDetail, UpdateAccount } from "@/types/account.type";

setActivePinia(pinia);

const appStore = useAppStore();
const persistentSession = usePersistentSession();

export const useAccountsStore = defineStore("accounts", {
  state: () => ({
    _id: "",
    account: { } as Account,
    indications: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, AccountIndication>(),
    },
  }),
  getters: {
    isSubscriber: (state) => Boolean(state.account.subscription) || Boolean(state.account.subscription_lifetime?.enabled),
  },
  actions: {
    async GET(url: string = "") {
      return await _GET(`accounts/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}, headers?: Record<string, string>) {
      return await _POST(`accounts/${url}`, body, headers);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}, headers?: Record<string, string>) {
      return await _PATCH(`accounts/${url}`, body, headers);
    },
    async GET_ACCOUNT() {
      if (appStore.internet) {
        if (!this._id) this._id = (await persistentSession.get("_id")) || "";
        const response = await this.GET(this._id);
        if (!response.error) {
          await persistentSession.set("account", JSON.stringify(response.account));
          this.account = response.account;
          return response;
        }
      }
      return await this.GET_ACCOUNT_OFFLINE();
    },
    async GET_ACCOUNT_OFFLINE() {
      const accountText = await persistentSession.get("account");
      if (accountText) {
        const account = JSON.parse(accountText) as Account;
        this._id = account._id;
        this.account = account;
        return { error: false, account };
      } else {
        eventBus.emit("NO_CONNECTION");
        return { error: true };
      }
    },
    async UPDATE_ACCOUNT(body: UpdateAccount, silent = true) {
      const response = await this.PATCH(`${this._id}?silent=${silent}`, body);
      if (!response.error) await this.GET_ACCOUNT();
      return response;
    },
    async REQUEST_WITHDRAWAL(amount: number) {
      const response = await this.POST("withdrawals", { amount });
      if (!response.error) await this.GET_ACCOUNT();
      return response;
    },
    RESET_INDICATIONS() {
      this.indications = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_INDICATIONS(): Promise<void> {
      const response = await this.GET(`indications?page=${this.indications.page + 1}&limit=15`);
      if (!response.error) {
        const result = response.result;
        this.indications.page = result.page;
        this.indications.pages = result.pages;
        this.indications.total = result.total;
        for (const indication of result.results as AccountIndication[]) {
          this.indications.results.set(indication._id, indication);
        }
      }
    },
    async GET_INDICATION_DETAIL(_id: string): Promise<AccountIndicationDetail | null> {
      const response = await this.GET(`indications/${_id}`);
      return !response.error ? response.result as AccountIndicationDetail : null;
    },
    async GET_AGGREGATE_INDICATIONS(): Promise<AccountAggregateIndication[]> {
      const response = await this.GET("aggregate-indications");
      return !response.error ? response.result as AccountAggregateIndication[] : [];
    },
  }
});