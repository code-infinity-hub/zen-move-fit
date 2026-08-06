<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <!-- HEADER -->
    <header class="heading border-bottom-tertiary d-flex align-center ga-2">
      <v-icon @click="back">
        mdi-arrow-left
      </v-icon>

      <div>
        <div
          class="size-2-5rem background rounded-circle bg-primary border-sm border-tertiary border-opacity-100"
          :style="{ backgroundImage: `url(${Zena})` }"
        ></div>
      </div>

      <div class="flex-fill d-flex flex-column">
        <p class="font-weight-bold font-space-grotesk">
          {{ aiName }}

          <span class="border-sm border-primary border-opacity-100 bg-theme-primary-15 text-caption text-primary font-weight-bold px-2 rounded-lg ml-1">
            BETA
          </span>
        </p>

        <p class="text-caption text-grey-lighten-1">
          {{ t("$vuetify.message.your_smart_fitness_coach") }}
        </p>
      </div>

      <v-btn
        icon=""
        size="small"
        color="transparent"
      >
        <img
          @click="menu = true"
          src="@/assets/images/sidebar-toggle-right.svg"
        />
      </v-btn>
    </header>

    <!-- CONTENT -->
    <div
      ref="content"
      class="overflow-y-auto flex-fill d-flex flex-column ga-4 px-2 py-3"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @scroll="handleScroll"
    >
      <div
        v-for="message in messages"
        :key="message.message_id"
        :class="[
          'd-flex',
          message.role === 'user' ? 'justify-end' : ''
        ]"
      >
        <div
          :class="[
            'd-flex ga-2',
            message.role === 'user' ? 'flex-row-reverse' : ''
          ]"
          :style="{ maxWidth: '80%' }"
        >
          <div>
            <ProfileImage
              v-if="message.role === 'user'"
              size="2.2rem"
              :image="account.image"
              :name="account.name"
            />
            <div
              v-else
              class="border-tertiary background rounded-circle size-2-2rem bg-primary"
              :style="{ backgroundImage: `url(${Zena})` }"
            ></div>
          </div>

          <div
            :class="[
              'w-100 flex-fill pa-2 rounded-lg d-flex flex-column ga-1',
              message.role === 'system' ? 'pt-0' : 'bg-quintet border-sextet'
            ]"
            @click="copyMessage(message.content)"
          >
            <span
              class="content-html overflow-x-auto"
              v-html="formatMD(message.content)"
            ></span>

            <div
              v-if="message.actions?.length"
              class="d-flex flex-wrap ga-2 mt-1"
            >
              <v-btn
                v-for="action in message.actions"
                :key="action.id"
                size="small"
                variant="tonal"
                color="primary"
                class="text-none"
                @click.stop="handleAction(action.id)"
              >{{ action.label }}</v-btn>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="waiting && messages[messages.length - 1]!.role === 'user'"
        class="d-flex align-center"
      >
        <img
          src="@/assets/images/zena-thinking-animation.svg"
          :style="{ width: '3rem' }"
        />

        <p class="text-body-2 text-grey-lighten-1">
          {{ `${t("$vuetify.message.zena_is_thinking")}${dots}` }}
        </p>
      </div>
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
          :placeholder="t('$vuetify.label.ask_zena')"
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

        <div
          v-if="availableSpeechRecognition"
          class="h-100"
        >
          <v-btn
            size="x-small"
            :disabled="waiting"
            :icon="!multipleLines"
            :class="{ 'rounded-lg': multipleLines }"
            :style="{ height: '32px' }"
            :color="microphoneStarted ? 'primary' : 'transparent'"
            @click="toggleMicrophone"
          >
            <v-icon
              :size="20"
              :color="microphoneStarted ? 'black' : 'grey-lighten-1'"
            >
              {{
                microphoneStarted ? "mdi-stop" : "mdi-microphone-outline"
              }}
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
        @click="send"
      >
        <v-icon :size="20">
          mdi-send
        </v-icon>
      </v-btn>
    </footer>

    <!-- BOTÃO PARA ROLAR PARA BAIXO -->
    <v-btn
      v-if="scrolling && !menu && !bottomSheet.ai_settings"
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

    <!-- MENU -->
    <div
      :class="{ overlay: true, active: menu }"
      @click="menu = false"
    ></div>

    <aside
      :class="[
        'd-flex flex-column overflow-hidden',
        menu ? 'open' : ''
      ]"
    >
      <header class="border-bottom-tertiary d-flex align-center ga-2 px-2 py-1">
        <div>
          <div
            class="size-2-5rem background rounded-circle bg-primary border-sm border-tertiary border-opacity-100"
            :style="{ backgroundImage: `url(${Zena})` }"
          ></div>
        </div>

        <div class="flex-fill d-flex flex-column">
          <p class="font-weight-bold font-space-grotesk">
            {{ aiName }}
          </p>
        </div>

        <v-btn
          icon=""
          size="small"
          color="transparent"
        >
          <v-icon
            :size="20"
            @click="menu = false"
          >mdi-close</v-icon>
        </v-btn>
      </header>

      <div class="overflow-y-auto flex-fill d-flex flex-column ga-2 px-2 py-2">
        <v-btn
          class="pa-5 position-relative text-none"
          color="primary"
          @click="newConversation"
        >
          <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex align-center ga-2 px-3">
            <v-icon>
              mdi-plus
            </v-icon>

            {{ t("$vuetify.label.new_conversation") }}
          </div>
        </v-btn>

        <template v-if="history.length">
          <v-divider class="my-3"></v-divider>

          <p class="font-weight-bold text-body-2 mb-1">
            {{ `${t("$vuetify.label.history")}: ${history.length}` }}
          </p>

          <v-btn
            v-for="item in history"
            :key="item._id"
            :color="item._id === chatId ? 'tertiary' : 'transparent'"
            class="pa-5 position-relative text-none"
            @click="selectConversation(item._id)"
          >
            <div class="position-absolute top-0 left-0 right-0 bottom-0 ga-2 px-3 d-flex ga-3 align-center">
              <span class="text-left text-truncate flex-fill">
                {{ item.title }}
              </span>

              <v-menu
                v-model="menuChat"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    @click="menuId = item._id"
                  >mdi-dots-vertical</v-icon>
                </template>

                <List
                  v-if="menuId === item._id"
                  class="px-2"
                >
                  <v-list-item-title>
                    <v-btn
                      block
                      color="secondary"
                      class="position-relative text-none"
                      :style="{ height: '4rem' }"
                      @click="menuId = item._id; menuChat = false; bottomSheet.delete_chat = true;"
                    >
                      <div class="position-absolute top-0 left-0 right-0 bottom-0 pa-2 d-flex align-center ga-3">
                        <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                          <v-icon :size="25">
                            mdi-trash-can-outline
                          </v-icon>
                        </div>

                        <span class="text-h6">
                          {{ t("$vuetify.label.delete_chat") }}
                        </span>
                      </div>
                    </v-btn>
                  </v-list-item-title>
                </List>
              </v-menu>
            </div>
          </v-btn>
        </template>
      </div>

      <footer class="border-top-tertiary d-flex flex-column ga-2 px-2 py-1">
        <v-btn
          class="pa-5 position-relative text-none"
          color="transparent"
          @click="bottomSheet.ai_settings = true"
        >
          <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex align-center ga-2 px-3">
            <v-icon>
              mdi-cog-outline
            </v-icon>

            {{ t("$vuetify.label.ai_settings") }}
          </div>
        </v-btn>

        <v-btn
          :ripple="false"
          class="pa-5 position-relative text-none"
          color="transparent"
        >
          <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex align-center ga-2 px-3">
            <div class="flex-fill text-left">
              <v-icon color="primary">
                mdi-flash-outline
              </v-icon>

              {{ t("$vuetify.label.credits") }}
            </div>

            <div class="font-weight-bold text-primary">
              {{ formatNumber(credits) }}
            </div>
          </div>
        </v-btn>
      </footer>
    </aside>

    <!-- BOTTOM SHEET DE CONFIGURAÇÃO DA IA -->
    <v-bottom-sheet v-model="bottomSheet.ai_settings">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.ai_settings = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5 d-flex flex-column overflow-hidden">
          <v-form
            ref="form"
            class="flex-fill overflow-x-hidden overflow-y-auto"
            @submit.prevent="submit"
          >
            <p class="mb-5 d-flex ga-3 font-weight-bold">
              <v-icon color="primary">
                mdi-cog-outline
              </v-icon>

              {{ t("$vuetify.label.zena_settings") }}
            </p>

            <TextField
              class="mb-5"
              v-model="nickname"
              :label="t('$vuetify.message.what_do_you_want_to_be_called')"
              :placeholder="t('$vuetify.message.your_name_or_nickname')"
            />

            <div class="mb-8">
              <p class="mb-2 text-subtitle-2">
                {{ t("$vuetify.label.ai_style") }}
              </p>

              <v-row class="mb-1">
                <v-col cols="6" sm="6" md="6" lg="6" class="pr-1 pb-0">
                  <div
                    :class="[
                      'h-100 pa-3 rounded-lg',
                      style === 'motivational' ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15' : 'border-sextet bg-quintet'
                    ]"
                    @click="style = 'motivational'"
                  >
                    <p
                      :class="[
                        'font-space-grotesk font-weight-bold mb-1',
                        style === 'motivational' ? 'text-primary' : ''
                      ]"
                    >{{ t("$vuetify.label.motivational") }}</p>

                    <p class="text-caption text-grey-lighten-1">
                      {{ t("$vuetify.message.motivational_message") }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="6" sm="6" md="6" lg="6" class="pl-1 pb-0">
                  <div
                    :class="[
                      'h-100 pa-3 rounded-lg',
                      style === 'direct' ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15' : 'border-sextet bg-quintet'
                    ]"
                    @click="style = 'direct'"
                  >
                    <p
                      :class="[
                        'font-space-grotesk font-weight-bold mb-1',
                        style === 'direct' ? 'text-primary' : ''
                      ]"
                    >{{ t("$vuetify.label.direct") }}</p>

                    <p class="text-caption text-grey-lighten-1">
                      {{ t("$vuetify.message.direct_message") }}
                    </p>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6" sm="6" md="6" lg="6" class="pr-1 py-0">
                  <div
                    :class="[
                      'h-100 pa-3 rounded-lg',
                      style === 'technical' ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15' : 'border-sextet bg-quintet'
                    ]"
                    @click="style = 'technical'"
                  >
                    <p
                      :class="[
                        'font-space-grotesk font-weight-bold mb-1',
                        style === 'technical' ? 'text-primary' : ''
                      ]"
                    >{{ t("$vuetify.label.technical") }}</p>

                    <p class="text-caption text-grey-lighten-1">
                      {{ t("$vuetify.message.technical_message") }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="6" sm="6" md="6" lg="6" class="pl-1 py-0">
                  <div
                    :class="[
                      'h-100 pa-3 rounded-lg',
                      style === 'friendly' ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15' : 'border-sextet bg-quintet'
                    ]"
                    @click="style = 'friendly'"
                  >
                    <p
                      :class="[
                        'font-space-grotesk font-weight-bold mb-1',
                        style === 'friendly' ? 'text-primary' : ''
                      ]"
                    >{{ t("$vuetify.label.friendly") }}</p>

                    <p class="text-caption text-grey-lighten-1">
                      {{ t("$vuetify.message.friendly_message") }}
                    </p>
                  </div>
                </v-col>
              </v-row>
            </div>

            <div class="mb-8">
              <p class="mb-2 text-subtitle-2">
                {{ t("$vuetify.label.goal") }}
              </p>

              <div class="d-flex ga-3 flex-wrap">
                <span
                  v-for="item in goals"
                  :key="item"
                  :class="[
                    'text-body-2 px-3 py-2 rounded-xl',
                    goal === item ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15 text-primary' : 'bg-quintet border-sextet'
                  ]"
                  @click="goal = item"
                >{{ t(`$vuetify.label.${item}`) }}</span>
              </div>
            </div>

            <div class="mb-5">
              <p class="mb-2 text-subtitle-2">
                {{ t("$vuetify.label.frequency_of_motivation") }}
              </p>

              <div class="d-flex ga-3 flex-wrap">
                <span
                  v-for="item in frequencies"
                  :key="item"
                  :class="[
                    'text-body-2 px-3 py-2 rounded-xl',
                    frequencyOfMotivation === item ? 'border-sm border-primary border-opacity-100 bg-theme-primary-15 text-primary' : 'bg-quintet border-sextet'
                  ]"
                  @click="frequencyOfMotivation = item"
                >{{ t(`$vuetify.label.${item}`) }}</span>
              </div>
            </div>

            <div class="mb-4 pa-3 rounded-lg d-flex justify-space-between ga-2 bg-quintet border-sextet">
              <div class="d-flex flex-column justify-center">
                <p class="text-body-2">
                  {{ t("$vuetify.label.detailed_answers") }}
                </p>

                <p class="text-caption text-grey-lighten-1">
                  {{ t("$vuetify.message.turn_off_for_shorter_answers") }}
                </p>
              </div>

              <div>
                <v-switch
                  inset
                  color="primary"
                  hide-details="auto"
                  class="py-0"
                  v-model="detailedAnswers"
                />
              </div>
            </div>

            <input type="submit" v-show="false" />
          </v-form>

          <v-btn
            block
            type="submit"
            color="primary"
            class="font-weight-bold text-none pa-7 mt-1"
            @click="submit"
          >{{ t("$vuetify.label.save") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE DELETAR CHAT -->
    <v-bottom-sheet v-model="bottomSheet.delete_chat">
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
            {{ t("$vuetify.label.delete_chat") }}
          </p>

          <p
            class="text-center mb-5 text-grey-lighten-1"
            v-html="t('$vuetify.message.delete_chat')"
          ></p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.delete_chat = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="deleteChat"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import MarkdownIt from "markdown-it";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { v4 } from "uuid";
import { eventBus } from "@/eventBus";
import { mobileEvents } from "@/utils";
import { useCopy, useFormatNumber } from "@/composables";
import { Device, SpeechRecognition } from "@/mobile";
import { useAccountsStore } from "@/stores/accounts";
import { useAppStore } from "@/stores/app";
import { useZenaConversationsStore } from "@/stores/zenas";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import type { Account } from "@/types/account.type";
import type { ListMessages, ReceivedMessageAi, ReceivedErrorMessageAi, ZenaActionId } from "@/types/global.type";

/// COMPONENTS
import ProfileImage from "@/components/ProfileImage.vue";
import List from "@/components/List.vue";
import Zena from "@/assets/images/zena.png";

/// DATA
const { t } = useLocale();
const { copy } = useCopy();
const { doubleTap } = mobileEvents();
const { formatNumber } = useFormatNumber();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const appStore = useAppStore();
const zenaConversationsStore = useZenaConversationsStore();
const persistentSession = usePersistentSession();

const socketService = appStore.socketService;

const image = ref("");

const menu = ref(false);

const bottomSheet = reactive({
  ai_settings: false,
  delete_chat: false,
});

const textarea = useTemplateRef("textarea");
const input = ref("");
const lines = ref(1);
const focus = ref(false);
const openKeyboard = ref(false);
let timeoutFocus: null | number = null;
let reservedInput = "";

const availableSpeechRecognition = ref(false);
const microphoneStarted = ref(false);
let onDeviceRecognitionAvailable = false;

const conversationCreated = ref(false);

const messages = ref<ListMessages>([]);

const page = ref(1);
const pages = ref(2);

const content = useTemplateRef("content");

const history = ref<{
  _id: string,
  title: string,
}[]>([]);

const touching = ref(false);
const scrolling = ref(false);
const waiting = ref(false);

const menuChat = ref(false);
const menuId = ref("");

const nickname = ref("");
const style = ref<Account["ai_settings"]["style"]>();
const goal = ref<Account["ai_settings"]["goal"]>();
const frequencyOfMotivation = ref<Account["ai_settings"]["frequency_of_motivation"]>();
const detailedAnswers = ref(false);

const dots = ref("");
const interval = ref<null | number>(null);

const reserverChatId = ref("");

/// COMPUTED
const account = computed(() => accountsStore.account);
const aiName = computed(() => import.meta.env.VITE_AI_NAME);
const credits = computed(() => (account.value?.credits?.plan || 0) + (account.value?.credits?.purchased || 0));
const multipleLines = computed(() => lines.value >= 2);
const chatId = computed(() => String(route.query._id || "") || reserverChatId.value);
const goals = computed(() => ["weight_loss", "hypertrophy", "conditioning", "health"] as const);
const frequencies = computed(() => ["high", "medium", "low"] as const);

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

watch(conversationCreated, (val) => {
  if (val) loadHistory();
});

watch(waiting, (val) => {
  if (val) {
    interval.value = setInterval(() => {
      if (dots.value.length < 3) dots.value += ".";
      else dots.value = ".";
    }, 1000);
  } else {
    if (interval.value !== null) clearInterval(interval.value);
  }
});

watch(chatId, (val) => {
  touching.value = false;
  scrolling.value = false;
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);

  // Chat id to open
  if (sessionStorage.getItem("chat-id")) {
    reserverChatId.value = sessionStorage.getItem("chat-id")!;
    sessionStorage.removeItem("chat-id");
  }

  // Get account
  await accountsStore.GET_ACCOUNT();

  const device = await Device.getInfo();

  if (device.platform !== "web") {
    const { available } = await SpeechRecognition.available();

    if (available) {
      if (device.platform === "ios") {
        const { available } = await SpeechRecognition.isOnDeviceRecognitionAvailable({
          language: navigator.language
        });

        onDeviceRecognitionAvailable = available;
      }

      const { speechRecognition } = await SpeechRecognition.checkPermissions();

      if (speechRecognition !== "denied") {
        availableSpeechRecognition.value = true;

        SpeechRecognition.addListener("partialResults", (event) => {
          input.value = `${reservedInput} ${event.matches?.[0] || ""}`;
        });

        SpeechRecognition.addListener("listeningState", (event) => {
          if (event.state === "stopped") {
            microphoneStarted.value = false;
          }
        });

        SpeechRecognition.addListener("error", ({ message }) => {
          eventBus.emit("SNACKBAR", { message });
        });
      }
    }
  }

  // If no internet connection
  if (!appStore.internet) {
    router.push({ name: "no_connection" });
    return;
  }

  const file = JSON.parse((await persistentSession.get("picture")) || "{}");

  image.value = file?.path || account.value.image;

  // If has id, try to load conversation
  if (chatId.value) {
    eventBus.emit("SET_LOADER", { enabled: true });
    await selectConversation(chatId.value);
    eventBus.emit("SET_LOADER", { enabled: false });
  } else {
    newConversation();
  }

  setTimeout(() => {
    if (socketService.isConnected()) {
      socketService.on("reply_message_ai", handleMessage);
      socketService.on("error_reply_message_ai", handleErrorMessage);
      socketService.on("update_history", loadHistory);
    }
  }, 3000);

  // Load history
  loadHistory();

  const aiSettings = account.value.ai_settings;

  nickname.value = aiSettings.nickname || account.value.name.trim().split(" ")[0] || "";
  style.value = aiSettings.style;
  goal.value = aiSettings.goal;
  frequencyOfMotivation.value = aiSettings.frequency_of_motivation;
  detailedAnswers.value = aiSettings.detailed_answers;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
  SpeechRecognition.removeAllListeners();
  socketService.off("reply_message_ai", handleMessage);
  socketService.off("error_reply_message_ai", handleErrorMessage);
  socketService.off("update_history", loadHistory);

  if (timeoutFocus !== null) clearTimeout(timeoutFocus);
  if (interval.value !== null) clearInterval(interval.value);
});

/// METHODS
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

  if (isBottom) {
    scrolling.value = false;
  }
};

const back = () => {
  eventBus.emit("BACK_ROUTER");
};

const loadHistory = async () => {
  const response = await zenaConversationsStore.GET();
  if (!response.error) history.value = response.conversations;
};

const toggleMicrophone = async () => {
  if (microphoneStarted.value) {
    await SpeechRecognition.stop();
  } else {
    let { speechRecognition } = await SpeechRecognition.checkPermissions();

    if (speechRecognition === "prompt-with-rationale" || speechRecognition === "prompt") {
      speechRecognition = (await SpeechRecognition.requestPermissions()).speechRecognition;
    }

    if (speechRecognition === "granted") {
      microphoneStarted.value = true;
      reservedInput = input.value;

      await SpeechRecognition.start({
        language: navigator.language,
        maxResults: 1,
        partialResults: true,
        allowForSilence: 2000,
        useOnDeviceRecognition: onDeviceRecognitionAvailable
      });
    }
  }
};

const newConversation = () => {
  menu.value = false;
  conversationCreated.value = false;
  messages.value = [];

  router.replace({
    replace: true,
    query: { ...route.query, _id: v4() }
  });
};

const send = async () => {
  const message = input.value;
  const messageId = v4();

  input.value = "";

  messages.value.push({
    message_id: messageId,
    role: "user",
    content: message
  });

  appStore.socketService.emit("message_ai", {
    message,
    message_id: messageId,
    conversation_id: chatId.value,
    conversation_created: conversationCreated.value
  });

  nextTick(() => {
    lines.value = 1;
    waiting.value = true;

    const element = textarea.value as HTMLElement;
    element.style.height = "auto";
  });

  setTimeout(() => {
    scrollDown(true);
  }, 300);
};

const handleMessage = async (response: ReceivedMessageAi) => {
  if (response.conversation_id === chatId.value) {
    conversationCreated.value = true;

    const message = messages.value.find((m) => m.message_id === response.message_id);

    if (!message) {
      messages.value.push({
        message_id: response.message_id,
        role: "system",
        content: response.reply,
        actions: response.actions
      });
    } else {
      if (response.replace) {
        message.content = response.reply;
        message.actions = response.actions;
        accountsStore.GET_ACCOUNT();
      } else {
        if (message.content !== response.reply) message.content += response.reply;
      }

      if (response.replace) {
        waiting.value = false;
        setTimeout(() => scrollDown(false, false), 300);
      }
    }

    scrollDown(false, false);
  }
};

const handleErrorMessage = (response: ReceivedErrorMessageAi) => {
  if (response.conversation_id === chatId.value) {
    input.value = response.input;

    messages.value = messages.value.filter((message) => message.message_id !== response.message_id);

    eventBus.emit("SNACKBAR", {
      message: response.system_error ?
        response.error :
        t(`$vuetify.errors_socket.${response.error}`)
    });

    waiting.value = false;

    accountsStore.GET_ACCOUNT();

    if (response.new) {
      newConversation()
      loadHistory();
    }
  }
};

const formatMD = (text: string) => {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true
  });

  return md.render(text);
};

const selectConversation = async (conversation_id: string) => {
  if (conversation_id === chatId.value && messages.value.length) {
    return;
  }

  menu.value = false;

  router.replace({
    replace: true,
    query: {
      ...route.query,
      _id: conversation_id,
    }
  });

  const response = await zenaConversationsStore.GET(conversation_id);

  if (response.error) {
    newConversation();
  } else {
    waiting.value = response.conversation.in_progress;

    page.value = 1;
    pages.value = 2;
    messages.value = [];
    conversationCreated.value = true;

    while (page.value <= pages.value) {
      const response = await zenaConversationsStore.GET(`${chatId.value}/messages?page=${page.value}&limit=100&sort_by=index&sort=ASC`);

      if (!response.error) {
        pages.value = response.result.pages;
        messages.value.push(...response.result.results);
        page.value++;
      }

      await scrollDown();
    }
  }
};

const scrollDown = async (forced = false, useNextTick = true) => {
  if ((scrolling.value || touching.value) && !forced) return;

  const element = content.value! as HTMLDivElement

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

const deleteChat = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });

  const response = await zenaConversationsStore.DELETE(menuId.value);

  if (!response.error) {
    bottomSheet.delete_chat = false;
    newConversation();
    loadHistory();
  }

  eventBus.emit("SET_LOADER", { enabled: false });
};

const submit = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });

    const response = await accountsStore.UPDATE_ACCOUNT({
      ai_settings: {
        nickname: nickname.value,
        style: style.value!,
        goal: goal.value!,
        frequency_of_motivation: frequencyOfMotivation.value!,
        detailed_answers: detailedAnswers.value,
      }
    }, false);

    if (!response.error) bottomSheet.ai_settings = false;
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const copyMessage = (text: string) => {
  doubleTap({
    onDoubleTap: () => copy(text)
  });
};

const handleAction = (id: ZenaActionId) => {
  switch (id) {
    case "OPEN_SUBSCRIPTION":
      eventBus.emit("START_SUBSCRIPTION");
      break;
    case "CREATE_PLAN":
      eventBus.emit("CREATE_PLAN");
      break;
    case "VIEW_WORKOUTS":
      router.push({ name: "training" });
      break;
    case "VIEW_CHALLENGES":
      router.push({ name: "challenge" });
      break;
  }
};
</script>

<style lang="sass" scoped>
div.overlay
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.35)
  backdrop-filter: blur(4px)
  opacity: 0
  pointer-events: none
  transition: opacity 0.35s ease
  z-index: 999

  &.active
    opacity: 1
    pointer-events: auto

aside
  position: fixed
  top: 0
  right: 0
  width: 80%
  height: 100vh
  background: var(--quintet)
  transform: translateX(100%)
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease
  opacity: 0
  z-index: 1000
  padding: var(--top-saved) 0 var(--bottom-saved) 0
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.25)
  border-left: 1px solid var(--sextet)

  &.open
    transform: translateX(0)
    opacity: 1
</style>

<style lang="sass">
span.content-html
  // ========================
  // TIPOGRAFIA BASE
  // ========================
  font-size: 0.95rem
  line-height: 1.65
  color: rgba(255, 255, 255, 0.9)

  p, ol, ul, h1, h2, h3, h4, h5, h6, hr, table, blockquote
    margin-bottom: 1rem

    &:last-child
      margin-bottom: 0

  // ========================
  // HEADINGS
  // ========================
  h1, h2, h3, h4, h5, h6
    font-weight: 600
    line-height: 1.3
    color: #FFFFFF

  h1
    font-size: 1.3rem

  h2
    font-size: 1.15rem

  h3
    font-size: 1.05rem

  h4, h5, h6
    font-size: 0.95rem

  // ========================
  // LISTAS
  // ========================
  ol, ul
    padding-left: 1.4rem

    li
      margin-bottom: 0.35rem
      padding-left: 0.2rem

      p
        margin-bottom: 0.4rem

        &:last-child
          margin-bottom: 0

  // ========================
  // LINKS
  // ========================
  a
    color: var(--primary)
    text-decoration: underline
    text-underline-offset: 3px
    opacity: 0.9

    &:hover
      opacity: 1

  // ========================
  // TABELA
  // ========================
  table
    width: max-content
    border-collapse: collapse
    border-radius: 12px
    overflow: hidden
    font-size: 0.88rem
    background: rgba(255, 255, 255, 0.04)
    border: 1px solid rgba(255, 255, 255, 0.08)

  thead
    background: rgba(255, 255, 255, 0.07)

    th
      padding: 0.65rem 0.85rem
      text-align: left
      font-weight: 600
      font-size: 0.8rem
      letter-spacing: 0.03em
      color: rgba(255, 255, 255, 0.5)
      text-transform: uppercase
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)

  tbody
    tr
      border-bottom: 1px solid rgba(255, 255, 255, 0.05)
      transition: background 0.15s ease

      &:last-child
        border-bottom: none

      &:hover
        background: rgba(255, 255, 255, 0.04)

    td
      padding: 0.6rem 0.85rem
      color: rgba(255, 255, 255, 0.85)
      vertical-align: middle

  // ========================
  // CODE
  // ========================
  code
    font-family: "SF Mono", "Fira Code", monospace
    font-size: 0.82rem
    background: rgba(255, 255, 255, 0.08)
    padding: 0.15rem 0.4rem
    border-radius: 5px
    color: var(--primary)

  pre
    background: rgba(255, 255, 255, 0.05)
    border: 1px solid rgba(255, 255, 255, 0.08)
    border-radius: 10px
    padding: 1rem
    overflow-x: auto
    margin-bottom: 1rem

    code
      background: none
      padding: 0
      color: rgba(255, 255, 255, 0.85)

  // ========================
  // BLOCKQUOTE
  // ========================
  blockquote
    border-left: 3px solid var(--primary)
    padding: 0.5rem 0 0.5rem 1rem
    margin-left: 0
    color: rgba(255, 255, 255, 0.55)
    font-style: italic

  // ========================
  // HR
  // ========================
  hr
    border: none
    border-top: 1px solid rgba(255, 255, 255, 0.08)
    margin: 1.2rem 0

  // ========================
  // STRONG / EM
  // ========================
  strong
    font-weight: 600
    color: #fff

  em
    color: rgba(255, 255, 255, 0.7)
</style>