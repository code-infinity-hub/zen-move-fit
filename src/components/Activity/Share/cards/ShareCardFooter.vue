<template>
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
</template>

<script setup lang="ts">
import { useShareCardIdentity } from "@/composables/use-share-card-identity";
import { type ShareCardProps } from "@/types/global.type";

/// COMPONENTS
import ShareCardBrand from "./ShareCardBrand.vue";

const props = defineProps<ShareCardProps>();

/// DATA
const { initials, avatarSrc } = useShareCardIdentity(props);
</script>

<style lang="sass" scoped>
.sc-footer
  display: flex
  align-items: center
  justify-content: space-between
  padding-top: 16px
  border-top: 1px solid rgba(255, 255, 255, 0.07)

.sc-user
  display: flex
  align-items: center
  gap: 10px

.sc-avatar
  width: 30px
  height: 30px
  border-radius: 50%
  background: #48F26D26
  border: 1.5px solid rgba(72, 242, 109, 0.3)
  display: flex
  align-items: center
  justify-content: center
  font-size: 13px
  font-weight: 700
  color: #48F26D

.sc-avatar-img
  width: 100%
  height: 100%
  border-radius: 50%
  object-fit: cover

.sc-username
  font-size: 13px
  font-weight: 600
  color: #FFFFFFBF

.sc-brand
  font-size: 11px
  font-weight: 700
  color: #48F26D
  letter-spacing: 0.05em
  opacity: 0.7
</style>