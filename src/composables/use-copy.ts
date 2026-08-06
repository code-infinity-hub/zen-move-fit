import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";

export const useCopy = () => {
  const { t } = useLocale();

  const copy = async (str: string) => {
    try {
      await navigator.clipboard.writeText(str);
      eventBus.emit("SNACKBAR", {
        message: t("$vuetify.message.copied_successfully"),
        icon: "mdi-content-copy"
      });
    } catch (error: any) {
      eventBus.emit("SNACKBAR", {
        message: error?.message,
        icon: "mdi-close"
      });
    }
  };

  return { copy };
};