import { defineStore } from "pinia";

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    feedback: null as any
  }),
  actions: {
    populate(value: Record<string, any>) {
      this.feedback = value;
    }
  }
});