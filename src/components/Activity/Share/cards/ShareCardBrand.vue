<template>
  <span
    v-if="errored"
    key="fallback"
  >⚡</span>
  <img
    v-else
    key="logo"
    class="brand-logo"
    :src="logo"
    alt="Zen Move Fit"
    @error="errored = true"
  />
  Zen Move Fit
</template>

<script setup lang="ts">
import logo from "@/assets/images/logo.png";
const errored = ref(false);
</script>

<style lang="sass" scoped>
.brand-logo
  height: 1.3em
  width: 1.3em
  border-radius: 3px
  vertical-align: middle
  margin-right: 3px
  display: inline-block
  object-fit: cover
</style>