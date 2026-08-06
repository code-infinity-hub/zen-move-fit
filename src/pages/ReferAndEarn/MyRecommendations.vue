<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column bg-secondary">
    <header class="heading border-bottom-tertiary d-flex align-center">
      <v-btn
        icon=""
        size="x-small"
        color="tertiary"
        class="mr-4"
        @click="back"
      >
        <v-icon :size="18">
          mdi-arrow-left
        </v-icon>
      </v-btn>

      <p class="text-h6 font-space-grotesk font-weight-bold">
        {{ t("$vuetify.label.my_recommendations") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto px-5 py-5 list-my-recommendations">
      <template v-if="aggregateIndications.length">
        <p class="text-caption text-grey-lighten-1 font-weight-bold text-uppercase mb-2">
          {{ t("$vuetify.label.aggregate_of") }}
        </p>

        <div
          v-for="aggregate in aggregateIndications"
          :key="aggregate._id"
          class="rounded-lg bg-quintet border-sextet d-flex align-center ga-3 px-3 py-3 mb-3"
        >
          <div>
            <ProfileImage
              size="2.5rem"
              :image="aggregate.image"
              :name="aggregate.name"
            />
          </div>

          <div class="flex-fill overflow-hidden">
            <p class="text-body-2 font-weight-bold text-truncate">
              {{ aggregate.name }}
            </p>

            <v-chip
              size="small"
              variant="tonal"
              color="orange"
            >{{ t("$vuetify.label.aggregate", aggregate.percentage) }}</v-chip>
          </div>

          <span
            v-if="aggregate.earned_amount > 0"
            class="text-body-2 font-weight-bold text-primary"
          >{{ currency(aggregate.earned_amount) }}</span>
        </div>

        <v-divider
          v-if="indications.length"
          class="mb-4"
        />
      </template>

      <div
        v-if="loading"
        class="w-100 d-flex justify-center align-center pa-6"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="40"
        />
      </div>
      <template v-else-if="indications.length">
        <div
          v-ripple
          v-for="indication in indications"
          :key="indication._id"
          class="rounded-lg bg-quintet border-sextet d-flex align-center ga-3 px-3 py-3 mb-3"
          @click="openDetail(indication)"
        >
          <div>
            <ProfileImage
              size="2.5rem"
              :image="indication.image"
              :name="indication.name"
            />
          </div>

          <div class="flex-fill overflow-hidden">
            <p class="text-body-2 font-weight-bold text-truncate">
              {{ indication.name }}
            </p>

            <p class="text-caption text-grey-lighten-1">
              {{ dayjs(indication.created_at).format(t("$vuetify.label.date_format")) }}
            </p>
          </div>

          <div class="d-flex flex-column align-end ga-1">
            <span
              v-if="indication.earned_amount > 0"
              class="text-body-2 font-weight-bold text-primary"
            >{{ currency(indication.earned_amount) }}</span>

            <v-chip
              size="small"
              variant="tonal"
              :color="statusColor(indication.status)"
            >{{ statusLabel(indication.status) }}</v-chip>
          </div>
        </div>

        <LoadingData v-if="loadingMore" />
      </template>
      <p
        v-else-if="!aggregateIndications.length"
        class="text-center text-grey-lighten-1 pa-6"
      >{{ t("$vuetify.label.no_recommendations") }}</p>
    </div>

    <v-bottom-sheet
      :persistent="detailLoading"
      v-model="bottomSheet"
    >
      <div
        v-if="!detailLoading"
        class="d-flex justify-end px-4 mb-3"
      >
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <div
          v-if="detailLoading"
          class="d-flex justify-center align-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            :size="40"
          />
        </div>
        <v-card-text
          v-else-if="detail"
          class="px-4 pb-5 d-flex flex-column overflow-y-hidden"
        >
          <div class="d-flex flex-column align-center mb-4">
            <ProfileImage
              size="4rem"
              class="mb-3"
              :image="detail.indication.image"
              :name="detail.indication.name"
            />

            <p class="text-h6 font-weight-bold font-space-grotesk text-center">
              {{ detail.indication.name }}
            </p>

            <p class="text-caption text-grey-lighten-1 mb-3">
              {{ dayjs(detail.indication.created_at).format(t("$vuetify.label.date_format")) }}
            </p>

            <v-chip
              size="small"
              variant="tonal"
              :color="statusColor(detail.indication.status)"
            >{{ statusLabel(detail.indication.status) }}</v-chip>
          </div>

          <div class="rounded-xl px-4 py-4 mb-4 d-flex flex-column align-center bg-quintet border-sextet">
            <p class="text-caption text-grey-lighten-1 mb-1">
              {{ t("$vuetify.label.total_earned") }}
            </p>

            <p class="text-h5 font-weight-bold font-space-grotesk text-primary">
              {{ currency(detail.indication.earned_amount) }}
            </p>
          </div>

          <p class="font-weight-bold mb-3 text-uppercase">
            {{ t("$vuetify.label.earnings_history") }}
          </p>

          <div
            v-if="detail.transactions.length"
            class="d-flex flex-column ga-3 overflow-y-auto"
            :style="{ maxHeight: '30vh' }"
          >
            <div
              v-for="transaction in detail.transactions"
              :key="transaction._id"
              class="rounded-lg px-3 py-3 d-flex align-center ga-3 bg-quintet border-sextet"
            >
              <div class="size-2rem d-flex justify-center align-center rounded-circle bg-theme-primary-15">
                <v-icon
                  color="primary"
                  :size="18"
                >{{ transaction.type === "SUBSCRIPTION" ? "mdi-autorenew" : "mdi-flash-outline" }}</v-icon>
              </div>

              <div class="flex-fill">
                <p class="text-body-2 font-weight-bold">
                  {{ transaction.type === "SUBSCRIPTION" ? t("$vuetify.label.subscription") : t("$vuetify.label.credits_purchase") }}
                </p>

                <p class="text-caption text-grey-lighten-1">
                  {{ dayjs(transaction.created_at).format(t("$vuetify.label.date_format")) }}
                </p>
              </div>

              <span class="text-body-2 font-weight-bold text-primary">
                {{ currency(transaction.amount) }}
              </span>
            </div>
          </div>
          <p
            v-else
            class="text-center text-grey-lighten-1 pa-4"
          >{{ t("$vuetify.label.no_earnings_yet") }}</p>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useCurrency } from "@/composables";
import { useAccountsStore } from "@/stores/accounts";
import { observerScroll } from "@/utils";
import type { AccountAggregateIndication, AccountIndication, AccountIndicationDetail } from "@/types/account.type";

/// COMPONENTS
import ProfileImage from "@/components/ProfileImage.vue";
import LoadingData from "@/components/LoadingData.vue";

/// DATA
const { t } = useLocale();
const { currency } = useCurrency();
const accountsStore = useAccountsStore();
const emit = defineEmits(["close"]);

const loading = ref(true);
const loadingMore = ref(false);

const bottomSheet = ref(false);
const detailLoading = ref(false);
const detail = ref<AccountIndicationDetail | null>(null);
const aggregateIndications = ref<AccountAggregateIndication[]>([]);

let observer: null | ReturnType<typeof observerScroll> = null;

/// COMPUTED
const indications = computed(() => [...accountsStore.indications.results.values()]);

/// LIFE CYCLES
onMounted(async () => {
  accountsStore.RESET_INDICATIONS();

  const [, aggregates] = await Promise.all([
    accountsStore.GET_INDICATIONS(),
    accountsStore.GET_AGGREGATE_INDICATIONS(),
  ]);

  aggregateIndications.value = aggregates;
  loading.value = false;

  nextTick(() => {
    observer = observerScroll(
      document.querySelector(".list-my-recommendations") as HTMLElement,
      loadMore
    );
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

/// METHODS
const statusColor = (status: AccountIndication["status"]) => {
  if (status === "CONVERTED") return "primary";
  if (status === "CANCELED") return "red";
  return "blue";
};

const statusLabel = (status: AccountIndication["status"]) => {
  if (status === "CONVERTED") return t("$vuetify.label.converted");
  if (status === "CANCELED") return t("$vuetify.label.canceled");
  return t("$vuetify.label.pending");
};

const back = () => {
  emit("close");
};

const loadMore = async () => {
  const { page, pages } = accountsStore.indications;

  if (loadingMore.value || page >= pages) return;

  loadingMore.value = true;
  await accountsStore.GET_INDICATIONS();
  loadingMore.value = false;
};

const openDetail = async (indication: AccountIndication) => {
  bottomSheet.value = true;
  detailLoading.value = true;
  detail.value = await accountsStore.GET_INDICATION_DETAIL(indication._id);
  detailLoading.value = false;
};
</script>