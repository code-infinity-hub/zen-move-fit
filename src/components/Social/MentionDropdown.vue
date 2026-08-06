<template>
  <List
    elevation="6"
    rounded="lg"
    class="overflow-y-auto"
    :style="{ maxHeight: '220px' }"
  >
    <v-list-item
      v-if="isLoading"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="30"
      />
    </v-list-item>
    <template v-else-if="results.length > 0">
      <div
        v-for="(user, index) in results"
        :key="user._id"
        class="d-flex flex-column ga-1"
      >
        <v-list-item
          :active="index === selectedIndex"
          active-color="primary"
          @click="emit('select', user)"
        >
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

        <v-divider
          v-if="index !== (results.length - 1)"
        />
      </div>
    </template>
    <p
      v-else
      class="text-caption text-medium-emphasis text-center pa-3"
    >{{ t("$vuetify.label.no_users_found") }}</p>
  </List>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type MentionUser } from "@/types/social.type";

/// COMPONENTS
import List from "../List.vue";
import ProfileImage from "../ProfileImage.vue";

/// DATA
defineProps<{
  results: MentionUser[];
  isLoading: boolean;
  selectedIndex: number;
}>();

const { t } = useLocale();
const emit = defineEmits<{ select: [user: MentionUser] }>();
</script>