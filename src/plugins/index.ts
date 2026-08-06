// Plugins
import vuetify from "./vuetify";
import pinia from "../stores";
import router from "../router";

// Types
import { type App } from "vue";

export const registerPlugins = (app: App) => {
  app
    .use(vuetify)
    .use(router)
    .use(pinia);
};