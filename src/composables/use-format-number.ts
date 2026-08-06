import { useLocale } from "vuetify";

const truncateToDown = (amount: number) => {
  return Math.trunc((amount * 100 - 0.0000001)) / 100;
};

export const useFormatNumber = () => {
  const locale = useLocale();
  const lang = locale.current.value;

  const formatNumber = (
    amount: number,
    style: "percent" | "decimal" = "decimal",
    minimumFractionDigits = 2
  ) => {
    if ((String(amount).split(".")[1] ?? "").length > 2) {
      amount = truncateToDown(amount);
    }

    return new Intl.NumberFormat(lang, {
      style,
      minimumFractionDigits: style === "percent" ? minimumFractionDigits : undefined
    }).format((amount || 0) / (style !== "percent" ? 1 : 100));
  };

  return { formatNumber };
};