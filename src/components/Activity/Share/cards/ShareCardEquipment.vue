<template>
  <div class="sc-root" :style="cardStyle">
    <div class="sc-glow"></div>
    <div class="sc-accent-line"></div>

    <div class="sc-header">
      <span class="sc-badge">{{ t("$vuetify.share.badge_equipment") }}</span>
      <span class="sc-date">{{ formattedDate }}</span>
    </div>

    <p class="sc-section-label">{{ t("$vuetify.share.equipment_used_with") }}</p>

    <div class="sc-eq-card">
      <div class="sc-eq-icon">👟</div>
      <div class="sc-eq-info">
        <p class="sc-eq-name">{{ activity.equipment!.name }}</p>
        <p class="sc-eq-brand">{{ activity.equipment!.brand }}</p>
      </div>
      <div class="sc-eq-km">
        <span class="sc-eq-km-val">{{ formatNumber(activity.equipment!.distance_km) }}</span>
        <span class="sc-eq-km-unit">{{ t("$vuetify.share.total_km_label") }}</span>
      </div>
    </div>

    <div v-if="contributionKm" class="sc-contribution">
      <div class="sc-c-label">{{ t("$vuetify.share.equipment_contribution") }}</div>
      <div class="sc-c-value">
        <span class="sc-c-num">{{ `+${contributionKm}` }}</span>
        <span class="sc-c-unit">{{ t("$vuetify.label.km") }}</span>
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
import { useFormatNumber } from "@/composables";
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const props = defineProps<ShareCardProps>();

/// COMPUTED
const { cardStyle, initials, avatarSrc, dateLabel: formattedDate } = useShareCardIdentity(props);
const contributionKm = computed(() => {
  const distance = props.activity.metrics?.distance_meters;
  return distance ? formatNumber(distance / 1000) : null;
});
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
  background: radial-gradient(circle at 15% 15%, var(--sc-accent-10, rgba(72, 242, 109, 0.07)) 0%, transparent 55%)
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
  margin-bottom: 24px

.sc-badge
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.1em
  color: #FFFFFF80
  text-transform: uppercase

.sc-date
  font-size: 11px
  color: #FFFFFF59

.sc-section-label
  font-size: 12px
  font-weight: 600
  color: #FFFFFF59
  text-transform: uppercase
  letter-spacing: 0.08em
  margin-bottom: 16px

.sc-eq-card
  display: flex
  align-items: center
  gap: 20px
  padding: 20px
  background: #FFFFFF0A
  border: 1px solid rgba(255, 255, 255, 0.07)
  border-radius: 16px
  margin-bottom: 24px

.sc-eq-icon
  font-size: 40px
  flex-shrink: 0

.sc-eq-info
  flex: 1

.sc-eq-name
  font-size: 20px
  font-weight: 700
  color: #FFFFFFE6
  margin-bottom: 4px
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-eq-brand
  font-size: 13px
  color: #FFFFFF73

.sc-eq-km
  display: flex
  flex-direction: column
  align-items: flex-end

.sc-eq-km-val
  font-size: 22px
  font-weight: 800
  color: var(--sc-accent, #48F26D)
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-eq-km-unit
  font-size: 10px
  color: #FFFFFF59
  text-align: right

.sc-contribution
  display: flex
  align-items: center
  justify-content: space-between
  padding: 12px 16px
  background: var(--sc-accent-10, rgba(72, 242, 109, 0.08))
  border: 1px solid var(--sc-accent-30, rgba(72, 242, 109, 0.2))
  border-radius: 12px

.sc-c-label
  font-size: 13px
  color: #FFF9

.sc-c-value
  display: flex
  align-items: baseline
  gap: 4px

.sc-c-num
  font-size: 20px
  font-weight: 800
  color: var(--sc-accent, #48F26D)
  font-family: "Space Grotesk", system-ui, sans-serif

.sc-c-unit
  font-size: 12px
  color: #FFFFFF73

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
  color: #FFFC

.sc-brand
  font-size: 11px
  font-weight: 700
  color: var(--sc-accent, #48F26D)
  letter-spacing: 0.05em
  opacity: 0.75
</style>