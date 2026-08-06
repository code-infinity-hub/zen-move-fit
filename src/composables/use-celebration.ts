import { Haptics, ImpactStyle } from "@/mobile";
import { createConfetti } from "@/utils";
import { useGameSounds } from "./";
import type { CelebrateOptions, CelebrationIntensity } from "@/types/global.type";

export const useCelebration = () => {
  const { playPop, playChime, playFanfare } = useGameSounds();

  const haptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch {
      /// unsupported platform
    }
  };

  const vibratePattern = async (times: number, interval = 120) => {
    for (let i = 0; i < times; i++) {
      await haptic(ImpactStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  };

  const celebrate = async (intensity: CelebrationIntensity = "success", options: CelebrateOptions = { }) => {
    const sound = options.sound ?? true;

    if (intensity === "light") {
      if (sound) playPop();
      await haptic(ImpactStyle.Light);
      return;
    }

    if (intensity === "success") {
      if (sound) playChime();
      createConfetti(2);
      await vibratePattern(2);
      return;
    }

    if (sound) playFanfare();
    createConfetti(4);
    await vibratePattern(4);
  };

  return { celebrate, haptic, vibratePattern };
};