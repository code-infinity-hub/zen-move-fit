<template>
  <div class="activity-hero">
    <div
      class="w-100 overflow-hidden"
      :style="{ height: mapPicture ? '264px' : 'var(--top-saved)' }"
    >
      <img
        v-if="mapPicture"
        :src="mapPicture"
        class="hero-map-img"
      />
    </div>

    <!-- Top nav overlay -->
    <div
      class="hero-nav"
      :style="{ paddingTop: `calc(var(--top-saved) + 4px)` }"
    >
      <v-btn
        icon=""
        size="x-small"
        class="glass-btn"
        @click="emit('back')"
      >
        <v-icon :size="18">
          mdi-arrow-left
        </v-icon>
      </v-btn>

      <div class="d-flex align-center ga-1">
        <v-btn
          icon=""
          size="x-small"
          class="glass-btn"
          @click="emit('share')"
        >
          <v-icon :size="20">
            mdi-share-variant-outline
          </v-icon>
        </v-btn>

        <v-menu v-if="isOwn" location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon=""
              size="x-small"
              class="glass-btn"
              v-bind="menuProps"
            >
              <v-icon :size="20">
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <List :style="{ minWidth: 'auto' }">
            <v-list-item @click="emit('edit')">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-pencil-outline</v-icon>
                {{ t("$vuetify.activity_detail.edit") }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item @click="emit('delete')">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-trash-can-outline</v-icon>
                {{ t("$vuetify.activity_detail.delete") }}
              </v-list-item-title>
            </v-list-item>
          </List>
        </v-menu>
        <v-menu v-else-if="isShared" location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon=""
              size="x-small"
              class="glass-btn"
              v-bind="menuProps"
            >
              <v-icon :size="20">
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <List :style="{ minWidth: 'auto' }">
            <v-list-item class="text-error" @click="emit('untag')">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-account-remove-outline</v-icon>
                {{ t("$vuetify.label.untag_myself") }}
              </v-list-item-title>
            </v-list-item>
          </List>
        </v-menu>
      </div>
    </div>

    <!-- Bottom gradient + info overlay -->
    <div
      :style="{ position: mapPicture ? 'absolute' : 'relative' }"
      class="hero-bottom"
    >
      <p class="hero-type-label">
        {{ typeLabel }}
        <template v-if="workoutIntensity">
          <span class="hero-type-sep">·</span>
          {{ t(`$vuetify.activity_detail.workout_intensity_${workoutIntensity}`) }}
        </template>
      </p>

      <p v-if="title" class="hero-title font-space-grotesk">
        {{ title }}
      </p>

      <button
        v-if="condensedAddress"
        class="hero-address"
      >
        <v-icon
          color="red"
          :size="12"
          :style="{ opacity: '0.7' }"
        >mdi-map-marker</v-icon>

        {{ condensedAddress }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// COMPONENTS
import List from "../List.vue";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["back", "share", "edit", "delete", "untag"]);
const props = defineProps<{
  mapPicture: string | null
  title: string | null
  typeLabel: string
  address: string | null
  workoutIntensity?: string | null
  isOwn?: boolean
  isShared?: boolean
}>();

/// COMPUTED
const condensedAddress = computed(() => {
  if (!props.address) return null;

  const parts = props.address.split(" - ");

  if (parts.length >= 3) {
    const middle = parts[1]?.trim() ?? "";
    const state = parts[2]?.split(",")[0]?.trim() ?? "";
    return state ? `${middle} · ${state}` : middle;
  }

  if (parts.length >= 2) {
    return parts[1]?.split(",").slice(0, 2).join(",").trim() ?? null;
  }

  return props.address.split(",").slice(0, 2).join(",").trim() || null;
});
</script>

<style lang="sass" scoped>
div.activity-hero
  position: relative
  width: 100%

img.hero-map-img
  width: 100%
  height: 100%
  object-fit: cover

// Navigation buttons overlaid on top of the map
div.hero-nav
  position: fixed
  top: 0
  left: 0
  right: 0
  z-index: 2
  display: flex
  justify-content: space-between
  align-items: center
  padding-left: 12px
  padding-right: 12px
  padding-bottom: 12px
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.52) 0%, transparent 100%)

// Glass-effect buttons over the map
button.glass-btn
  background-color: var(--quintet) !important
  border: 1px solid var(--sextet) !important

  :deep(.v-icon)
    color: white !important

// Gradient + info at the bottom of the map
div.hero-bottom
  position: absolute
  bottom: 0
  left: 0
  right: 0
  padding: 52px 16px 14px
  background: linear-gradient(to top, var(--secondary) 0%, rgba(14, 17, 21, 0.88) 45%, transparent 100%)

p.hero-type-label
  font-size: 0.68rem
  font-weight: 700
  color: rgba(255, 255, 255, 0.5)
  text-transform: uppercase
  letter-spacing: 0.12em
  margin-bottom: 4px

.hero-type-sep
  opacity: 0.4
  margin: 0 3px

p.hero-title
  font-size: 1.35rem
  font-weight: 800
  color: white
  line-height: 1.2
  margin-bottom: 6px

button.hero-address
  display: flex
  align-items: center
  gap: 4px
  color: rgba(255, 255, 255, 0.62)
  font-size: 0.72rem
  background: none
  border: none
  cursor: pointer
  padding: 0

  &:active
    opacity: 0.65
</style>