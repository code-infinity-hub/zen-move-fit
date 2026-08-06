<template>
  <div class="w-100 h-100 d-flex flex-column">
    <TextField
      inline
      clearable
      id="search"
      density="compact"
      prepend-icon="mdi-magnify"
      :placeholder="t('$vuetify.label.search_people_chat')"
      v-model="search"
      @focus="focused = true"
      @blur="focused = false"
    />

    <!-- FILTRO DA PESQUISA -->
    <div
      v-if="searchResult.results.size > 0"
      class="mt-3 overflow-x-auto"
    >
      <div
        class="d-flex ga-2"
        :style="{ width: 'max-content' }"
      >
        <div
          v-for="option in searchOptions"
          :key="option"
          :style="{
            ...(
              searchResult.option === option ?
                { border: '1px solid var(--primary)', color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' } :
                { border: '1px solid #272C34' }
            )
          }"
          class="py-1 px-3 rounded-xl"
          @click="searchResult.option = option"
        >{{ t(`$vuetify.label.${option}`) }}</div>
      </div>
    </div>

    <div class="mt-5 flex-fill">
      <!-- RESULTADOS DA PESQUISA -->
      <div v-if="searchResult.results.size > 0">
        <p class="font-space-grotesk text-body-2 font-weight-bold text-grey-lighten-1 mb-3">
          {{ `${t("$vuetify.label.search_results")} (${formatNumber(results.length)})` }}
        </p>

        <div class="d-flex flex-column ga-3">
          <div
            v-ripple
            v-for="result in results"
            :key="result.account_id"
            class="rounded-lg bg-quintet border-sextet d-flex justify-center align-center ga-3 px-3 py-3"
            @click="openProfile($event, result.account_id)"
          >
            <div>
              <ProfileImage
                size="2.5rem"
                :image="result.image"
                :name="result.name"
              />
            </div>

            <div class="w-100 d-flex flex-column ga-1 text-left overflow-hidden">
              <div class="w-100 d-flex ga-1">
                <span class="font-weight-bold text-truncate">
                  {{
                    result.type === 'FRIEND' ?
                      result.name :
                      result.name.split(" ").slice(0, 3).join(" ")
                  }}
                </span>

                <v-icon
                  v-if="result.verified"
                  color="blue"
                  @click="bottomSheet.verified = true"
                >mdi-shield-check</v-icon>
              </div>

              <p
                class="text-grey-lighten-1"
                :style="{ fontSize: '0.65rem' }"
              >{{ `${t("$vuetify.label.level")} ${formatNumber(result.level || 0)}` }}</p>

              <p
                v-if="result.type === 'MUTUAL'"
                class="text-grey-lighten-1"
                :style="{ fontSize: '0.65rem' }"
              >{{ t("$vuetify.message.compatible_with_you", formatNumber(result.score, "percent", 0)) }}</p>
            </div>

            <div>
              <template v-if="result.type === 'FRIEND'">
                <span
                  v-if="result.friendship!.status === 'PENDING'"
                  class="text-primary text-caption"
                >{{ t("$vuetify.label.pending") }}</span>
                <button
                  v-else
                  v-ripple
                  class="rounded-lg bg-tertiary"
                  :style="{ width: '3rem', height: '2rem' }"
                  @click="openChat(result.friendship!.friendship_id)"
                >
                  <v-icon>mdi-chat</v-icon>
                </button>
              </template>
              <template v-else>
                <button
                  v-ripple
                  class="rounded-lg bg-primary"
                  :style="{ width: '3rem', height: '2rem' }"
                  @click="addFriend(result.account_id)"
                >
                  <v-icon>mdi-account-plus-outline</v-icon>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- LISTAGEM NORMAL -->
      <template v-else>
        <div class="mb-5">
          <p class="font-space-grotesk text-body-2 font-weight-bold text-grey-lighten-1 mb-3">
            {{ `${t("$vuetify.label.friends")} (${formatNumber(countFriends)})` }}
          </p>

          <p
            v-if="countFriends === 0"
            class="text-body-2"
          >{{ t("$vuetify.message.no_friends_have_been_added_yet") }}</p>
          <div
            v-else
            class="d-flex flex-column ga-3"
          >
            <div
              v-ripple
              v-for="friend in friends"
              :key="friend.account_id"
              class="rounded-lg bg-quintet border-sextet d-flex justify-center align-center ga-3 px-3 py-3"
              @click="openProfile($event, friend.account_id)"
            >
              <div>
                <ProfileImage
                  size="2.5rem"
                  :image="friend.image"
                  :name="friend.name"
                />
              </div>

              <div class="w-100 d-flex flex-column ga-1 text-left overflow-hidden">
                <div class="w-100 d-flex ga-1">
                  <span class="font-weight-bold text-truncate">
                    {{ friend.name }}
                  </span>

                  <v-icon
                    v-if="friend.verified"
                    color="blue"
                    @click="bottomSheet.verified = true"
                  >mdi-shield-check</v-icon>
                </div>

                <p
                  class="text-grey-lighten-1"
                  :style="{ fontSize: '0.65rem' }"
                >{{ `${t("$vuetify.label.level")} ${formatNumber(friend.level || 0)}` }}</p>
              </div>

              <div>
                <span
                  v-if="friend.status === 'PENDING'"
                  class="text-primary text-caption"
                >{{ t("$vuetify.label.pending") }}</span>
                <button
                  v-else
                  v-ripple
                  class="rounded-lg bg-tertiary"
                  :style="{ width: '3rem', height: '2rem' }"
                  @click="openChat(friend.friendship_id)"
                >
                  <v-icon>mdi-chat</v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SUGESTÕES DE AMIZADE -->
        <template v-if="countSuggestionsFriends > 0">
          <v-divider class="pb-5"></v-divider>

          <div class="mb-5">
            <p class="font-space-grotesk text-body-2 font-weight-bold text-grey-lighten-1 mb-3">
              {{ `${t("$vuetify.label.suggestions_from_friends")} (${formatNumber(countSuggestionsFriends)})` }}
            </p>

            <div class="d-flex flex-column ga-3">
              <div
                v-ripple
                v-for="suggestion in suggestions"
                :key="suggestion.account_id"
                class="rounded-lg bg-quintet border-sextet d-flex justify-center align-center ga-3 px-3 py-3"
                @click="openProfile($event, suggestion.account_id)"
              >
                <div>
                  <ProfileImage
                    size="2.5rem"
                    :image="suggestion.image"
                    :name="suggestion.name"
                  />
                </div>

                <div class="w-100 d-flex flex-column ga-1 text-left overflow-hidden">
                  <div class="w-100 d-flex ga-1">
                    <span class="font-weight-bold text-truncate">
                      {{ suggestion.name.split(" ").slice(0, 3).join(" ") }}
                    </span>

                    <v-icon
                      v-if="suggestion.verified"
                      color="blue"
                      @click="bottomSheet.verified = true"
                    >mdi-shield-check</v-icon>
                  </div>

                  <p
                    class="text-grey-lighten-1"
                    :style="{ fontSize: '0.65rem' }"
                  >{{ `${t("$vuetify.label.level")} ${formatNumber(suggestion.level || 0)}` }}</p>

                  <p
                    class="text-grey-lighten-1"
                    :style="{ fontSize: '0.65rem' }"
                  >{{ t("$vuetify.message.compatible_with_you", formatNumber(suggestion.score, "percent", 0)) }}</p>
                </div>

                <div>
                  <button
                    v-ripple
                    class="rounded-lg bg-primary"
                    :style="{ width: '3rem', height: '2rem' }"
                    @click="addFriend(suggestion.account_id)"
                  >
                    <v-icon>mdi-account-plus-outline</v-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- LOADING DE CARREGAMENTO DE DADOS -->
      <LoadingData v-if="loadingData" />
    </div>

    <!-- EXPLICAÇÃO DE PERFIL VERIFICADO -->
    <AuthenticatedAccount
      v-model="bottomSheet.verified"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useSocialStore } from "@/stores/social";
import { useFormatNumber } from "@/composables";
import { observerScroll } from "@/utils";
import { eventBus } from "@/eventBus";
import { type SearchFriend } from "@/types/social.type";

/// COMPONENTS
import AuthenticatedAccount from "@/components/AuthenticatedAccount.vue";
import LoadingData from "@/components/LoadingData.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const route = useRoute();
const router = useRouter();
const socialStore = useSocialStore();

const search = ref("");
const focused = ref(false);

const bottomSheet = reactive({ verified: false });

const searchResult = reactive({
  page: 1,
  pages: 1,
  limit: 50,
  total: 0,
  results: new Map<string, SearchFriend>(),
  option: "",
});

const loadingData = ref(false);

let observer: null | ReturnType<typeof observerScroll> = null;

let timeoutSearch: null | number = null;

/// COMPUTED
const countFriends = computed(() => socialStore.friends.total);
const countSuggestionsFriends = computed(() => socialStore.suggestions.total);
const friends = computed(() =>
  [...socialStore.friends.results.values()].sort((a, b) => a.name.localeCompare(b.name))
);
const suggestions = computed(() =>
  [...socialStore.suggestions.results.values()].sort((a, b) => a.name.localeCompare(b.name))
);
const searchOptions = computed(() => {
  const results = [...searchResult.results.values()];
  const countFriends = results.filter((search) => search.type === "FRIEND").length;
  const countMutual = results.filter((search) => search.type === "MUTUAL").length;
  return [
    countFriends && countMutual ? "all" : "",
    countFriends ?  "friends" : "",
    countMutual ?  "mutual_friends" : "",
  ].filter(Boolean);
});
const results = computed(() => {
  return [...searchResult.results.values()]
    .filter((search) => {
      if (searchResult.option === "all") return search;
      if (searchResult.option === "friends") return search.type === "FRIEND";
      return search.type === "MUTUAL";
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

/// WATCH
watch(() => route.query.search, (val) => {
  if (val === "1" && !focused.value) {
    getTextfield().focus();
  }
}, { deep: true });

watch(focused, (val) => {
  router.replace({
    replace: true,
    query: {
      ...route.query,
      search: val ? "1" : undefined
    }
  });
});

watch(search, (val) => {
  if (timeoutSearch !== null) {
    clearTimeout(timeoutSearch);
    timeoutSearch = null;
  }

  if (val) {
    timeoutSearch = setTimeout(searchPeople, 500);
  } else {
    searchResult.page = 1;
    searchResult.pages = 1;
    searchResult.limit = 50;
    searchResult.total = 0;
    searchResult.results.clear();
    searchResult.option = "";
  }
});

/// LIFE CYCLES
onMounted(() => {
  observer = observerScroll(
    document.querySelector(".overflow-social") as HTMLElement,
    handle
  );
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

/// METHODS
const getTextfield = () => document.querySelector("#search")! as HTMLInputElement;

const handle = async () => {
  if (search.value) {
    if (
      !loadingData.value &&
      (searchResult.page + 1) <= searchResult.pages
    ) {
      loadingData.value = true;
      await searchPeople(searchResult.page + 1, false);
      loadingData.value = false;
    }
  } else {
    if (!loadingData.value) {
      if ((socialStore.suggestions.page + 1) <= socialStore.suggestions.pages) {
        loadingData.value = true;
        await socialStore.GET_SUGGESTION_FRIENDS();
        loadingData.value = false;
        return;
      }

      if ((socialStore.friends.page + 1) <= socialStore.friends.pages) {
        loadingData.value = true;
        await socialStore.GET_FRIENDS();
        loadingData.value = false;
      }
    }
  }
};

const openProfile = (event: Event, account_id: string) => {
  const tagName = (event.target as HTMLElement).tagName.toLowerCase();

  if (!["button", "i"].includes(tagName)) {
    router.push({
      name: "profile",
      params: { _id: account_id }
    });
  }
};

const openChat = (friendship_id: string) => {
  eventBus.emit("OPEN_CHAT", { friendship_id });
};

const searchPeople = async (page = searchResult.page, loader = true) => {
  try {
    if (loader) eventBus.emit("SET_LOADER", { enabled: true });

    const response = await socialStore.GET(`friends/search?q=${search.value.toLowerCase().trim()}&page=${page}&limit=50&sort_by=account.name&sort=ASC`);

    if (!response.error) {
      const result = response.result;

      if (result.results.length) {
        searchResult.page = result.page;
        searchResult.pages = result.pages;
        searchResult.limit = result.limit;
        searchResult.total = result.total;

        result.results.forEach((search: SearchFriend) => {
          if (!searchResult.results.has(search.account_id)) searchResult.results.set(search.account_id, search);
        });

        if (searchResult.option && searchOptions.value.includes(searchResult.option)) {
          ///
        } else {
          searchResult.option = searchOptions.value[0]!;
        }
      } else {
        eventBus.emit("SNACKBAR", {
          message: t("$vuetify.message.no_results_found")
        });
      }
    }
  } catch {
    ///
  } finally {
    if (loader) eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const addFriend = async (account_id: string) => {
  eventBus.emit("SET_LOADER", { enabled: true });
  await socialStore.ADD_FRIEND(account_id);
  eventBus.emit("SET_LOADER", { enabled: false });
};
</script>