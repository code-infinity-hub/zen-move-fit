import { useShareRenderer } from "./use-share-renderer";
import { useShareImageProxy } from "./use-share-image-proxy";
import { getAllTemplateImages } from "./use-share-templates";
import { type ActivityDetail } from "@/types/activity.type";

// Speculatively pays the one-time costs of the share flow (font load, html2canvas
// cold-start, CDN image proxy) while the user is just looking at the activity —
// so opening the share sheet later has nothing left to wait on. Font/html2canvas
// warm-up is memoized process-wide (safe to let finish even if the caller navigates
// away); only the per-activity image fetch is skipped if scheduled but not yet due.
export const useSharePrewarm = () => {
  const { ensureFontsReady, prewarm } = useShareRenderer();
  const { resolveImages } = useShareImageProxy();

  let handle: number | null = null;
  let cancelled = false;

  const schedule = (activity: ActivityDetail) => {
    const run = () => {
      handle = null;
      if (cancelled) return;

      void ensureFontsReady();
      void prewarm();
      void resolveImages(getAllTemplateImages(activity));
    };

    if (typeof requestIdleCallback === "function") {
      handle = requestIdleCallback(run, { timeout: 2000 });
    } else {
      handle = window.setTimeout(run, 300) as unknown as number;
    }
  };

  const cancel = () => {
    cancelled = true;

    if (handle !== null) {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(handle);
      else clearTimeout(handle);
      handle = null;
    }
  };

  return { schedule, cancel };
};