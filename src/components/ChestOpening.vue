<template>
  <v-dialog
    fullscreen
    persistent
    v-model="model"
    transition="dialog-bottom-transition"
  >
    <v-card color="secondary" class="d-flex flex-column">
      <v-card-text class="flex-fill d-flex flex-column align-center justify-center text-center ga-4 overflow-hidden">
        <template v-if="stage !== 'revealed'">
          <p class="text-h5 font-space-grotesk font-weight-bold">
            {{ t("$vuetify.label.you_earned_a_chest") }}
          </p>

          <p class="text-body-2 text-grey-lighten-1">
            {{ t("$vuetify.message.tap_the_chest_to_open") }}
          </p>

          <!-- ROLETA: prêmios reais ciclando durante a antecipação -->
          <div
            v-if="stage === 'opening'"
            :class="['roulette px-6 py-3 rounded-pill font-space-grotesk font-weight-bold', rouletteClass]"
          >{{ rouletteLabel }}</div>

          <div class="chest-stage d-flex align-center justify-center" @click="open">
            <div
              :class="['chest-glow', stage === 'opening' ? (goldHot ? 'chest-glow-gold' : 'chest-glow-hot') : '']"
            ></div>

            <div :class="['chest', stage === 'opening' ? 'chest-opening' : 'chest-idle']">
              🎁
            </div>
          </div>

          <!-- PITY: progresso até o raro garantido -->
          <div v-if="stage === 'idle'" class="w-100 px-8">
            <p :class="['text-caption mb-1', pityNow ? 'text-yellow font-weight-bold' : 'text-grey-lighten-1']">
              {{ pityNow ? t("$vuetify.message.rare_guaranteed_now") : t("$vuetify.message.rare_guaranteed_in", pityRemaining) }}
            </p>

            <v-progress-linear
              rounded
              bg-color="tertiary"
              height="6"
              :model-value="pityProgress"
              :color="pityNow ? 'yellow' : 'primary'"
            />
          </div>
        </template>
        <template v-else>
          <p class="text-h5 font-space-grotesk font-weight-bold">
            {{ t("$vuetify.label.reward_unlocked") }}
          </p>

          <p
            v-if="reward && reward.rarity !== 'common'"
            :class="['text-h6 font-space-grotesk font-weight-bold rarity-badge', reward.rarity === 'epic' ? 'text-yellow' : 'text-blue']"
          >{{ t(`$vuetify.label.rarity_${reward.rarity}`) }}</p>

          <div class="chest-stage d-flex align-center justify-center">
            <div :class="['chest-rays', reward?.rarity === 'epic' ? 'chest-rays-gold' : '']"></div>
            <div class="chest-reward d-flex flex-column align-center justify-center rounded-circle bg-theme-primary-15">
              <span :style="{ fontSize: '3rem' }">{{ rewardEmoji }}</span>
            </div>
          </div>

          <p class="text-h4 font-space-grotesk font-weight-bold text-primary reward-label">
            {{ rewardLabel }}
          </p>

          <p v-if="openedSource === 'WELCOME'" class="text-body-2 text-grey-lighten-1">
            {{ t("$vuetify.message.welcome_chest_hint") }}
          </p>

          <v-btn
            v-if="openedSource === 'WELCOME'"
            color="primary"
            class="w-100 text-none font-weight-bold mt-6 pa-7 d-flex text-black"
            @click="goToZena"
          >{{ `💬 ${t("$vuetify.label.talk_to_zena")}` }}</v-btn>

          <v-btn
            :color="openedSource === 'WELCOME' ? undefined : 'primary'"
            :variant="openedSource === 'WELCOME' ? 'text' : 'elevated'"
            :class="[
              'w-100 text-none font-weight-bold d-flex',
              openedSource === 'WELCOME' ? 'mt-1 pa-5' : 'mt-6 pa-7 text-black'
            ]"
            @click="close"
          >{{ t("$vuetify.label.close") }}</v-btn>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useRewardChestsStore } from "@/stores/reward-chests";
import { useZenaConversationsStore } from "@/stores/zenas";
import { useCelebration } from "@/composables/use-celebration";
import { useGameSounds } from "@/composables/use-game-sounds";
import { useAnimatedNumber } from "@/composables/use-animated-number";
import { eventBus } from "@/eventBus";
import type { ChestReward, PendingChest, PossibleReward } from "@/types/global.type";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const rewardChestsStore = useRewardChestsStore();
const zenaConversationsStore = useZenaConversationsStore();
const { celebrate, haptic } = useCelebration();
const { playAnticipation, playCoins, playPowerUp, playShimmer, playFanfare } = useGameSounds();

const model = ref(false);
const stage = ref<"idle" | "opening" | "revealed">("idle");
const reward = ref<ChestReward | null>(null);
const pending = ref(false);
const goldHot = ref(false);
const openedSource = ref<PendingChest["source"] | "">("");

const rouletteItem = ref<PossibleReward | null>(null);
const rouletteLocked = ref(false);

let checking = false;
let rouletteTimer: ReturnType<typeof setTimeout> | null = null;

// Rolling counter for the reward amount (slot-machine feel)
const animatedAmount = useAnimatedNumber(() => reward.value?.amount ?? 0, 700);

/// COMPUTED
const inActivity = computed(() => route.query.mode === "activity" || ["training", "challenge"].includes(String(route.name || "")));
const pityRemaining = computed(() => Math.max(1, rewardChestsStore.pity.threshold - rewardChestsStore.pity.opened_without_rare));
const pityNow = computed(() => rewardChestsStore.pity.opened_without_rare >= rewardChestsStore.pity.threshold - 1);
const pityProgress = computed(() => Math.min(100, (rewardChestsStore.pity.opened_without_rare / Math.max(1, rewardChestsStore.pity.threshold - 1)) * 100));
const rewardEmoji = computed(() => emojiFor(reward.value?.type ?? ""));
const rouletteLabel = computed(() => {
  if (!rouletteItem.value) return "";
  const item = rouletteItem.value;
  return item.type === "STREAK_FREEZE" ? `${emojiFor(item.type)} FREEZE` : `${emojiFor(item.type)} ${item.amount}`;
});
const rouletteClass = computed(() => {
  if (rouletteLocked.value && reward.value) return reward.value.rarity === "epic" ? "roulette-epic" : reward.value.rarity === "rare" ? "roulette-rare" : "roulette-common";
  return rouletteItem.value?.rarity === "epic" ? "roulette-epic" : rouletteItem.value?.rarity === "rare" ? "roulette-rare" : "roulette-common";
});
const rewardLabel = computed(() => {
  if (!reward.value) return "";
  switch (reward.value.type) {
    case "CREDITS": return t("$vuetify.message.chest_reward_credits", Math.round(animatedAmount.value));
    case "STREAK_FREEZE": return t("$vuetify.message.chest_reward_freeze");
    default: return t("$vuetify.message.chest_reward_xp", Math.round(animatedAmount.value));
  }
});

/// WATCH
watch(inActivity, (val) => {
  if (!val && pending.value) {
    pending.value = false;
    check();
  }
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("CHECK_CHESTS", check);
});

onBeforeUnmount(() => {
  eventBus.off("CHECK_CHESTS", check);
  stopRoulette();
});

/// METHODS
const emojiFor = (type: string) => {
  switch (type) {
    case "CREDITS": return "🪙";
    case "STREAK_FREEZE": return "🧊";
    default: return "⚡";
  }
};

const check = async () => {
  if (checking || model.value) return;

  if (inActivity.value) {
    pending.value = true;
    return;
  }

  try {
    checking = true;
    const response = await rewardChestsStore.GET_PENDING();
    if (response.error || !rewardChestsStore.pending.length) return;

    stage.value = "idle";
    reward.value = null;
    goldHot.value = false;
    model.value = true;
  } catch {
    ///
  } finally {
    checking = false;
  }
};

const startRoulette = (items: PossibleReward[]) => {
  rouletteLocked.value = false;
  let interval = 70;

  const spin = () => {
    if (rouletteLocked.value || !items.length) return;

    rouletteItem.value = items[Math.floor(Math.random() * items.length)] ?? null;
    interval = Math.min(240, interval * 1.06);
    rouletteTimer = setTimeout(spin, interval);
  };

  spin();
};

const stopRoulette = () => {
  if (rouletteTimer) {
    clearTimeout(rouletteTimer);
    rouletteTimer = null;
  }
  rouletteLocked.value = true;
};

const open = async () => {
  if (stage.value !== "idle") return;

  const chest = rewardChestsStore.pending[0];
  if (!chest) return close();

  openedSource.value = chest.source;
  stage.value = "opening";
  await haptic();

  startRoulette(chest.possible_rewards ?? []);

  const anticipation = 1100 + Math.random() * 900;
  playAnticipation(anticipation);

  const [response] = await Promise.all([
    rewardChestsStore.OPEN(chest._id),
    new Promise((resolve) => setTimeout(resolve, anticipation)),
  ]);

  if (response.error || !response.chest?.reward) {
    stopRoulette();
    return close();
  }

  const drawn = response.chest.reward as ChestReward;

  // Rare+ stretches the suspense: gold glow and one extra tick run
  if (drawn.rarity !== "common") {
    goldHot.value = true;
    playAnticipation(900);
    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  // Land the reel on the real result and let it sit for a beat
  stopRoulette();
  rouletteItem.value = { type: drawn.type, amount: drawn.amount, rarity: drawn.rarity };
  reward.value = drawn;
  await haptic();
  await new Promise((resolve) => setTimeout(resolve, 350));

  stage.value = "revealed";

  // Reward-themed jingle + confetti/haptics scaled by rarity
  switch (drawn.type) {
    case "CREDITS": playCoins(drawn.amount); break;
    case "STREAK_FREEZE": playShimmer(); break;
    default: playPowerUp(); break;
  }

  if (drawn.rarity === "epic") {
    playFanfare();
    celebrate("epic", { sound: false });
  } else if (drawn.rarity === "rare") {
    celebrate("epic", { sound: false });
  } else {
    celebrate("success", { sound: false });
  }
};

const close = () => {
  model.value = false;
  stage.value = "idle";
  reward.value = null;
  goldHot.value = false;
  openedSource.value = "";

  accountsStore.GET_ACCOUNT();

  // More chests queued: celebrate them in sequence
  if (rewardChestsStore.pending.length) {
    nextTick(() => check());
  }
};

const goToZena = async () => {
  try {
    const response = await zenaConversationsStore.GET();
    const conversations = (response.conversations ?? []) as { _id: string }[];
    const conversation = conversations[conversations.length - 1];

    if (conversation?._id) sessionStorage.setItem("chat-id", conversation._id);
  } catch {
    ///
  }

  close();
  router.push({ name: "ai_coach" });
};
</script>

<style lang="sass" scoped>
.chest-stage
  position: relative
  width: 220px
  height: 220px

.chest
  position: relative
  z-index: 2
  font-size: 6rem
  line-height: 1
  cursor: pointer
  user-select: none

.chest-idle
  animation: chest-shake 1.6s ease-in-out infinite

.chest-opening
  animation: chest-rumble 0.12s linear infinite

.chest-glow
  position: absolute
  inset: 30px
  border-radius: 50%
  background: radial-gradient(circle, rgba(72, 242, 109, 0.35), transparent 70%)
  animation: glow-pulse 1.6s ease-in-out infinite
  z-index: 1

.chest-glow-hot
  background: radial-gradient(circle, rgba(255, 235, 59, 0.55), transparent 70%)
  animation: glow-pulse 0.25s ease-in-out infinite

.chest-glow-gold
  background: radial-gradient(circle, rgba(255, 193, 7, 0.75), transparent 70%)
  animation: glow-pulse 0.15s ease-in-out infinite

.roulette
  min-width: 10rem
  font-size: 1.3rem
  background-color: var(--quintet)
  border: 1px solid var(--tertiary)
  transition: border-color 0.1s, color 0.1s

.roulette-common
  color: white

.roulette-rare
  color: rgb(59, 130, 246)
  border-color: rgb(59, 130, 246)

.roulette-epic
  color: rgb(255, 193, 7)
  border-color: rgb(255, 193, 7)
  box-shadow: 0 0 18px rgba(255, 193, 7, 0.35)

.chest-rays
  position: absolute
  inset: -40px
  border-radius: 50%
  background: repeating-conic-gradient(rgba(72, 242, 109, 0.22) 0deg 12deg, transparent 12deg 30deg)
  -webkit-mask-image: radial-gradient(circle, black 30%, transparent 70%)
  mask-image: radial-gradient(circle, black 30%, transparent 70%)
  animation: rays-spin 6s linear infinite
  z-index: 1

.chest-rays-gold
  background: repeating-conic-gradient(rgba(255, 193, 7, 0.35) 0deg 12deg, transparent 12deg 30deg)
  animation: rays-spin 3s linear infinite

.chest-reward
  position: relative
  z-index: 2
  width: 120px
  height: 120px
  animation: reward-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)

.reward-label
  animation: reward-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)

.rarity-badge
  letter-spacing: 0.2em
  animation: reward-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

@keyframes chest-shake
  0%, 100%
    transform: rotate(0deg) scale(1)
  20%
    transform: rotate(-6deg) scale(1.02)
  40%
    transform: rotate(6deg) scale(1.04)
  60%
    transform: rotate(-4deg) scale(1.02)
  80%
    transform: rotate(4deg) scale(1)

@keyframes chest-rumble
  0%
    transform: translate(-2px, 1px) rotate(-3deg) scale(1.08)
  25%
    transform: translate(2px, -1px) rotate(3deg) scale(1.1)
  50%
    transform: translate(-2px, -2px) rotate(-2deg) scale(1.12)
  75%
    transform: translate(2px, 2px) rotate(2deg) scale(1.1)
  100%
    transform: translate(-1px, 1px) rotate(-3deg) scale(1.08)

@keyframes glow-pulse
  0%, 100%
    opacity: 0.6
    transform: scale(1)
  50%
    opacity: 1
    transform: scale(1.15)

@keyframes rays-spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

@keyframes reward-pop
  0%
    transform: scale(0.3)
    opacity: 0
  70%
    transform: scale(1.12)
  100%
    transform: scale(1)
    opacity: 1
</style>