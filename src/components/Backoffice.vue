<template>
  <div class="w-100 h-100 d-flex flex-column justify-center align-center">
    <iframe
      v-if="token"
      ref="iframeEl"
      v-show="loaded"
      class="w-100 h-100 border-0"
      allow="clipboard-read; clipboard-write"
      :src="src"
      @load="loaded = true"
    ></iframe>

    <v-progress-circular
      v-if="!loaded"
      indeterminate
      color="primary"
      :size="50"
    />

    <!-- BOTTOM SHEET DE EXPLICAÇÃO DE BACKOFFICE -->
    <v-bottom-sheet
      v-if="mode === 'backoffice'"
      v-model="bottomSheet"
    >
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
              <v-icon color="primary" :size="30">
                mdi-information
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.label.backoffice") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
            {{ t("$vuetify.message.backoffice_message") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet = false"
          >{{ t("$vuetify.label.ok") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute } from "vue-router";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession";

/// DATA
const { t } = useLocale();
const route = useRoute();
const loaded = ref(false);
const persistentSession = usePersistentSession();
const bottomSheet = ref(false);
const iframeEl = ref<HTMLIFrameElement>();
let token = "";
const root = document.documentElement;

/// COMPUTED
const src = computed(() => `${import.meta.env.VITE_API_BACKOFFICE}?app=1&token=${token}&top=${getCssEnv("top-saved")}&bottom=${getCssEnv("bottom-saved")}`);
const mode = computed(() => route.query?.mode);

/// WATCH
watch(loaded, async (val) => {
  if (val) {
    const explanation = await persistentSession.get("explanation-backoffice");

    if (!explanation) {
      await persistentSession.set("explanation-backoffice", "1");
      bottomSheet.value = true;
    }
  }
});

/// LIFE CYCLES
onMounted(async () => {
  token = await persistentSession.get("token") ?? "";
  eventBus.on("BACK_BUTTON", backButton);
  window.addEventListener("message", onWindowMessage);
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", backButton);
  window.removeEventListener("message", onWindowMessage);
});

/// METHODS
const backButton = () => {
  iframeEl.value?.contentWindow?.postMessage({ type: "BACK_BUTTON" }, "*");
};

const onWindowMessage = (event: MessageEvent) => {
  if (event.data?.type !== "GO_HOME") return;
  eventBus.emit("BACK_ROUTER");
};

const getCssEnv = (key: string) => getComputedStyle(root).getPropertyValue(`--${key}`);
</script>