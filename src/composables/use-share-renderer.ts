import html2canvas from "html2canvas";
import { nextTick } from "vue";
import { FORMAT_DIMENSIONS } from "@/utils";
import { type ShareFormat } from "@/types/global.type";

export { type ShareFormat } from "@/types/global.type";
export { getCardStyle, FORMAT_HEIGHTS } from "@/utils";

const RENDER_CACHE_MAX_SIZE = 20;
const renderCache = new Map<string, string>();

const cacheKey = (activityId: string, templateId: string, format: string) => `${activityId}:${templateId}:${format}`;

const cacheSet = (key: string, dataUrl: string) => {
  if (renderCache.has(key)) renderCache.delete(key);
  renderCache.set(key, dataUrl);
  if (renderCache.size > RENDER_CACHE_MAX_SIZE) renderCache.delete(renderCache.keys().next().value as string);
};

// Ensures the bundled "Space Grotesk" face is fully loaded before the first rasterization.
// Without this the first html2canvas pass can run against a fallback font (or stall waiting on it),
// which is the main cause of the slow/incorrect first image. Memoized so it runs at most once.
let fontsReadyPromise: Promise<void> | null = null;
const ensureFontsReady = (): Promise<void> => {
  if (!fontsReadyPromise) {
    fontsReadyPromise = (async () => {
      try {
        if (document.fonts?.load) {
          await Promise.all([
            document.fonts.load('400 16px "Space Grotesk"'),
            document.fonts.load('700 16px "Space Grotesk"'),
          ]);
        }
        await document.fonts?.ready;
      } catch {
        /* best-effort — fall through and render with whatever is available */
      }
    })();
  }
  return fontsReadyPromise;
};

// Pays html2canvas' one-time cold-start cost (internal init + first canvas raster) on a throwaway
// node, so it happens during the loading spinner instead of on the first real card. Runs at most once.
let prewarmPromise: Promise<void> | null = null;
const prewarm = (): Promise<void> => {
  if (!prewarmPromise) {
    prewarmPromise = (async () => {
      try {
        await ensureFontsReady();
        const probe = document.createElement("div");
        probe.style.cssText = "position:absolute;left:-9999px;top:0;width:32px;height:32px;font-family:'Space Grotesk',sans-serif;";
        probe.textContent = "0";
        document.body.appendChild(probe);
        await html2canvas(probe, { logging: false, scale: 1, width: 32, height: 32 });
        document.body.removeChild(probe);
      } catch {
        /* best-effort */
      }
    })();
  }
  return prewarmPromise;
};

export const useShareRenderer = () => {
  return {
    ensureFontsReady,
    prewarm,
    renderTemplate: async (
      activityId: string,
      templateId: string,
      format: ShareFormat,
      el: HTMLElement,
      transparent = false
    ): Promise<string> => {
      const key = cacheKey(activityId, templateId, format);
      if (renderCache.has(key)) return renderCache.get(key)!;

      await ensureFontsReady();
      await nextTick();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const dims = FORMAT_DIMENSIONS[format];
      const canvas = await html2canvas(el, {
        useCORS: false,
        allowTaint: true,
        backgroundColor: transparent ? null : "#0E1115",
        logging: false,
        scale: 2,
        width: dims.w,
        height: dims.h,
      });
      const dataUrl = canvas.toDataURL("image/png");

      cacheSet(key, dataUrl);
      return dataUrl;
    },
    isCached: (activityId: string, templateId: string, format: string) => renderCache.has(cacheKey(activityId, templateId, format)),
    clearForActivity: (activityId: string) => {
      for (const key of Array.from(renderCache.keys())) {
        if (key.startsWith(`${activityId}:`)) renderCache.delete(key);
      }
    },
  };
};