// Styles
import "@mdi/font/css/materialdesignicons.css";

// @ts-ignore
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// Locales
import { pt, en } from "@/locales";

const locale = navigator.language.split("-")[0];
const isGym = Boolean(Number(import.meta.env.VITE_GYM));
const theme = "dark";
const colors = {
  primary: "#48F26D",
  secondary: "#0E1115",
  tertiary: "#22272F",
  quaternary: "#E6FFE9",
  quintet: "#15181E",
  sextet: "#272C3480",

  //
  yellow: "#FFEB3B",
  blue: "#3B82F6",
  orange: "#FF9800",
  red: "#F44336",
  green: "#4CAF50",

  // Map
  map_background: "#0D0D0D"
};

if (isGym) {

}

Object.keys(colors).forEach((key) => {
  document.documentElement.style.setProperty(`--${key}`, colors[key as keyof typeof colors]);
});

export default createVuetify({
  theme: {
    defaultTheme: theme,
    themes: {
      [theme]: { dark: theme === "dark", colors }
    }
  },
  locale: {
    locale,
    fallback: "pt",
    messages: { pt, en }
  },
});