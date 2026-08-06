<template>
  <div class="pa-2 rounded-lg bg-quintet border-sextet d-flex flex-column ga-3">
    <div class="d-flex align-center ga-2">
      <div>
        <ProfileImage
          :size="'2.5rem'"
          :image="image"
          :name="account.name"
          :loaded-border="image ? 'tertiary' : 'primary'"
        />
      </div>

      <span class="font-weight-bold">
        {{ account.name }}
      </span>
    </div>

    <div class="position-relative">
      <TextareaField
        no-resize
        inline
        v-model="text"
        @focus="focusTextarea"
        @input="mention.onInput"
        @keydown="mention.onKeydown"
        :placeholder="t('$vuetify.message.what_would_you_like_to_share')"
      >
        <template #append>
          <div class="d-flex flex-column ga-2">
            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon=""
                  size="x-small"
                  v-bind="props"
                  color="secondary"
                >
                  <v-icon>mdi-emoticon</v-icon>
                </v-btn>
              </template>

              <Emoji
                @add="(t: string) => text += t"
              />
            </v-menu>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon=""
                  size="x-small"
                  v-bind="props"
                  color="secondary"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>

              <List>
                <v-list-item
                  v-for="(option, i) in options"
                  :key="i"
                >
                  <v-list-item-title>
                    <div
                      v-ripple
                      class="bg-secondary pa-2 d-flex align-center ga-3 rounded-lg"
                      @click="option.method"
                    >
                      <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                        <v-icon :size="25">
                          {{ option.icon }}
                        </v-icon>
                      </div>

                      <span class="text-h6">
                        {{ option.text }}
                      </span>
                    </div>
                  </v-list-item-title>
                </v-list-item>
              </List>
            </v-menu>
          </div>
        </template>
      </TextareaField>

      <MentionDropdown
        v-if="mention.mentionQuery.value !== null && mention.mentionQuery.value.length >= 1"
        :results="mention.mentionResults.value"
        :is-loading="mention.isSearchingMentions.value"
        :selected-index="mention.selectedIndex.value"
        class="mention-dropdown-anchor"
        @select="mention.selectMention"
      />
    </div>

    <div
      v-if="files.length"
      class="overflow-x-auto overflow-y-hidden"
    >
      <div
        class="d-flex ga-2"
        :style="{ height: '10rem' }"
      >
        <div
          v-for="(file, i) in files"
          :key="i"
          :style="{ width: 'auto', height: '100%' }"
          class="position-relative"
        >
          <img
            class="rounded-lg h-100"
            v-if="file.mimetype.startsWith('image')"
            :src="file.base64"
          />
          <Player
            v-else
            class="rounded-lg h-100"
            :style="{ width: '20rem' }"
            :video-id="[{ src: file.base64, type: file.mimetype }]"
          />

          <v-btn
            icon=""
            size="x-small"
            color="tertiary"
            class="position-absolute top-0"
            :style="{ right: '-0.5rem' }"
            @click="files = files.filter((_, index) => i !== index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-btn
      color="primary"
      :disabled="text.replace(/[\s]/g, '').length === 0"
      class="text-none text-black font-weight-bold pa-6 d-flex"
      @click="submit"
    >{{ t("$vuetify.label.publish") }}</v-btn>

    <!-- BOTTOM SHEET DE DIRETRIZES DA COMUNIDADE -->
    <v-bottom-sheet v-model="bottomSheet.rules">
      <v-card>
        <v-card-text class="py-5">
          <p class="text-h6 font-weight-bold mb-3">
            {{ t("$vuetify.label.community_guidelines") }}
          </p>

          <p class="mb-3">
            {{ t("$vuetify.message.community_guidelines_message") }}
          </p>

          <p class="mb-3 font-weight-bold">
            {{ t("$vuetify.message.community_guidelines_before_publishing") }}
          </p>

          <p
            v-for="i in quantityAllowItems"
            :key="`allow_${i}`"
            :class="[
              'text-body-2',
              i === quantityAllowItems ? 'mb-5' : 'mb-2'
            ]"
          >
            <v-icon color="success">
              mdi-check
            </v-icon>

            {{ t(`$vuetify.message.community_guidelines_allow_items.item_${i}`) }}
          </p>

          <p class="mb-3 font-weight-bold">
            {{ t("$vuetify.message.community_guidelines_not_allowed") }}
          </p>

          <p
            v-for="i in quantityNotAllowItems"
            :key="`not_allow_items_${i}`"
            :class="[
              'text-body-2',
              i === quantityNotAllowItems ? 'mb-5' : 'mb-3'
            ]"
          >
            <v-icon color="error">
              mdi-close
            </v-icon>

            {{ t(`$vuetify.message.community_guidelines_not_allow_items.item_${i}`) }}
          </p>

          <p class="mb-3">
            {{ t("$vuetify.message.post_violation") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.rules = false"
          >{{ t("$vuetify.label.ok") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE ERRO NA POSTAGEM -->
    <v-bottom-sheet v-model="bottomSheet.error_prompt">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.error_prompt = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5">
          <p class="text-h6 font-weight-bold mb-3">
            {{ t("$vuetify.message.error_creating_your_post") }}
          </p>

          <p>{{ message }}</p>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useSocialStore } from "@/stores/social.ts";
import { useMentionInput } from "@/composables";
import { MediaService } from "@/services/media.service";
import { usePersistentSession } from "@/plugins/usePersistentSession.ts";
import { eventBus } from "@/eventBus";

/// COMPONENTS
import Emoji from "../Emoji.vue";
import List from "../List.vue";
import Player from "../Player.vue";
import ProfileImage from "../ProfileImage.vue";
import MentionDropdown from "./MentionDropdown.vue";

/// DATA
const { t } = useLocale();
const accountsStore = useAccountsStore();
const socialsStore = useSocialStore();
const persistentSession = usePersistentSession();
const text = ref("");
const mention = useMentionInput(text);

const files = ref<{
  base64: string,
  format: string,
  mimetype: string,
}[]>([]);

const mediaService = new MediaService;
const maximumSizeVideo = +import.meta.env.VITE_MAXIMUM_MB_VIDEO;

const bottomSheet = reactive({
  rules: false,
  error_prompt: false,
});

const quantityAllowItems = ref(3);
const quantityNotAllowItems = ref(5);

const message = ref("");

/// COMPUTED
const account = computed(() => accountsStore.account);
const image = computed(() => account.value.image);
const options = computed(() => [
  {
    icon: "mdi-image-outline",
    text: t("$vuetify.label.select_photos"),
    method: selectPhotos
  },
  {
    icon: "mdi-video-outline",
    text: t("$vuetify.label.select_videos"),
    method: selectVideos
  },
]);

/// METHODS
const selectPhotos = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const results = await mediaService.getFiles("Photo", 5);

    for (const result of results) {
      if (files.value.some((file) => file.base64 === result.base64)) continue;

      files.value.push({
        base64: result.base64,
        format: result.format,
        mimetype: result.mimetype
      });
    }
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const selectVideos = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const results = await mediaService.getFiles("Video", 5);

    for (const result of results) {
      if (result.size > maximumSizeVideo) {
        eventBus.emit("SNACKBAR", {
          message: t("$vuetify.errors.some_files_exceeded_mb", maximumSizeVideo)
        });
        return;
      }

      if (files.value.some((file) => file.base64 === result.base64)) continue;

      files.value.push({
        base64: result.base64,
        format: result.format,
        mimetype: result.mimetype
      });
    }
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const focusTextarea = async () => {
  const verify = await persistentSession.get("verify-message-post");

  if (!verify) {
    bottomSheet.rules = true;
    await persistentSession.set("verify-message-post", "true");
  }
};

const submit = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });

    const response = await socialsStore.CREATE_POST({
      text: text.value,
      files: files.value
    });

    if (!response.error) {
      if (!response.success) {
        bottomSheet.error_prompt = true;
        message.value = response.details;
      } else {
        socialsStore.posts.results.set(response.post.post_id, response.post);
        text.value = "";
        files.value = [];
      }
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
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