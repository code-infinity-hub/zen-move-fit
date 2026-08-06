import { type DoubleTapOptions } from "@/types/global.type";

export const mobileEvents = () => {
  let lastTap = 0;

  const doubleTap = ({ delay = 400, onDoubleTap }: DoubleTapOptions) => {
    return ((event?: PointerEvent) => {
      const now = Date.now();
      const diff = now - lastTap;

      if (diff > 0 && diff < delay) {
        onDoubleTap(event);
      }

      lastTap = now;
    })();
  };

  return { doubleTap };
};