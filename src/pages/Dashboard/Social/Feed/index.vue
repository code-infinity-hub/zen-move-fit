<template>
  <div class="h-100">
    <PullToRefreshIndicator
      :is-pulling="ptr.isPulling.value"
      :is-refreshing="ptr.isRefreshing.value"
      :pull-distance="ptr.pullDistance.value"
      :threshold="ptr.threshold"
    />

    <CreatePost />

    <v-divider class="my-4" />

    <template v-if="!posts.length">
      <div class="text-center py-8">
        <v-icon
          :size="48"
          class="mb-3"
        >mdi-newspaper-variant-outline</v-icon>

        <p class="text-body-2">
          {{ t("$vuetify.message.no_posts_yet") }}
        </p>
      </div>
    </template>
    <template v-else>
      <div class="d-flex flex-column ga-3">
        <PostCard
          v-for="post in posts"
          :key="post.post_id"
          :post="post"
        />
      </div>

      <LoadingData v-if="loadingData" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useSocialStore } from "@/stores/social";
import { observerScroll } from "@/utils";
import { usePullToRefresh } from "@/composables";

/// COMPONENTS
import CreatePost from "@/components/Social/CreatePost.vue";
import LoadingData from "@/components/LoadingData.vue";
import PostCard from "@/components/Social/PostCard.vue";
import PullToRefreshIndicator from "@/components/Social/PullToRefreshIndicator.vue";

/// DATA
const { t } = useLocale();
const socialStore = useSocialStore();
const loadingData = ref(false);
const feedContainerRef = ref<HTMLElement | null>(null);

let observer: null | ReturnType<typeof observerScroll> = null;

const ptr = usePullToRefresh({
  containerRef: feedContainerRef,
  onRefresh: async () => {
    socialStore.RESET_POSTS();
    await socialStore.GET_POSTS();
  },
});

/// COMPUTED
const posts = computed(() =>
  [...socialStore.posts.results.values()].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
);

/// LIFE CYCLES
onMounted(async () => {
  feedContainerRef.value = document.querySelector(".overflow-social");

  observer = observerScroll(
    feedContainerRef.value as HTMLElement,
    handle
  );

  await socialStore.GET_POSTS();
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

/// METHODS
const handle = async () => {
  if (
    !loadingData.value &&
    (socialStore.posts.page + 1) <= socialStore.posts.pages
  ) {
    loadingData.value = true;
    await socialStore.GET_POSTS();
    loadingData.value = false;
  }
};
</script>