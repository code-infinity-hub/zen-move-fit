<template>
  <div class="pa-3">
    <template v-if="canComment">
      <div class="position-relative mb-3">
        <div class="d-flex align-center ga-2">
          <TextareaField
            auto-grow
            no-resize
            enable-emoji
            :rows="1"
            :max-rows="5"
            :disabled="loadingAddComment"
            :placeholder="t('$vuetify.label.type_a_comment')"
            class="flex-fill"
            v-model="newText"
            @input="mention.onInput"
            @keydown="onCommentKeydown"
          />

          <v-btn
            icon
            size="small"
            color="primary"
            :disabled="!newText.trim() || loadingAddComment"
            :loading="loadingAddComment"
            @click="submitComment"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>

        <MentionDropdown
          v-if="mention.mentionQuery.value !== null && mention.mentionQuery.value.length >= 1"
          :results="mention.mentionResults.value"
          :is-loading="mention.isSearchingMentions.value"
          :selected-index="mention.selectedIndex.value"
          class="mention-dropdown-anchor"
          @select="mention.selectMention"
        />
      </div>
    </template>
    <p v-else class="text-caption text-grey-lighten-1 text-center py-2 mb-3">
      {{ t("$vuetify.message.commenting_disabled") }}
    </p>

    <div
      v-if="loadingList"
      class="d-flex justify-center align-center py-5"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="40"
      />
    </div>
    <div v-else-if="!commentsList.length" class="text-center py-4">
      <p class="text-caption text-grey-lighten-1">
        {{ t("$vuetify.message.no_comments_yet") }}
      </p>
    </div>
    <template v-else>
      <div class="d-flex flex-column ga-3">
        <CommentItem
          v-for="comment in commentsList"
          :key="comment._id"
          :comment="comment"
          :post-id="postId"
          :depth="0"
          :active-reply-id="activeReplyId"
          @open-reply="activeReplyId = $event"
          @close-reply="activeReplyId = null"
        />
      </div>

      <LoadingData v-if="loadingData" />
      <v-btn
        v-else-if="hasMoreComments"
        block
        variant="text"
        size="small"
        color="grey-lighten-1"
        class="mt-3 text-none"
        @click="loadMoreComments"
      >{{ t("$vuetify.label.see_more_comments") }}</v-btn>
    </template>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useSocialStore } from "@/stores/social";
import { useMentionInput } from "@/composables/use-mention-input";

/// COMPONENTS
import CommentItem from "./CommentItem.vue";
import LoadingData from "../LoadingData.vue";
import MentionDropdown from "./MentionDropdown.vue";

/// DATA
const { t } = useLocale();
const socialStore = useSocialStore();
const props = defineProps<{ postId: string; canComment: boolean }>();

const loadingAddComment = ref(false);
const loadingList = ref(true);
const loadingData = ref(false);

const newText = ref("");
const activeReplyId = ref<string | null>(null);
const mention = useMentionInput(newText);

/// COMPUTED
const commentsList = computed(() => {
  const list = socialStore.comments_by_post.get(props.postId)?.results || [];
  return [...list].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
});
const hasMoreComments = computed(() => {
  const instance = socialStore.comments_by_post.get(props.postId);
  if (!instance) return false;
  return (instance.page + 1) <= instance.pages;
});

/// LIFE CYCLES
onMounted(async () => {
  await socialStore.GET_COMMENTS(props.postId);
  loadingList.value = false;
});

/// METHODS
const onCommentKeydown = (event: KeyboardEvent) => {
  if (mention.mentionQuery.value !== null) {
    mention.onKeydown(event);
    return;
  }

  if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    submitComment();
  }
};

const submitComment = async () => {
  const text = newText.value.trim();
  if (!text) return;

  const response = await socialStore.ADD_COMMENT(props.postId, text);

  if (!response.error) {
    newText.value = "";
  }
};

const loadMoreComments = async () => {
  loadingData.value = true;
  await socialStore.GET_COMMENTS(props.postId);
  loadingData.value = false;
};
</script>

<style lang="sass" scoped>
.mention-dropdown-anchor
  position: absolute
  bottom: 100%
  left: 0
  right: 0
  z-index: 100
  margin-bottom: 4px
</style>