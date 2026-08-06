<template>
  <div class="d-flex justify-center align-center text-center py-4 text-grey-lighten-1">
    {{
      `${t("$vuetify.label.loading")}${dots}`
    }}
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const interval = ref<null | number>(null);
const dots = ref("");

/// LIFE CYCLES
onMounted(() => {
  interval.value = setInterval(() => {
    if (dots.value.length < 3) dots.value += ".";
    else dots.value = ".";
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval.value !== null) clearInterval(interval.value);
});
</script>