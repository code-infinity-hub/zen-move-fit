<template>
  <div>
    <div
      id="pixi-canvas"
      class="position-fixed top-0 left-0 w-100 h-100"
    ></div>

    <div id="flash"></div>

    <div id="ui">
      <div class="check-ring" id="ring">
        <div class="pulse-ring" id="pulse"></div>
        <svg class="check-svg" viewBox="0 0 50 50">
          <path id="checkPath" d="M10 26 L21 37 L40 16" />
        </svg>
      </div>

      <div class="label-done" id="title">
        {{ t("$vuetify.label.activity") }}

        <span>
          {{ t("$vuetify.label.completed") }}
        </span>
      </div>

      <div class="sub text-grey-lighten-1" id="sub">
        {{ choosePhrase }}
      </div>

      <div class="stats" id="stats">
        <template v-if="['TRAINING', 'CHALLENGE'].includes(props.activity.type)">
          <div class="stat">
            <div class="stat-value" id="exercises">—</div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.exercises") }}</div>
          </div>

          <div class="divider"></div>

          <div class="stat">
            <div class="stat-value" id="dur">—</div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.time") }}</div>
          </div>

          <div class="divider"></div>

          <div class="stat">
            <div class="stat-value" id="cal">0</div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.calories") }}</div>
          </div>
        </template>
        <template v-else>
          <div class="stat">
            <div class="stat-value" id="dur">—</div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.time") }}</div>
          </div>

          <div class="divider"></div>

          <div class="stat">
            <div class="stat-value" id="cal">0</div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.calories") }}</div>
          </div>

          <div class="divider"></div>

          <div class="stat">
            <div class="stat-value" id="rhythm"></div>
            <div class="stat-label text-grey-lighten-1">{{ t("$vuetify.label.rhythm") }}</div>
          </div>
        </template>
      </div>

      <div class="cta d-flex flex-column ga-3" id="cta">
        <v-btn
          block
          color="primary"
          class="text-none pa-7 text-h6 text-black font-weight-bold"
          @click="share"
        >
          <v-icon class="mr-2">mdi-share</v-icon>
          {{ t("$vuetify.label.share_the_result") }}
        </v-btn>

        <v-btn
          v-if="showBackButton"
          block
          variant="tonal"
          color="primary"
          class="text-none pa-7 text-h6 text-black font-weight-bold"
          @click="emit('back')"
        >{{ t("$vuetify.label.back_button") }}</v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useFormatNumber } from "@/composables";
import { date, getPrimaryDurationSeconds } from "@/utils";
import { RunningMetricsService } from "@/services/running-metrics.service";
import {
  Application,
  BlurFilter,
  Container,
  Graphics,
  Sprite
} from "pixi.js";
import {
  Device,
  Haptics,
  ImpactStyle,
  Share
} from "@/mobile";
import { type Activity } from "@/types/activity.type";

interface CustomSprite extends Sprite {
  _vx: number,
  _vy: number,
  _vr: number,
  _life: number,
};

type coords = { x: number, y: number };

/// DATA
const { t } = useLocale();
const { formatTime, fromSecondsToMinutes } = date();
const { formatNumber } = useFormatNumber();
const emit = defineEmits(["back"]);
const props = defineProps<{ activity: Activity }>();

let shakeRafId: number | null = null;

const showBackButton = ref(false);

const app = new Application();

const layerBg = new Container();
const layerRibbon = new Container();
const layerConf = new Container();

const NEON = 0x00FF9C;
const Z_SPEED = 0.008;
const Z_BAND_W = Math.min(window.innerWidth * 0.32, 130);
let zT = 0;
let zDone = false;
const zGraphics = new Graphics();

const zBlur = new BlurFilter({ strength: 20 });

const zGlow = new Graphics();

const ribbonGraphics = new Graphics();

let flashAlpha = 0;
let flashDir = 0;
let flashEl: HTMLElement;

const confettiPool: CustomSprite[] = [];
const CONF_COLORS = [0x00FF9C, 0xFFFFFF, 0xB3FFDE, 0x80FFC8, 0x00CC7A];

const totalPhrases = 20;

/// COMPUTED
const choosePhrase = computed(() => {
  const index = Math.floor(Math.random() * totalPhrases) + 1;
  return t(`$vuetify.completed_phrases.phrase_${index}`);
});

const duration = computed(() => formatTime(getPrimaryDurationSeconds(props.activity)));

const titleShare = computed(() => {
  const label = ["TRAINING", "CHALLENGE"].includes(props.activity.type) ?
    props.activity.type :
    props.activity.category;
  return t(`$vuetify.share_title.${label}`);
});

const textShare = computed(() => {
  const label = ["TRAINING", "CHALLENGE"].includes(props.activity.type) ?
    props.activity.type :
    props.activity.category;

  return t(
    `$vuetify.share_text.${label}`,
    formatNumber((props.activity.metrics?.distance_meters ?? 0) / 1000),
    fromSecondsToMinutes(getPrimaryDurationSeconds(props.activity))
  );
});

/// LIFE CYCLES
onMounted(async () => {
  flashEl = document.querySelector("div#flash")! as HTMLElement;

  await app.init({
    resizeTo: window,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--secondary"),
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  document.querySelector("div#pixi-canvas")!.appendChild(app.canvas);

  /* ─────────────────────────────
    LAYERS
  ───────────────────────────── */
  app.stage.addChild(layerBg, layerRibbon, layerConf);

  /* ─────────────────────────────
    Z-BAND (neon stroke)
  ───────────────────────────── */
  layerBg.addChild(zGraphics);

  // Neon glow filter for z-band
  zBlur.quality = 3;
  layerBg.addChildAt(zGlow, 0);

  /* ─────────────────────────────
    RIBBON SWEEP
  ───────────────────────────── */
  let sweepX = -W() * 0.7;
  let sweepDone = false;
  const SWEEP_SPEED = 55;

  layerRibbon.addChild(ribbonGraphics);

  /* ─────────────────────────────
    TICKER (main loop)
  ───────────────────────────── */
  app.ticker.add((delta) => {
    const dt = Math.min(delta.deltaTime, 3);

    // Z-Band
    if (!zDone) {
      zT += Z_SPEED * dt;

      if (zT >= 1) {
        zT = 1;
        zDone = true;
      }

      drawZBand(zT);
    } else {
      zGraphics.clear();
      zGlow.clear();
    }

    // Ribbon sweep
    if(zDone && !sweepDone){
      sweepX += SWEEP_SPEED * dt;
      drawRibbon(sweepX);

      if (sweepX > W() + 450) {
        sweepDone = true;
        ribbonGraphics.clear();
        triggerFlash();
        spawnConfetti();
        revealUI();
      }
    }

    // Flash
    if (flashDir === 1) {
      flashAlpha += 0.14 * dt;

      if (flashAlpha >= 1) {
        flashAlpha = 1;
        flashDir = -1;
      }
    } else if (flashDir === -1) {
      flashAlpha -= 0.07 * dt;

      if(flashAlpha < 0) flashAlpha = 0;
    }
    flashEl.style.opacity = String(flashAlpha);

    // Confetti
    updateConfetti(dt);
  });

  const device = await Device.getInfo();
  if (device.platform === "ios") showBackButton.value = true;
});

/// METHODS
const W = () => app.screen.width;
const H = () => app.screen.height;

const cubic = (P0: coords, P1: coords, P2: coords, P3: coords, t: number) => {
  const m = 1 - t;

  return {
    x: m * m * m * P0.x + 3 * m * m * t * P1.x + 3 * m * t * t * P2.x + t * t * t * P3.x,
    y: m * m * m * P0.y + 3 * m * m * t * P1.y + 3 * m * t * t * P2.y + t * t * t * P3.y
  };
};

const zPoint = (t: number, w: number, h: number) => {
  if (t <= 0.45) {
    const s = t / 0.45;

    return cubic(
      { x: w + 80, y: -80 },
      { x: w * 0.5, y: -80 },
      { x: -80, y: h * 0.28 },
      { x: -80, y: h * 0.52 },
      s
    );
  };

  if (t <= 0.55) {
    const s = (t - 0.45) / 0.1;

    return cubic(
      { x: -80, y: h * 0.52 },
      { x: w * 0.25, y: h * 0.52 },
      { x: w * 0.75, y: h * 0.48 },
      { x: w + 80, y: h * 0.48 },
      s
    );
  }

  const s = (t - 0.55) / 0.45;

  return cubic(
    { x: w + 80, y: h * 0.48 },
    { x: w + 80, y: h * 0.72 },
    { x: w * 0.5, y: h + 80 },
    { x: -80, y: h + 80 },
    s
  );
};

const drawZBand = (maxT: number) => {
  const w = W(), h = H();
  const N = 120;
  const pts: coords[] = [];

  for (let i = 0; i <= N; i++) {
    pts.push(zPoint((i / N) * maxT, w, h));
  }

  if (!pts.length) return;

  // glow
  zGlow.clear();
  zGlow
    .setStrokeStyle({ width: Z_BAND_W * 2, color: NEON, alpha: 0.18 })
    .moveTo(pts[0]!.x, pts[0]!.y);

  for (let i = 1; i < pts.length; i++) {
    zGlow.lineTo(pts[i]!.x, pts[i]!.y);
  }

  zGlow.stroke();
  zGlow.filters = [zBlur];

  // sharp
  zGraphics.clear();
  zGraphics
    .setStrokeStyle({ width: Z_BAND_W, color: NEON, alpha: 1 })
    .moveTo(pts[0]!.x, pts[0]!.y);

  for (let i = 1; i < pts.length; i++) {
    zGraphics.lineTo(pts[i]!.x, pts[i]!.y);
  }

  zGraphics.stroke();
};

const drawRibbon = (x: number) => {
  const h = H();
  ribbonGraphics.clear();

  // soft glow
  ribbonGraphics
    .fill({ color: NEON, alpha: 0.12 })
    .poly([
      x - 40, 0,
      x + 360, 0,
      x + 760, h,
      x + 360, h
    ])
    .fill({ color: NEON });

  // main ribbon
  ribbonGraphics
    .fill({ color: NEON, alpha: 0.88 })
    .poly([
      x, 0,
      x + 320, 0,
      x + 700, h,
      x + 380, h
    ])
    .fill({ color: NEON });
};

const vibratePattern = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });

  setTimeout(async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }, 50);
};

const triggerFlash = () => {
  flashDir = 1;

  // haptic if available
  vibratePattern();

  // cancela shake anterior, se ainda estiver rodando
  if (shakeRafId !== null) {
    cancelAnimationFrame(shakeRafId);
    shakeRafId = null;
    app.stage.x = 0;
  }

  const duration = 1200;
  const amplitude = 5;
  let startTime: number | null = null;

  const animateShake = (time: number) => {
    if (startTime === null) startTime = time;

    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    app.stage.x = Math.sin(progress * 8 * Math.PI) * amplitude * (1 - progress);

    if (progress < 1) {
      shakeRafId = requestAnimationFrame(animateShake);
    } else {
      app.stage.x = 0;
      shakeRafId = null;
    }
  };

  shakeRafId = requestAnimationFrame(animateShake);
};

const makeSquareTex = (color: number) => {
  const g = new Graphics();

  g
    .fill({ color })
    .rect(0, 0, 6, 6)
    .fill({ });

  return app.renderer.generateTexture(g);
};

const spawnConfetti = () => {
  const confTextures = CONF_COLORS.map((color) => makeSquareTex(color));

  for (let i = 0; i < 220; i++) {
    const tex = confTextures[Math.floor(Math.random() * confTextures.length)];
    const sp = new Sprite(tex) as CustomSprite;
    sp.anchor.set(0.5);
    sp.x = Math.random() * W();
    sp.y = -20 - Math.random() * 60;
    sp.rotation = Math.random() * Math.PI * 2;

    sp._vx = (Math.random() - 0.5) * 3.5;
    sp._vy = Math.random() * 4 + 2;
    sp._vr = (Math.random() - 0.5) * 0.14;
    sp._life = 1 + Math.random() * 0.5;

    layerConf.addChild(sp);
    confettiPool.push(sp);
  }
};

const updateConfetti = (dt: number) => {
  for (let i = confettiPool.length - 1; i >= 0; i--) {
    const p = confettiPool[i]!;
    p.x += p._vx * dt;
    p.y += p._vy * dt;
    p.rotation += p._vr * dt;
    p._vy += 0.05 * dt;
    p._life -= 0.005 * dt;
    p.alpha = Math.min(p._life, 1);

    if (p._life <= 0 || p.y > H() + 40) {
      layerConf.removeChild(p);
      confettiPool.splice(i, 1);
    }
  }
};

const animateNumber = (
  el: HTMLElement,
  target: number,
  duration = 1300,
  suffix = "",
  format = false
) => {
  const startTime = performance.now();

  const tick = (t: number) => {
    const p = Math.min((t - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);

    if (format) {
      el.textContent = `${formatNumber(ease * target)}${suffix}`;
    } else {
      el.textContent = `${Math.floor(ease * target)}${suffix}`;
    }

    if (p < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const revealUI = () => {
  const ring = document.querySelector("#ring")! as HTMLElement;
  const title = document.querySelector("#title")! as HTMLElement;
  const sub = document.querySelector("#sub")! as HTMLElement;
  const stats = document.querySelector("#stats")! as HTMLElement;
  const pulse = document.querySelector("#pulse")! as HTMLElement;
  const path = document.querySelector("#checkPath")! as HTMLElement;
  const cta = document.querySelector("#cta")! as HTMLElement;

  const ease = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  // ring pop
  setTimeout(() => {
    ring.style.transition = `opacity 0.3s ease, transform 0.55s ${ease}`;
    ring.style.opacity = "1";
    ring.style.transform = "scale(1)";

    setTimeout(() => {
      path.style.transition = "stroke-dashoffset 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
      path.style.strokeDashoffset = "0";
      pulse.style.opacity = "1";
    }, 320);
  }, 160);

  // title
  setTimeout(() => {
    title.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    title.style.opacity = "1";
    title.style.transform = "none";
  }, 480);

  // sub
  setTimeout(() => {
    sub.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    sub.style.opacity = "1";
    sub.style.transform = "none";
  }, 700);

  // stats + counters
  setTimeout(() => {
    stats.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    stats.style.opacity = "1";
    stats.style.transform = "none";

    document.querySelector("#dur")!.textContent = duration.value;

    animateNumber(
      document.querySelector("#cal")!,
      props.activity.calories,
      1300,
      "",
      true
    );

    if (["TRAINING", "CHALLENGE"].includes(props.activity.type)) {
      animateNumber(
        document.querySelector("#exercises")!,
        props.activity.exercises!.length,
        1300
      );
    } else {
      document.querySelector("#rhythm")!.textContent = RunningMetricsService.formatPace(props.activity.metrics!.avg_pace);
    }
  }, 900);

  // CTA button
  setTimeout(() => {
    cta.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    cta.style.opacity = "1";
    cta.style.transform = "none";
  }, 1150);
};

const share = async () => {
  await Share.share({
    title: titleShare.value,
    text: textShare.value,
    url: `${import.meta.env.VITE_URL_ACTIVITY_SHARE}${props.activity._id}`,
    dialogTitle: t("$vuetify.label.share_activity"),
  });
};
</script>

<style scoped lang="sass">
div#pixi-canvas
  position: fixed
  inset: 0
  z-index: 0

div#flash
  position: fixed
  inset: 0
  background: var(--primary)
  opacity: 0
  z-index: 1
  pointer-events: none
  will-change: opacity

// UI layer
div#ui
  position: fixed
  inset: 0
  z-index: 2
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  pointer-events: none
  gap: 0

  // Check ring
  div.check-ring
    width: clamp(88px, 22vw, 120px)
    height: clamp(88px, 22vw, 120px)
    border-radius: 50%
    border: 3px solid var(--primary)
    display: flex
    align-items: center
    justify-content: center
    opacity: 0
    transform: scale(0.3)
    margin-bottom: clamp(20px, 5vw, 32px)
    position: relative
    flex-shrink: 0

    &::before
      content: ""
      position: absolute
      inset: -10px
      border-radius: 50%
      border: 1px solid rgba(0, 255, 156, 0.18)

    &::after
      content: ""
      position: absolute
      inset: -22px
      border-radius: 50%
      border: 1px solid rgba(0, 255, 156, 0.07)

    div.pulse-ring
      position: absolute
      inset: 0
      border-radius: 50%
      border: 2px solid var(--primary)
      animation: pulseRing 1.5s ease-out infinite
      opacity: 0

    svg.check-svg
      width: clamp(34px, 9vw, 50px)
      height: clamp(34px, 9vw, 50px)

      path
        stroke: var(--primary)
        stroke-width: 4
        stroke-linecap: round
        stroke-linejoin: round
        fill: none
        stroke-dasharray: 80
        stroke-dashoffset: 80

  div.label-done
    font-family: "Bebas Neue", sans-serif
    font-size: clamp(44px, 13vw, 86px)
    color: #FFFFFF
    letter-spacing: 0.05em
    line-height: 1
    text-align: center
    opacity: 0
    transform: translateY(18px)
    text-transform: uppercase

    span
      color: var(--primary)

  div.sub
    font-size: clamp(11px, 3.2vw, 14px)
    letter-spacing: 0.18em
    text-transform: uppercase
    margin-top: clamp(10px, 2.5vw, 14px)
    text-align: center
    opacity: 0
    transform: translateY(8px)
    line-height: 1.5
    padding: 0 16px

  div.stats
    display: flex
    gap: clamp(20px, 8vw, 48px)
    margin-top: clamp(24px, 7vw, 40px)
    opacity: 0
    transform: translateY(10px)
    align-items: center

    div.stat
      text-align: center

      div.stat-value
        font-family: "Bebas Neue", sans-serif
        font-size: clamp(28px, 8vw, 38px)
        color: #FFFFFF
        line-height: 1
        letter-spacing: 0.02em

      div.stat-label
        font-size: clamp(9px, 2.5vw, 11px)
        letter-spacing: 0.14em
        text-transform: uppercase
        margin-top: 5px

    div.divider
      width: 1px
      height: clamp(28px, 7vw, 40px)
      background: rgba(255, 255, 255, 0.1)

  div.cta
    margin-top: clamp(28px, 8vw, 44px)
    opacity: 0
    transform: translateY(10px)
    pointer-events: all
    width: 90%

@keyframes pulseRing
  0%
    transform: scale(1)
    opacity: 0.6

  100%
    transform: scale(1.9)
    opacity: 0
</style>