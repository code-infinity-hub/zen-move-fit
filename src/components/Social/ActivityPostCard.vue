<template>
  <div
    v-ripple
    class="rounded-lg overflow-hidden border-tertiary"
    :style="{ cursor: 'pointer' }"
    @click="openActivity"
  >
    <!-- Imagem principal: mapa em avulsas, primeira mídia em treino/desafio -->
    <v-img
      v-if="mainImage"
      :src="mainImage"
      max-height="320"
      cover
    />

    <div class="pa-3 bg-tertiary">
      <p class="text-body-2 font-weight-bold text-truncate">
        {{ activity.title }}
      </p>

      <p
        v-if="dateLabel"
        class="text-caption text-grey-lighten-1 mt-1"
      >{{ dateLabel }}</p>

      <div
        class="d-flex align-center flex-wrap ga-3 mt-2"
        :style="{ rowGap: '1px !important' }"
      >
        <template v-if="distance">
          <span class="text-caption text-grey-lighten-1">
            <v-icon :size="12" class="mr-1">mdi-map-marker-distance</v-icon>
            {{ distance }}
          </span>
          <span class="text-caption text-grey-lighten-1">•</span>
        </template>

        <span class="text-caption text-grey-lighten-1">
          <v-icon :size="12" class="mr-1">mdi-clock-outline</v-icon>
          {{ formatTime(durationSeconds) }}
        </span>

        <template v-if="pace">
          <span class="text-caption text-grey-lighten-1">•</span>
          <span class="text-caption text-grey-lighten-1">
            <v-icon :size="12" class="mr-1">mdi-speedometer</v-icon>
            {{ pace }}
          </span>
        </template>

        <template v-if="activity.calories !== undefined">
          <span class="text-caption text-grey-lighten-1">•</span>
          <span class="text-caption text-grey-lighten-1">
            <v-icon :size="12" class="mr-1">mdi-fire</v-icon>
            {{ `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
          </span>
        </template>

        <template v-if="activity.type !== 'AVULSE' && activity.exercises_count !== undefined">
          <span class="text-caption text-grey-lighten-1">•</span>
          <span class="text-caption text-grey-lighten-1">
            <v-icon :size="12" class="mr-1">mdi-dumbbell</v-icon>
            {{ `${activity.exercises_count} ${t("$vuetify.label.exercises")}` }}
          </span>
        </template>
      </div>

      <!-- Demais mídias -->
      <div
        v-if="extraFiles.length"
        class="d-flex ga-1 overflow-x-auto mt-2"
        @click.stop
      >
        <template v-for="(file, i) in extraFiles" :key="i">
          <v-img
            v-if="file.mimetype.startsWith('image')"
            :src="file.url"
            rounded="lg"
            width="120"
            height="120"
            cover
            class="flex-shrink-0"
            @click="eventBus.emit('SHOW_IMAGE', { images: [file.url] })"
          />
          <Player
            v-else
            class="rounded-lg"
            :style="{ minWidth: '15rem' }"
            :video-id="[{ src: file.url, type: file.mimetype }]"
          />
        </template>
      </div>

      <!-- Pessoas marcadas -->
      <div
        v-if="activity.tagged_people?.length"
        class="d-flex align-center flex-wrap ga-2 mt-2"
        @click.stop
      >
        <span class="text-caption text-grey-lighten-1">
          {{ t("$vuetify.label.with") }}
        </span>

        <v-chip
          v-for="person in activity.tagged_people"
          :key="person._id"
          size="x-small"
          variant="tonal"
          @click="openProfile(person._id)"
        >
          <template #prepend>
            <ProfileImage
              size="16px"
              :image="person.image"
              :name="person.name"
              class="mr-1"
            />
          </template>

          {{ `@${person.username}` }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useRouter } from "vue-router";
import { useFormatNumber } from "@/composables";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { date, getPrimaryDurationSeconds } from "@/utils";
import { eventBus } from "@/eventBus";
import { type PostActivity } from "@/types/social.type";

/// COMPONENTS
import Player from "../Player.vue";
import ProfileImage from "../ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { formatTime, formatDateTimeLong } = date();
const router = useRouter();
const props = defineProps<{ activity: PostActivity }>();

/// COMPUTED
const durationSeconds = computed(() => getPrimaryDurationSeconds(props.activity));
// Avulsa: mapa é a imagem principal e as mídias vêm depois; treino/desafio: primeira mídia é a principal
const mainImage = computed(() => {
  if (props.activity.type === "AVULSE") return props.activity.map_picture;
  const firstImage = props.activity.files.find((file) => file.mimetype.startsWith("image"));
  return firstImage?.url ?? null;
});
const extraFiles = computed(() => {
  if (props.activity.type === "AVULSE") return props.activity.files;
  return props.activity.files.filter((file) => file.url !== mainImage.value);
});
const dateLabel = computed(() =>
  props.activity.started_at ? formatDateTimeLong(props.activity.started_at) : null
);
const distance = computed(() => {
  const meters = props.activity.metrics?.distance_meters;
  if (!meters) return null;
  return `${formatNumber(meters / 1000)} ${t("$vuetify.label.km")}`;
});
const pace = computed(() => {
  const avgPace = props.activity.metrics?.avg_pace;
  if (!avgPace) return null;
  return `${RunningMetricsService.formatPace(avgPace)}/${t("$vuetify.label.km")}`.toLowerCase();
});

/// METHODS
const openActivity = () => {
  router.push({ name: "activity", params: { _id: props.activity._id } });
};

const openProfile = (_id: string) => {
  router.push({ name: "profile", params: { _id } });
};
</script>