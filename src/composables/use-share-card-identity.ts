import dayjs from "dayjs";
import "dayjs/locale/pt";
import "dayjs/locale/en";
import { useLocale } from "vuetify";
import { getCardStyle } from "@/utils";
import { type ShareCardProps } from "@/types/global.type";

export const useShareCardIdentity = (props: ShareCardProps) => {
  const { t, current } = useLocale();

  const cardStyle = computed(() => getCardStyle(props.format ?? "feed"));
  const initials = computed(() => props.activity.account.name.charAt(0).toUpperCase());
  const avatarSrc = computed(() => {
    const image = props.activity.account.image;
    return image ? props.imageCache?.[image] ?? image : "";
  });
  const dateLabel = computed(() => dayjs(props.activity.started_at).locale(current.value).format(t("$vuetify.share.date_format")));

  return { cardStyle, initials, avatarSrc, dateLabel };
};