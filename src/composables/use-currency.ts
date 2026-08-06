import { useLocale } from "vuetify";

const truncateToDown = (amount: number) => {
  return Math.trunc((amount * 100 - 0.0000001)) / 100;
};

export const useCurrency = () => {
  const locale = useLocale();
  const lang = locale.current.value;
  const { t } = useLocale();

  const currency = (amount: number) => {
    if ((String(amount).split(".")[1] ?? "").length > 2) {
      amount = truncateToDown(amount);
    }

    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: t("$vuetify.currency"),
      minimumFractionDigits: 2
    }).format((amount || 0) / 1);
  };

  return { currency };
};