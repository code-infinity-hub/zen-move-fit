import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";
import { updateReactionSummary, removeFromReactionSummary, snapshotReactions } from "@/utils";
import type { Activity } from "@/types/activity.type";
import type { Response } from "@/types/global.type";
import type {
  Chat,
  Profile,
  Post,
  Message,
  PostComment,
  RequestFriend,
  RequestFriendStatuses,
  SocialFriend,
  SendMessageBody,
  SuggestionFriend,
  PostReactionType,
} from "@/types/social.type";

setActivePinia(pinia);

export const useSocialStore = defineStore("social", {
  state: () => ({
    limit: 50,
    on_social_tab: false,

    /// FRIENDS
    friends: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, SocialFriend>(),
    },
    suggestions: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, SuggestionFriend>(),
    },
    requests: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, RequestFriend>(),
    },

    /// CHATS
    chats: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, Chat>(),
    },
    chat: {
      friendship_id: "",
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, Message>(),
    },
    messages: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, Message>(),
    },
    unread: {
      chats: 0,
      messages: 0
    },

    /// POSTS
    posts: {
      page: 0,
      pages: 0,
      total: 0,
      results: new Map<string, Post>()
    },
    user_posts: {
      page: 0,
      pages: 0,
      total: 0,
      restricted: false,
      results: new Map<string, Post>()
    },
    user_activities: {
      page: 0,
      pages: 0,
      total: 0,
      restricted: false,
      results: new Map<string, Activity>()
    },
    comments_by_post: new Map<string, {
      page: number,
      pages: number,
      total: number,
      results: PostComment[]
    }>(),
    replies_by_comment: new Map<string, {
      page: 0,
      pages: 0,
      total: 0,
      results: Map<string, PostComment>
    }>(),
  }),
  actions: {
    async GET(url: string = "") {
      return await _GET(`social/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}) {
      return await _POST(`social/${url}`, body);
    },
    async PATCH(url: string = "", body: Record<string, any> = {}) {
      return await _PATCH(`social/${url}`, body);
    },
    async DELETE(url: string = "", body: Record<string, any> = {}) {
      return await _DELETE(`social/${url}`, body);
    },
    /// PROFILE
    async GET_PROFILE(_id: string): Promise<Profile | null> {
      const response = await this.GET(`profile/${_id}`);
      return !response.error ? response.profile as Profile : null;
    },
    ///
    RESET_FRIENDS(): void {
      this.friends = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_FRIENDS(): Promise<void> {
      const response = await this.GET(`friends?page=${this.friends.page + 1}&limit=${this.limit}&sort_by=account.name&sort=ASC`);
      if (!response.error) {
        const result = response.result;
        this.friends.page = result.page;
        this.friends.pages = result.pages;
        this.friends.total = result.total;
        result.results.forEach((friend: SocialFriend) => {
          if (!this.friends.results.has(friend.account_id)) this.friends.results.set(friend.account_id, friend);
        });
      }
    },
    async GET_FRIEND(friendship_id: string): Promise<SocialFriend | null> {
      const response = await this.GET(`friends/${friendship_id}`);
      return !response.error ? response.friendship as SocialFriend : null;
    },
    async CHANGE_FRIENDSHIP_STATUS(friendship_id: string, account_id: string, status: RequestFriendStatuses): Promise<void> {
      const response = await this.PATCH(`friends/${friendship_id}`, { status });
      if (!response.error) {
        if (this.requests.total > 0) {
          this.requests.total--;
          this.requests.results.delete(account_id);
        }
        if (this.on_social_tab && response.friendship) {
          this.friends.total++;
          this.friends.results.set(response.friendship.account_id, response.friendship);
        }
      }
    },
    ///
    async RESET_REQUESTS() {
      this.requests = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_REQUESTS(): Promise<void> {
      const response = await this.GET(`friends/requests?page=${this.requests.page + 1}&limit=${this.limit}&sort_by=account.name&sort=ASC`);
      if (!response.error) {
        const result = response.result;
        this.requests.page = result.page;
        this.requests.pages = result.pages;
        this.requests.total = result.total;
        result.results.forEach((request: RequestFriend) => {
          if (!this.requests.results.has(request.account_id)) this.requests.results.set(request.account_id, request);
        });
      }
    },
    async GET_REQUEST(friendship_id: string): Promise<RequestFriend | null> {
      const response = await this.GET(`friends/requests/${friendship_id}`);
      return !response.error ? response.request as RequestFriend : null;
    },
    async ADD_FRIEND(account_id: string): Promise<void> {
      const response = await this.POST("friends", { account_id });
      if (!response.error) {
        const friendship = response.friendship;
        this.suggestions.total--;
        this.suggestions.results.delete(account_id);
        this.friends.total++;
        this.friends.results.set(friendship.account_id, friendship);
      }
    },
    ///
    RESET_SUGGESTION_FRIENDS(): void {
      this.suggestions = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_SUGGESTION_FRIENDS(): Promise<void> {
      const response = await this.GET(`friends/suggestions?page=${this.suggestions.page + 1}&limit=${this.limit}&sort_by=score&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        this.suggestions.page = result.page;
        this.suggestions.pages = result.pages;
        this.suggestions.total = result.total;
        result.results.forEach((suggestion: SuggestionFriend) => {
          if (!this.suggestions.results.has(suggestion.account_id)) this.suggestions.results.set(suggestion.account_id, suggestion);
        });
      }
    },
    /// CHAT
    RESET_CHATS(): void {
      this.chats = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_CHATS(): Promise<void> {
      const response = await this.GET(`chats?page=${this.chats.page + 1}&limit=${this.limit}&sort_by=message.created_at&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        this.chats.page = result.page;
        this.chats.pages = result.pages;
        this.chats.total = result.total;
        result.results.forEach((chat: Chat) => {
          if (!this.chats.results.has(chat.friendship_id)) this.chats.results.set(chat.friendship_id, chat);
        });
      }
    },
    RESET_CHAT(): void {
      this.chat = {
        friendship_id: "",
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async GET_CHAT(friendship_id: string): Promise<Chat | null> {
      const response = await this.GET(`chats/${friendship_id}`);
      return !response.error ? response.chat : null;
    },
    RESET_MESSAGES(): void {
      this.messages = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map(),
      };
    },
    async LOAD_MESSAGES(friendship_id: string): Promise<void> {
      const response = await this.GET(`chats/${friendship_id}/messages?page=${this.messages.page + 1}&limit=${this.limit}&sort_by=created_at&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        this.messages.page = result.page;
        this.messages.pages = result.pages;
        this.messages.total = result.total;
        result.results.forEach((message: Message) => {
          if (!this.messages.results.has(message.message_id)) this.messages.results.set(message.message_id, message);
        });
      }
    },
    async SEND_MESSAGE(friendship_id: string, body: SendMessageBody): Promise<Response> {
      const response = await this.POST(`chats/${friendship_id}/message`, body);
      if (!response.error) this.GET_UNREAD_MESSAGES();
      return response;
    },
    RESET_UNREAD_MESSAGES() {
      this.unread.chats = 0;
      this.unread.messages = 0;
    },
    async GET_UNREAD_MESSAGES() {
      const response = await this.GET("chats/unread");
      if (!response.error) {
        const result = response.result;
        this.unread.chats = result.chats;
        this.unread.messages = result.messages;
      }
    },
    /// POSTS
    RESET_POSTS() {
      this.posts = {
        page: 0,
        pages: 0,
        total: 0,
        results: new Map<string, Post>()
      };
      this.comments_by_post.clear();
      this.replies_by_comment.clear();
    },
    async GET_POSTS(): Promise<void> {
      const response = await this.GET(`posts?page=${this.posts.page + 1}&limit=${this.limit}&sort_by=created_at&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        this.posts.page = result.page;
        this.posts.pages = result.pages;
        this.posts.total = result.total;
        result.results.forEach((post: Post) => {
          if (!this.posts.results.has(post.post_id)) this.posts.results.set(post.post_id, post);
        });
      }
    },
    async CREATE_POST(body: Record<string, any>) {
      return await this.POST("posts", body);
    },
    async HIDE_AUTHOR(author_id: string): Promise<Response> {
      const response = await this.POST("hidden-authors", { author_id });
      if (!response.error) {
        for (const [post_id, post] of this.posts.results) {
          if (post.account._id === author_id) this.posts.results.delete(post_id);
        }
      }
      return response;
    },
    async REACT_TO_POST(post_id: string, reaction: PostReactionType): Promise<void> {
      const feedPost = this.posts.results.get(post_id);
      const profilePost = this.user_posts.results.get(post_id);
      const prevFeedReactions = feedPost ? snapshotReactions(feedPost.reactions) : null;
      const prevProfileReactions = profilePost ? snapshotReactions(profilePost.reactions) : null;

      const applyReaction = (post: Post) => {
        const isNew = !post.reactions.current_user_reaction;
        post.reactions = {
          total: isNew ? post.reactions.total + 1 : post.reactions.total,
          summary: updateReactionSummary(post.reactions.summary, reaction, post.reactions.current_user_reaction),
          current_user_reaction: reaction,
        };
      };

      if (feedPost) {
        applyReaction(feedPost);
        this.posts.results.set(post_id, { ...feedPost });
      }
      if (profilePost) {
        applyReaction(profilePost);
        this.user_posts.results.set(post_id, { ...profilePost });
      }

      const response = await this.POST(`posts/${post_id}/reactions`, { reaction });

      if (response.error) {
        if (feedPost && prevFeedReactions) {
          feedPost.reactions = prevFeedReactions;
          this.posts.results.set(post_id, { ...feedPost });
        }
        if (profilePost && prevProfileReactions) {
          profilePost.reactions = prevProfileReactions;
          this.user_posts.results.set(post_id, { ...profilePost });
        }
      }
    },
    async REMOVE_REACTION(post_id: string): Promise<void> {
      const feedPost = this.posts.results.get(post_id);
      const profilePost = this.user_posts.results.get(post_id);
      const prevFeedReactions = feedPost ? snapshotReactions(feedPost.reactions) : null;
      const prevProfileReactions = profilePost ? snapshotReactions(profilePost.reactions) : null;

      const applyRemove = (post: Post) => {
        if (!post.reactions.current_user_reaction) return;
        post.reactions = {
          total: Math.max(0, post.reactions.total - 1),
          summary: removeFromReactionSummary(post.reactions.summary, post.reactions.current_user_reaction),
          current_user_reaction: null,
        };
      };

      if (feedPost) {
        applyRemove(feedPost);
        this.posts.results.set(post_id, { ...feedPost });
      }
      if (profilePost) {
        applyRemove(profilePost);
        this.user_posts.results.set(post_id, { ...profilePost });
      }

      const response = await this.DELETE(`posts/${post_id}/reactions`);
      if (response.error) {
        if (feedPost && prevFeedReactions) {
          feedPost.reactions = prevFeedReactions;
          this.posts.results.set(post_id, { ...feedPost });
        }
        if (profilePost && prevProfileReactions) {
          profilePost.reactions = prevProfileReactions;
          this.user_posts.results.set(post_id, { ...profilePost });
        }
      }
    },
    async GET_COMMENTS(post_id: string): Promise<void> {
      if (!this.comments_by_post.has(post_id)) {
        this.comments_by_post.set(post_id, { page: 0, pages: 0, total: 0, results: [] });
      }
      const instance = this.comments_by_post.get(post_id)!;
      const response = await this.GET(`posts/${post_id}/comments?page=${instance.page + 1}&limit=${this.limit}&sort_by=created_at&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        instance.page = result.page;
        instance.pages = result.pages;
        instance.total = result.total;
        result.results.forEach((comment: PostComment) => {
          const some = instance.results.some((item) => item._id === comment._id);
          if (!some) instance.results.push(comment);
        });
      }
    },
    async GET_REPLIES(post_id: string, parent_id: string): Promise<void> {
      if (!this.replies_by_comment.has(parent_id)) {
        this.replies_by_comment.set(parent_id, {
          page: 0,
          pages: 0,
          total: 0,
          results: new Map()
        });
      }
      const instance = this.replies_by_comment.get(parent_id)!;
      const response = await this.GET(`posts/${post_id}/comments/${parent_id}/replies?page=${instance.page + 1}&limit=${this.limit}&sort_by=created_at&sort=DESC`);
      if (!response.error) {
        const result = response.result;
        instance.page = result.page;
        instance.pages = result.pages;
        instance.total = result.total;
        result.results.forEach((comment: PostComment) => {
          instance.results.set(comment._id, comment);
        });
      }
    },
    async DELETE_REPLY(post_id: string, comment_id: string, parent_id?: string) {
      const response = await this.DELETE(`posts/${post_id}/comments/${comment_id}`);
      if (!response.error) {
        if (parent_id) {
          const list = this.replies_by_comment.get(parent_id);
          if (list) {
            const item = list.results.get(comment_id);
            if (item) item.deleted = true;
          }
        } else {
          const instance = this.comments_by_post.get(post_id);
          if (instance) {
            const idx = instance.results.findIndex((c) => c._id === comment_id);
            if (idx !== -1) {
              instance.results[idx] = { ...instance.results[idx]!, deleted: true };
            }
          }
          this.DECREMENT_COMMENT_COUNT(post_id);
        }
      }
    },
    async SAVE_POST(post_id: string): Promise<void> {
      const response = await this.POST(`posts/${post_id}/save`);
      if (!response.error) {
        const feedPost = this.posts.results.get(post_id);
        if (feedPost) {
          feedPost.is_saved = true;
          feedPost.save_count++;
          this.posts.results.set(post_id, { ...feedPost });
        }
        const profilePost = this.user_posts.results.get(post_id);
        if (profilePost) {
          profilePost.is_saved = true;
          profilePost.save_count++;
          this.user_posts.results.set(post_id, { ...profilePost });
        }
      }
    },
    async UNSAVE_POST(post_id: string): Promise<void> {
      const response = await this.DELETE(`posts/${post_id}/save`);
      if (!response.error) {
        const feedPost = this.posts.results.get(post_id);
        if (feedPost) {
          feedPost.is_saved = false;
          feedPost.save_count = Math.max(0, feedPost.save_count - 1);
          this.posts.results.set(post_id, { ...feedPost });
        }
        const profilePost = this.user_posts.results.get(post_id);
        if (profilePost) {
          profilePost.is_saved = false;
          profilePost.save_count = Math.max(0, profilePost.save_count - 1);
          this.user_posts.results.set(post_id, { ...profilePost });
        }
      }
    },
    INCREMENT_COMMENT_COUNT(post_id: string): void {
      const feedPost = this.posts.results.get(post_id);
      if (feedPost) {
        feedPost.comment_count++;
        this.posts.results.set(post_id, { ...feedPost });
      }
      const profilePost = this.user_posts.results.get(post_id);
      if (profilePost) {
        profilePost.comment_count++;
        this.user_posts.results.set(post_id, { ...profilePost });
      }
    },
    DECREMENT_COMMENT_COUNT(post_id: string): void {
      const feedPost = this.posts.results.get(post_id);
      if (feedPost) {
        feedPost.comment_count = Math.max(0, feedPost.comment_count - 1);
        this.posts.results.set(post_id, { ...feedPost });
      }
      const profilePost = this.user_posts.results.get(post_id);
      if (profilePost) {
        profilePost.comment_count = Math.max(0, profilePost.comment_count - 1);
        this.user_posts.results.set(post_id, { ...profilePost });
      }
    },
    async DELETE_POST(post_id: string): Promise<Response> {
      const response = await this.DELETE(`posts/${post_id}`);
      if (!response.error) {
        if (this.posts.results.has(post_id)) {
          this.posts.total--;
          this.posts.results.delete(post_id);
        }
        if (this.user_posts.results.has(post_id)) {
          this.user_posts.total--;
          this.user_posts.results.delete(post_id);
        }
      }
      return response;
    },
    RESET_USER_POSTS(): void {
      this.user_posts = {
        page: 0,
        pages: 0,
        total: 0,
        restricted: false,
        results: new Map<string, Post>(),
      };
    },
    async GET_USER_POSTS(user_id: string): Promise<void> {
      const response = await this.GET(`profile/${user_id}/posts?page=${this.user_posts.page + 1}&limit=${this.limit}&sort_by=created_at&sort=DESC`);
      if (response.restricted) {
        this.user_posts.restricted = true;
        return;
      }
      if (!response.error) {
        const result = response.result;
        this.user_posts.page = result.page;
        this.user_posts.pages = result.pages;
        this.user_posts.total = result.total;
        result.results.forEach((post: Post) => {
          if (!this.user_posts.results.has(post.post_id)) this.user_posts.results.set(post.post_id, post);
        });
      }
    },
    RESET_USER_ACTIVITIES(): void {
      this.user_activities = {
        page: 0,
        pages: 0,
        total: 0,
        restricted: false,
        results: new Map<string, Activity>(),
      };
    },
    async GET_USER_ACTIVITIES(user_id: string): Promise<void> {
      const response = await this.GET(`profile/${user_id}/activities?page=${this.user_activities.page + 1}&limit=${this.limit}&sort_by=started_at&sort=DESC`);
      if (response.restricted) {
        this.user_activities.restricted = true;
        return;
      }
      if (!response.error) {
        const result = response.result;
        this.user_activities.page = result.page;
        this.user_activities.pages = result.pages;
        this.user_activities.total = result.total;
        result.results.forEach((activity: Activity) => {
          if (!this.user_activities.results.has(activity._id)) this.user_activities.results.set(activity._id, activity);
        });
      }
    },
    async HANDLE_FRIENDSHIP(user_id: string, currentStatus: string, friendship_id?: string | null): Promise<Response> {
      switch (currentStatus) {
        case "none":
          return this.POST("friends", { account_id: user_id });
        case "friends":
          return this.DELETE(`friends/${friendship_id}`);
        case "pending_received":
          return this.PATCH(`friends/${friendship_id}`, { status: "DONE" });
        case "pending_sent":
          return this.DELETE(`friends/${friendship_id}`);
        default:
          return { error: false };
      }
    },
    async ADD_COMMENT(post_id: string, text: string, parent_id?: string) {
      const response = await this.POST(`posts/${post_id}/comments`, { text, parent_id });
      if (!response.error) {
        const comment = response.comment as PostComment;
        if (parent_id) {
          if (!this.replies_by_comment.has(parent_id)) {
            this.replies_by_comment.set(parent_id, {
              page: 0,
              pages: 0,
              total: 0,
              results: new Map()
            });
          }
          const replies = this.replies_by_comment.get(parent_id)!;
          replies.results.set(comment._id, comment);
          replies.total++;

          const instance = this.comments_by_post.get(post_id);
          const commentCreated = instance?.results.find((c) => c._id === parent_id);
          if (commentCreated) commentCreated.reply_count++;

          this.INCREMENT_COMMENT_COUNT(post_id);
        } else {
          if (!this.comments_by_post.has(post_id)) {
            this.comments_by_post.set(post_id, { page: 0, pages: 0, total: 0, results: [] });
          }
          const instance = this.comments_by_post.get(post_id)!;
          instance.total++;
          instance.results.push(comment);

          this.INCREMENT_COMMENT_COUNT(post_id);
        }
      }
      return response;
    }
  },
});