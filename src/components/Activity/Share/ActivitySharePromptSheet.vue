<template>
  <v-bottom-sheet v-model="model">
    <v-sheet class="prompt-sheet" rounded="t-xl">
      <!-- Anéis decorativos com glow (cortados pelas bordas superiores) -->
      <div class="ring ring-left"></div>
      <div class="ring ring-right"></div>

      <v-btn
        icon=""
        size="small"
        variant="flat"
        class="close-btn"
        color="rgba(255, 255, 255, 0.08)"
        @click="model = false"
      >
        <v-icon
          :size="18"
          color="white"
        >mdi-close</v-icon>
      </v-btn>

      <div class="content px-6 pb-8 d-flex flex-column align-center">
        <div class="icon-badge d-flex align-center justify-center mt-8">
          <v-icon
            :size="40"
            color="primary"
          >mdi-share-variant-outline</v-icon>
        </div>

        <p class="text-h4 font-weight-black text-center prompt-title mt-6">
          {{ t("$vuetify.share.prompt_title") }}
          <span class="text-primary d-block">
            {{ t("$vuetify.share.prompt_title_highlight") }}
          </span>
        </p>

        <p class="text-body-1 text-center prompt-subtitle mt-3">
          {{ t("$vuetify.share.prompt_subtitle") }}
        </p>

        <v-btn
          block
          color="primary"
          variant="flat"
          rounded="pill"
          height="56"
          class="font-weight-bold text-none text-black cta-btn mt-8"
          @click="share"
        >
          <v-icon
            start
            :size="22"
          >mdi-share-variant</v-icon>
          {{ t("$vuetify.share.prompt_cta") }}
        </v-btn>

        <p class="text-caption text-center prompt-privacy mt-5">
          <v-icon
            :size="16"
            color="primary"
            class="mr-1"
          >mdi-lock-outline</v-icon>
          {{ t("$vuetify.share.prompt_privacy") }}
        </p>
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const model = defineModel<boolean>({ default: false });
const emit = defineEmits<{ share: [] }>();

/// METHODS
const share = () => {
  model.value = false;
  emit("share");
};
</script>

<style lang="sass" scoped>
.prompt-sheet
  background: var(--quintet)
  border-top: 1px solid rgba(255, 255, 255, 0.06)
  position: relative
  overflow: hidden

.content
  position: relative
  z-index: 1

.handle-bar
  width: 56px
  height: 4px
  background: rgba(255, 255, 255, 0.25)

.close-btn
  position: absolute
  top: 14px
  right: 14px
  z-index: 3

.ring
  position: absolute
  border-radius: 50%
  border: 22px solid rgba(72, 242, 109, 0.9)
  box-shadow: 0 0 36px 8px rgba(72, 242, 109, 0.4), 0 0 90px 30px rgba(72, 242, 109, 0.15), inset 0 0 28px 6px rgba(72, 242, 109, 0.35)
  filter: blur(0.5px)
  pointer-events: none
  z-index: 0
  animation: ring-glow 3s ease-in-out infinite

.ring-left
  width: 260px
  height: 260px
  left: -160px
  top: -70px

.ring-right
  width: 420px
  height: 420px
  right: -267px
  top: -255px
  animation-delay: -1.5s

.icon-badge
  width: 96px
  height: 96px
  border-radius: 50%
  border: 1px solid rgba(72, 242, 109, 0.55)
  animation: badge-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both

.prompt-title
  line-height: 1.15
  animation: rise-in 0.4s ease-out 0.08s both

.prompt-subtitle
  color: rgba(255, 255, 255, 0.7)
  font-size: 15px !important
  line-height: 1.45
  animation: rise-in 0.4s ease-out 0.16s both

.cta-btn
  font-size: 1.05rem
  letter-spacing: 0
  box-shadow: 0 8px 32px rgba(72, 242, 109, 0.35)
  animation: rise-in 0.4s ease-out 0.24s both, cta-glow 3s ease-in-out 0.64s infinite

.prompt-privacy
  color: rgba(255, 255, 255, 0.6)
  animation: rise-in 0.4s ease-out 0.32s both

@keyframes ring-glow
  0%, 100%
    opacity: 0.85
  50%
    opacity: 1

@keyframes cta-glow
  0%, 100%
    box-shadow: 0 8px 32px rgba(72, 242, 109, 0.35)
  50%
    box-shadow: 0 8px 44px rgba(72, 242, 109, 0.55)

@keyframes badge-pop
  from
    opacity: 0
    transform: scale(0.8)
  to
    opacity: 1
    transform: scale(1)

@keyframes rise-in
  from
    opacity: 0
    transform: translateY(14px)
  to
    opacity: 1
    transform: translateY(0)
</style>