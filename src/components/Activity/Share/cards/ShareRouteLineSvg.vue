<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    :style="{ position: 'absolute', inset: '0', width: '100%', height: '100%' }"
  >
    <defs>
      <filter :id="`glow-${uid}`" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath v-if="markers" :id="`finish-clip-${uid}`">
        <circle :cx="markers.end.x" :cy="markers.end.y" r="6" />
      </clipPath>
    </defs>

    <path
      v-if="routePath"
      :d="routePath"
      fill="none"
      stroke="#48F26D"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-opacity="0.95"
      :filter="`url(#glow-${uid})`"
    />

    <template v-if="markers">
      <!-- Start: green dot + white ring + green glow — mirrors map.service.ts addStartMarker -->
      <circle :cx="markers.start.x" :cy="markers.start.y" r="13" fill="rgba(72, 242, 109, 0.28)" />
      <circle :cx="markers.start.x" :cy="markers.start.y" r="7.5" fill="#48F26D" stroke="#FFFFFF" stroke-width="3" />

      <!-- Finish: dark disc + checkered finish flag + white ring + dark glow — mirrors map.service.ts addFinishMarker -->
      <circle :cx="markers.end.x" :cy="markers.end.y" r="14" fill="rgba(0, 0, 0, 0.4)" />
      <circle :cx="markers.end.x" :cy="markers.end.y" r="7.5" fill="#111111" stroke="#FFFFFF" stroke-width="3" />
      <image
        :href="finishFlag"
        :x="markers.end.x - 6"
        :y="markers.end.y - 6"
        width="12"
        height="12"
        preserveAspectRatio="xMidYMid slice"
        :clip-path="`url(#finish-clip-${uid})`"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { projectRoute, toSmoothPath, getRouteMarkers } from "@/utils/route-projection";
import { type RoutePoint } from "@/types/share.type";
import finishFlag from "@/assets/images/finish-flag.png?inline";

/// DATA
const props = defineProps<{
  routePoints: RoutePoint[],
  width: number,
  height: number,
  padding?: number,
  uid: string,
}>();

/// COMPUTED
const padding = computed(() => props.padding ?? 48);
const projected = computed(() => projectRoute(props.routePoints, props.width, props.height, padding.value));
const routePath = computed(() => (projected.value.length ? toSmoothPath(projected.value) : null));
const markers = computed(() => getRouteMarkers(projected.value));
</script>