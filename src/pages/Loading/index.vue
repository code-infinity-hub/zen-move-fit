<template>
  <div class="w-100 h-100 d-flex flex-column align-center py-10 bg-secondary">
    <div class="flex-fill d-flex flex-column justify-center align-center">
      <img
        src="@/assets/images/zena-thinking-animation.svg"
        :style="{ width: '7rem' }"
      />

      <p
        class="font-space-grotesk font-weight-bold"
        :style="{ fontSize: '1.3rem', position: 'relative', top: '-0.8rem' }"
      >{{ t("$vuetify.company_name") }}</p>
    </div>

    <img
      src="@/assets/images/codeinfinity-powered-by-logo.png"
      :style="{ width: '8rem' }"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { Capacitor, sync, reload } from "@/mobile";
import { eventBus } from "@/eventBus";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();
const persistentSession = usePersistentSession();

let timeout: number | null = null;

/// LIFE CYCLES
onMounted(async () => {
  const minimumSplashDuration = new Promise<void>((resolve) => {
    timeout = setTimeout(resolve, 2200);
  });

  if (import.meta.env.PROD && Capacitor.isNativePlatform()) {
    try {
      const result = await sync();

      if (result.activeApplicationPathChanged) {
        eventBus.emit("SNACKBAR", { message: t("$vuetify.message.applying_update") });
        await reload();
        return;
      }
    } catch {
      /// sem rede, canal indisponível etc. — segue com o bundle atual
    }
  }

  await minimumSplashDuration;

  const isLogged = await persistentSession.isLogged();

  if (route.name === "loading") {
    router.push({ name: isLogged ? "dashboard" : "login" });
  }
});

onBeforeUnmount(() => {
  if (timeout !== null) clearTimeout(timeout);
});
</script>