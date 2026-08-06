<template>
  <div ref="rootRef" class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_insights") }}</span>
      <span class="sc-premium">{{ t("$vuetify.share.premium_tag") }}</span>
    </div>

    <p class="sc-title">{{ t("$vuetify.share.insights_subtitle") }}</p>

    <div v-if="activity.insight" class="sc-insight-box">
      <p ref="textRef" class="sc-insight-text">{{ fittedText }}</p>
    </div>

    <div v-if="bullets.length" class="sc-bullets">
      <div v-for="(bullet, index) in bullets" :key="index" class="sc-bullet">
        <span class="sc-bullet-dot">●</span>
        <span class="sc-bullet-text">{{ bullet }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>

    <ShareCardFooter :activity="activity" :image-cache="imageCache" />
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useFitText } from "@/composables/use-fit-text";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardFooter from "./ShareCardFooter.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();
const rootRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const { fittedText } = useFitText(
  rootRef,
  textRef,
  () => props.activity.insight ?? "",
  { watchSources: () => props.format }
);

/// COMPUTED
const { cardStyle } = useShareCardIdentity(props);
const bullets = computed(() => {
  const training = props.activity.training_analysis;
  const challenge = props.activity.challenge_analysis;
  return (training?.coach_bullets ?? challenge?.coach_bullets ?? []).slice(0, 3).map((bullet) => {
    try {
      return t(`$vuetify.training_analysis.${bullet.key}`, bullet.params);
    } catch {
      return bullet.key;
    }
  });
});
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: linear-gradient(145deg, #0F1115, #0E1115)
  display: flex
  flex-direction: column
  padding: 0 32px 28px
  position: relative
  overflow: hidden
  box-sizing: border-box

.sc-glow
  position: absolute
  inset: 0
  background: radial-gradient(circle at 70% 30%, rgba(72, 242, 109, 0.09) 0%, transparent 55%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, #48F26D, transparent)
  margin-bottom: 24px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 6px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80

.sc-premium
  font-size: 10px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.12em
  opacity: 0.7

.sc-title
  font-size: 22px
  font-weight: 800
  color: #FFFFFFE6
  margin-bottom: 20px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-insight-box
  background: #48F26D0A
  border: 1px solid rgba(72, 242, 109, 0.1)
  border-radius: 14px
  padding: 20px
  margin-bottom: 20px

.sc-insight-text
  font-size: 15px
  color: #FFFFFFD1
  line-height: 1.65
  font-style: italic

.sc-bullets
  display: flex
  flex-direction: column
  gap: 12px

.sc-bullet
  display: flex
  align-items: flex-start
  gap: 10px

.sc-bullet-dot
  color: #48F26D
  font-size: 8px
  margin-top: 5px
  flex-shrink: 0

.sc-bullet-text
  font-size: 13px
  color: #FFFFFFB3
  line-height: 1.55
</style>