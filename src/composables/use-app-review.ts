import { CapgoInAppReview, Device } from "@/mobile";
import { useAccountsStore } from "@/stores/accounts";
import { usePersistentSession } from "@/plugins/usePersistentSession";

const MIN_ACTIVITIES = 3;
const MILESTONE_STEP = 15;
const MIN_DAYS_BETWEEN_REQUESTS = 45;
const MAX_REQUESTS = 3;
const CELEBRATION_DELAY_MS = 4_000;

const isMilestone = (activityNumber: number): boolean => activityNumber >= MIN_ACTIVITIES && (activityNumber - MIN_ACTIVITIES) % MILESTONE_STEP === 0;

export const useAppReview = () => {
  const accountsStore = useAccountsStore();
  const persistentSession = usePersistentSession();

  const requestAfterActivityCompleted = () => {
    const activityNumber = (accountsStore.account.historical?.activities ?? 0) + 1;

    if (!isMilestone(activityNumber)) return;

    setTimeout(async () => {
      const { platform } = await Device.getInfo();
      if (platform === "web") return;

      const requestsCount = Number((await persistentSession.get("review-requests-count")) || "0");
      if (requestsCount >= MAX_REQUESTS) return;

      const lastRequestedAt = await persistentSession.get("review-requested-at");

      if (lastRequestedAt) {
        const daysSinceLastRequest = (Date.now() - Number(lastRequestedAt)) / 86_400_000;
        if (daysSinceLastRequest < MIN_DAYS_BETWEEN_REQUESTS) return;
      }

      await CapgoInAppReview.requestReview();

      await Promise.all([
        persistentSession.set("review-requested-at", String(Date.now())),
        persistentSession.set("review-requests-count", String(requestsCount + 1))
      ]);
    }, CELEBRATION_DELAY_MS);
  };

  return { requestAfterActivityCompleted };
};