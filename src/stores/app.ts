import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { SocketService } from "@/services/socket.service";

setActivePinia(pinia);

export const useAppStore = defineStore("app", {
  state: () => ({
    internet: true,
    foreground: true,
    title_notification_background_geolocation: "",
    message_notification_background_geolocation: "",
    socketService: new SocketService(),
    open_keyboard: false,
    maintenance_message: "",
  }),
  actions: {
    async GET_ADDRESS_BY_ZIPCODE(zipcode: string) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipcode.replace("-", "")}/json/`);
        const json = await response.json() as Record<string, any>;

        if (json?.erro === "true") {
          return { error: true };
        }

        return {
          error: false,
          zipcode: json.cep.replace("-", ""),
          street: json.logradouro,
          neighborhood: json.bairro,
          city: json.localidade,
          state: json.uf,
        };
      } catch { }

      return { error: true };
    }
  },
});