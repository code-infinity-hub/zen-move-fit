<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_recovery") }}</span>
      <span class="sc-date">{{ dateLabel }}</span>
    </div>

    <div class="sc-primary">
      <div class="sc-hours-display">
        <span class="sc-hours-val">{{ recovery.hours }}</span>
        <span class="sc-hours-unit">h</span>
      </div>
      <p class="sc-hours-label">{{ t("$vuetify.share.recovery_recommended") }}</p>
    </div>

    <div class="sc-quality-chip">{{ qualityLabel }}</div>

    <p v-if="descriptionLabel" class="sc-description">
      {{ descriptionLabel }}
    </p>

    <div v-if="primaryMuscles.length" class="sc-muscles">
      <p class="sc-muscles-label">{{ t("$vuetify.share.muscles_recovering") }}</p>
      <div class="sc-muscles-list">
        <span
          v-for="muscle in primaryMuscles"
          :key="muscle"
          class="sc-muscle-chip"
        >{{ t(`$vuetify.muscle_groups.${muscle}`) }}</span>
      </div>
    </div>

    <div :style="{ flex: 1 }"></div>
    <div class="sc-divider"></div>

    <div class="sc-footer">
      <div class="sc-user">
        <div class="sc-avatar">
          <img v-if="avatarSrc" :src="avatarSrc" class="sc-avatar-img" />
          <span v-else>{{ initials }}</span>
        </div>
        <span class="sc-username">{{ activity.account.name }}</span>
      </div>
      <span class="sc-brand">
        <ShareCardBrand />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, initials, avatarSrc, dateLabel } = useShareCardIdentity(props);
const recovery = computed(() => props.activity.analysis!.recovery!);
const qualityLabel = computed(() => t(`$vuetify.activity_analysis.${recovery.value.label_key}`));
const descriptionLabel = computed(() => t(`$vuetify.activity_analysis.${recovery.value.description_key}`));
const primaryMuscles = computed(() => props.activity.training_analysis?.recovery?.primary_muscles ?? []);
</script>

<style lang="sass" scoped>
.sc-root
  width: 540px
  height: 540px
  background: #0E1115
  display: flex
  flex-direction: column
  padding: 0 32px 28px
  position: relative
  overflow: hidden
  box-sizing: border-box

.sc-glow
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: radial-gradient(circle at 80% 20%, var(--sc-accent-10, rgba(72, 242, 109, 0.06)) 0%, transparent 50%)
  pointer-events: none

.sc-accent-line
  width: 100%
  height: 2px
  background: linear-gradient(to right, var(--sc-accent, #48F26D), transparent)
  margin-bottom: 28px

.sc-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 28px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80
  text-transform: uppercase

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-primary
  display: flex
  align-items: baseline
  gap: 12px
  margin-bottom: 10px

.sc-hours-display
  display: flex
  align-items: baseline
  gap: 4px

.sc-hours-val
  font-size: 80px
  font-weight: 800
  color: var(--sc-accent, #48F26D)
  line-height: 1
  font-family: "Space Grotesk", system-ui, sans-serif
  letter-spacing: -3px

.sc-hours-unit
  font-size: 28px
  font-weight: 700
  color: #FFFFFF99

.sc-hours-label
  font-size: 15px
  color: #FFFFFF73
  max-width: 180px
  line-height: 1.3

.sc-quality-chip
  display: inline-block
  font-size: 12px
  font-weight: 700
  letter-spacing: 0.08em
  text-transform: uppercase
  color: var(--sc-accent, #48F26D)
  background: var(--sc-accent-10, rgba(72, 242, 109, 0.1))
  border: 1px solid var(--sc-accent-30, rgba(72, 242, 109, 0.25))
  padding: 5px 14px
  border-radius: 20px
  margin-bottom: 18px

.sc-description
  font-size: 14px
  color: #FFFFFF8C
  line-height: 1.5
  margin-bottom: 20px

.sc-muscles
  margin-bottom: 4px

.sc-muscles-label
  font-size: 11px
  font-weight: 600
  color: #FFFFFF4D
  text-transform: uppercase
  letter-spacing: 0.06em
  margin-bottom: 8px

.sc-muscles-list
  display: flex
  flex-wrap: wrap
  gap: 6px

.sc-muscle-chip
  font-size: 11px
  font-weight: 600
  color: #FFFFFF8C
  background: #FFFFFF0D
  border: 1px solid rgba(255, 255, 255, 0.08)
  padding: 4px 10px
  border-radius: 8px

.sc-divider
  height: 1px
  background: #FFFFFF12
  margin: 0 0 20px

.sc-footer
  display: flex
  align-items: center
  justify-content: space-between

.sc-user
  display: flex
  align-items: center
  gap: 10px

.sc-avatar
  width: 30px
  height: 30px
  border-radius: 50%
  background: var(--sc-accent-15, rgba(72, 242, 109, 0.15))
  border: 1.5px solid var(--sc-accent-30, rgba(72, 242, 109, 0.3))
  display: flex
  align-items: center
  justify-content: center
  font-size: 13px
  font-weight: 700
  color: var(--sc-accent, #48F26D)

.sc-avatar-img
  width: 100%
  height: 100%
  border-radius: 50%
  object-fit: cover

.sc-username
  font-size: 13px
  font-weight: 600
  color: #FFFFFFCC

.sc-brand
  font-size: 11px
  font-weight: 700
  color: var(--sc-accent, #48F26D)
  letter-spacing: 0.05em
  opacity: 0.75
</style>