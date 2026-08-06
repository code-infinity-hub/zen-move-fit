<template>
  <div class="bg-quintet border-sextet rounded-lg">
    <div class="pa-3">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center ga-2">
          <ProfileImage
            size="40px"
            :image="post.account.image"
            :name="post.account.name"
            @click="openProfile(post.account._id)"
          />

          <div>
            <div class="d-flex align-center ga-1">
              <span
                class="text-body-2 font-weight-bold"
                @click="openProfile(post.account._id)"
              >{{ post.account.name }}</span>

              <v-icon
                v-if="post.account.verified"
                :size="18"
                color="blue"
                @click="bottomSheet.verified = true"
              >mdi-shield-check</v-icon>
            </div>

            <div>
              <span
                class="text-caption text-grey-lighten-1"
                @click="openProfile(post.account._id)"
              >{{ `@${post.account.username}` }}</span>

              <v-chip
                v-if="post.suggested"
                size="x-small"
                color="primary"
                variant="tonal"
                class="ml-1"
              >{{ t("$vuetify.label.suggested_post") }}</v-chip>
            </div>
          </div>
        </div>

        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              v-bind="menuProps"
            >
              <v-icon :size="20">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <List :style="{ minWidth: '12rem' }">
            <template v-if="isOwnPost">
              <v-list-item @click="bottomSheet.delete_post = true">
                <v-list-item-title>
                  <v-icon class="mr-2">
                    mdi-trash-can-outline
                  </v-icon>

                  {{ t("$vuetify.label.delete") }}
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item @click="toggleSave">
                <v-list-item-title>
                  <v-icon class="mr-2">
                    {{ post.is_saved ? "mdi-bookmark" : "mdi-bookmark-outline" }}
                  </v-icon>

                  {{ post.is_saved ? t("$vuetify.label.unsave") : t("$vuetify.label.save") }}
                </v-list-item-title>
              </v-list-item>

              <!-- <v-list-item @click="">
                <v-list-item-title>
                  <v-icon class="mr-2">
                    mdi-bullhorn-outline
                  </v-icon>

                  {{ t("$vuetify.label.report") }}
                </v-list-item-title>
              </v-list-item> -->

              <template v-if="post.suggested">
                <v-list-item @click="hideAuthor">
                  <v-list-item-title>
                    <v-icon class="mr-2">
                      mdi-eye-off-outline
                    </v-icon>

                    {{ t("$vuetify.label.dont_see_this_profile_anymore") }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item :disabled="friendRequestSent" @click="addFriend">
                  <v-list-item-title>
                    <v-icon class="mr-2">
                      mdi-account-plus-outline
                    </v-icon>

                    {{ friendRequestSent ? t("$vuetify.label.friend_request_sent") : t("$vuetify.label.add_as_friend") }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </template>

            <v-list-item @click="share">
              <v-list-item-title>
                <v-icon class="mr-2">
                  mdi-share-variant-outline
                </v-icon>

                {{ t("$vuetify.label.share") }}
              </v-list-item-title>
            </v-list-item>
          </List>
        </v-menu>
      </div>

      <p
        class="text-body-2 mb-2"
        :style="{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }"
      >
        <template v-if="post.post.length >= 80 && !showFullPost">
          {{ `${post.post.substring(0, 80)}...` }}
          <span
            class="text-lowercase text-grey-lighten-1"
            @click="showFullPost = true"
          >{{ t("$vuetify.label.more") }}</span>
        </template>
        <template v-else>
          <template v-for="(seg, i) in parsedPostContent" :key="i">
            <span
              v-if="seg.type === 'mention'"
              class="text-primary font-weight-medium"
              :style="{ cursor: seg.userId ? 'pointer' : 'default' }"
              @click="seg.userId && openProfile(seg.userId)"
            >{{ `@${seg.value}` }}</span>
            <span v-else>{{ seg.value }}</span>
          </template>
        </template>
      </p>

      <ActivityPostCard
        v-if="post.activity"
        class="mb-2"
        :activity="post.activity"
      />

      <div v-if="post.files?.length" class="mb-2">
        <template v-if="post.files.length === 1">
          <v-img
            v-if="post.files[0]!.mimetype.startsWith('image')"
            :src="post.files[0]!.url"
            rounded="lg"
            max-height="320"
            cover
            @click="eventBus.emit('SHOW_IMAGE', { images: [post.files[0]!.url] })"
          />
          <Player
            v-else
            class="rounded-lg"
            :video-id="[{ src: post.files[0]!.url, type: post.files[0]!.mimetype }]"
          />
        </template>
        <div
          v-else
          class="d-flex ga-1 overflow-x-auto"
        >
          <template v-for="(file, i) in post.files" :key="i">
            <v-img
              v-if="file.mimetype.startsWith('image')"
              :src="file.url"
              rounded="lg"
              width="160"
              height="160"
              cover
              class="flex-shrink-0"
              @click="eventBus.emit('SHOW_IMAGE', { images: [file.url] })"
            />
            <Player
              v-else
              class="rounded-lg"
              :style="{ minWidth: '20rem' }"
              :video-id="[{ src: file.url, type: file.mimetype }]"
            />
          </template>
        </div>
      </div>

      <div class="d-flex align-center ga-3 mt-2">
        <div class="d-flex align-center ga-1">
          <ReactionMenu v-model="showReactionMenu" @select="handleReactionSelect">
            <template #activator="{ props: menuProps }">
              <v-btn
                icon
                size="small"
                variant="text"
                v-bind="menuProps"
                :class="{ 'reaction-active': !!post.reactions.current_user_reaction }"
                @touchstart.prevent="onReactionTouchStart"
                @touchend.prevent="onReactionTouchEnd"
                @click.stop
              >
                <div class="reaction-stack">
                  <div
                    v-for="(item, index) in post.reactions.summary"
                    :key="item.type"
                    class="reaction-bubble"
                    :class="`reaction-bubble--${item.type.toLowerCase()}`"
                    :style="{ zIndex: post.reactions.summary.length - index }"
                  >
                    <v-icon :size="14" color="white">
                      {{ REACTION_MAP[item.type].icon }}
                    </v-icon>
                  </div>
                  <v-icon
                    v-if="post.reactions.summary.length === 0"
                    :size="20"
                    color="grey-lighten-1"
                  >mdi-heart-outline</v-icon>
                </div>
              </v-btn>
            </template>
          </ReactionMenu>

          <span class="text-caption text-grey-lighten-1">
            {{ formatCount(post.reactions.total) }}
          </span>
        </div>

        <div class="d-flex align-center ga-1">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="toggleComments"
          >
            <v-icon
              :size="20"
              :color="showComments ? 'primary' : 'grey-lighten-1'"
            >mdi-comment-outline</v-icon>
          </v-btn>

          <span class="text-caption text-grey-lighten-1">
            {{ formatCount(post.comment_count) }}
          </span>
        </div>

        <v-spacer />

        <div class="d-flex align-center ga-1">
          <v-btn
            icon
            size="small"
            variant="text"
            :disabled="isOwnPost"
            @click="toggleSave"
          >
            <v-icon
              :size="20"
              :color="post.is_saved ? 'primary' : 'grey-lighten-1'"
            >{{ post.is_saved ? "mdi-bookmark" : "mdi-bookmark-outline" }}</v-icon>
          </v-btn>

          <span
            v-if="post.save_count > 0"
            class="text-caption text-grey-lighten-1"
          >{{ formatCount(post.save_count) }}</span>
        </div>
      </div>
    </div>

    <template v-if="showComments">
      <v-divider />

      <CommentSection
        :post-id="post.post_id"
        :can-comment="post.current_user_permissions?.can_comment ?? true"
      />
    </template>

    <!-- BOTTOM SHEET EXPLICAÇÃO DE PERFIL VERIFICADO -->
    <AuthenticatedAccount
      v-model="bottomSheet.verified"
    />

    <v-bottom-sheet v-model="bottomSheet.delete_post">
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
            {{ t("$vuetify.label.post_deletion") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1">
            {{ t("$vuetify.message.post_deletion") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.delete_post = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="deletePost(post.post_id)"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts.ts";
import { useSocialStore } from "@/stores/social";
import { useFormatNumber, useReactionSound } from "@/composables";
import { parseCommentContent } from "@/utils";
import { eventBus } from "@/eventBus.ts";
import { Share } from "@/mobile";
import type { Post, PostReactionType } from "@/types/social.type";

/// COMPONENTS
import ActivityPostCard from "./ActivityPostCard.vue";
import CommentSection from "./CommentSection.vue";
import List from "../List.vue";
import Player from "../Player.vue";
import ProfileImage from "../ProfileImage.vue";
import ReactionMenu from "./ReactionMenu.vue";
import AuthenticatedAccount from "../AuthenticatedAccount.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { playReactionSound } = useReactionSound();
const props = defineProps<{ post: Post }>();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const socialStore = useSocialStore();
const showFullPost = ref(false);
const showComments = ref(false);
const showReactionMenu = ref(false);
const friendRequestSent = ref(false);
const bottomSheet = reactive({ verified: false, delete_post: false });

let longPressTimer: number | null = null;

const REACTION_MAP: Record<PostReactionType, { icon: string; color: string }> = {
  LIKE: { icon: "mdi-heart", color: "red-accent-4" },
  FIRE: { icon: "mdi-fire", color: "orange-accent-4" },
  STRENGTH: { icon: "mdi-arm-flex", color: "yellow-accent-4" },
  CLAP: { icon: "mdi-hand-clap", color: "amber-darken-1" },
};

/// COMPUTED
const currentUserId = computed(() => accountsStore._id);
const isOwnPost = computed(() => props.post.account._id === currentUserId.value);
const parsedPostContent = computed(() => parseCommentContent(props.post.post, props.post.mentions ?? []));

/// LIFE CYCLES
onUnmounted(() => {
  if (longPressTimer) clearTimeout(longPressTimer);
});

/// METHODS
const onReactionTouchStart = () => {
  longPressTimer = setTimeout(() => {
    longPressTimer = null;
    showReactionMenu.value = true;
  }, 400);
};

const onReactionTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    handleReactionTap();
  }
};

const handleReactionTap = () => {
  if (props.post.reactions.current_user_reaction) {
    socialStore.REMOVE_REACTION(props.post.post_id);
  } else {
    playReactionSound();
    socialStore.REACT_TO_POST(props.post.post_id, "LIKE");
  }
};

const toggleSave = () => {
  if (props.post.is_saved) {
    socialStore.UNSAVE_POST(props.post.post_id);
  } else {
    socialStore.SAVE_POST(props.post.post_id);
  }
};

const handleReactionSelect = (type: PostReactionType) => {
  if (props.post.reactions.current_user_reaction === type) {
    socialStore.REMOVE_REACTION(props.post.post_id);
  } else {
    playReactionSound();
    socialStore.REACT_TO_POST(props.post.post_id, type);
  }
};

const toggleComments = () => {
  showComments.value = !showComments.value;
};

const deletePost = async (post_id: string) => {
  try {
    bottomSheet.delete_post = false;
    eventBus.emit("SET_LOADER", { enabled: true });
    await socialStore.DELETE_POST(post_id);
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const formatCount = (n: number) => {
  if (n < 1000) return formatNumber(n, "decimal");
  if (n < 10000) return `${formatNumber(n / 1000, "decimal")}${t("$vuetify.label.k_label")}`;
  if (n < 1000000) return `${formatNumber(n / 1000, "decimal")}${t("$vuetify.label.k_label")}`;
  if (n < 10000000) return `${formatNumber(n / 1000000, "decimal")}${t("$vuetify.label.m_label")}`;
  return `${formatNumber(n / 1000000, "decimal")}${t("$vuetify.label.m_label")}`;
};

const reportPost = async (post_id: string) => { };

const hideAuthor = async () => {
  await socialStore.HIDE_AUTHOR(props.post.account._id);
};

const addFriend = async () => {
  if (friendRequestSent.value) return;
  const response = await socialStore.HANDLE_FRIENDSHIP(props.post.account._id, "none");
  if (!response.error) friendRequestSent.value = true;
};

const share = async () => {
  await Share.share({
    url: `${import.meta.env.VITE_URL_POST_SHARE}${props.post.post_id}`,
    dialogTitle: t("$vuetify.label.post"),
  });
};

const openProfile = (_id: string) => {
  if (currentUserId.value === _id) {
    router.replace({
      replace: true,
      query: { ...route.query, tab: "account" }
    });
  } else {
    router.push({ name: "profile", params: { _id } });
  }
};
</script>

<style lang="sass" scoped>
@keyframes reaction-pop
  0%
    transform: scale(1)

  30%
    transform: scale(1.4)

  60%
    transform: scale(0.9)

  80%
    transform: scale(1.1)

  100%
    transform: scale(1)

.reaction-active
  .v-icon
    animation: reaction-pop 400ms ease-out

.reaction-stack
  display: flex
  align-items: center

.reaction-bubble
  width: 22px
  height: 22px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  position: relative
  box-shadow: 0 0 0 2px var(--quintet)

  & + &
    margin-left: -6px

  &--like
    background-color: #E0245E

  &--fire
    background-color: #F4511E

  &--strength
    background-color: #F4B400

  &--clap
    background-color: #E37400
</style>