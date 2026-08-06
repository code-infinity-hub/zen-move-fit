import { type Ref } from "vue";
import { Capacitor, Haptics, ImpactStyle } from "@/mobile";

interface UsePullToRefreshOptions {
  containerRef: Ref<HTMLElement | null>,
  onRefresh: () => Promise<void>,
  threshold?: number,
};

export const usePullToRefresh = ({ containerRef, onRefresh, threshold = 70 }: UsePullToRefreshOptions) => {
  const isPulling = ref(false);
  const pullDistance = ref(0);
  const isRefreshing = ref(false);

  const isNative = Capacitor.isNativePlatform();

  let startY = 0;
  let startScrollTop = 0;

  const onTouchStart = (e: TouchEvent) => {
    if (isRefreshing.value) return;
    startY = e.touches[0]!.clientY;
    startScrollTop = containerRef.value?.scrollTop ?? 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (isRefreshing.value) return;
    if (startScrollTop > 0) return;

    const delta = e.touches[0]!.clientY - startY;
    if (delta <= 0) {
      pullDistance.value = 0;
      isPulling.value = false;
      return;
    }

    pullDistance.value = Math.min(delta * 0.45, threshold * 1.5);
    isPulling.value = pullDistance.value > 10;

    if (isPulling.value) {
      e.preventDefault();
    }
  };

  const onTouchEnd = async () => {
    if (!isPulling.value) return;

    if (pullDistance.value >= threshold) {
      isRefreshing.value = true;
      isPulling.value = false;
      pullDistance.value = threshold;

      if (isNative) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // haptics unavailable
        }
      }

      try {
        await onRefresh();
      } finally {
        isRefreshing.value = false;
        pullDistance.value = 0;
      }
    } else {
      isPulling.value = false;
      pullDistance.value = 0;
    }
  };

  const attach = (el: HTMLElement) => {
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
  };

  const detach = (el: HTMLElement) => {
    el.removeEventListener("touchstart", onTouchStart);
    el.removeEventListener("touchmove", onTouchMove);
    el.removeEventListener("touchend", onTouchEnd);
  };

  watch(containerRef, (el, prev) => {
    if (prev) detach(prev);
    if (el) attach(el);
  });

  onUnmounted(() => {
    const el = containerRef.value;
    if (el) detach(el);
  });

  return { isPulling, pullDistance, isRefreshing, threshold };
};