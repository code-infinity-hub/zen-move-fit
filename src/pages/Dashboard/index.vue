<template>
  <div id="dashboard" class="bg-secondary">
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

    <v-tabs-window
      v-if="account?._id"
      :style="{ visibility: loading ? 'hidden' : 'visible' }"
      v-model="tab"
      class="h-100"
    >
      <v-tabs-window-item class="h-100">
        <section
          v-if="tab === 0"
          class="h-100 d-flex flex-column"
        >
          <main class="overflow-y-auto">
            <v-tabs-window v-model="itemTab" class="h-100">
              <v-tabs-window-item class="h-100">
                <Home v-if="itemsTab.includes(0)" />
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100">
                <Training v-if="itemsTab.includes(1)" />
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100">
                <Social v-if="itemsTab.includes(2)" />
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100">
                <Progress v-if="itemsTab.includes(3)" />
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100">
                <Account v-if="itemsTab.includes(4)" />
              </v-tabs-window-item>

              <v-tabs-window-item class="h-100"></v-tabs-window-item>
            </v-tabs-window>
          </main>

          <footer
            class="menu"
            :style="{ paddingBottom: paddingBottomFooterMenu }"
          >
            <button
              v-for="(detail, i) in tabDetails.filter((detail) => detail.enabled)"
              :key="i"
              :class="itemTab === i ? 'active' : ''"
              @click="replaceByTab(detail.title)"
            >
              <v-badge
                v-if="detail.badge"
                location="top right"
                color="blue"
                :content="detail.badge"
              >
                <div>
                  <v-icon :size="22">{{ detail.icon }}</v-icon>
                </div>
              </v-badge>
              <div v-else>
                <v-icon :size="22">{{ detail.icon }}</v-icon>
              </div>

              <span>
                {{ t(`$vuetify.menu.${detail.title}`) }}
              </span>
            </button>
          </footer>
        </section>
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Activity v-if="tab === 1" />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Chat v-if="tab === 2" />
      </v-tabs-window-item>

      <v-tabs-window-item class="h-100">
        <Notifications v-if="tab === 3" />
      </v-tabs-window-item>

      <v-tabs-window-item
        v-if="enableBackoffice"
        class="h-100"
      >
        <Backoffice />
      </v-tabs-window-item>

      <v-tabs-window-item></v-tabs-window-item>
    </v-tabs-window>

    <!-- POPUP DE ATALHOS -->
    <div v-if="!loading && tab === 0">
      <div
        v-if="showOptions"
        class="position-fixed top-0 left-0 right-0 bottom-0 bg-theme-background-80 popup-content"
        :style="{ backdropFilter: 'blur(4px)' }"
        @click="closeContentOptions"
      >
        <div
          class="position-fixed d-flex flex-column ga-1"
          ref="list-shortcuts"
          :style="{ width: '12rem', right: '1rem', top: `calc(${topButtonShowShortcuts} - (${heightListShortcut} + 20px))` }"
        >
          <div
            v-for="shortcut in shortcuts.filter((short) => short.enabled)"
            :key="shortcut.id"
            class="d-flex justify-end align-center ga-2"
            @click="actionShortcut(shortcut.id)"
          >
            <div
              :style="{ border: '1.5px solid var(--tertiary)', fontSize: '0.75rem' }"
              class="px-2 py-1 rounded-lg bg-secondary"
            >{{ shortcut.label }}</div>

            <div
              :style="{
                width: '44px',
                height: '44px',
                border: '1.5px solid var(--tertiary)',
                ...('image' in shortcut && { backgroundImage: `url(${shortcut.image})`, backgroundSize: 'cover' })
              }"
              class="bg-secondary d-flex justify-center align-center rounded-circle"
            >
              <v-icon
                v-if="'icon' in shortcut"
                color="primary"
                :size="18"
              >{{ shortcut.icon }}</v-icon>
            </div>
          </div>
        </div>
      </div>

      <v-btn
        v-if="appStore.internet && (showOptions || account?._id)"
        icon="mdi-plus"
        color="primary"
        size="large"
        class="position-fixed border-tertiary"
        ref="button-show-shortcuts"
        :style="{ top: '80vh', right: '1rem', transition: 'transform 0.4s ease', transform: showOptions ? 'rotate(90deg)' : '' }"
        @click="showOptions = !showOptions"
      ></v-btn>
    </div>

    <!-- PEDIR PERMISSÃO DE NOTIFICAÇÃO -->
    <PermissionNotification
      v-model="modelPermissionNotification"
      @request="saveNotificationId"
    />

    <!-- MOSTRAR EQUIPAMENTO PERTO DO LIMITE -->
    <EquipmentAlertBottomSheet
      v-model="showEquipmentAlert"
      :equipments="equipmentsNearLimit"
    />

    <!-- MOSTRAR BOTTOMSHEET DE INDIQUE E GANHE -->
    <ReferAndEarnSheet
      v-model="showReferAndEarnSheet"
    />

    <!-- BOTTOMSHEET DE RENOVAÇÃO -->
    <RenewalBottomSheet
      v-model="showRenewalBottomSheet"
      @renew="eventBus.emit('START_SUBSCRIPTION'); showRenewalBottomSheet = false;"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useAnalyticsStore } from "@/stores/analytics";
import { useAppStore } from "@/stores/app";
import { useNotificationsStore } from "@/stores/notifications.ts";
import { useOffersStore } from "@/stores/offers";
import { useSocialStore } from "@/stores/social.ts";
import { useEquipmentsStore } from "@/stores/equipments.ts";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { useCurrency, useLogout } from "@/composables";
import {
  Device,
  SystemBars, SystemBarType,
  OneSignal,
} from "@/mobile";
import { type Offer } from "@/types/offer.type";
import { type Equipment } from "@/types/equipment.type";

import TABS_PROGRESS from "@/json/tabs-progress.json";
import TABS_ACCOUNT from "@/json/tabs-accounts.json";
import TABS_SOCIAL from "@/json/tabs-social.json";
import Zena from "@/assets/images/zena.png";

/// COMPONENTS
import Home from "./Home/index.vue";
import Training from "./Training/index.vue";
import Social from "./Social/index.vue";
import Progress from "./Progress/index.vue";
import Account from "./Account/index.vue";
import PermissionNotification from "@/components/Permissions/Notification.vue";
import Activity from "@/components/Activity/Creation/index.vue";
import Chat from "@/components/Chat.vue";
import Notifications from "@/components/Notifications.vue";
import Backoffice from "@/components/Backoffice.vue";
import EquipmentAlertBottomSheet from "@/components/Equipment/EquipmentAlertBottomSheet.vue";
import ReferAndEarnSheet from "@/components/Subscription/ReferAndEarnSheet.vue";
import RenewalBottomSheet from "@/components/Subscription/RenewalBottomSheet.vue";

/// DATA
const BACKOFFICE_TAB = 4;

const { t } = useLocale();
const { currency } = useCurrency();
const { logout } = useLogout();
const route = useRoute();
const router = useRouter();
const tab = ref(BACKOFFICE_TAB);
const itemTab = ref(0);
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();
const analyticsStore = useAnalyticsStore();
const appStore = useAppStore();
const offersStore = useOffersStore();
const notificationsStore = useNotificationsStore();
const socialStore = useSocialStore();
const equipmentsStore = useEquipmentsStore();
const persistentSession = usePersistentSession();
const loading = ref(true);
const modelPermissionNotification = ref(false);
const showOptions = ref(false);

const showEquipmentAlert = ref(false);
const equipmentsNearLimit = ref<Equipment[]>([]);

const showRenewalBottomSheet = ref(false);

const showReferAndEarnSheet = ref(false);

const buttonShowShortcuts = useTemplateRef("button-show-shortcuts");
const topButtonShowShortcuts = ref("0px");

const heightListShortcut = ref("0px");
const listShortcuts = useTemplateRef("list-shortcuts");

const itemsTab = ref<number[]>([]);

const timeoutsTab: Record<number, number | null> = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
};

let startedBackoffice = false;

const backButton = () => eventBus.emit("FINISH_APP");
const backofficeCached = async () => Boolean(Number(await persistentSession.get("backoffice-cached")));

const replaceMode = (mode: string) => {
  router.replace({
    replace: true,
    query: { ...route.query, mode }
  });
};

/// COMPUTED
const tabModes = computed(() => [
  "dashboard",
  "activity",
  "chat",
  "notification",
  enableBackoffice.value ? "backoffice" : ""
].filter(Boolean));
const account = computed(() => accountsStore.account);
const enableBackoffice = computed(() => account.value?.backoffice?.enabled);
const generatePlan = computed(() => !accountsStore.isSubscriber || (accountsStore.isSubscriber && !account.value?.plan_id));
const tabDetails = computed(() => {
  const badgeSocial = socialStore.requests.total + socialStore.unread.chats;
  const badgeTraining = activitiesStore.pending_tags.total;

  return [
    {
      icon: "mdi-home-outline",
      title: "home",
      enabled: true,
      badge: ""
    },
    {
      icon: "mdi-dumbbell",
      title: "training",
      enabled: true,
      badge: badgeTraining > 99 ? "99+" : String(badgeTraining || "")
    },
    {
      icon: "mdi-account-multiple-outline",
      title: "social",
      enabled: true,
      badge: badgeSocial > 99 ? "99+" : String(badgeSocial || "")
    },
    {
      icon: "mdi-trending-up",
      title: "progress",
      enabled: true,
      badge: ""
    },
    {
      icon: "mdi-account-outline",
      title: "account",
      enabled: true,
      badge: ""
    },
  ] as const;
});
const shortcuts = computed(() => [
  { id: "ai_coach", label: import.meta.env.VITE_AI_NAME, image: Zena, enabled: true },
  { id: "generate_plan", label: t("$vuetify.label.generate_plan"), icon: "mdi-star-four-points-outline", enabled: generatePlan.value },
  { id: "register_workout", label: t("$vuetify.label.register_workout"), icon: "mdi-dumbbell", enabled: true },
  { id: "register_activity", label: t("$vuetify.label.register_activity"), icon: "mdi-pulse", enabled: true },
  { id: "register_meal", label: t("$vuetify.label.register_meal"), icon: "mdi-food-apple-outline", enabled: true },
] as const);
const paddingBottomFooterMenu = computed(() => !appStore.open_keyboard ? "var(--bottom-saved)" : "0px");
const isInPixRenewalWindow = computed(() => {
  const subscription = account.value?.subscription_details;
  if (!subscription || subscription.payment_method !== "pix" || subscription.status !== "PAID") return false;
  return dayjs(subscription.expires_at).diff(dayjs(), "hour") <= 24;
});

/// WATCH
watch(itemTab, (val) => {
  if (timeoutsTab[val] !== null) {
    clearTimeout(timeoutsTab[val]);
    timeoutsTab[val] = null;
  }

  itemsTab.value.push(val);

  replaceByTab(
    tabDetails.value.find((_, i) => i === val)!.title
  );

  for (const item of itemsTab.value) {
    if (item !== val) {
      timeoutsTab[item] = setTimeout(() => {
        itemsTab.value = itemsTab.value.filter((i) => i !== item);
      }, 150);
    }
  }
});

watch(() => route.query.mode, async (val, oldVal) => {
  if (tab.value === BACKOFFICE_TAB && !startedBackoffice) {
    const isBackofficeCache = await backofficeCached();

    const time = isBackofficeCache ? 800 : 0;
    await new Promise((accept) => setTimeout(accept, time));

    startedBackoffice = true;

    itemTab.value = tabDetails.value.findIndex((item) => item.title === (route.query.tab || tabDetails.value[0].title));

    if (itemTab.value === 0 && !itemsTab.value.length) {
      itemsTab.value.push(0);
    }

    tab.value = !oldVal && val === "backoffice" ?
      0 :
      tabModes.value.findIndex((item) => item === (oldVal || val || "dashboard"));
  } else if (val) {
    if (val === "dashboard") {
      eventBus.on("BACK_BUTTON", backButton);
    } else {
      eventBus.off("BACK_BUTTON", backButton);
    }

    tab.value = tabModes.value.findIndex((item) => item === val);
  }
}, { immediate: true });

watch(() => route.query.tab, (val) => {
  const index = tabDetails.value.findIndex((item) => item.title === val);
  if (index !== itemTab.value) itemTab.value = index;
});

watch(modelPermissionNotification, (val) => {
  if (val) {
    SystemBars.show({
      bar: SystemBarType.StatusBar,
      animation: "NONE"
    });
  } else if (tab.value === 0 && itemTab.value === 0) {
    SystemBars.hide({
      bar: SystemBarType.StatusBar,
      animation: "NONE"
    });
  }
});

watch(showOptions, (val) => {
  if (val) {
    nextTick(() => {
      heightListShortcut.value = `${listShortcuts.value?.clientHeight}px`;
      topButtonShowShortcuts.value = `${buttonShowShortcuts.value?.$el?.offsetTop}px`;
    });
  }
});

watch(() => appStore.internet, (val) => {
  if (!val) showOptions.value = false;
});

watch(tab, (val) => {
  const index = tabModes.value.findIndex((_, i) => i === val);
  if (index > -1) replaceMode(tabModes.value[index]!);
}, { immediate: true });

watch(() => account.value?.backoffice, async (val) => {
  await persistentSession.set("backoffice-cached", String(Number(val?.enabled || false)));
});

watch(() => account.value, async (val) => {
  await persistentSession.set("backoffice-cached", String(Number(val?.backoffice?.enabled || false)));
});

/// LIFE CYCLES
onMounted(async () => {
  const accountId = await persistentSession.get("_id");

  if (!accountId) {
    await logout(false);
    return;
  }

  accountsStore._id = accountId;
  await accountsStore.GET_ACCOUNT();

  const isBackofficeCache = await backofficeCached();
  const time = isBackofficeCache ? 1000 : 0;
  await new Promise((accept) => setTimeout(accept, time));

  if (!route.query.tab) {
    replaceByTab("home");
  }

  loading.value = false;

  if (appStore.internet) {
    const device = await Device.getInfo();

    if (["android", "ios"].includes(device.platform)) {
      const permission = await OneSignal.default.Notifications.getPermissionAsync();

      if (!permission) {
        modelPermissionNotification.value = true;
      } else {
        saveNotificationId();
      }

      analyticsStore.TRACK(permission ? "push_opt_in" : "push_opt_out");
    }

    socialStore.RESET_REQUESTS();
    socialStore.RESET_UNREAD_MESSAGES();
    activitiesStore.RESET_PENDING_TAGS();

    await Promise.all([
      accountsStore.UPDATE_ACCOUNT({
        lang: (await Device.getLanguageCode())?.value || "pt",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }),
      getDefaultOffer(),
      notificationsStore.GET_COUNT_PENDANTS_NOTIFICATIONS(),
      socialStore.GET_REQUESTS(),
      socialStore.GET_UNREAD_MESSAGES(),
      activitiesStore.GET_PENDING_TAGS(),
    ]);

    eventBus.emit("CHECK_ACHIEVEMENTS");
    eventBus.emit("CHECK_CHESTS");
    eventBus.emit("CHECK_LEAGUE_RESULT");

    analyticsStore.TRACK("app_opened");
  }

  const typeTraining = await persistentSession.get("type-training");

  if (typeTraining === "ACTIVITY") {
    tab.value = 1;
  } else if (typeTraining === "TRAINING") {
    router.push({ name: "training" });
  } else if (typeTraining === "CHALLENGE") {
    router.push({ name: "challenge" });
  }

  await loadEquipmentAlerts();

  if (accountsStore.isSubscriber && account.value?.indication?.status) {
    const hideReferAndEarnSheet = await persistentSession.get("hide-refer-and-earn-sheet");
    if (!hideReferAndEarnSheet) showReferAndEarnSheet.value = true;
  }

  if (isInPixRenewalWindow.value) {
    showRenewalBottomSheet.value = true;
  }

  eventBus.on("OPEN_CHAT", openChat);
});

onUnmounted(() => {
  eventBus.off("BACK_BUTTON", backButton);
  eventBus.off("OPEN_CHAT", openChat);
});

/// METHODS
const replaceByTab = (tab: typeof tabDetails.value[number]["title"]) => {
  let query: Record<string, string> = { };
  const originalQuery = route.query;

  switch(tab) {
    case "home":
    case "training":
      query = { tab, mode: "dashboard" };
      break;
    case "social":
    case "progress":
    case "account":
      const list = tab === "social" ?
        TABS_SOCIAL :
        tab === "progress" ? TABS_PROGRESS : TABS_ACCOUNT;

      query = {
        ...originalQuery,
        tab,
        mode: "dashboard",
        list: list.includes(String(originalQuery?.list || "")) ? String(originalQuery.list) : list[0]!
      };
      break;
  };

  router.replace({
    replace: true,
    query
  });
};

const actionShortcut = (id: typeof shortcuts.value[number]["id"]) => {
  switch(id) {
    case "ai_coach":
      const { plan, purchased } = account.value.credits;
      if ((plan + purchased) > 0 || accountsStore.isSubscriber) {
        router.push({ name: "ai_coach" });
      } else {
        eventBus.emit("START_SUBSCRIPTION");
      }
      break;
    case "generate_plan":
      if (accountsStore.isSubscriber) {
        eventBus.emit("CREATE_PLAN");
      } else {
        eventBus.emit("START_SUBSCRIPTION");
      }
      break;
    case "register_workout":
      if (accountsStore.isSubscriber) {
        router.replace({
          replace: true,
          query: {
            ...route.query,
            mode: "dashboard",
            tab: "training",
          }
        });
      } else {
        eventBus.emit("START_SUBSCRIPTION");
      }
      break;
    case "register_activity":
      replaceMode("activity");
      break;
    case "register_meal":
      if (!accountsStore.isSubscriber) {
        eventBus.emit("START_SUBSCRIPTION");
      } else if (!account.value.plan_id) {
        eventBus.emit("CREATE_PLAN");
      } else {
        router.replace({
          replace: true,
          query: {
            ...route.query,
            mode: "dashboard",
            tab: "progress",
            list: "nutrition",
            operation: "new"
          }
        });
      }
      break;
  };

  showOptions.value = false;
};

const saveNotificationId = async () => {
  const oneSignalID = await OneSignal.default?.User?.pushSubscription?.getIdAsync();

  if (oneSignalID) {
    const exists = account.value.notification_ids.some((notification) =>
      notification.id === oneSignalID
    );

    const device = await Device.getInfo();

    if (!exists && device.platform !== "web") {
      await accountsStore.UPDATE_ACCOUNT({
        notification_ids: [
          ...account.value.notification_ids,
          {
            type: "app",
            platform: device.platform,
            id: oneSignalID,
            created_at: dayjs().toISOString()
          }
        ]
      });
    }
  }
};

const getDefaultOffer = async () => {
  const response = await offersStore.GET("default");

  if (!response.error) {
    const offer = response.offer as Offer;

    offersStore._id = offer._id;
    offersStore.cta_now = t("$vuetify.label.start_now_for", currency(offer.amount));
    offersStore.cta_subscription = t("$vuetify.label.start_now_for", currency(offer.amount));
    offersStore.amount = offer.amount || Number(import.meta.env.VITE_PRICE_SUBSCRIPTION);
    offersStore.amount_original = offer.amount_original || Number(import.meta.env.VITE_PRICE_SUBSCRIPTION_ORIGINAL);
    offersStore.credits = offer.credits;
    offersStore.payment_methods = offer.payment_methods;
  }
};

const closeContentOptions = (event: Event) => {
  if ((event.target as HTMLElement).classList.contains("popup-content")) {
    showOptions.value = false;
  }
};

const openChat = ({ friendship_id }: { friendship_id: string }) => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      mode: "chat",
      chat: friendship_id
    }
  });
};

const loadEquipmentAlerts = async () => {
  const response = await equipmentsStore.GET();

  if (!response.error) {
    equipmentsNearLimit.value = (response.result.results as Equipment[]).filter((equipment) =>
      equipment.type === "tennis" &&
      equipment.warn &&
      !equipment.retiree &&
      !equipment.alert_dismissed &&
      (equipment.mileage ?? 0) > 0 &&
      equipment.used >= (equipment.mileage ?? 0) * 0.8
    );

    if (equipmentsNearLimit.value.length) {
      showEquipmentAlert.value = true;
    }
  }
};
</script>

<style lang="sass">
div#dashboard
  span.v-badge__badge
    border: 1px solid var(--secondary)
</style>

<style lang="sass" scoped>
div#dashboard
  width: 100%
  height: 100%
  overflow: hidden

  main
    flex: 1

  footer.menu
    display: flex
    border-top: 1px solid var(--tertiary)
    background-color: var(--secondary)

    button
      flex: 1
      display: flex
      flex-direction: column
      gap: 2px
      justify-content: center
      align-items: center
      padding: 0.7rem 0

      div
        border-radius: 50%
        padding: 0.2rem
        margin-bottom: 0.1rem
        display: flex
        justify-content: center
        align-items: center

        i
          color: #818898

      span
        font-size: 12px
        color: #818898

      &.active
        div
          background-color: var(--primary)

          i
            color: var(--secondary)
            animation: pulse 0.35s ease
        span
          color: var(--primary)

@keyframes pulse
  0%
    transform: scale(0.9)
  60%
    transform: scale(1.15)
  100%
    transform: scale(1)
</style>