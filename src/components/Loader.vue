<template>
  <div
    v-if="props.modelValue"
    id="loader"
  >
    <div class="content">
      <v-progress-circular
        color="primary"
        indeterminate
      />

      <p class="mt-5">
        {{ `${t("$vuetify.label.loading")}${dotsLoader}` }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const props = defineProps<{ modelValue: boolean }>();
const intervalLoader = ref(0);
const dotsLoader = ref("");

/// WATCH
watch(() => props.modelValue, (val) => {
  if (val) startLoader();
  else stopLoader();
});

/// LIFE CYCLES
onMounted(() => {
  if (props.modelValue) {
    startLoader();
  }
});

/// METHODS
const startLoader = () => {
  intervalLoader.value = setInterval(() => {
    if (dotsLoader.value.length < 3) dotsLoader.value += ".";
    else dotsLoader.value = "";
  }, 1000);
};

const stopLoader = () => {
  clearInterval(intervalLoader.value);
  dotsLoader.value = "";
};
</script>

<style lang="sass" scoped>
div#loader
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: rgba(0, 0, 0, 0.48)
  backdrop-filter: saturate(1.1) blur(2px)
  display: flex
  justify-content: center
  align-items: center
  z-index: 10002

  div.content
    width: 50%
    padding: 1.5rem 1rem
    background-color: var(--tertiary)
    border-radius: 12px
    display: flex
    flex-direction: column
    align-items: center

    p
      color: var(--quaternary)
</style>