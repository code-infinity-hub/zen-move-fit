import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";
import type { Response } from "@/types/global.type";
import type { ActivityDetail, PendingActivityTag } from "@/types/activity.type";

setActivePinia(pinia);

export const useActivitiesStore = defineStore("activities", {
  state: () => ({
    pending_tags: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, PendingActivityTag>(),
    },
  }),
  actions: {
    async RESET_PENDING_TAGS() {
      this.pending_tags = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET(url: string = "") {
      return await _GET(`activities/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return await _POST(`activities/${url}`, body);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`activities/${url}`, body);
    },
    async DELETE(url: string = "") {
      return await _DELETE(`activities/${url}`);
    },
    async GET_PENDING_TAGS(): Promise<void> {
      const response = await this.GET(`tags/pending?page=${this.pending_tags.page + 1}&limit=15`);
      if (!response.error) {
        const result = response.result;
        this.pending_tags.page = result.page;
        this.pending_tags.pages = result.pages;
        this.pending_tags.total = result.total;
        for (const tag of result.results as PendingActivityTag[]) {
          this.pending_tags.results.set(tag._id, tag);
        }
      }
    },
    async RESPOND_PENDING_TAG(tag_id: string, status: "APPROVED" | "REJECTED"): Promise<Response> {
      const response = await this.PATCH(`tags/${tag_id}`, { status });
      if (!response.error && this.pending_tags.results.delete(tag_id)) {
        this.pending_tags.total = Math.max(0, this.pending_tags.total - 1);
      }
      return response;
    },
    async GET_ACTIVITY(id: string): Promise<ActivityDetail | null> {
      const response = await this.GET(id);
      return !response.error ? response.activity as ActivityDetail : null;
    },
  }
});