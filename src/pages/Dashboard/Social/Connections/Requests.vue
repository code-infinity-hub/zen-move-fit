<template>
  <div class="d-flex flex-column">
    <p class="font-space-grotesk text-body-2 font-weight-bold text-grey-lighten-1 mb-3">
      {{ `${t("$vuetify.label.total")} (${formatNumber(countRequests)})` }}
    </p>

    <div class="d-flex flex-column ga-3">
      <div
        v-ripple
        v-for="request in requests"
        :key="request.account_id"
        class="bg-quintet border-sextet rounded-lg d-flex justify-center align-center ga-3 px-3 py-3"
        @click="openProfile($event, request.account_id)"
      >
        <div>
          <ProfileImage
            size="2.5rem"
            :image="request.image"
            :name="request.name"
          />
        </div>

        <div class="w-100 d-flex flex-column ga-1 text-left overflow-hidden">
          <div class="w-100 d-flex ga-1">
            <span class="font-weight-bold text-truncate">
              {{ request.name }}
            </span>

            <v-icon
              v-if="request.verified"
              color="blue"
              @click="bottomSheet.verified = true"
            >mdi-shield-check</v-icon>
          </div>

          <p
            class="text-grey-lighten-1"
            :style="{ fontSize: '0.65rem' }"
          >{{ `${t("$vuetify.label.level")} ${formatNumber(request.level || 0)}` }}</p>
        </div>

        <div class="d-flex ga-1">
          <button
            v-ripple
            class="rounded-lg bg-tertiary"
            :style="{ width: '3rem', height: '2rem' }"
            @click="changeStatusFriendship(request.friendship_id, request.account_id, 'DONE')"
          >
            <v-icon color="success">
              mdi-check
            </v-icon>
          </button>

          <button
            v-ripple
            class="rounded-lg bg-tertiary"
            :style="{ width: '3rem', height: '2rem' }"
            @click="changeStatusFriendship(request.friendship_id, request.account_id, 'REFUSED')"
          >
            <v-icon color="error">
              mdi-close
            </v-icon>
          </button>
        </div>
      </div>
    </div>

    <LoadingData v-if="loadingData" />
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { useSocialStore } from "@/stores/social";
import { useFormatNumber } from "@/composables";
import { observerScroll } from "@/utils";
import { eventBus } from "@/eventBus";
import { type RequestFriendStatuses } from "@/types/social.type";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const router = useRouter();
const socialStore = useSocialStore();

const bottomSheet = reactive({ verified: false });

const loadingData = ref(false);

let observer: null | ReturnType<typeof observerScroll> = null;

/// COMPUTED
const requests = computed(() =>
  [...socialStore.requests.results.values()].sort((a, b) => a.name.localeCompare(b.name))
);

const countRequests = computed(() => socialStore.requests.total);

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
    (socialStore.requests.page + 1) <= socialStore.requests.pages
  ) {
    loadingData.value = true;
    await socialStore.GET_REQUESTS();
    loadingData.value = false;
  }
};

const openProfile = (event: Event, account_id: string) => {
  const tagName = (event.target as HTMLElement).tagName.toLowerCase();

  if (!["button", "i"].includes(tagName)) {
    router.push({
      name: "profile",
      params: { _id: account_id }
    });
  }
};

const changeStatusFriendship = async (friendship_id: string, account_id: string, status: RequestFriendStatuses) => {
  eventBus.emit("SET_LOADER", { enabled: true });
  await socialStore.CHANGE_FRIENDSHIP_STATUS(friendship_id, account_id, status);
  eventBus.emit("SET_LOADER", { enabled: false });
};
</script>