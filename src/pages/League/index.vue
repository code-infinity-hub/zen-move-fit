<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary">
    <div class="heading border-bottom-tertiary d-flex align-center">
      <v-btn
        icon=""
        size="x-small"
        color="tertiary"
        class="mr-4"
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <p class="text-h6 font-space-grotesk font-weight-bold flex-fill">
        {{ t("$vuetify.label.weekly_league") }}
      </p>
    </div>

    <div class="flex-fill overflow-y-auto pa-3">
      <LoadingData v-if="loading" />

      <!-- SEM LIGA NA SEMANA -->
      <div
        v-else-if="!leaguesStore.league"
        class="px-4 h-100 d-flex flex-column justify-center align-center text-center ga-3"
      >
        <div
          class="d-flex justify-center align-center rounded-circle bg-theme-primary-15"
          :style="{ width: '88px', height: '88px', fontSize: '2.8rem' }"
        >🏆</div>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ t("$vuetify.label.no_league_this_week") }}
        </p>

        <p class="text-body-2 text-grey-lighten-1">
          {{ t("$vuetify.message.train_to_join_next_league") }}
        </p>
      </div>

      <template v-else>
        <!-- CABEÇALHO DA LIGA -->
        <div class="text-center py-4">
          <p class="text-h5 font-space-grotesk font-weight-bold text-primary">
            {{ t(`$vuetify.leagues.${leaguesStore.league.tier_name}`) }}
          </p>

          <p class="text-body-2 text-grey-lighten-1 mt-1">
            {{ t("$vuetify.message.league_closes_in", countdown) }}
          </p>
        </div>

        <!-- LISTA DA COORTE -->
        <div class="d-flex flex-column">
          <template
            v-for="(member, index) in leaguesStore.league.members"
            :key="member._id"
          >
            <!-- Divisor da zona de promoção -->
            <div
              v-if="index === leaguesStore.league.zones.promote && leaguesStore.league.zones.promote > 0"
              class="d-flex align-center ga-3 my-2"
            >
              <v-divider color="primary" />

              <span class="text-caption text-primary text-no-wrap">
                <v-icon :size="14">mdi-arrow-up-bold</v-icon>
                {{ t("$vuetify.label.promotion_zone") }}
              </span>

              <v-divider color="primary" />
            </div>

            <!-- Divisor da zona de rebaixamento -->
            <div
              v-if="index === leaguesStore.league.members.length - leaguesStore.league.zones.demote && leaguesStore.league.zones.demote > 0"
              class="d-flex align-center ga-3 my-2"
            >
              <v-divider color="red" />

              <span class="text-caption text-red text-no-wrap">
                <v-icon :size="14">mdi-arrow-down-bold</v-icon>
                {{ t("$vuetify.label.demotion_zone") }}
              </span>

              <v-divider color="red" />
            </div>

            <div
              :class="[
                'd-flex align-center ga-3 px-3 py-2 rounded-lg mb-1',
                member._id === accountsStore._id ? 'bg-theme-primary-15' : ''
              ]"
            >
              <span
                class="font-weight-bold text-center"
                :style="{ width: '1.6rem' }"
              >{{ member.position }}</span>

              <div>
                <ProfileImage
                  :name="member.name"
                  :image="member.image"
                  size="38px"
                />
              </div>

              <div class="flex-fill overflow-hidden">
                <p class="text-body-2 font-weight-bold text-truncate">
                  {{ member._id === accountsStore._id ? t("$vuetify.label.you") : member.name }}
                </p>

                <p class="text-caption text-grey-lighten-1">
                  {{ `@${member.username}` }}
                </p>
              </div>

              <span class="text-body-2 font-weight-bold text-primary">
                {{ `${formatNumber(member.xp)} ${t("$vuetify.label.xp")}` }}
              </span>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useLeaguesStore } from "@/stores/leagues";
import { useAnalyticsStore } from "@/stores/analytics";
import { useFormatNumber } from "@/composables";
import { eventBus } from "@/eventBus";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const accountsStore = useAccountsStore();
const leaguesStore = useLeaguesStore();
const analyticsStore = useAnalyticsStore();
const loading = ref(true);
const now = ref(dayjs());

let interval: ReturnType<typeof setInterval> | null = null;

/// COMPUTED
const countdown = computed(() => {
  if (!leaguesStore.league) return "";

  const diff = Math.max(0, dayjs(leaguesStore.league.closes_at).diff(now.value, "second"));
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", back);

  interval = setInterval(() => now.value = dayjs(), 30_000);

  analyticsStore.TRACK("screen_viewed", { screen: "league" });

  await leaguesStore.GET_CURRENT();
  loading.value = false;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
  if (interval) clearInterval(interval);
});

/// METHODS
const back = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>