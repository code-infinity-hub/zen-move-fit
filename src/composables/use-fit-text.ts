import { ref, nextTick, onMounted, watch, type Ref } from "vue";

export const useFitText = (
  containerRef: Ref<HTMLElement | null>,
  textRef: Ref<HTMLElement | null>,
  fullText: () => string,
  options: { ellipsis?: string; watchSources?: () => unknown } = {}
) => {
  const ellipsis = options.ellipsis ?? "…";
  const fittedText = ref("");

  const fitsWithin = (container: HTMLElement) => container.scrollHeight <= container.clientHeight;

  const measure = () => {
    const container = containerRef.value;
    const text = textRef.value;
    const full = (fullText() ?? "").trim();

    if (!container || !text || !full) {
      fittedText.value = full;
      return;
    }

    // Whole text fits — show everything.
    text.textContent = full;
    if (fitsWithin(container)) {
      fittedText.value = full;
      return;
    }

    // Binary-search the largest word count that still fits (height grows monotonically with words).
    const tokens = full.split(/\s+/);
    let lo = 0;
    let hi = tokens.length;
    let best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      text.textContent = tokens.slice(0, mid).join(" ").trimEnd() + ellipsis;
      if (fitsWithin(container)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    fittedText.value = best > 0 ? tokens.slice(0, best).join(" ").trimEnd() + ellipsis : ellipsis;
    text.textContent = fittedText.value;
  };

  const remeasure = () => nextTick().then(measure);

  onMounted(measure);
  watch(fullText, remeasure);
  if (options.watchSources) watch(options.watchSources, remeasure);

  return { fittedText, remeasure };
};