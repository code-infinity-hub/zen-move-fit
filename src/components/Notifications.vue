<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary">
    <header class="heading border-bottom-tertiary d-flex align-center">
      <v-btn
        icon=""
        size="x-small"
        color="tertiary"
        class="mr-4"
        @click="back"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <p class="text-h6 font-space-grotesk font-weight-bold flex-fill">
        {{ t("$vuetify.label.notifications") }}
      </p>

      <v-btn
        v-if="notificationsStore.pendants_notifications > 0"
        icon=""
        size="x-small"
        variant="text"
        :loading="markingAll"
        @click="markAllAsRead"
      >
        <v-icon color="primary">mdi-check-all</v-icon>
      </v-btn>
    </header>

    <div class="flex-fill overflow-y-auto pa-3 list-notifications">
      <div
        v-if="loading"
        class="w-100 d-flex justify-center align-center pa-6"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="40"
        />
      </div>
      <template v-else-if="notifications.length">
        <div
          v-ripple
          v-for="notification in notifications"
          :key="notification._id"
          :class="[
            'bg-quintet rounded-lg pa-3 mb-3 d-flex align-center ga-3',
            notification.read ? 'border-sextet' : 'border-tertiary'
          ]"
          :style="{ opacity: notification.read ? 0.7 : 1 }"
          @click="openNotification(notification)"
        >
          <div :style="{ height: 'stretch' }">
            <v-avatar
              v-if="notification.image"
              :image="notification.image"
              :size="42"
            />
            <div
              v-else
              class="d-flex justify-center align-center rounded-circle bg-theme-primary-15"
              :style="{ width: '42px', height: '42px' }"
            >
              <v-icon color="primary" :size="22">
                {{ iconByType(notification.type) }}
              </v-icon>
            </div>
          </div>

          <div class="flex-fill">
            <p class="text-body-2 font-weight-bold">
              {{ notification.title }}
            </p>

            <p class="text-caption text-grey-lighten-1">
              {{ notification.message }}
            </p>

            <p class="text-caption text-grey-darken-1 mt-1">
              {{ dayjs(notification.created_at).format("DD/MM/YYYY HH:mm") }}
            </p>
          </div>

          <div v-if="!notification.read">
            <div
              class="rounded-circle bg-primary"
              :style="{ width: '9px', height: '9px' }"
            ></div>
          </div>
        </div>

        <LoadingData v-if="loadingMore" />
      </template>
      <p
        v-else
        class="text-center text-grey-lighten-1 pa-6"
      >{{ t("$vuetify.label.no_notifications") }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import { useSocialStore } from "@/stores/social";
import { observerScroll } from "@/utils";
import { eventBus } from "@/eventBus";
import type { AppNotification, NotificationType } from "@/types/notification.type";

/// COMPONENTS
import LoadingData from "./LoadingData.vue";

/// DATA
const { t } = useLocale();
const router = useRouter();
const notificationsStore = useNotificationsStore();
const socialStore = useSocialStore();

const loading = ref(true);
const loadingMore = ref(false);
const markingAll = ref(false);

let observer: null | ReturnType<typeof observerScroll> = null;

/// COMPUTED
const notifications = computed(() => [...notificationsStore.notifications.results.values()]);

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);

  notificationsStore.RESET_NOTIFICATIONS();

  await Promise.all([
    notificationsStore.GET_NOTIFICATIONS(),
    notificationsStore.GET_COUNT_PENDANTS_NOTIFICATIONS(),
  ]);

  loading.value = false;

  nextTick(() => {
    observer = observerScroll(
      document.querySelector(".list-notifications") as HTMLElement,
      loadMore
    );
  });
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
  observer?.disconnect();
});

/// METHODS
const loadMore = async () => {
  const { page, pages } = notificationsStore.notifications;

  if (loadingMore.value || page >= pages) return;

  loadingMore.value = true;
  await notificationsStore.GET_NOTIFICATIONS();
  loadingMore.value = false;
};

const markAllAsRead = async () => {
  markingAll.value = true;
  await notificationsStore.MARK_ALL_AS_READ();
  markingAll.value = false;
};

const iconByType = (type: NotificationType) => {
  switch (type) {
    case "PLAN_READY":
      return "mdi-star-four-points-outline";
    case "TRAINING_INSIGHT":
    case "CHALLENGE_INSIGHT":
    case "ACTIVITY_INSIGHT":
      return "mdi-lightbulb-outline";
    case "ZENA_MESSAGE":
      return "mdi-robot-outline";
    case "ACTIVITY_TAG":
      return "mdi-tag-outline";
    case "STREAK_ALERT":
      return "mdi-fire";
    case "WEEKLY_WORKOUTS_COMPLETED":
    case "WEEKLY_CHALLENGES_COMPLETED":
      return "mdi-trophy-outline";
    case "POST_MENTION":
    case "COMMENT_MENTION":
      return "mdi-at";
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return "mdi-account-multiple-outline";
    case "ACHIEVEMENT":
      return "mdi-medal-outline";
    case "POST_REACTION":
      return "mdi-heart-outline";
    case "POST_COMMENT":
    case "COMMENT_REPLY":
      return "mdi-comment-outline";
    case "CHAT_MESSAGE":
      return "mdi-message-outline";
    case "LEVEL_UP":
      return "mdi-arrow-up-bold-circle-outline";
    case "PAYMENT_FAILED":
      return "mdi-credit-card-off-outline";
    case "SUBSCRIPTION_EXPIRING":
      return "mdi-clock-alert-outline";
    case "SUBSCRIPTION_ENDED":
      return "mdi-credit-card-remove-outline";
    case "SUBSCRIPTION_ACTIVATED":
      return "mdi-credit-card-check-outline";
    case "CREDIT_PURCHASE_PAID":
      return "mdi-cash-plus";
    case "CREDITS_LOW":
      return "mdi-alert-circle-outline";
    case "DOCUMENT_VERIFICATION_REQUIRED":
      return "mdi-file-document-outline";
    case "DOCUMENT_VERIFICATION_APPROVED":
      return "mdi-file-document-check-outline";
    case "DOCUMENT_VERIFICATION_REJECTED":
      return "mdi-file-document-remove-outline";
    case "DAILY_WORKOUT_REMINDER":
      return "mdi-alarm";
    case "MISSED_WORKOUT":
      return "mdi-calendar-remove-outline";
    case "EQUIPMENT_MILEAGE":
      return "mdi-shoe-sneaker";
    default:
      return "mdi-bell-outline";
  }
};

const openNotification = async (notification: AppNotification) => {
  if (!notification.read) {
    notificationsStore.MARK_AS_READ(notification._id);
  }

  const [key, value] = (notification.data?.id || "").split(":");

  switch (key) {
    case "VIEW_ACTIVITY":
      router.push({ name: "activity", params: { _id: value } });
      break;
    case "PENDING_TAGS":
      router.push({ name: "pending-tags" });
      break;
    case "OPEN_CHAT":
      if (notification.type === "CHAT_MESSAGE") {
        router.replace({
          replace: true,
          query: { mode: "chat", chat: value, tab: "social", list: "connections" }
        });
      } else {
        sessionStorage.setItem("chat-id", value!);
        router.push({ name: "ai_coach" });
      }
      break;
    case "VIEW_PROFILE":
      router.push({ name: "profile", params: { _id: value } });
      break;
    case "ACCEPT_FRIENDSHIP": {
      const request = await socialStore.GET_REQUEST(value!);

      if (request) {
        router.push({ name: "profile", params: { _id: request.account_id } });
      }
      break;
    }
    case "OPEN_POST":
      router.replace({
        replace: true,
        query: { mode: "dashboard", tab: "social", list: "feed" }
      });
      break;
    case "OPEN_SUBSCRIPTION":
      router.push({ name: "subscription" });
      break;
    case "OPEN_WALLET":
      router.push({ name: "refer_and_earn" });
      break;
  };
};

const back = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>
