<template>
  <div
    :class="[
      'image-profile background d-flex justify-center align-center',
      !loading && props.loadedBorder ? `border-sm border-opacity-100 border-${props.loadedBorder}` : '',
      props.image ? '' : 'bg-theme-primary-15'
    ]"
    :style="{
      width: props.width || props.size,
      height: props.height || props.size,
      containerType: 'inline-size',
      ...(props.image && { backgroundImage: `url(${profile})` })
    }"
  >
    <v-skeleton-loader
      v-if="loading"
      type="image"
    />
    <span
      v-else-if="!profile"
      :style="{ fontSize: `${props.fontSize}cqw` }"
      class="font-weight-bold text-primary text-uppercase"
    >{{ props.name.split(" ")[0]?.split("")[0] }}</span>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  width?: string,
  height?: string,
  size?: string,
  image?: string,
  loadedBorder?: string,
  fontSize?: number,
  name: string,
};

const props = withDefaults(defineProps<Props>(), {
  size: "72px",
  loadedBorder: "primary",
  fontSize: 45
});

/// DATA
const loading = ref(true);
const profile = ref("");

/// WATCH
watch(() => props.image, (val) => {
  if (val) {
    profile.value = val;

    const image = new Image();

    image.onload = () => {
      loading.value = false;
    };

    image.onerror = () => {
      profile.value = "";
      loading.value = false;
    };

    image.src = val;
  } else {
    loading.value = false;
  }
}, { immediate: true });
</script>

<style lang="sass">
div.image-profile
  border-radius: 50%

  div.v-skeleton-loader
    width: 100%
    height: 100%
    border-radius: 50%

    div.v-skeleton-loader__image
      width: 100%
      height: 100%
      border-radius: 50%
</style>