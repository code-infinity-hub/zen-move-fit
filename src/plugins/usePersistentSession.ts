import { Preferences } from "@/mobile";

export const usePersistentSession = () => {
  return {
    get: async (key: string) => {
      const { value } = await Preferences.get({ key });
      return value || null;
    },
    set: async (key: string, value: string) => {
      await Preferences.set({ key, value });
    },
    remove: async (key: string) => {
      await Preferences.remove({ key });
    },
    destroy: async () => {
      await Preferences.clear();
    },
    getAll: async () => {
      const { keys } = await Preferences.keys();
      const obj: Record<string, string> = {};

      for (const key of keys) {
        const { value } = await Preferences.get({ key });
        if (value) obj[key] = value;
      }

      return obj;
    },
    isLogged: async () => {
      const { value: valueToken } = await Preferences.get({ key: "token" });
      const { value: valueId } = await Preferences.get({ key: "_id" });
      return Boolean(valueToken && valueId);
    }
  };
};