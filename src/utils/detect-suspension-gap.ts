import dayjs from "dayjs";
import { type Activity } from "@/types/activity.type";
import { type SyntheticPause } from "@/types/global.type";

export const SUSPENSION_GAP_THRESHOLD_SECONDS = 10;
const DEDUPE_TOLERANCE_SECONDS = 2;

/**
 * Detecta se o intervalo entre `lastUpdateTime` e `now` deve virar uma pausa
 * sintética (gap de suspensão do SO não coberto por pausa manual), evitando
 * duplicar uma pausa já registrada para o mesmo gap.
 */
export const detectSuspensionGap = (
  lastUpdateTime: string | null | undefined,
  now: string,
  pauses: Activity["pauses"]
): SyntheticPause | null => {
  if (!lastUpdateTime) return null;

  const lastPause = pauses[pauses.length - 1];

  // Pausa manual em aberto já cobre o intervalo até ser retomada.
  if (lastPause && !lastPause.ended_at) return null;

  let candidateStart = lastUpdateTime;

  if (lastPause?.ended_at) {
    const alreadyCoveredUpToNow =
      Math.abs(dayjs(lastPause.ended_at).diff(dayjs(now), "second")) < DEDUPE_TOLERANCE_SECONDS;

    if (alreadyCoveredUpToNow) return null;

    if (dayjs(lastPause.ended_at).isAfter(dayjs(candidateStart))) {
      candidateStart = lastPause.ended_at;
    }
  }

  const gapSeconds = dayjs(now).diff(dayjs(candidateStart), "second");

  if (gapSeconds < SUSPENSION_GAP_THRESHOLD_SECONDS) return null;

  return { started_at: candidateStart, ended_at: now };
};