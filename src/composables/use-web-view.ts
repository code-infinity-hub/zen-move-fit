import { InAppBrowser, DefaultWebViewOptions } from "@/mobile";
import { useLocale } from "vuetify";

export const useWebView = () => {
  const { t } = useLocale();

  const open = (url: string) => {
    InAppBrowser.openInWebView({
      url,
      options: {
        ...DefaultWebViewOptions,
        closeButtonText: t("$vuetify.label.close"),
        showURL: false,
        clearCache: true,
        clearSessionCache: true,
      }
    });
  };

  const openInBrowser = (url: string) => {
    InAppBrowser.openInExternalBrowser({ url });
  };

  return { open, openInBrowser };
};