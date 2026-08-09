<template>
  <div :id="id" class="custom-player-external">
    <div
      v-if="typeof props.videoId === 'string'"
      data-plyr-provider="youtube"
      :id="idPlayer"
      :data-plyr-embed-id="props.videoId"
    ></div>
    <video
      v-else
      :id="idPlayer"
      :data-poster="props.thumbnail"
      controls
      playsinline
      webkit-playsinline
    >
      <source
        v-for="(source, i) in props.videoId"
        :key="i"
        :src="source.src"
        :type="source.type"
      />
    </video>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import Plyr from "plyr";
import { useLocale } from "vuetify";
import { v4 as uuidv4 } from "uuid";
import { Device, Fullscreen, ScreenOrientation } from "@/mobile";
import { eventBus } from "@/eventBus";

interface Props {
  loop?: boolean,
  thumbnail?: string,
  startSecond?: number,
  videoId: string | { src: string, type: string }[],
};

const props = withDefaults(defineProps<Props>(), {
  loop: false,
  startSecond: 0
});

/// DATA
const { t } = useLocale();
const player = ref<Plyr>();
const id = ref(`custom-player-${uuidv4()}`);
const idPlayer = ref(`custom-player-${uuidv4()}`);
const emit = defineEmits(["load"]);
const platform = ref("");

/// WATCH
watch(() => props.videoId, (videoId) => {
  if (!player.value) return;

  const isYoutube = typeof videoId === "string";

  player.value.source = {
    type: "video",
    title: "",
    sources: isYoutube ?
      [{ src: videoId, provider: "youtube" }] :
      videoId.map((source) => ({ src: source.src, type: source.type })),
    poster: props.thumbnail
  };
});

/// LIFE CYCLES
onMounted(async () => {
  const device = await Device.getInfo();
  platform.value = device.platform;

  player.value = new Plyr(`#${idPlayer.value}`, {
    i18n: { speed: t("$vuetify.label.speed") },
    loop: { active: props.loop }
  });

  player.value.on("ready", () => {
    player.value!.currentTime = props.startSecond;

    if (player.value!.isHTML5) {
      const wasMuted = player.value!.muted;
      player.value!.muted = true;

      // Toca e pausa sem aguardar a promise resolver, só pra pintar o primeiro frame como
      // "poster" (evita a tela cinza do Android antes do play) sem deixar o vídeo tocar de fato
      Promise.resolve(player.value!.play()).catch(() => {});
      player.value!.pause();
      player.value!.muted = wasMuted;

      // Sai do fullscreen nativo do iOS zera o safe-area do WKWebView de forma transitória
      ((player.value as any)!.media as HTMLVideoElement).addEventListener(
        "webkitendfullscreen",
        () => eventBus.emit("REFRESH_SAFE_AREA")
      );
    }

    const yt = player.value?.embed;

    if (yt && yt.getPlayerState) {
      setTimeout(() => {
        const state = yt.getPlayerState();

        if (state === -1) {

        }
      }, 2000);
    }

    setTimeout(() => emit("load"), 1000);
  });

  player.value.on("enterfullscreen", async () => {
    await ScreenOrientation.lock({ orientation: "landscape-primary" });

    if (platform.value === "android") {
      await Fullscreen.activateImmersiveMode();
    }
  });

  player.value.on("exitfullscreen", async () => {
    await ScreenOrientation.lock({ orientation: "portrait-primary" });

    if (platform.value === "android") {
      await Fullscreen.deactivateImmersiveMode();
    }
  });

  player.value.on("error", (event: any) => {

  });
});
</script>

<style lang="sass">
div.custom-player-external
  width: 100%
  height: max-content
  aspect-ratio: 16 / 9
  overflow: hidden

  --plyr-color-main: var(--primary)

  div.plyr
    max-height: -webkit-fill-available
    height: -webkit-fill-available

  div.plyr__poster
    background-size: cover

  iframe
    width: 300% !important
    height: 100% !important
    margin-left: -100%

  video
    aspect-ratio: 16 / 9
</style>