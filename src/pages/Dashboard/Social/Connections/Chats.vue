<template>
  <div class="w-100 h-100 d-flex flex-column">
    <div
      v-if="!conversations.length"
      class="flex-fill d-flex flex-column justify-center align-center ga-7"
    >
      <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
        <v-icon color="primary" :size="65">
          mdi-package-variant
        </v-icon>
      </div>

      <p class="text-center font-weight-bold text-h5 font-space-grotesk">
        {{ t("$vuetify.message.no_conversations_have_begun") }}
      </p>

      <v-btn
        color="primary"
        class="w-100 pa-7 d-flex text-h6 font-weight-bold"
        @click="startNow"
      >{{ t("$vuetify.label.start_now") }}</v-btn>
    </div>
    <template v-else>
      <p class="font-space-grotesk text-body-2 font-weight-bold text-grey-lighten-1 mb-3">
        {{ `${t("$vuetify.label.conversations")} (${formatNumber(socialStore.chats.total)})` }}
      </p>

      <div class="d-flex flex-column ga-3">
        <div
          v-ripple
          v-for="conversation in conversations"
          :key="conversation.friendship_id"
          class="rounded-lg bg-quintet border-sextet d-flex justify-center align-center ga-3 px-3 py-3"
          @click="selectChat($event, conversation.friendship_id)"
        >
          <div>
            <ProfileImage
              size="3rem"
              :image="conversation.account.image"
              :name="conversation.account.name"
            />
          </div>

          <div class="w-100 d-flex flex-column ga-1 text-left overflow-hidden">
            <div class="w-100 d-flex ga-1 mb-1">
              <span class="font-weight-bold text-truncate">
                {{ conversation.account.name.split(" ").slice(0, 3).join(" ") }}
              </span>

              <v-icon
                v-if="conversation.account.verified"
                color="blue"
                @click="bottomSheet.verified = true"
              >mdi-shield-check</v-icon>
            </div>

            <p
              class="text-grey-lighten-1 text-truncate"
              :style="{ fontSize: '0.65rem' }"
            >
              <v-icon
                v-if="conversation.message.sender._id === account._id"
                :color="conversation.message.view ? 'blue' : ''"
              >{{ conversation.message.view ? "mdi-check-all" : "mdi-check" }}</v-icon>

              {{ conversation.message.sender._id === account._id ? `${t("$vuetify.label.you")}:` : "" }}

              {{
                conversation.message.type === "TEXT" ? conversation.message.text : t(`$vuetify.label.${conversation.message.type.toLowerCase()}_message`)
              }}
            </p>
          </div>

          <div class="text-caption text-grey-lighten-1">
            {{ formatTimestampMessage(conversation.message.created_at) }}
          </div>

          <div v-if="conversation.unread">
            <v-chip color="primary">
              {{ formatNumber(conversation.unread) }}
            </v-chip>
          </div>
        </div>
      </div>

      <!-- LOADING DE CARREGAMENTO DE DADOS -->
      <LoadingData v-if="loadingData" />
    </template>

    <!-- EXPLICAÇÃO DE PERFIL VERIFICADO -->
    <AuthenticatedAccount
      v-model="bottomSheet.verified"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { observerScroll } from "@/utils";
import { useAccountsStore } from "@/stores/accounts";
import { useSocialStore } from "@/stores/social";
import { useFormatNumber } from "@/composables";

/// COMPONENTS
import AuthenticatedAccount from "@/components/AuthenticatedAccount.vue";
import LoadingData from "@/components/LoadingData.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const socialStore = useSocialStore();

const loadingData = ref(false);

const bottomSheet = reactive({ verified: false });

const account = computed(() => accountsStore.account);

let observer: null | ReturnType<typeof observerScroll> = null;

/// COMPUTED
const conversations = computed(() =>
  [...socialStore.chats.results.values()].sort((a, b) =>
    dayjs(a.message.created_at).valueOf() - dayjs(b.message.created_at).valueOf()
  )
);

/// LIFE CYCLES
onMounted(() => {
  observer = observerScroll(
    document.querySelector(".overflow-social") as HTMLElement,
    handle
  );
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

/// METHODS
const handle = async () => {
  if (
    !loadingData.value &&
    (socialStore.chats.page + 1) <= socialStore.chats.pages
  ) {
    loadingData.value = true;
    await socialStore.GET_CHATS();
    loadingData.value = false;
  }
};

const startNow = () => {
  router.replace({
    replace: true,
    query: { ...route.query, option: "friends" }
  });
};

const selectChat = (event: Event, friendship_id: string) => {
  const tagName = (event.target as HTMLElement).tagName.toLowerCase();

  if (!["button", "i"].includes(tagName)) {
    eventBus.emit("OPEN_CHAT", { friendship_id });
  }
};

const formatTimestampMessage = (created_at: string) => {
  const createdAt = dayjs(created_at);
  const today = dayjs();

  if (
    createdAt.date() === today.date() &&
    createdAt.month() === today.month() &&
    createdAt.year() === today.year()
  ) {
    return createdAt.format("HH:mm");
  }

  if (createdAt.year() === today.year()) {
    return createdAt.format(t("$vuetify.label.date_month_format"));
  }

  return createdAt.format(t("$vuetify.label.date_format"));
};
</script>