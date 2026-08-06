import { type ShareFormat } from "@/types/share.type";

export const FORMAT_DIMENSIONS: Record<ShareFormat, { w: number; h: number }> = {
  feed: { w: 540, h: 540 },
  story: { w: 540, h: 960 },
};

export const FORMAT_HEIGHTS: Record<ShareFormat, number> = {
  feed: FORMAT_DIMENSIONS.feed.h,
  story: FORMAT_DIMENSIONS.story.h,
};

export const cardDimStyle = (format: ShareFormat): Record<string, string> => {
  const dims = FORMAT_DIMENSIONS[format];
  return {
    "--sc-accent": "#48F26D",
    "--sc-accent-10": "rgba(72,242,109,0.10)",
    "--sc-accent-15": "rgba(72,242,109,0.15)",
    "--sc-accent-30": "rgba(72,242,109,0.30)",
    "--sc-accent-border": "rgba(72,242,109,0.20)",
    "--sc-h": `${dims.h}px`,
    width: `${dims.w}px`,
    height: `${dims.h}px`,
  };
};

// Card wrapper style consumed by every ShareCard*.vue for consistent sizing/theming
export const getCardStyle = (format: ShareFormat, accentColor = "#48F26D") => {
  const dims = FORMAT_DIMENSIONS[format];
  return {
    "--sc-accent": accentColor,
    "--sc-accent-10": hexToRgba(accentColor, 0.1),
    "--sc-accent-15": hexToRgba(accentColor, 0.15),
    "--sc-accent-30": hexToRgba(accentColor, 0.3),
    "--sc-accent-border": hexToRgba(accentColor, 0.2),
    "--sc-h": `${dims.h}px`,
    width: `${dims.w}px`,
    height: `${dims.h}px`,
  };
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};