<template>
  <div>
    <p
      v-if="comment.deleted"
      class="text-caption text-grey-lighten-1 font-italic pl-1"
    >{{ t("$vuetify.label.deleted_comment") }}</p>
    <template v-else>
      <div class="d-flex ga-2">
        <ProfileImage
          size="32px"
          :image="comment.account.image"
          :name="comment.account.name"
          @click="navigateToAccount(comment.account._id)"
        />

        <div class="flex-fill">
          <div class="comment-bubble pa-2 rounded-lg">
            <p
              @click="navigateToAccount(comment.account._id)"
              class="text-caption font-weight-bold"
            >{{ comment.account.name }}</p>

            <p class="text-body-2 mt-1" :style="{ whiteSpace: 'pre-wrap' }">
              <template v-for="(seg, i) in parsedContent" :key="i">
                <span
                  v-if="seg.type === 'mention'"
                  class="text-primary font-weight-medium cursor-pointer"
                  @click="navigateToAccount(seg.userId)"
                >{{ `@${seg.value}` }}</span>
                <span v-else>{{ seg.value }}</span>
              </template>
            </p>
          </div>

          <div class="d-flex align-center ga-3 mt-2 px-1">
            <span
              @click="navigateToAccount(comment.account._id)"
              class="text-caption text-grey-lighten-1"
            >{{ formatTime(comment.created_at) }}</span>

            <template v-if="depth === 0">
              <span class="text-caption text-grey-lighten-1">•</span>

              <span
                class="text-caption cursor-pointer"
                :class="isReplying ? 'text-primary' : 'text-grey-lighten-1'"
                @click="isReplying ? closeReply() : openReply()"
              >{{ isReplying ? t("$vuetify.label.cancel") : t("$vuetify.label.reply") }}</span>
            </template>

            <template v-if="comment.permissions.can_delete">
              <span class="text-caption text-grey-lighten-1">•</span>

              <span
                class="text-caption text-red-accent-2 cursor-pointer"
                @click="handleDelete"
              >{{ t("$vuetify.label.delete") }}</span>
            </template>
          </div>

          <div
            v-if="depth === 0 && isReplying"
            class="mt-2 pl-0 position-relative"
          >
            <div class="d-flex align-end ga-2">
              <TextareaField
                auto-grow
                no-resize
                enable-emoji
                :rows="1"
                :max-rows="4"
                :disabled="isSubmittingReply"
                :placeholder="`${t('$vuetify.label.reply')}...`"
                :class="['flex-fill', textClass]"
                v-model="replyText"
                @input="replyMention.onInput"
                @keydown="onReplyKeydown"
              />

              <v-btn
                icon
                size="small"
                color="primary"
                :loading="isSubmittingReply"
                :disabled="!replyText.trim()"
                @click="submitReply"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>

            <MentionDropdown
              v-if="replyMention.mentionQuery.value !== null && replyMention.mentionQuery.value.length >= 1"
              :results="replyMention.mentionResults.value"
              :is-loading="replyMention.isSearchingMentions.value"
              :selected-index="replyMention.selectedIndex.value"
              class="mention-dropdown-anchor"
              @select="replyMention.selectMention"
            />
          </div>

          <template v-if="depth === 0 && comment.reply_count > 0">
            <div class="mt-2">
              <div
                v-if="loadingReplies"
                class="d-flex justify-center align-center py-3"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="30"
                />
              </div>
              <v-btn
                v-else-if="!showReplies"
                variant="text"
                size="x-small"
                color="grey-lighten-1"
                class="text-none px-1"
                @click="loadReplies"
              >{{ t("$vuetify.label.see_x_replies", comment.reply_count) }}</v-btn>
              <div
                v-if="showReplies"
                class="d-flex flex-column ga-3 mt-4 pl-5 border-s-md border-primary border-opacity-100"
              >
                <CommentItem
                  v-for="reply in replies"
                  :key="reply._id"
                  :comment="reply"
                  :post-id="postId"
                  :depth="1"
                  :active-reply-id="null"
                />

                <v-btn
                  v-if="moreReplies"
                  block
                  variant="text"
                  size="small"
                  color="grey-lighten-1"
                  class="mt-3 text-none"
                  @click="loadReplies"
                >{{ t("$vuetify.label.see_more_replies") }}</v-btn>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { v4 } from "uuid";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { useSocialStore } from "@/stores/social";
import { parseCommentContent } from "@/utils/parse-comment-content";
import { useMentionInput } from "@/composables/use-mention-input";
import { type PostComment } from "@/types/social.type";

/// COMPONENTS
import ProfileImage from "../ProfileImage.vue";
import MentionDropdown from "./MentionDropdown.vue";

/// DATA
const { t } = useLocale();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const socialStore = useSocialStore();
const props = defineProps<{
  comment: PostComment,
  postId: string,
  depth?: number,
  activeReplyId?: string | null,
}>();
const emit = defineEmits<{
  "open-reply": [commentId: string];
  "close-reply": [];
  delete: [commentId: string];
}>();

const loadingReplies = ref(false);
const showReplies = ref(false);
const replyText = ref("");
const isSubmittingReply = ref(false);

const textClass = ref(`textarea-${v4().replace(/[-]/g, "")}`);
const replyMention = useMentionInput(replyText);

/// COMPUTED
const isReplying = computed(() => !!props.activeReplyId && props.activeReplyId === props.comment._id);
const replies = computed(() => {
  const instance = socialStore.replies_by_comment.get(props.comment._id);
  const map = instance?.results || new Map();
  return [...map.values()].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
});
const moreReplies = computed(() => {
  const instance = socialStore.replies_by_comment.get(props.comment._id);
  const page = (instance?.page || 0) + 1;
  const pages = instance?.pages || 0;
  return page <= pages;
});
const parsedContent = computed(() => parseCommentContent(props.comment.text, props.comment.mentions ?? []));

/// METHODS
const loadReplies = async () => {
  loadingReplies.value = true;
  await socialStore.GET_REPLIES(props.postId, props.comment._id);
  loadingReplies.value = false;
  showReplies.value = true;
};

const openReply = () => {
  emit("open-reply", props.comment._id);
  nextTick(() => {
    (document.querySelector(`.${textClass.value} textarea`) as HTMLTextAreaElement)?.focus();
  });
};

const closeReply = () => {
  replyText.value = "";
  emit("close-reply");
};

const onReplyKeydown = (event: KeyboardEvent) => {
  if (replyMention.mentionQuery.value !== null) {
    replyMention.onKeydown(event);
    return;
  }

  if (event.key === "Escape") {
    closeReply();
    return;
  }

  if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    submitReply();
  }
};

const submitReply = async () => {
  try {
    const text = replyText.value.trim();
    if (!text || isSubmittingReply.value) return;

    isSubmittingReply.value = true;

    const response = await socialStore.ADD_COMMENT(props.postId, text, props.comment._id);

    if (!response.error) {
      closeReply();
      await loadReplies();
      showReplies.value = true;
    }
  } catch {
    ///
  } finally {
    isSubmittingReply.value = false;
  }
};

const handleDelete = async () => {
  socialStore.DELETE_REPLY(
    props.postId,
    props.comment._id,
    props.comment.parent_id || ""
  );
};

const navigateToAccount = (userId?: string) => {
  if (!userId) return;

  if (userId === accountsStore._id) {
    router.replace({
      replace: true,
      query: { ...route.query, tab: "account" }
    });
  } else {
    router.push({ name: "profile", params: { _id: userId } });
  }
};

const formatTime = (iso: string) => dayjs(iso).format(`${t("$vuetify.label.date_format")} - HH:mm`);
</script>

<style lang="sass" scoped>
.comment-bubble
  background: var(--tertiary)
  display: inline-block
  max-width: 100%

.mention-dropdown-anchor
  position: absolute
  bottom: 100%
  left: 0
  right: 0
  z-index: 100
  margin-bottom: 4px
</style>