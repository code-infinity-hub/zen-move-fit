import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _PATCH } from "@/plugins/Fetcher";
import { type Response } from "@/types/global.type";
import { type AppNotification } from "@/types/notification.type";

setActivePinia(pinia);

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    pendants_notifications: 0,
    notifications: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, AppNotification>(),
    },
  }),
  actions: {
    RESET_NOTIFICATIONS() {
      this.notifications = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET(url: string = "") {
      return await _GET(`notifications/${url}`);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`notifications/${url}`, body);
    },
    async GET_NOTIFICATIONS(): Promise<void> {
      const response = await this.GET(`?page=${this.notifications.page + 1}&limit=15`);
      if (!response.error) {
        const result = response.result;
        this.notifications.page = result.page;
        this.notifications.pages = result.pages;
        this.notifications.total = result.total;
        for (const notification of result.results as AppNotification[]) {
          this.notifications.results.set(notification._id, notification);
        }
      }
    },
    async GET_COUNT_PENDANTS_NOTIFICATIONS() {
      const response = await this.GET("count-pendants");
      if (!response.error) this.pendants_notifications = response.count_pendants;
    },
    async MARK_AS_READ(_id: string): Promise<Response> {
      const response = await this.PATCH(`${_id}/read`);
      if (!response.error) {
        const notification = this.notifications.results.get(_id);
        if (notification && !notification.read) {
          notification.read = true;
          this.notifications.results.set(_id, { ...notification });
          this.pendants_notifications = Math.max(0, this.pendants_notifications - 1);
        }
      }
      return response;
    },
    async MARK_ALL_AS_READ(): Promise<Response> {
      const response = await this.PATCH("read-all");
      if (!response.error) {
        for (const [_id, notification] of this.notifications.results) {
          if (!notification.read) this.notifications.results.set(_id, { ...notification, read: true });
        }
        this.pendants_notifications = 0;
      }
      return response;
    },
  }
});