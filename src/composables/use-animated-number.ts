export const useAnimatedNumber = (source: () => number, duration = 900) => {
  const display = ref(source());

  let frame: number | null = null;

  watch(source, (target) => {
    if (frame) cancelAnimationFrame(frame);

    const from = display.value;
    const delta = target - from;

    if (!delta) return;

    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      display.value = from + delta * eased;

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        display.value = target;
        frame = null;
      }
    };

    frame = requestAnimationFrame(step);
  });

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame);
  });

  return display;
};