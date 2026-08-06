<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <div
      v-if="!profile"
      class="w-100 h-100 d-flex flex-column justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <template v-else>
      <header class="heading border-bottom-tertiary d-flex justify-space-between align-center">
        <v-btn
          icon=""
          size="x-small"
          color="tertiary"
          class="mr-4"
          @click="back()"
        >
          <v-icon :size="18">mdi-arrow-left</v-icon>
        </v-btn>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ `@${profile.username}` }}
        </p>

        <v-btn
          icon=""
          size="x-small"
          color="tertiary"
          class="ml-4"
          :style="{ visibility: 'hidden' }"
        >
          <v-icon :size="18">mdi-arrow-left</v-icon>
        </v-btn>
      </header>

      <div ref="scrollRef" class="flex-fill overflow-y-auto px-4 pt-3 pb-5">
        <PullToRefreshIndicator
          :is-pulling="ptr.isPulling.value"
          :is-refreshing="ptr.isRefreshing.value"
          :pull-distance="ptr.pullDistance.value"
          :threshold="ptr.threshold"
        />

        <div class="d-flex ga-4">
          <div class="d-flex justify-center">
            <ProfileImage
              size="72px"
              :image="profile.image"
              :name="profile.name"
            />
          </div>

          <div class="d-flex flex-column w-100 mb-2">
            <p
              class="font-space-grotesk font-weight-bold mb-1"
              :style="{ fontSize: '1.125rem' }"
            >
              <span>{{ profile.name.split(" ").slice(0, 4).join(" ") }}</span>

              <v-icon
                v-if="profile.verified"
                color="blue"
                class="ml-1"
                :size="18"
                @click="bottomSheet.verified = true"
              >mdi-shield-check</v-icon>
            </p>

            <p class="text-caption text-yellow-lighten-1 mb-1">
              <v-icon>mdi-flash-outline</v-icon>
              <span>{{ `${t("$vuetify.label.level")} ${profile.level}` }}</span>
              <span class="mx-2">•</span>
              <span>{{ t(`$vuetify.levels.${profile.classification}`) }}</span>
            </p>

            <p class="text-caption d-flex ga-2 text-lowercase text-grey-lighten-1">
              <v-icon>mdi-account-multiple-outline</v-icon>
              {{ `${formatNumber(profile.friends)} ${t(`$vuetify.label.friend${profile.friends > 1 ? "s" : ""}`)}` }}
            </p>
          </div>
        </div>

        <p
          v-if="profile.bio"
          class="text-body-2 text-medium-emphasis mt-2"
          :style="{ whiteSpace: 'pre-line' }"
        >{{ profile.bio }}</p>

        <div class="mt-3 mb-3">
          <v-btn
            v-if="isOwnProfile"
            rounded
            block
            variant="outlined"
            color="primary"
            class="pa-5 text-none"
            @click="navigateToEditProfile"
          >
            <v-icon start>mdi-pencil-outline</v-icon>
            {{ t("$vuetify.profile.edit_profile") }}
          </v-btn>
          <div class="d-flex ga-3" v-else>
            <v-row>
              <v-col :cols="friendshipStatus === 'friends' ? 6 : 12">
                <v-btn
                  block
                  rounded
                  class="text-none pa-5 text-caption"
                  :variant="friendshipStatus === 'friends' ? 'outlined' : 'tonal'"
                  :color="friendshipStatus === 'friends' ? 'error' : 'primary'"
                  :loading="isLoadingFriendship"
                  @click="handleFriendshipAction"
                >
                  <v-icon start :size="18">
                    {{ friendshipIcon }}
                  </v-icon>

                  {{ friendshipLabel }}
                </v-btn>
              </v-col>

              <v-col
                v-if="friendshipStatus === 'friends'"
                cols="6"
              >
                <v-btn
                  block
                  rounded
                  class="text-none pa-5 text-caption"
                  variant="tonal"
                  @click="navigateToMessage"
                >
                  <v-icon start :size="18">
                    mdi-message-outline
                  </v-icon>

                  {{ t("$vuetify.profile.message") }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>

        <div
          v-if="hasVisibleStats"
          class="d-flex ga-2 mt-3"
        >
          <template
            v-for="stat in statsCards.filter((item) => item.value !== null)"
            :key="stat.key"
          >
            <div
              :style="{ width: `calc(100% / ${visibleStatsCount})` }"
              class="stat-card bg-quintet border-sextet rounded-lg d-flex flex-column align-center justify-center px-1 py-3"
            >
              <span class="text-h6 font-weight-bold font-space-grotesk">
                {{ formatNumber(stat.value!) }}
              </span>

              <span class="text-caption text-medium-emphasis">
                {{ stat.label }}
              </span>
            </div>
          </template>
        </div>

        <div
          v-if="hasVisibleBodyStats"
          class="d-flex ga-2 mt-2"
        >
          <div
            v-if="profile.body.weight !== null"
            :style="{ width: `calc(100% / ${visibleBodyCount})` }"
            class="stat-card bg-quintet border-sextet rounded-lg d-flex flex-column align-center justify-center pa-3"
          >
            <span class="text-h6 font-weight-bold font-space-grotesk">
              {{ formatNumber(profile.body.weight) }}
            </span>

            <span class="text-caption text-medium-emphasis">
              {{ `${t("$vuetify.label.weight")} (${t("$vuetify.label.kg_abbreviation")})` }}
            </span>
          </div>

          <div
            v-if="profile.body.height !== null"
            :style="{ width: `calc(100% / ${visibleBodyCount})` }"
            class="stat-card bg-quintet border-sextet rounded-lg d-flex flex-column align-center justify-center pa-3"
          >
            <span class="text-h6 font-weight-bold font-space-grotesk">
              {{ formatNumber(profile.body.height) }}
            </span>

            <span class="text-caption text-medium-emphasis">
              {{ `${t("$vuetify.label.height")} (${t("$vuetify.label.cm_abbreviation")})` }}
            </span>
          </div>
        </div>

        <div
          v-if="!isOwnProfile && profile.is_private && friendshipStatus !== 'friends'"
          class="d-flex align-center justify-center ga-2 mt-3 py-3"
        >
          <v-icon color="medium-emphasis" :size="18">
            mdi-lock-outline
          </v-icon>

          <span class="text-caption text-medium-emphasis">
            {{ t("$vuetify.profile.private_account") }}
          </span>
        </div>
        <template v-else>
          <div class="mt-5 d-flex ga-2 flex-wrap">
            <v-btn
              v-for="(option, i) in options.filter((item) => item.enabled)"
              :key="i"
              :class="[
                'rounded-pill text-none text-body-2',
                tab === i ? 'text-black font-weight-bold' : ''
              ]"
              :color="tab === i ? 'primary' : 'tertiary'"
              @click="tab = i"
            >
              {{ `${option.label} (${formatNumber(option.quantity)})` }}
            </v-btn>
          </div>

          <v-tabs-window v-model="tab" class="mt-5">
            <v-tabs-window-item>
              <div>
                <div
                  v-if="socialStore.user_posts.restricted"
                  class="d-flex flex-column align-center justify-center ga-2 py-6"
                >
                  <v-icon color="medium-emphasis" :size="32">
                    mdi-lock-outline
                  </v-icon>

                  <span class="text-body-2 text-medium-emphasis text-center">
                    {{ t("$vuetify.profile.private_posts") }}
                  </span>
                </div>
                <template v-else-if="posts.length > 0">
                  <div class="d-flex flex-column ga-3">
                    <PostCard
                      v-for="post in posts"
                      :key="post.post_id"
                      :post="post"
                    />
                  </div>

                  <LoadingData v-if="loadingMorePosts" />
                </template>
                <div
                  v-else
                  class="d-flex justify-center py-6"
                >
                  <span class="text-body-2 text-medium-emphasis">
                    {{ t("$vuetify.profile.no_publications") }}
                  </span>
                </div>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item>
              <div>
                <div
                  v-if="socialStore.user_activities.restricted"
                  class="d-flex flex-column align-center justify-center ga-2 py-6"
                >
                  <v-icon color="medium-emphasis" :size="32">
                    mdi-lock-outline
                  </v-icon>

                  <span class="text-body-2 text-medium-emphasis text-center">
                    {{ t("$vuetify.profile.private_activities") }}
                  </span>
                </div>
                <template v-else-if="activities.length > 0">
                  <div class="d-flex flex-column ga-3">
                    <ActivityCard
                      v-for="activity in activities"
                      :key="activity._id"
                      :activity="activity"
                      :show-calories="showActivitiesCalories"
                    />
                  </div>

                  <LoadingData v-if="loadingMoreActivities" />
                </template>
                <div
                  v-else
                  class="d-flex justify-center py-6"
                >
                  <span class="text-body-2 text-medium-emphasis">
                    {{ t("$vuetify.profile.no_activities") }}
                  </span>
                </div>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item></v-tabs-window-item>
          </v-tabs-window>
        </template>
      </div>

      <AuthenticatedAccount v-model="bottomSheet.verified" />

      <v-fab-transition>
        <v-btn
          v-if="showScrollTop"
          icon="mdi-arrow-up"
          color="primary"
          size="large"
          class="position-fixed border-tertiary"
          :style="{ top: '90vh', right: '1rem' }"
          @click="scrollToTop"
        ></v-btn>
      </v-fab-transition>
    </template>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { useSocialStore } from "@/stores/social";
import { useFormatNumber, usePullToRefresh } from "@/composables";
import { observerScroll } from "@/utils";
import { type Profile } from "@/types/social.type";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";
import PostCard from "@/components/Social/PostCard.vue";
import ProfileImage from "@/components/ProfileImage.vue";
import ActivityCard from "@/components/Activity/ActivityCard.vue";
import PullToRefreshIndicator from "@/components/Social/PullToRefreshIndicator.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const socialStore = useSocialStore();
const tab = ref(0);

const profile = ref<Profile | null>(null);
const bottomSheet = reactive({ verified: false });
const scrollRef = ref<HTMLElement | null>(null);
const loadingMorePosts = ref(false);
const loadingMoreActivities = ref(false);
const showScrollTop = ref(false);
const SCROLL_TOP_THRESHOLD = 400;

const isLoadingFriendship = ref(false);

const ptr = usePullToRefresh({
  containerRef: scrollRef,
  onRefresh: async () => {
    profile.value = await socialStore.GET_PROFILE(_id.value);
    socialStore.RESET_USER_POSTS();
    socialStore.RESET_USER_ACTIVITIES();
    await Promise.all([
      socialStore.GET_USER_POSTS(_id.value),
      socialStore.GET_USER_ACTIVITIES(_id.value),
    ]);
  },
});

let observer: null | ReturnType<typeof observerScroll> = null;

/// COMPUTED
const _id = computed(() => route.params._id as string);
const currentUserId = computed(() => accountsStore._id);
const isOwnProfile = computed(() => currentUserId.value === profile.value?.account_id);
const friendshipStatus = computed(() => profile.value?.current_user_relationship?.friendship_status ?? "none");
const options = computed(() => [
  {
    label: t("$vuetify.profile.publications"),
    quantity: posts.value.length,
    enabled: posts.value.length > 0 || activities.value.length === 0
  },
  {
    label: t("$vuetify.profile.activities"),
    quantity: activities.value.length,
    enabled: activities.value.length > 0
  },
]);
const friendshipIcon = computed(() => {
  switch (friendshipStatus.value) {
    case "friends":
      return "mdi-account-remove-outline";
    case "pending_sent":
      return "mdi-account-clock-outline";
    case "pending_received":
      return "mdi-account-check-outline";
    default:
      return "mdi-account-plus-outline";
  }
});
const friendshipLabel = computed(() => {
  switch (friendshipStatus.value) {
    case "friends":
      return t("$vuetify.profile.remove_friend");
    case "pending_sent":
      return t("$vuetify.profile.pending");
    case "pending_received":
      return t("$vuetify.profile.accept");
    default:
      return t("$vuetify.profile.add_friend");
  }
});
const statsCards = computed(() => [
  {
    key: "workouts",
    value: profile.value?.stats?.total_workouts ?? null,
    label: t("$vuetify.profile.workouts"),
  },
  {
    key: "km",
    value: profile.value?.stats?.total_km ?? null,
    label: t("$vuetify.label.km"),
  },
  {
    key: "achievements",
    value: profile.value?.stats?.total_achievements ?? null,
    label: t("$vuetify.profile.achievements"),
  },
  {
    key: "calories",
    value: profile.value?.stats?.total_calories ?? null,
    label: t("$vuetify.label.kcal_abbreviation"),
  },
]);
const hasVisibleStats = computed(() => statsCards.value.some((s) => s.value !== null));
const visibleStatsCount = computed(() => statsCards.value.filter((s) => s.value !== null).length);
const hasVisibleBodyStats = computed(() =>
  (profile.value?.body?.weight ?? null) !== null || (profile.value?.body?.height ?? null) !== null
);
const visibleBodyCount = computed(() => {
  const b = profile.value?.body;
  if (!b) return 0;
  return [b.weight, b.height].filter((v) => v !== null).length;
});
const showActivitiesCalories = computed(() =>
  isOwnProfile.value || profile.value?.stats?.total_calories !== null
);
const posts = computed(() =>
  [...socialStore.user_posts.results.values()].sort((a, b) =>
    dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
  )
);
const activities = computed(() =>
  [...socialStore.user_activities.results.values()].sort((a, b) =>
    dayjs(b.started_at).valueOf() - dayjs(a.started_at).valueOf()
  )
);

/// LIFECYCLE
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);
  profile.value = await socialStore.GET_PROFILE(_id.value);

  if (!options.value[0]!.enabled) {
    tab.value = 1;
  }

  socialStore.RESET_USER_POSTS();
  socialStore.RESET_USER_ACTIVITIES();
  await Promise.all([
    socialStore.GET_USER_POSTS(_id.value),
    socialStore.GET_USER_ACTIVITIES(_id.value),
  ]);

  nextTick(() => {
    if (scrollRef.value) {
      observer = observerScroll(scrollRef.value, handleScrollEnd);
      scrollRef.value.addEventListener("scroll", handleScroll, { passive: true });
    }
  });
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
  observer?.disconnect();
  scrollRef.value?.removeEventListener("scroll", handleScroll);
  socialStore.RESET_USER_POSTS();
  socialStore.RESET_USER_ACTIVITIES();
});

/// METHODS
const back = () => {
  eventBus.emit("BACK_ROUTER");
};

const handleScroll = () => {
  showScrollTop.value = (scrollRef.value?.scrollTop ?? 0) > SCROLL_TOP_THRESHOLD;
};

const scrollToTop = () => {
  scrollRef.value?.scrollTo({ top: 0, behavior: "smooth" });
};

const handleScrollEnd = async () => {
  if (tab.value === 0) {
    if (
      !loadingMorePosts.value &&
      (socialStore.user_posts.page + 1) <= socialStore.user_posts.pages
    ) {
      loadingMorePosts.value = true;
      await socialStore.GET_USER_POSTS(_id.value);
      loadingMorePosts.value = false;
    }
  } else if (tab.value === 1) {
    if (
      !loadingMoreActivities.value &&
      (socialStore.user_activities.page + 1) <= socialStore.user_activities.pages
    ) {
      loadingMoreActivities.value = true;
      await socialStore.GET_USER_ACTIVITIES(_id.value);
      loadingMoreActivities.value = false;
    }
  }
};

const handleFriendshipAction = async () => {
  if (!profile.value) return;

  isLoadingFriendship.value = true;

  try {
    await socialStore.HANDLE_FRIENDSHIP(
      profile.value.account_id,
      friendshipStatus.value,
      profile.value.current_user_relationship?.friendship_id,
    );
    profile.value = await socialStore.GET_PROFILE(_id.value);
    socialStore.RESET_USER_POSTS();
    socialStore.RESET_USER_ACTIVITIES();
    await Promise.all([
      socialStore.GET_USER_POSTS(_id.value),
      socialStore.GET_USER_ACTIVITIES(_id.value),
    ]);
  } finally {
    isLoadingFriendship.value = false;
  }
};

const navigateToEditProfile = () => {
  router.push({ name: "dashboard", query: { tab: "account", list: "activities" } });
};

const navigateToMessage = () => {
  const friendship_id = profile.value?.current_user_relationship?.friendship_id;
  if (friendship_id) {
    router.push({
      name: "dashboard",
      query: {
        tab: "social",
        mode: "chat",
        list: "connections",
        option: "friends",
        chat: friendship_id
      }
    });
  }
};
</script>

<style lang="sass" scoped>
.stat-card
  min-height: 64px
  cursor: default

.letter-spacing-wider
  letter-spacing: 0.08em
</style>