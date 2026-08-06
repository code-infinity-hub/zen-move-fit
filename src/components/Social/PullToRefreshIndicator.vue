<template>
  <div class="ptr-wrapper">
    <div
      class="ptr-bubble elevation-3 bg-quintet border-sextet"
      :class="{ 'ptr-releasing': !isPulling && !isRefreshing }"
      :style="{ transform: `translateY(${bubbleOffset}px)` }"
    >
      <v-progress-circular
        v-if="isRefreshing"
        indeterminate
        color="primary"
        :size="22"
        :width="2.5"
      />
      <v-icon
        v-else
        :style="{ transform: `rotate(${iconRotation}deg)` }"
        color="primary"
        :size="22"
      >mdi-refresh</v-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
const BUBBLE_SIZE = 40;
const REVEAL_OFFSET = 80;

const props = defineProps<{
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  threshold: number;
}>();

/// COMPUTED
const iconRotation = computed(() =>
  Math.min((props.pullDistance / props.threshold) * 360, 360)
);

const bubbleOffset = computed(() => {
  const ratio = Math.min(props.pullDistance, props.threshold) / props.threshold;
  return ratio * (BUBBLE_SIZE + 2 * REVEAL_OFFSET) - (BUBBLE_SIZE + REVEAL_OFFSET);
});
</script>

<style lang="sass" scoped>
.ptr-wrapper
  position: fixed
  top: calc(var(--top-saved) - 30px)
  left: 0
  right: 0
  display: flex
  justify-content: center
  pointer-events: none
  z-index: 2000

.ptr-bubble
  width: 40px
  height: 40px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center

.ptr-releasing
  transition: transform 0.3s ease
</style>