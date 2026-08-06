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
        {{ t("$vuetify.label.refer_and_earn") }}
      </p>
    </header>

    <div
      v-if="!account?._id"
      class="flex-fill d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>
    <template v-else>
      <div class="flex-fill overflow-y-auto px-5 py-5">
        <div class="mb-5 d-flex flex-column align-start rounded-xl px-4 py-6 bg-primary">
          <p
            class="text-uppercase text-caption font-weight-bold px-3 py-1 mb-6 rounded-pill"
            :style="{ backgroundColor: '#0003' }"
          >
            <v-icon class="mr-2">mdi-creation-outline</v-icon>
            {{ t("$vuetify.label.affiliate_program") }}
          </p>

          <p class="font-weight-bold text-h4 font-space-grotesk">
            {{ `${t("$vuetify.label.earn")} ${formatNumber(account.indication.percentage, "percent", 0)}` }}
          </p>

          <p class="font-space-grotesk font-weight-bold mb-4">
            {{ t("$vuetify.label.for_each_subscription") }}
          </p>

          <p class="text-body-2 mb-4">
            {{ t("$vuetify.message.invite_friends_to_train_at_zen_move_fit_and_receive_a_recurring_commission_every_month") }}
          </p>

          <div
            class="w-100 pa-4 d-flex flex-column align-start rounded-xl"
            :style="{ backgroundColor: '#0003' }"
          >
            <p
              class="text-uppercase text-caption font-weight-bold px-3 py-1 mb-3 rounded-pill"
              :style="{ backgroundColor: '#0003' }"
            >{{ t("$vuetify.label.exclusive_offer") }}</p>

            <p class="text-body-2 mb-2">
              {{ t("$vuetify.message.your_referral_pays_only") }}
            </p>

            <p class="d-flex align-center ga-2">
              <span class="text-h5 font-weight-bold">
                {{ currency(account.indication.amount || 0) }}
              </span>

              <span
                v-if="(account.indication.full_amount || 0) !== (account.indication.amount || 0)"
                class="text-caption text-decoration-line-through"
              >
                {{ currency(account.indication.full_amount || 0) }}
              </span>
            </p>
          </div>
        </div>

        <div v-if="listIndications.length > 1" class="d-flex ga-3 mb-5">
          <div
            v-for="(item, i) in listIndications"
            :key="i"
            class="flex-fill pa-3 rounded-lg d-flex flex-column align-center ga-2 bg-quintet border-sextet"
          >
            <div class="size-3rem d-flex justify-center align-center rounded-circle bg-theme-primary-15">
              <v-icon color="primary">
                {{ item.icon }}
              </v-icon>
            </div>

            <p class="text-h5 font-weight-bold font-space-grotesk">
              {{ item.percentage }}
            </p>

            <p class="font-space-grotesk text-grey-lighten-1">
              {{ item.text }}
            </p>
          </div>
        </div>

        <div>
          <div class="mb-5">
            <p class="font-weight-bold font-space-grotesk mb-3 text-uppercase">
              {{ t("$vuetify.label.how_it_works") }}
            </p>

            <div class="d-flex flex-column ga-3">
              <div
                v-for="(item, i) in listHowItWorks"
                :key="i"
                class="rounded-xl px-3 py-5 d-flex align-center ga-3 bg-quintet border-sextet"
              >
                <div>
                  <div class="size-3rem d-flex justify-center align-center rounded-circle bg-theme-primary-15">
                    <v-icon color="primary">
                      {{ item.icon }}
                    </v-icon>
                  </div>
                </div>

                <div>
                  <p class="text-body-2 font-weight-bold mb-1">
                    {{ item.title }}
                  </p>

                  <p class="text-caption text-grey-lighten-1">
                    {{ item.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <p class="font-weight-bold mb-3 text-uppercase">
              {{ t("$vuetify.label.benefits") }}
            </p>

            <div class="rounded-xl px-3 py-5 d-flex flex-column ga-3 bg-quintet border-sextet">
              <div
                v-for="(item, i) in listBenefits"
                :key="i"
                class="d-flex align-center ga-3"
              >
                <v-icon color="success">
                  mdi-check-circle-outline
                </v-icon>

                <span class="text-body-2 text-grey-lighten-1">
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <p class="font-weight-bold mb-3 text-uppercase">
              {{ t("$vuetify.label.your_referral_link") }}
            </p>

            <div class="rounded-xl px-3 py-5 d-flex flex-column bg-quintet border-sextet">
              <div
                class="pa-2 mb-4"
                :style="{ wordBreak: 'break-word' }"
              >{{ referralLink }}</div>

              <div class="d-flex ga-3">
                <v-btn
                  :style="{ width: '48%' }"
                  class="pa-5 text-none d-flex"
                  color="tertiary"
                  @click="copyLink"
                >
                  <v-icon class="mr-2">
                    mdi-content-copy
                  </v-icon>

                  {{ t("$vuetify.label.copy_link") }}
                </v-btn>

                <v-btn
                  :style="{ width: '48%' }"
                  class="pa-5 text-none d-flex"
                  color="primary"
                  @click="share"
                >
                  <v-icon class="mr-2">
                    mdi-share-variant-outline
                  </v-icon>

                  {{ t("$vuetify.label.share") }}
                </v-btn>
              </div>
            </div>
          </div>

          <v-btn
            block
            color="quintet"
            class="mb-5 pa-7 position-relative text-none border-sextet"
            @click="myRecommendations"
          >
            <div class="position-absolute top-0 left-0 right-0 bottom-0 d-flex px-3 ga-3">
              <div class="flex-fill d-flex align-center">
                <v-icon :size="25" color="primary" class="mr-3">
                  mdi-account-multiple-outline
                </v-icon>

                <span class="font-weight-bold">
                  {{ t("$vuetify.label.my_recommendations") }}
                </span>
              </div>

              <div class="d-flex justify-center align-center">
                <v-icon :size="30">
                  mdi-chevron-right
                </v-icon>
              </div>
            </div>
          </v-btn>

          <v-btn
            v-if="needVerification"
            block
            variant="tonal"
            color="blue"
            class="mb-3 pa-7 text-none"
            @click="verifyDocuments"
          >{{ t("$vuetify.label.verify_documents") }}</v-btn>

          <v-btn
            block
            variant="tonal"
            color="primary"
            class="pa-7 text-none"
            @click="editBankAccount"
          >
            {{
              !account?.recipient?.identification ?
                t("$vuetify.label.set_up_account") :
                t("$vuetify.label.edit_bank_details")
            }}
          </v-btn>
        </div>
      </div>
    </template>

    <v-bottom-sheet v-model="bottomSheet" >
      <div class="d-flex justify-end px-4 mb-3">
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
        <v-card-text class="pt-5 pb-3 px-4 d-flex flex-column overflow-y-hidden">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
              <v-icon color="primary" :size="30">
                mdi-file-document-alert
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.message.document_verification_required") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1 text-body-2">
            {{ t("$vuetify.message.verify_your_documents_to_be_able_to_make_any_withdrawals") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="verifyDocuments"
          >{{ t("$vuetify.label.verify_documents") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { Share } from "@/mobile";
import { useCopy, useWebView, useCurrency, useFormatNumber } from "@/composables";
import { useAccountsStore } from "@/stores/accounts";
import { eventBus } from "@/eventBus";

/// DATA
const { t } = useLocale();
const { copy } = useCopy();
const { openInBrowser } = useWebView();
const { formatNumber } = useFormatNumber();
const { currency } = useCurrency();
const accountsStore = useAccountsStore();
const emit = defineEmits(["close", "my-recommendations", "bank-account"]);
const bottomSheet = ref(false);

/// COMPUTED
const listIndications = computed(() => [
  {
    icon: "mdi-trending-up",
    percentage: formatNumber(account.value.indication.percentage, "percent", 0),
    text: t("$vuetify.label.level_1")
  },
  ...(account.value.indication.second_level_status ? [{
    icon: "mdi-layers-outline",
    percentage: formatNumber(account.value.indication.second_level_percentage, "percent", 0),
    text: t("$vuetify.label.level_2")
  }] : []),
  ...(account.value.indication.extras_status ? [{
    icon: "mdi-wallet-outline",
    percentage: formatNumber(account.value.indication.extras_percentage, "percent", 0),
    text: t("$vuetify.label.extras")
  }] : []),
]);

const listHowItWorks = computed(() => [
  {
    icon: "mdi-share-variant-outline",
    title: t("$vuetify.message.share_your_link"),
    message: t("$vuetify.message.send_your_unique_link_to_friends_and_family")
  },
  {
    icon: "mdi-account-multiple-outline",
    title: t("$vuetify.message.friend_registers"),
    message: t("$vuetify.message.when_someone_signs_up_using_your_link_you_will_be_notified")
  },
  {
    icon: "mdi-currency-usd",
    title: t("$vuetify.message.receive_a_commission"),
    message: t("$vuetify.message.earn_a_commission_for_each_active_subscription_your_referrals_make")
  },
  ...(
    account.value.indication.second_level_status ?
      [{
        icon: "mdi-layers-outline",
        title: t("$vuetify.label.network_gains"),
        message: t("$vuetify.message.network_gains"),
      }] :
      []
  ),
  ...(
    account.value.indication.extras_status ?
    [{
      icon: "mdi-wallet-outline",
      title: t("$vuetify.label.extra_packages"),
      message: t("$vuetify.message.extra_packages"),
    }] :
    []
  )
]);

const listBenefits = computed(() => [
  t("$vuetify.message.commission_as_an_active_subscriber"),
  t("$vuetify.message.no_limit_on_referrals"),
  t("$vuetify.message.withdraw_anytime")
]);

const account = computed(() => accountsStore.account);

const referralLink = computed(() => {
  return `${import.meta.env.VITE_API_FRONTEND}${account.value?.indication?.id}`;
});

const needVerification = computed(() => account.value?.recipient?.status === "affiliation");

/// LIFE CYCLES
onMounted(async () => {
  if (needVerification.value) bottomSheet.value = true;
  if (!account.value.indication.status) emit("close");
});

/// METHODS
const back = () => {
  emit("close");
};

const copyLink = () => {
  copy(referralLink.value);
};

const share = async () => {
  Share.share({ url: referralLink.value });
};

const myRecommendations = () => {
  emit("my-recommendations");
};

const editBankAccount = () => {
  emit("bank-account");
};

const verifyDocuments = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await accountsStore.GET(`recipients/${account.value.recipient.identification}/kyc`);
    if (!response.error) openInBrowser(response.url);
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>