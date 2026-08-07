<template>
  <v-app>
    <header :style="statusBarStyle"></header>

    <main id="application">
      <router-view />

      <v-snackbar
        center
        rounded="lg"
        z-index="10003"
        color="secondary"
        :timeout="3_000"
        v-model="snackbar.enable"
      >
        <v-icon
          v-if="snackbar.icon"
          class="mr-2"
          color="white"
        >{{ snackbar.icon }}</v-icon>

        <span v-html="snackbar.message"></span>
      </v-snackbar>
    </main>

    <footer :style="navigationBarStyle"></footer>

    <Loader v-model="loader" />

    <Subscription v-model="startSubscription" />

    <BuildPlan v-model="startCreatePlan" />

    <AchievementSheet />

    <ChestOpening />

    <LeagueResultSheet />

    <RescueActivitySheet />

    <!-- MAPA PARA SALVAR IMAGEM DE ATIVIDADE OFFLINE -->
    <div
      class="position-fixed top-0 left-0 right-0 bottom-0 px-3"
      :style="{ pointerEvents: 'none', visibility: 'hidden' }"
    >
      <div
        id="map-app"
        :style="{ width: '100%', height: '12rem' }"
      ></div>
    </div>
  </v-app>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { api as ViewerApi } from "v-viewer";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useAppStore } from "@/stores/app";
import { useFeedbackStore } from "@/stores/feedback";
import { useSocialStore } from "@/stores/social";
import { eventBus } from "@/eventBus";
import { fileToBase64 } from "@/utils";
import { useLogout } from "@/composables";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { attestationService } from "@/services/attestation.service";
import { MapService } from "@/services/map.service";
import { MediaService } from "@/services/media.service";
import { SqliteService } from "@/services/sqlite.service";
import {
  App,
  AppShortcuts,
  BackgroundMode,
  CordovaNotifications,
  Device,
  FirebaseAnalytics,
  Keyboard,
  Network,
  OneSignal,
  SafeArea,
  ScreenshotEvent,
  EdgeToEdge,
} from "@/mobile";
import { type Activity } from "@/types/activity.type";
import { type Platform } from "@/types/global.type";
import { type MediaResult } from "@/types/global.type";
import { type ReceivedMessage } from "@/types/social.type";

/// COMPONENTS
import Loader from "@/components/Loader.vue";
import Subscription from "@/components/Subscription.vue";
import BuildPlan from "@/components/BuildPlan.vue";
import AchievementSheet from "@/components/AchievementSheet.vue";
import ChestOpening from "@/components/ChestOpening.vue";
import LeagueResultSheet from "@/components/LeagueResultSheet.vue";
import RescueActivitySheet from "@/components/RescueActivitySheet.vue";

/// STYLES
import "viewerjs/dist/viewer.css";

/// ICONS
import LoginIcon from "@/assets/images/login-icon.png";
import RegisterIcon from "@/assets/images/register-icon.png";
import RegisterTrainingIcon from "@/assets/images/register-training-icon.png";
import RegisterActivityIcon from "@/assets/images/register-activity-icon.png";
import RegisterMealIcon from "@/assets/images/register-meal-icon.png";

/// DATA
const { t } = useLocale();
const { logout } = useLogout();
const persistentSession = usePersistentSession();
const route = useRoute();
const router = useRouter();
const loader = ref(false);

const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();
const appStore = useAppStore();
const feedbackStore = useFeedbackStore();
const socialStore = useSocialStore();

const statusBarShow = ref(true);
const statusBarHeight = ref("0px");
const statusBarColor = ref("#0E1115");

const navigationBarShow = ref(true);
const navigationBarHeight = ref("0px");
const navigationBarColor = ref("#0E1115");

const isFullscreen = ref(true);
const platform = ref<Platform>("web");

const timeout: Ref<null, number> = ref(null);
const snackbar = reactive({
  enable: false,
  message: "",
  icon: "",
  color: ""
});

const startSubscription = ref(false);
const startCreatePlan = ref(false);

const root = document.documentElement;

const mediaService = new MediaService();
const sqliteService = new SqliteService();

let fullPath = "";
let intervalSaveActivity: null | number = null;

const socketService = appStore.socketService;

let historyPaths: string[] = [];

/// COMPUTED
const account = computed(() => accountsStore.account);

const isActivityInProgress = computed(() => route.name === "dashboard" && route.query.mode === "activity");

const statusBarStyle = computed(() => {
  if (statusBarHeight.value === "0px" || !statusBarShow.value || isFullscreen.value) {
    return { display: "none" };
  }

  return {
    height: statusBarHeight.value,
    backgroundColor: statusBarColor.value ? statusBarColor.value : "transparent"
  };
});

const mainHeight = computed(() => {
  const top = isFullscreen.value ?
    "0px" :
    statusBarShow.value ? statusBarHeight.value : "0px";

  const bottom = isFullscreen.value ?
    "0px" :
    navigationBarShow.value ? navigationBarHeight.value : "0px";

  return `calc(100vh - ${top} - ${bottom})`;
});

const navigationBarStyle = computed(() => {
  if (navigationBarHeight.value === "0px" || !navigationBarShow.value || isFullscreen.value) {
    return { display: "none" };
  }

  return {
    height: navigationBarHeight.value,
    backgroundColor: navigationBarColor.value ? navigationBarColor.value : "transparent"
  };
});

const optionsShowPicture = computed(() => ({
  inline: true,
  button: true,
  navbar: false,
  title: false,
  toolbar: false,
  tooltip: false,
  movable: false,
  zoomable: true,
  rotatable: false,
  scalable: false,
  transition: false,
  fullscreen: true,
  keyboard: false
}));

/// WATCH
watch(() => feedbackStore.feedback, async (val) => {
  if (val?.logout) await logout(false);

  if (val?.message) {
    const message = Array.isArray(val.message) ? val.message[0] : val.message;

    eventBus.emit("SNACKBAR", {
      message,
      color: val.error ? "error" : "success",
      icon: val.error ? "mdi-close" : "mdi-check"
    });
  }
});

watch(() => snackbar.enable, (value) => {
  if (value) {
    clearTimeout(timeout.value!);
    timeout.value = setTimeout(() => snackbar.enable = false, 3_000);
  }
});

watch(() => account.value._id, async (val) => {
  if (val) {
    if (platform.value !== "web") {
      await FirebaseAnalytics.setUserId({ userId: val });

      await FirebaseAnalytics.setUserProperty({
        key: "language",
        value: (await Device.getLanguageCode())?.value || "pt",
      });
    }

    await socketService.init();
  } else {
    if (platform.value !== "web") await FirebaseAnalytics.resetAnalyticsData();
    socketService.disconnect();
  }
});

watch(() => route.name, async (val) => {
  if (platform.value !== "web") {
    await FirebaseAnalytics.setCurrentScreen({
      screenName: String(val),
      screenClassOverride: `${String(val)}Page`,
    });
  }
});

watch(() => account.value.updated_image_at, async (val) => {
  if (val && platform.value !== "web") {
    const updatedImageAt = await persistentSession.get("updated-image-at");

    if (updatedImageAt !== val) {
      const savedImage = await mediaService.saveMediaOffline(account.value.image);

      if (!savedImage.error) {
        const oldFile = JSON.parse(
          (await persistentSession.get("picture")) || "{}"
        );

        if (oldFile?.file) {
          await mediaService.deleteFile(oldFile.file);
        }

        await persistentSession.set("picture", JSON.stringify({
          file: savedImage.file,
          path: savedImage.path
        }));
      }
    }
  }
});

watch(() => route.fullPath, (val, oldVal) => {
  const resolvedRoute = router.resolve({ path: val });
  const oldResolvedRoute = router.resolve({ path: oldVal || "/" });
  const namesRoutesNotAdd = ["loading", "login"];

  const conditions = [
    ![...namesRoutesNotAdd, "no_connection"].includes(String(oldResolvedRoute.name)),
    !(resolvedRoute.name === "profile" && (String(oldResolvedRoute.name) === "activity" || oldVal?.includes("mode=chat"))),
    !val.includes("mode=notification")
  ];

  if (namesRoutesNotAdd.includes(String(resolvedRoute.name))) {
    historyPaths = [];
  } else if (conditions.every(Boolean)) {
    historyPaths.push(oldVal);
  }
});

/// EVENT LISTENER
document.addEventListener("deviceready", async () => {
  const device = await Device.getInfo();
  platform.value = device.platform;

  if (device.platform === "android") {
    await Promise.allSettled([
      CordovaNotifications.createChannel({
        id: "activity_sound",
        name: t("$vuetify.label.activity"),
        description: t("$vuetify.message.show_activity_information"),
        importance: "IMPORTANCE_DEFAULT"
      }),
      CordovaNotifications.createChannel({
        id: "activity_silence",
        name: t("$vuetify.label.activity"),
        description: t("$vuetify.message.show_activity_information"),
        importance: "IMPORTANCE_LOW"
      }),
      CordovaNotifications.local.addActions("REPLY", [
        {
          id: "REPLY_ACTION",
          type: "input",
          title: t("$vuetify.label.reply"),
          emptyText: t("$vuetify.label.type_your_message"),
          launch: false
        },
        {
          id: "OPEN_CHAT",
          title: t("$vuetify.label.open_conversation"),
          launch: true
        }
      ]),
    ]);
  }

  // Configurações iniciais da tela
  await refreshSafeAreaInsets();

  SafeArea.addListener("safeAreaChanged", ({ insets }) => applySafeAreaInsets(insets));

  // Configurações OneSignal
  OneSignal.default.initialize(import.meta.env.VITE_ONESIGNAL_ID);
  OneSignal.default.Notifications.addEventListener("click", async (event) => {
    const [key, value] = (event?.result?.actionId || (event?.notification?.additionalData as any)?.id || "").split(":");

    switch(key) {
      case "VIEW_ACTIVITY":
        router.push({ name: "activity", params: { _id: value } });
        break;
      case "PENDING_TAGS":
        router.push({ name: "pending-tags" });
        break;
      case "OPEN_CHAT":
        if ((event?.notification?.additionalData as any)?.type === "CHAT_MESSAGE") {
          router.push({
            name: "dashboard",
            query: { mode: "chat", chat: value, tab: "social", list: "connections" }
          });
        } else {
          sessionStorage.setItem("chat-id", value);
          router.push({ name: "ai_coach" });
        }
        break;
      case "OPEN_SUBSCRIPTION":
        router.push({ name: "subscription" });
        break;
      case "OPEN_RESCUE_ACTIVITY":
        router.push({ name: "dashboard" });
        nextTick(() => eventBus.emit("OPEN_RESCUE_ACTIVITY"));
        break;
      case "OPEN_WALLET":
        router.push({ name: "refer_and_earn" });
        break;
      case "VIEW_PROFILE":
        router.push({ name: "profile", params: { _id: value } });
        break;
      case "ACCEPT_FRIENDSHIP": {
        const request = await socialStore.GET_REQUEST(value);
        if (request) {
          await socialStore.CHANGE_FRIENDSHIP_STATUS(value, request.account_id, "DONE");
        }
        break;
      }
      case "REFUSE_FRIENDSHIP": {
        const request = await socialStore.GET_REQUEST(value);
        if (request) {
          await socialStore.CHANGE_FRIENDSHIP_STATUS(value, request.account_id, "REFUSED");
        }
        break;
      }
    };
  });

  await Promise.all([
    ...(device.platform === "android" ?
      [
        EdgeToEdge.disable(),
        BackgroundMode.enable({
          title: t("$vuetify.message.the_app_is_in_background_mode"),
          text: t("$vuetify.message.app_will_start_faster")
        })
      ] :
      []),
    FirebaseAnalytics.setEnabled({ enabled: true })
  ]);

  appStore.internet = (await Network.getStatus()).connected;

  BackgroundMode.addListener("appInBackground", () => appStore.foreground = false);
  BackgroundMode.addListener("appInForeground", () => appStore.foreground = true);

  App.addListener("resume", () => {
    if (account.value._id) accountsStore.GET_ACCOUNT();
  });

  App.addListener("backButton", () => {
    if (!loader.value) {
      if (startSubscription.value) startSubscription.value = false;
      else eventBus.emit("BACK_BUTTON");
    }
  });

  App.addListener("appUrlOpen", ({ url }) => {
    const itemId = url.split("/").pop();

    if (url.includes("post.zenmovefit.com.br")) {
      ///
    } else if (url.includes("activity.zenmovefit.com.br")) {
      router.push({ name: "activity", params: { _id: itemId } });
    }
  });

  Network.addListener("networkStatusChange", ({ connected }) => {
    appStore.internet = connected;

    if (connected) {
      if (route.name === "no_connection" && fullPath) {
        router.push(fullPath);
        fullPath = "";
      }
    } else {
      if (!["dashboard", "training", "challenge", "no_connection"].includes(String(route.name || ""))) {
        fullPath = route.fullPath;
        router.push({ name: "no_connection" });
      }
    }
  });

  AppShortcuts.addListener("click", async ({ shortcutId }) => {
    const isLogged = await persistentSession.isLogged();

    switch(shortcutId) {
      case "login":
        if (!isLogged) {
          router.push({ name: "login", query: { mode: "login" } });
        }
        break;
      case "register":
        if (!isLogged) {
          router.push({ name: "login", query: { mode: "register" } });
        }
        break;
      case "register_training":
        if (isLogged) {
          router.push({ name: "dashboard", query: { tab: "training", mode: "dashboard" } });
        }
        break;
      case "register_activity":
        if (isLogged) {
          router.push({ name: "dashboard", query: { tab: "home", mode: "activity" } });
        }
        break;
      case "register_meal":
        if (isLogged) {
          router.push({
            name: "dashboard",
            query: {
              mode: "dashboard",
              tab: "progress",
              list: "nutrition",
              operation: "new"
            }
          });
        }
        break;
    };
  });

  Keyboard.addListener("keyboardWillShow", () => appStore.open_keyboard = true);
  Keyboard.addListener("keyboardDidShow", () => appStore.open_keyboard = true);
  Keyboard.addListener("keyboardWillHide", () => appStore.open_keyboard = false);
  Keyboard.addListener("keyboardDidHide", () => appStore.open_keyboard = false);

  createAppIcons();

  CordovaNotifications.local.on("REPLY_ACTION", async (notification: any, event: any) => {
    const text = event.text;
    const { id } = notification;
    const [key, value] = String(id).split(":");

    switch(key) {
      case "friendship":
        await socialStore.SEND_MESSAGE(value!, { type: "TEXT", text });
        break;
    };
  });

  CordovaNotifications.local.on("OPEN_CHAT", (notification: any, event: any) => {
    const { id } = notification;
    const [key, value] = String(id).split(":");

    switch(key) {
      case "friendship":
        eventBus.emit("OPEN_CHAT", { friendship_id: value! });
        break;
    };
  });

  CordovaNotifications.local.on("click", (notification: any, event: any) => {
    const { id } = notification;
    const [key, value] = String(id).split(":");

    switch(key) {
      case "friendship":
        eventBus.emit("OPEN_CHAT", { friendship_id: value! });
        break;
    };
  });

  ScreenshotEvent.addListener("userDidTakeScreenshot", () => eventBus.emit("TAKE_SCREENSHOT"));
  ScreenshotEvent.startWatchEvent();
}, false);

/// LIFE CYCLES
onMounted(async () => {
  appStore.title_notification_background_geolocation = t("$vuetify.label.activity_in_progress");
  appStore.message_notification_background_geolocation = t("$vuetify.message.zen_move_fit_is_monitoring_your_activity");

  // Configurações iniciais da tela
  statusBarHeight.value = "0px";
  navigationBarHeight.value = "0px";

  root.style.setProperty("--top-saved", "0px");
  root.style.setProperty("--top", "0px");
  root.style.setProperty("--bottom-saved", "0px");
  root.style.setProperty("--bottom", "0px");

  // Handlers eventBus
  eventBus.on("SET_FULLSCREEN", ({ enabled }) => isFullscreen.value = enabled);
  eventBus.on("SET_LOADER", ({ enabled }) => loader.value = enabled);
  eventBus.on("FINISH_APP", () => App.exitApp());
  eventBus.on("START_SUBSCRIPTION", () => startSubscription.value = true);
  eventBus.on("CREATE_PLAN", () => startCreatePlan.value = true);
  eventBus.on("NO_CONNECTION", () => router.push({ name: "no_connection" }));
  eventBus.on("SESSION_EXPIRED", () => logout(false));
  eventBus.on("REFRESH_SAFE_AREA", () => refreshSafeAreaInsets());
  eventBus.on("SAVE_OFFLINE_ACTIVITY", () => saveActivityOffline());
  eventBus.on("UPDATE_APP_ICONS", () => createAppIcons());
  eventBus.on("SNACKBAR", ({ message, icon, color }) => {
    if (snackbar.enable) {
      clearTimeout(timeout.value!);
      snackbar.enable = false;
    }

    nextTick(() => {
      snackbar.enable = true;
      snackbar.message = message;
      snackbar.icon = icon ?? "";
      snackbar.color = color ?? "";
    });
  });
  eventBus.on("STATUS_BAR", (result) => {
    if ("show" in result) statusBarShow.value = result.show!;
    if ("color" in result) statusBarColor.value = result.color!;
  });
  eventBus.on("NAVIGATION_BAR", (result) => {
    if ("show" in result) navigationBarShow.value = result.show!;
    if ("color" in result) navigationBarColor.value = result.color!;
  });
  eventBus.on("SHOW_IMAGE", ({ images }) => {
    ViewerApi({ images, options: optionsShowPicture.value });
  });
  eventBus.on("MAINTENANCE_MODE", ({ message }) => {
    appStore.maintenance_message = message;

    const inActivity = route.query.mode === "activity" || ["training", "challenge"].includes(String(route.name || ""));

    if (inActivity || route.name === "maintenance") return;

    router.push({ name: "maintenance" });
  });
  eventBus.on("BACK_ROUTER", () => {
    if (historyPaths.length) {
      if (route.name !== "dashboard") {
        const filteredRoutes = historyPaths.filter((path) => !path.startsWith(route.path));
        if (filteredRoutes.length) router.push(filteredRoutes[filteredRoutes.length - 1]!);
        else router.back();
      } else {
        const routeResolved = router.resolve({ path: historyPaths[historyPaths.length - 1]! });
        if (route.name !== routeResolved.name) {
          router.push(historyPaths[historyPaths.length - 1]!);
        } else {
          router.replace({
            replace: true,
            query: { ...route.query, mode: "dashboard" }
          });
        }
      }
    } else {
      router.back();
    }
  });

  saveActivityOffline();
  handleSocketEvents();

  // Warm up device attestation in the background so it's already registered
  // by the time the user reaches login, signup, or a payment screen.
  attestationService.ensureKey();
});

/// METHODS
const applySafeAreaInsets = (insets: { top: number, bottom: number }) => {
  statusBarHeight.value = `${insets.top}px`;
  navigationBarHeight.value = `${insets.bottom}px`;

  root.style.setProperty("--top-saved", `${insets.top}px`);
  root.style.setProperty("--top", `${insets.top}px`);
  root.style.setProperty("--bottom-saved", `${insets.bottom}px`);
  root.style.setProperty("--bottom", `${insets.bottom}px`);
};

const refreshSafeAreaInsets = async () => {
  const { insets } = await SafeArea.getSafeAreaInsets();
  applySafeAreaInsets(insets);
};

const saveActivityOffline = () => {
  if (intervalSaveActivity !== null) return;
  handleIntervalSaveActivityOffline();
};

const handleIntervalSaveActivityOffline = () => {
  intervalSaveActivity = setTimeout(async () => {
    if (appStore.internet) {
      const getList = async (): Promise<number[]> => JSON.parse(
        (await persistentSession.get("offline-activity")) || "[]"
      );

      let list: number[] = await getList();
      let saved = 0;

      for (const key of list) {
        const body = JSON.parse(
          (await persistentSession.get(`offline-activity-${key}`)) || "{}"
        ) as Record<string, any>;

        let files = JSON.parse(
          (await persistentSession.get(`offline-medias-${key}`)) || "[]"
        ) as Omit<MediaResult, "base64">[];

        for (const file of files) {
          const exists = await mediaService.fileExists(file.uri);

          if (!exists) {
            files = files.filter((f) => f.id !== file.id);
          }
        }

        const formattedFiles = await Promise.all(
          files.map(async (file) => {
            const base64 = await mediaService.getBase64(file.path);
            return { base64, ...file };
          })
        );

        body.files = formattedFiles
          .filter((file) => file.base64)
          .map((file) => ({
            base64: file.base64,
            format: file.format,
            mimetype: file.mimetype,
            type: file.type
          }));

        if (body.type === "AVULSE") {
          await sqliteService.init();

          const coords = await sqliteService.getWorkoutPoints(body._id);

          body.points = coords.map((point, i) => ({
            id: i + 1,
            accuracy: point.accuracy,
            altitude: point.altitude,
            altitudeAccuracy: point.altitudeAccuracy,
            lat: point.lat,
            lng: point.lng,
            speed: point.speed,
            time: point.time,
          }));

          body.map_picture = await getMapPicture(body.points);
        }

        const response = await activitiesStore.POST("", body);

        if (!response.error) {
          saved++;

          let updatedList = await getList();

          updatedList = updatedList.filter((item) => key !== item);

          accountsStore.GET_ACCOUNT();
          eventBus.emit("RELOAD_ACTIVITIES");

          if (body.type === "AVULSE") {
            await sqliteService.deleteWorkoutPoints(body._id);

            if (!isActivityInProgress.value) {
              await sqliteService.close();
            }
          }

          await Promise.all([
            persistentSession.set("offline-activity", JSON.stringify(updatedList)),
            persistentSession.remove(`offline-activity-${key}`),
            persistentSession.remove(`offline-medias-${key}`)
          ]);
        } else {
          break;
        }
      }

      if (saved) {
        const message = saved >= 2 ?
          t("$vuetify.label.synchronized_activities", saved) :
          t("$vuetify.label.synchronized_activity");

        eventBus.emit("SNACKBAR", { message });

        eventBus.emit("CHECK_ACHIEVEMENTS");
        eventBus.emit("CHECK_CHESTS");

        if (platform.value !== "web") {
          await CordovaNotifications.createNotification({
            id: CordovaNotifications.createId(),
            title: message,
            text: t("$vuetify.message.your_offline_activities_have_been_successfully_synchronized"),
            channel_id: "activity_sound",
          });
        }
      }

      list = await getList();

      if (list.length) {
        handleIntervalSaveActivityOffline();
      } else {
        intervalSaveActivity = null;
      }
    }
  }, 3000);
};

const getMapPicture = async (coords: NonNullable<Activity["points"]>) => {
  return await new Promise((resolve) => {
    const mapService = new MapService("map-app");

    mapService.init([coords[0]!.lng, coords[0]!.lat]);

    mapService.on("ready", () => {
      mapService!.initActivityLine(2);
      mapService!.showWorkoutRoute(
        coords.map((point) => ({
          lat: point.lat,
          lng: point.lng,
          accuracy: point.accuracy,
          speed: point.speed
        }))
      );

      nextTick(async () => {
        const result = {
          base64: (await mapService!.getMapImage()) || "",
          format: "png",
          mimetype: "image/png",
          type: "image"
        };

        mapService.destroy();

        resolve(result);
      });
    });
  });
};

const createAppIcons = async () => {
  if (platform.value !== "web") {
    const isLogged = await persistentSession.isLogged();

    await AppShortcuts.set({
      shortcuts: [
        ...(
          !isLogged ?
            [
              {
                id: "login",
                title: t("$vuetify.label.login"),
                description: t("$vuetify.label.log_in_to_account"),
                androidIcon: await fileToBase64(LoginIcon),
                iosIcon: await fileToBase64(LoginIcon)
              },
              {
                id: "register",
                title: t("$vuetify.label.create_account"),
                description: t("$vuetify.label.create_account"),
                androidIcon: await fileToBase64(RegisterIcon),
                iosIcon: await fileToBase64(RegisterIcon)
              }
            ] :
            [
              {
                id: "register_training",
                title: t("$vuetify.label.register_workout"),
                description: t("$vuetify.label.register_workout"),
                androidIcon: await fileToBase64(RegisterTrainingIcon),
                iosIcon: await fileToBase64(RegisterTrainingIcon)
              },
              {
                id: "register_activity",
                title: t("$vuetify.label.register_activity"),
                description: t("$vuetify.label.register_activity"),
                androidIcon: await fileToBase64(RegisterActivityIcon),
                iosIcon: await fileToBase64(RegisterActivityIcon)
              },
              {
                id: "register_meal",
                title: t("$vuetify.label.register_meal"),
                description: t("$vuetify.label.register_meal"),
                androidIcon: await fileToBase64(RegisterMealIcon),
                iosIcon: await fileToBase64(RegisterMealIcon)
              },
            ]
        )
      ],
    });
  }
};

const handleSocketEvents = () => {
  socketService.on("NEW_MESSAGE", async (message: ReceivedMessage) => {
    if (!appStore.foreground || socialStore.chat.friendship_id !== message.friendship_id) {
      CordovaNotifications.createNotification({
        id: `friendship:${message.friendship_id}`,
        title: message.name,
        text: message.type === "TEXT" ? message.text : t(`$vuetify.label.${message.type.toLowerCase()}_message`),
        actions: "REPLY",
        channel_id: "activity_sound"
      });
    }

    if (socialStore.chat.friendship_id === message.friendship_id) {
      delete (message as any).name;
      delete (message as any).image;
      socialStore.messages.results.set(message.message_id, message);
    }

    if (socialStore.chats.results.has(message.friendship_id)) {
      const chat = await socialStore.GET_CHAT(message.friendship_id);
      if (chat) socialStore.chats.results.set(message.friendship_id, chat);
    }

    if (message.receiver === account.value._id) socialStore.GET_UNREAD_MESSAGES();
  });

  socketService.on("UPDATE_MESSAGE", async (message: ReceivedMessage) => {
    if (socialStore.chat.friendship_id === message.friendship_id) {
      delete (message as any).name;
      delete (message as any).image;
      socialStore.messages.results.set(message.message_id, message);
    }

    if (socialStore.chats.results.has(message.friendship_id)) {
      const chat = await socialStore.GET_CHAT(message.friendship_id);
      if (chat) socialStore.chats.results.set(message.friendship_id, chat);
    }
  });

  socketService.on("ACHIEVEMENT_UNLOCKED", () => eventBus.emit("CHECK_ACHIEVEMENTS"));

  socketService.on("CHEST_GRANTED", () => eventBus.emit("CHECK_CHESTS"));
};
</script>

<style lang="sass">
div.v-application
  width: 100%
  height: 100vh
  overflow: hidden

  main#application
    height: v-bind(mainHeight)
    background-color: var(--secondary)

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