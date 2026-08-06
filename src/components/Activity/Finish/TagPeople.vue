<template>
  <div class="w-100 d-flex flex-column">
    <label class="mb-2 text-subtitle-2">
      {{ t("$vuetify.label.tag_people") }}
    </label>

    <TextField
      hide-details
      :placeholder="t('$vuetify.label.search_people')"
      v-model="query"
    />

    <List
      v-if="query.length >= 1"
      class="overflow-y-auto mt-2"
      :style="{ maxHeight: '220px', minWidth: 'auto' }"
    >
      <v-list-item
        v-if="loading"
        class="d-flex justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="30"
        />
      </v-list-item>
      <template v-else-if="availableResults.length > 0">
        <div
          v-for="(user, index) in availableResults"
          :key="user._id"
          class="d-flex flex-column ga-1"
        >
          <v-list-item @click="select(user)">
            <template #prepend>
              <ProfileImage
                size="32px"
                :image="user.image"
                :name="user.name"
                class="mr-2"
              />
            </template>

            <v-list-item-title class="text-body-2">
              {{ user.name }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption">
              {{ `@${user.username}` }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider v-if="index !== (availableResults.length - 1)" />
        </div>
      </template>
      <p
        v-else
        class="text-caption text-medium-emphasis text-center pa-3"
      >{{ t("$vuetify.label.no_users_found") }}</p>
    </List>

    <div
      v-if="model.length"
      class="d-flex flex-wrap ga-2 mt-3"
    >
      <v-chip
        v-for="user in model"
        :key="user._id"
        closable
        color="primary"
        @click:close="remove(user._id)"
      >
        <template #prepend>
          <ProfileImage
            size="20px"
            :image="user.image"
            :name="user.name"
            class="mr-1"
          />
        </template>

        {{ `@${user.username}` }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { Fetcher } from "@/plugins/Fetcher";
import { type MentionUser } from "@/types/social.type";

/// COMPONENTS
import List from "@/components/List.vue";
import ProfileImage from "@/components/ProfileImage.vue";

const MAX_TAGS = 10;

/// DATA
const { t } = useLocale();
const model = defineModel<MentionUser[]>({ default: [] });

const query = ref("");
const loading = ref(false);
const results = ref<MentionUser[]>([]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/// COMPUTED
const availableResults = computed(() =>
  results.value.filter((user) => !model.value.some((selected) => selected._id === user._id))
);

/// WATCH
watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!val.length) {
    results.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  debounceTimer = setTimeout(() => search(val), 250);
});

/// METHODS
const search = async (q: string) => {
  try {
    const response = await Fetcher(
      `${import.meta.env.VITE_API_BACKEND}social/tag-search?q=${encodeURIComponent(q)}&limit=10`,
      { method: "GET" }
    );

    if (!response.error) results.value = response.json.results;
  } finally {
    loading.value = false;
  }
};

const select = (user: MentionUser) => {
  if (model.value.length >= MAX_TAGS) return;

  model.value = [...model.value, user];
  query.value = "";
  results.value = [];
};

const remove = (_id: string) => {
  model.value = model.value.filter((user) => user._id !== _id);
};
</script>