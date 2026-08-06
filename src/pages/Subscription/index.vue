<template>
  <div class="w-100 h-100 bg-secondary">
    <!-- SEM ASSINATURA -->
    <div
      v-if="!accountsStore.isSubscriber"
      class="w-100 h-100 d-flex flex-column align-center justify-center px-5 ga-7"
    >
      <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
        <v-icon color="primary" :size="65">
          mdi-package-variant
        </v-icon>
      </div>

      <p class="text-center font-weight-bold text-h5 font-space-grotesk">
        {{ t("$vuetify.message.no_active_subscription") }}
      </p>

      <v-btn
        color="primary"
        class="w-100 pa-7 d-flex text-h6 font-weight-bold"
        @click="eventBus.emit('START_SUBSCRIPTION')"
      >{{ t("$vuetify.label.subscribe_now") }}</v-btn>
    </div>

    <!-- ACESSO VITALÍCIO -->
    <div
      v-else-if="account.subscription_lifetime?.enabled"
      class="w-100 h-100 d-flex flex-column overflow-hidden"
    >
      <header class="heading border-bottom-tertiary d-flex align-center">
        <v-btn
          icon=""
          size="x-small"
          color="tertiary"
          class="mr-4"
          @click="backButton"
        >
          <v-icon :size="18">
            mdi-arrow-left
          </v-icon>
        </v-btn>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ t("$vuetify.label.subscription") }}
        </p>
      </header>

      <div class="flex-fill overflow-y-auto pa-5 d-flex flex-column align-center justify-center ga-7">
        <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
          <v-icon color="primary" :size="65">
            mdi-crown-outline
          </v-icon>
        </div>

        <p class="text-center font-weight-bold text-h5 font-space-grotesk">
          {{ t("$vuetify.label.lifetime_access") }}
        </p>

        <p class="text-center text-body-2 text-grey-lighten-1">
          {{ t("$vuetify.message.lifetime_access_description") }}
        </p>

        <TextField
          v-if="account.subscription_lifetime.recharge_credits"
          readonly
          is-money
          hide-symbol
          class="w-100"
          :label="t('$vuetify.label.credits_acquired')"
          v-model="lifetimeCredits"
        />

        <TextField
          v-if="account.subscription_lifetime.recharge_credits && account.subscription_lifetime.renewal_date"
          readonly
          class="w-100"
          :label="t('$vuetify.label.next_recharge')"
          v-model="lifetimeRenewalDate"
        />
      </div>
    </div>

    <!-- COM ASSINATURA -->
    <div
      v-else
      class="w-100 h-100 d-flex flex-column overflow-hidden"
    >
      <header class="heading border-bottom-tertiary d-flex align-center">
        <v-btn
          icon=""
          size="x-small"
          color="tertiary"
          class="mr-4"
          @click="backButton"
        >
          <v-icon :size="18">
            mdi-arrow-left
          </v-icon>
        </v-btn>

        <p class="text-h6 font-space-grotesk font-weight-bold">
          {{ t("$vuetify.label.subscription") }}
        </p>
      </header>

      <div class="flex-fill overflow-y-auto pa-3">
        <TextField
          readonly
          class="mb-5"
          :label="t('$vuetify.label.created_in')"
          v-model="createdAt"
        />

        <TextField
          readonly
          class="mb-5"
          :label="t('$vuetify.label.paid_in')"
          v-model="paidAt"
        />

        <TextField
          readonly
          is-money
          class="mb-5"
          :label="t('$vuetify.label.value')"
          v-model="amount"
        />

        <ItemSelect
          readonly
          class="mb-5"
          :label="t('$vuetify.label.payment_method')"
          :items="[
            { title: t('$vuetify.label.pix'), value: 'pix', icon: 'mdi-rhombus-split' },
            { title: t('$vuetify.label.credit_card'), value: 'credit_card', icon: 'mdi-credit-card' },
          ]"
          v-model="paymentMethod"
        />

        <TextField
          readonly
          class="mb-5"
          :label="t(`$vuetify.label.${paymentMethod === 'pix' ? 'next_payment' : 'next_charge'}`)"
          v-model="nextBilling"
        />

        <TextField
          readonly
          is-money
          hide-symbol
          class="mb-5"
          :label="t('$vuetify.label.credits_acquired')"
          v-model="credits"
        />

        <v-btn
          v-if="isInPixRenewalWindow"
          block
          color="primary"
          class="text-black font-weight-bold text-none pa-6 mb-3"
          @click="renewSubscription"
        >{{ t("$vuetify.label.renew_subscription") }}</v-btn>

        <v-btn
          block
          variant="outlined"
          color="error"
          class="text-none pa-6"
          @click="cancelSubscription"
        >{{ t("$vuetify.label.cancel_subscription") }}</v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { usePersistentSession } from "@/plugins/usePersistentSession";

/// DATA
const { t } = useLocale();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();

/// COMPUTED
const account = computed(() => accountsStore.account);
const createdAt = computed(() => dayjs(account.value?.subscription_details?.created_at).format(t("$vuetify.label.full_date_format")));
const paidAt = computed(() => dayjs(account.value?.subscription_details?.paid_at).format(t("$vuetify.label.full_date_format")));
const amount = computed(() => account.value?.subscription_details?.amount);
const paymentMethod = computed(() => account.value?.subscription_details?.payment_method);
const nextBilling = computed(() => dayjs(account.value?.subscription_details?.expires_at).format(t("$vuetify.label.date_format")));
const credits = computed(() => account.value?.subscription_details?.credits);
const isInPixRenewalWindow = computed(() => {
  const subscription = account.value?.subscription_details;
  if (!subscription || subscription.payment_method !== "pix" || subscription.status !== "PAID") return false;
  return dayjs(subscription.expires_at).diff(dayjs(), "hour") <= 24;
});
const lifetimeCredits = computed(() => account.value?.subscription_lifetime?.credits);
const lifetimeRenewalDate = computed(() => {
  const renewalDate = account.value?.subscription_lifetime?.renewal_date;
  return renewalDate ? dayjs(renewalDate).format(t("$vuetify.label.date_format")) : "";
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);
  accountsStore._id = (await persistentSession.get("_id"))!;
  accountsStore.GET_ACCOUNT();
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", backButton);
});

/// METHDS
const renewSubscription = () => {
  eventBus.emit("START_SUBSCRIPTION");
};

const cancelSubscription = () => {
  window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_SUPPORT}?text=Ol%C3%A1,%20quero%20falar%20com%20suporte.`);
};

const backButton = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>