<template>
  <div id="chat" class="w-100 h-100 d-flex flex-column">
    <div
      v-if="loading"
      class="w-100 h-100 d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <template v-else-if="profile">
      <!-- HEADER -->
      <header class="heading border-bottom-tertiary d-flex align-center ga-2">
        <v-icon @click="back">
          mdi-arrow-left
        </v-icon>

        <div>
          <ProfileImage
            size="2.5rem"
            :image="profile.image"
            :name="profile.name"
          />
        </div>

        <div class="flex-fill d-flex flex-column">
          <p class="font-weight-bold font-space-grotesk">
            {{ profile.name.split(" ").slice(0, 4).join(" ") }}
          </p>

          <p class="text-caption text-grey-lighten-1">
            {{ status }}
          </p>
        </div>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon=""
              size="small"
              color="transparent"
              v-bind="props"
            >
              <v-icon :size="20">
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <List :style="{ minWidth: 'auto' }">
            <v-list-item
              v-for="(option, i) in options"
              :key="i"
              @click="option.handle"
            >
              <v-list-item-title>
                <v-icon class="mr-2">
                  {{ option.icon }}
                </v-icon>

                {{ option.text }}
              </v-list-item-title>
            </v-list-item>
          </List>
        </v-menu>
      </header>

      <!-- CONTENT -->
      <div
        ref="content"
        class="overflow-y-auto flex-fill d-flex flex-column ga-4 px-2 py-3 list-chat"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @scroll="handleScroll"
      >
        <!-- CONVERSA NÃO INICIADA -->
        <div
          v-if="!socialStore.messages.results.size"
          class="w-100 h-100 d-flex flex-column justify-center align-center"
        >
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem bg-tertiary rounded-lg d-flex justify-center align-center">
              <v-icon color="primary" :size="30">
                mdi-chat-outline
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold">
            {{ t("$vuetify.message.this_conversation_hasnt_even_started_yet") }}
          </p>

          <p class="text-center text-body-2 text-grey-lighten-1">
            {{ t("$vuetify.message.take_the_first_step_and_start_the_conversation") }}
          </p>
        </div>

        <!-- LISTAGEM DAS MENSAGENS -->
        <template v-else>
          <!-- CARREGAMENTO DO RESTANTE DA CONVERSA -->
          <LoadingData v-if="loadingData" />

          <template
            v-for="date in Object.keys(messagesChat)"
            :key="date"
          >
            <div class="d-flex justify-center">
              <div class="rounded-lg pa-2 bg-yellow font-weight-bold">
                {{ formatDate(date) }}
              </div>
            </div>

            <div
              v-for="message in orderMessages(messagesChat[date]!)"
              :key="message.message_id"
              :class="[
                'd-flex',
                message.sender === account._id ? 'justify-end' : ''
              ]"
            >
              <div
                :class="[
                  'd-flex ga-2',
                  message.sender === account._id ? 'flex-row-reverse' : ''
                ]"
                :style="{
                  maxWidth: message.type === 'VOICE' ? '90%' : '80%',
                  minWidth: '30%'
                }"
              >
                <div>
                  <ProfileImage
                    size="2.2rem"
                    :image="message.sender === account._id ? account.image : profile.image"
                    :name="message.sender === account._id ? account.name : profile.name"
                  />
                </div>

                <div
                  :class="[
                    'w-100 flex-fill pa-2 rounded-lg d-flex flex-column ga-1',
                    message.sender === account._id ? 'bg-primary' : 'bg-quintet border-sextet'
                  ]"
                >
                  <span
                    v-if="message.type === 'TEXT'"
                    class="content-html overflow-x-auto"
                  >{{ message.text }}</span>
                  <img
                    v-else-if="message.type === 'IMAGE'"
                    :src="message.url"
                    :style="{ maxWidth: '100%' }"
                    class="rounded-lg"
                    @click="eventBus.emit('SHOW_IMAGE', { images: [message.url] })"
                    @load="!scrolling ? scrollDown() : null"
                  />
                  <audio
                    v-else
                    controls
                    controlsList="nodownload noremoteplayback noplaybackrate"
                    :class="message.sender === account._id ? 'me' : 'other'"
                    :src="message.url"
                    type="audio/mpeg"
                  ></audio>

                  <div
                    :class="[
                      'd-flex ga-1 align-center',
                      message.sender === account._id ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <span class="text-caption">
                      {{ dayjs(message.created_at).format("HH:mm") }}
                    </span>

                    <v-icon
                      v-if="message.sender === account._id"
                      :size="15"
                      :color="message.view ? 'blue' : ''"
                    >{{ message.view ? "mdi-check-all" : "mdi-check" }}</v-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- FOOTER -->
      <footer
        class="border-top-tertiary d-flex ga-2"
        :style="{ padding: `0.7rem 0.5rem calc(${openKeyboard ? '0.4rem' : 'var(--bottom-saved)'} + 0.3rem) 0.5rem` }"
      >
        <div
          :class="[
            'flex-fill bg-quintet border-sextet d-flex justify-center align-center ga-2 pl-4 pr-1',
            multipleLines ? 'rounded-lg' : 'rounded-pill'
          ]"
          :style="{ padding: '0.2rem 0' }"
        >
          <textarea
            ref="textarea"
            rows="1"
            class="flex-fill d-flex"
            :placeholder="t('$vuetify.label.type_your_message')"
            :style="{
              resize: 'none',
              outline: 'none',
              verticalAlign: 'middle',
              maxHeight: '30vh'
            }"
            v-model="input"
            @focus="focus = true"
            @blur="focus = false"
          ></textarea>

          <div class="h-100 d-flex">
            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn
                  size="x-small"
                  color="transparent"
                  :disabled="waiting"
                  :icon="!multipleLines"
                  :class="{ 'rounded-lg': multipleLines }"
                  :style="{ height: '32px' }"
                  @click=""
                  v-bind="props"
                >
                  <v-icon :size="20" color="grey-lighten-1">
                    mdi-emoticon
                  </v-icon>
                </v-btn>
              </template>

              <Emoji
                @add="(t) => input += t"
              />
            </v-menu>

            <v-btn
              size="x-small"
              color="transparent"
              :disabled="waiting"
              :icon="!multipleLines"
              :class="{ 'rounded-lg': multipleLines }"
              :style="{ height: '32px' }"
              @click="selectPhoto"
            >
              <v-icon :size="20" color="grey-lighten-1">
                mdi-image
              </v-icon>
            </v-btn>
          </div>
        </div>

        <v-btn
          size="small"
          color="primary"
          :icon="!multipleLines"
          :class="{ 'rounded-lg': multipleLines }"
          :style="{ height: '40px' }"
          :disabled="waiting || !input.replace(/[\n]/g, '').length"
          :loading="waiting"
          @click="send"
        >
          <v-icon :size="20">
            mdi-send
          </v-icon>
        </v-btn>
      </footer>

      <!-- BOTÃO PARA ROLAR PARA BAIXO -->
      <v-btn
        v-if="scrolling"
        icon=""
        size="small"
        class="position-fixed border-sextet"
        color="quintet"
        :style="{
          left: 'calc(100% / 2 - 28px / 2)',
          bottom: `calc(10% + ${openKeyboard ? 'var(--bottom-saved)' : '0px'})`
        }"
        @click="scrollDown(true)"
      >
        <v-icon>mdi-arrow-down</v-icon>
      </v-btn>

      <!-- BOTTOM SHEET DE DELETAR CONVERSA -->
      <v-bottom-sheet v-model="bottomSheet.delete_conversation">
        <v-card>
          <v-card-text class="py-5">
            <div class="d-flex justify-center align-center mb-5">
              <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
                <v-icon color="primary" :size="30">
                  mdi-trash-can-outline
                </v-icon>
              </div>
            </div>

            <p class="text-center font-weight-bold text-h6 mb-3">
              {{ t("$vuetify.label.delete_conversation") }}
            </p>

            <p
              class="text-center mb-5 text-grey-lighten-1"
              v-html="t('$vuetify.message.delete_conversation')"
            ></p>

            <v-btn
              block
              color="primary"
              class="font-weight-bold text-none pa-7 mb-3"
              @click="bottomSheet.delete_conversation = false"
            >{{ t("$vuetify.label.no") }}</v-btn>

            <v-btn
              block
              color="tertiary"
              class="font-weight-bold text-none pa-7"
              @click="deleteConversation"
            >{{ t("$vuetify.label.yes") }}</v-btn>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>
    </template>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts.ts";
import { useSocialStore } from "@/stores/social";
import { observerScroll } from "@/utils";
import { eventBus } from "@/eventBus.ts";
import { MediaService } from "@/services/media.service.ts";
import type { Message, Profile, SocialFriend } from "@/types/social.type";

/// COMPONENTS
import List from "./List.vue";
import LoadingData from "./LoadingData.vue";
import ProfileImage from "./ProfileImage.vue";
import Emoji from "./Emoji.vue";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();
const accountStore = useAccountsStore();
const socialStore = useSocialStore();

const loading = ref(true);

const textarea = useTemplateRef("textarea");
const input = ref("");
const lines = ref(1);
const focus = ref(false);
const openKeyboard = ref(false);
let timeoutFocus: null | number = null;

const waiting = ref(false);

const loadingData = ref(false);

const touching = ref(false);
const scrolling = ref(false);

const content = useTemplateRef("content");

const bottomSheet = reactive({ delete_conversation: false });

const profile = ref<Profile>();
const friendship = ref<null | SocialFriend>(null);

let interval: null | number = null;

let mediaService = new MediaService();

let observer: null | ReturnType<typeof observerScroll> = null;

let reservedText = "";

/// COMPUTED
const messages = computed(() => [...socialStore.messages.results.values()]);
const account = computed(() => accountStore.account);
const friendshipId = computed(() => route.query.chat as string);
const multipleLines = computed(() => lines.value >= 2);
const options = computed(() => [
  {
    icon: "mdi-account",
    text: t("$vuetify.label.view_profile"),
    handle: () => router.push({ name: "profile", params: { _id: profile.value!.account_id } })
  },
  {
    icon: "mdi-trash-can-outline",
    text: t("$vuetify.label.delete_conversation"),
    handle: () => bottomSheet.delete_conversation = true
  }
]);
const status = computed(() => {
  if (!profile.value) return "";
  if (profile.value.status === "ONLINE") return t("$vuetify.label.online");

  const today = dayjs();
  const lastTimeOnline = dayjs(profile.value.last_time_online || undefined);

  if (
    today.date() === lastTimeOnline.date() &&
    today.month() === lastTimeOnline.month() &&
    today.year() === lastTimeOnline.year()
  ) {
    return t("$vuetify.label.last_viewed", lastTimeOnline.format("HH:mm"));
  }

  if (today.year() === lastTimeOnline.year()) {
    return t(
      "$vuetify.label.last_viewed",
      lastTimeOnline.format(t("$vuetify.label.date_month_format"))
    );
  }

  return t(
    "$vuetify.label.last_viewed",
    lastTimeOnline.format(t("$vuetify.label.date_format"))
  );
});
const messagesChat = computed(() =>
  orderMessages(messages.value).reduce((acc, message) => {
    const date = dayjs(message.created_at).format("YYYY-MM-DD");
    if (!(date in acc)) acc[date] = [];
    acc[date]!.push(message);
    return acc;
  }, { } as Record<string, Message[]>)
);

/// WATCH
watch(input, (val) => {
  const element = textarea.value as HTMLElement;

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;

  const style = window.getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight);
  lines.value = Math.round(element.scrollHeight / lineHeight);
});

watch(focus, (val) => {
  if (val) {
    timeoutFocus = setTimeout(() => {
      openKeyboard.value = true;
      scrollDown();
    }, 300);
  } else {
    if (timeoutFocus !== null) clearTimeout(timeoutFocus);
    openKeyboard.value = false;
    scrollDown();
  }
});

watch(messages, async (val, oldVal) => {
  const messagesNotViewed = val.filter((message) =>
    message.receiver === account.value._id &&
    !message.view
  );

  if (messagesNotViewed.length) {
    await Promise.all(
      messagesNotViewed.map((message) =>
        socialStore.PATCH(`chats/${message.friendship_id}/messages/${message.message_id}`, { view: true })
      )
    );

    socialStore.GET_UNREAD_MESSAGES();
  }

  if (
    val.length > (oldVal?.length || 0) &&
    !scrolling.value
  ) {
    scrollDown();
  }
}, { immediate: true });

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);

  friendship.value = await socialStore.GET_FRIEND(friendshipId.value);

  if (!friendship.value || friendship.value?.status === "PENDING") {
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.conversation_not_found")
    });
    eventBus.emit("BACK_ROUTER");
    return;
  }

  socialStore.RESET_CHAT();
  socialStore.RESET_MESSAGES();

  socialStore.chat.friendship_id = friendship.value.friendship_id;

  await Promise.all([
    loadProfile(),
    socialStore.LOAD_MESSAGES(friendshipId.value)
  ]);

  interval = setInterval(handleInterval, 8000);

  loading.value = false;

  nextTick(async () => {
    await scrollDown();
    setTimeout(() => {
      observer = observerScroll(
        document.querySelector(".list-chat") as HTMLElement,
        handle,
        50,
        "UP"
      );
    }, 1000);
  });
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
  if (interval !== null) clearInterval(interval);
  observer?.disconnect();

  socialStore.RESET_CHAT();
  socialStore.RESET_MESSAGES();
});

/// METHODS
const formatDate = (date: string) => {
  return dayjs(date).format(t("$vuetify.label.date_format"));
};

const back = () => {
  eventBus.emit("BACK_ROUTER");
};

const orderMessages = (message: Message[]) => {
  return message.sort((a, b) =>
    dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()
  );
};

const handle = async () => {
  if (
    !loadingData.value &&
    (socialStore.messages.page + 1) <= socialStore.messages.pages
  ) {
    await loadOlderMessages(async () => {
      loadingData.value = true;
      await socialStore.LOAD_MESSAGES(friendshipId.value);
      loadingData.value = false;
    });
  }
};

const handleInterval = async () => {
  await loadProfile();
};

const loadProfile = async () => {
  profile.value = (await socialStore.GET_PROFILE(friendship.value!.account_id))!;
};

const handleTouchStart = () => {
  touching.value = true;
};

const handleTouchEnd = () => {
  touching.value = false;
};

const handleScroll = () => {
  if (touching.value) {
    scrolling.value = true;
  }

  const el = content.value!;
  const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;

  if (isBottom) scrolling.value = false;
};

const selectPhoto = async () => {
  waiting.value = true;

  try {
    const results = await mediaService.getFiles("Photo", 1);
    const { base64, format, mimetype } = results[0]!;

    await socialStore.SEND_MESSAGE(
      friendship.value!.friendship_id,
      { type: "IMAGE", base64, format, mimetype }
    );
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    waiting.value = false;
  }
};

const send = async () => {
  waiting.value = true;

  reservedText = input.value;
  input.value = "";

  const response = await socialStore.SEND_MESSAGE(
    friendship.value!.friendship_id,
    { type: "TEXT", text: reservedText }
  );

  waiting.value = false;

  if (response.error) {
    input.value = reservedText;
  } else {
    reservedText = "";
  }
};

const loadOlderMessages = async (callback: () => Promise<void>) => {
  const element = content.value! as HTMLDivElement;

  // Altura antes de carregar
  const oldHeight = element.scrollHeight;

  // Carrega mensagens antigas
  await callback();

  // Aguarda Vue renderizar
  await nextTick();

  // Nova altura
  const newHeight = element.scrollHeight;

  // Mantém o usuário na mesma posição visual
  element.scrollTop += (newHeight - oldHeight);
};

const scrollDown = async (forced = false, useNextTick = true) => {
  if ((scrolling.value || touching.value) && !forced) return;

  const element = content.value! as HTMLDivElement;

  if (!element) return;

  if (useNextTick) {
    await nextTick();

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth"
    });
  } else {
    element.scrollTop = element.scrollHeight;
  }
};

const deleteConversation = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });
  const response = await socialStore.DELETE(`chats/${friendshipId.value}`);

  eventBus.emit("SET_LOADER", { enabled: false });

  if (!response.error) {
    eventBus.emit("BACK_ROUTER");
  }
};
</script>

<style lang="sass">
div#chat
  audio
    &::-webkit-media-controls-timeline
      filter: hue-rotate(120deg)

    &::-webkit-media-controls-volume-slider
      filter: hue-rotate(120deg)

    &::-webkit-media-controls-enclosure
      background: transparent !important

    &::-webkit-media-controls-panel
      background: transparent !important

    &::-webkit-media-controls-overflow-button
      display: none !important

    &.me
      &::-webkit-media-controls-play-button
        background-color: transparent
        border-radius: 50%

      &::-webkit-media-controls-current-time-display, &::-webkit-media-controls-time-remaining-display
        color: #FFFFFF
        font-weight: bold

    &.other
      &::-webkit-media-controls-play-button
        background-color: transparent
        border-radius: 50%

      &::-webkit-media-controls-current-time-display, &::-webkit-media-controls-time-remaining-display
        color: #FFFFFF
        font-weight: bold
</style>