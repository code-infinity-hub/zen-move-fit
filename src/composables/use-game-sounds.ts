import { type ToneOptions } from "@/types/global.type";

let ctx: AudioContext | null = null;

export const getSharedAudioContext = (): AudioContext | null => {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;

    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") ctx.resume().catch(() => { });

    return ctx;
  } catch {
    return null;
  }
};

const getCtx = getSharedAudioContext;

// iOS/WKWebView keeps the AudioContext suspended until it's resumed from inside a genuine,
// synchronous user gesture. Sounds triggered later by server events (achievement unlocked,
// chest granted) have no gesture of their own, so they silently produce no audio unless the
// context was already unlocked earlier by a real tap. Call this once, early, from any tap.
export const unlockAudioContext = () => {
  getSharedAudioContext();
};

const tone = (audio: AudioContext, { freq, at = 0, dur = 0.15, type = "sine", vol = 0.2, slideTo }: ToneOptions) => {
  const start = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
};

export const useGameSounds = () => {
  // Soft pop for small wins (quest step, freeze bought)
  const playPop = () => {
    const audio = getCtx();
    if (!audio) return;

    tone(audio, { freq: 520, dur: 0.09, type: "triangle", vol: 0.18, slideTo: 780 });
  };

  // Bright two-note chime + sparkle — achievement unlocked
  const playChime = () => {
    const audio = getCtx();
    if (!audio) return;

    tone(audio, { freq: 659, at: 0, dur: 0.28, type: "sine", vol: 0.22 });
    tone(audio, { freq: 988, at: 0.09, dur: 0.4, type: "sine", vol: 0.2 });
    tone(audio, { freq: 1319, at: 0.18, dur: 0.5, type: "sine", vol: 0.12 });
    tone(audio, { freq: 2637, at: 0.22, dur: 0.3, type: "sine", vol: 0.05 });
  };

  // Rising arpeggio fanfare — level up, league promotion, epic moments
  const playFanfare = () => {
    const audio = getCtx();
    if (!audio) return;

    const notes = [523, 659, 784, 1047];

    notes.forEach((freq, index) => {
      tone(audio, { freq, at: index * 0.11, dur: 0.16, type: "triangle", vol: 0.22 });
    });

    // Closing chord
    [523, 659, 784, 1047].forEach((freq) => {
      tone(audio, { freq, at: 0.46, dur: 0.6, type: "triangle", vol: 0.1 });
    });
    tone(audio, { freq: 2093, at: 0.5, dur: 0.4, type: "sine", vol: 0.05 });
  };

  // Slot-machine style anticipation: accelerating ticks + riser sweep for the
  // given duration (ms). The player can't tell when the reveal lands.
  const playAnticipation = (durationMs: number) => {
    const audio = getCtx();
    if (!audio) return;

    const duration = durationMs / 1000;

    // Riser
    tone(audio, { freq: 180, dur: duration, type: "sawtooth", vol: 0.06, slideTo: 880 });

    // Accelerating ticks
    let at = 0;
    let interval = 0.16;

    while (at < duration) {
      tone(audio, { freq: 1600 + Math.random() * 300, at, dur: 0.03, type: "square", vol: 0.07 });
      at += interval;
      interval = Math.max(0.045, interval * 0.88);
    }
  };

  // Cascading coin jingle — credits won (more coins for bigger amounts)
  const playCoins = (amount = 50) => {
    const audio = getCtx();
    if (!audio) return;

    const coins = Math.min(16, 6 + Math.floor(amount / 25));

    for (let i = 0; i < coins; i++) {
      const freq = 1568 + Math.random() * 1200 + i * 40;
      tone(audio, { freq, at: i * 0.06 + Math.random() * 0.02, dur: 0.08, type: "square", vol: 0.09 });
      tone(audio, { freq: freq * 1.5, at: i * 0.06 + 0.02, dur: 0.05, type: "sine", vol: 0.04 });
    }
  };

  // Double power-up sweep — XP won
  const playPowerUp = () => {
    const audio = getCtx();
    if (!audio) return;

    tone(audio, { freq: 330, dur: 0.22, type: "square", vol: 0.12, slideTo: 880 });
    tone(audio, { freq: 440, at: 0.2, dur: 0.28, type: "square", vol: 0.12, slideTo: 1320 });
  };

  // Icy shimmer — streak freeze won
  const playShimmer = () => {
    const audio = getCtx();
    if (!audio) return;

    tone(audio, { freq: 2093, dur: 0.5, type: "sine", vol: 0.1 });
    tone(audio, { freq: 2102, at: 0.03, dur: 0.5, type: "sine", vol: 0.08 });
    tone(audio, { freq: 2637, at: 0.18, dur: 0.4, type: "sine", vol: 0.07 });
    tone(audio, { freq: 3136, at: 0.32, dur: 0.35, type: "sine", vol: 0.05 });
  };

  return { playPop, playChime, playFanfare, playAnticipation, playCoins, playPowerUp, playShimmer };
};