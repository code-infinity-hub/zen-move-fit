<template>
  <div
    v-if="modelProxy"
    class="position-fixed top-0 left-0 right-0 bottom-0 overflow-hidden bg-secondary"
    :style="{ zIndex: 3 }"
  >
    <v-tabs-window
      v-model="tabMaster"
      class="w-100 h-100"
    >
      <v-tabs-window-item class="w-100 h-100">
        <div class="w-100 h-100 overflow-hidden d-flex flex-column">
          <header
            :style="{ padding: 'calc(var(--top-saved) + 0.3rem) 0.3rem 0.3rem 0.3rem' }"
            class="d-flex justify-end"
          >
            <v-icon
              :size="30"
              @click="modelProxy = false"
            >mdi-close</v-icon>
          </header>

          <div class="flex-fill overflow-y-auto px-5 py-4">
            <div class="d-flex justify-center align-center mb-4">
              <div
                :style="{ width: '3.8rem', height: '3.8rem' }"
                class="rounded-lg bg-primary d-flex justify-center align-center"
              >
                <v-icon color="black" :size="35">
                  mdi-crown-outline
                </v-icon>
              </div>
            </div>

            <p class="text-center font-weight-bold font-space-grotesk text-h5 mb-2">
              {{ t("$vuetify.message.unlock_your_full_potential") }}
            </p>

            <p class="text-center text-grey-lighten-1 mb-7">
              {{ t("$vuetify.message.training_nutrition_and_ai_working_for_you") }}
            </p>

            <div class="mb-7 px-5 py-4 border-sm border-primary border-opacity-100 rounded-xl d-flex flex-column bg-theme-primary-background-10">
              <p class="font-weight-bold text-primary text-uppercase mb-3">
                {{ t("$vuetify.label.premium") }}
              </p>

              <div class="mb-2">
                <span class="text-h4 font-weight-bold font-space-grotesk">
                  {{ currency(offersStore.amount) }}
                </span>

                <span class="text-body-2 text-grey-lighten-1 text-lowercase ml-1">
                  {{ `/ ${t("$vuetify.label.month")}` }}
                </span>
              </div>

              <p class="text-body-2 text-grey-lighten-1">
                {{ t("$vuetify.message.monthly_recurring_billing") }}
              </p>
            </div>

            <div class="rounded-xl mb-7">
              <div class="px-4 py-3 rounded-t-xl bg-theme-tertiary-40 border-tertiary d-flex">
                <div
                  class="text-body-2 text-grey-lighten-1 font-weight-bold"
                  :style="{ width: '60%' }"
                >{{ t("$vuetify.label.resource") }}</div>

                <div
                  class="text-body-2 text-center text-grey-lighten-1 font-weight-bold"
                  :style="{ width: '20%' }"
                >{{ t("$vuetify.label.free") }}</div>

                <div
                  class="text-body-2 text-center text-primary font-weight-bold"
                  :style="{ width: '20%' }"
                >{{ t("$vuetify.label.premium") }}</div>
              </div>

              <div
                class="bg-theme-tertiary-40 d-flex flex-column rounded-b-xl"
                :style="{ borderLeft: '1px solid var(--tertiary)', borderRight: '1px solid var(--tertiary)' }"
              >
                <div
                  v-for="(item, i) in list"
                  :key="i"
                  :class="[
                    'px-4 py-2 border-bottom-tertiary d-flex',
                    i === (list.length - 1) ? 'rounded-b-xl' : ''
                  ]"
                >
                  <div
                    class="text-body-2 text-white d-flex align-center"
                    :style="{ width: '60%' }"
                  >{{ item.text }}</div>

                  <div
                    class="text-body-2 d-flex justify-center align-center"
                    :style="{ width: '20%' }"
                  >
                    <v-icon
                      :color="item.free ? 'white' : 'grey-darken-2'"
                    >{{ item.free ? "mdi-check" : "mdi-close" }}</v-icon>
                  </div>

                  <div
                    class="text-body-2 d-flex justify-center align-center"
                    :style="{ width: '20%' }"
                  >
                    <div class="size-2rem rounded-circle bg-theme-primary-15 d-flex justify-center align-center">
                      <v-icon color="primary">mdi-check</v-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="account.guarantee_activated"
              class="pa-3 rounded-xl d-flex align-center ga-3 border-sm border-primary border-opacity-100 bg-theme-primary-15"
            >
              <div class="d-flex justify-center align-center">
                <v-icon color="primary" :size="30">
                  mdi-shield-check-outline
                </v-icon>
              </div>

              <div class="text-left">
                <p class="font-weight-bold font-space-grotesk mb-1">
                  {{ t("$vuetify.label.s7_day_guarantee") }}
                </p>

                <p
                  class="text-caption text-grey-lighten-1"
                  :style="{ whiteSpace: 'normal' }"
                >{{ t("$vuetify.message.well_give_you_a_100_refund_if_youre_not_satisfied_cancel_anytime") }}</p>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <footer :style="{ padding: '0.5rem 0.5rem calc(var(--bottom-saved) + 0.5rem) 0.5rem' }">
            <v-btn
              block
              color="primary"
              class="pa-7 text-h6 text-black font-weight-bold"
              @click="bottomSheet = true"
            >{{ offersStore.cta_subscription }}</v-btn>
          </footer>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item class="w-100 h-100">
        <div class="w-100 h-100 px-5 d-flex flex-column justify-center align-center ga-7">
          <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
            <v-icon color="primary" :size="65">
              mdi-check
            </v-icon>
          </div>

          <p class="text-center font-weight-bold text-h5 font-space-grotesk">
            {{ t("$vuetify.message.your_subscription_was_successful") }}
          </p>

          <v-btn
            color="primary"
            class="w-100 pa-7 d-flex text-h6 font-weight-bold"
            @click="modelProxy = false"
          >{{ t("$vuetify.label.close") }}</v-btn>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- BOTTOM SHEET PARA PAGAMENTO -->
    <v-bottom-sheet
      :persistent="loadingPix"
      v-model="bottomSheet"
    >
      <div v-if="!loadingPix" class="d-flex justify-end px-4 mb-3">
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
        <v-card-text class="py-5">
          <div class="d-flex justify-space-between align-center mb-5">
            <div>
              <p class="font-weight-bold">
                {{ t("$vuetify.message.choose_your_payment_method") }}
              </p>

              <p class="text-caption text-grey-lighten-1">
                {{ t("$vuetify.message.payment_is_100_secure_and_encrypted") }}
              </p>
            </div>
          </div>

          <div class="pa-1 rounded-lg d-flex justify-center ga-2 bg-tertiary mb-5">
            <v-btn
              v-if="offersStore.payment_methods.includes('credit_card')"
              class="text-none rounded-lg text-caption"
              elevation="0"
              :color="tab === 0 ? 'primary' : 'tertiary'"
              :style="{ width: offersStore.payment_methods.length === 2 ? '48%' : '100%' }"
              @click="tab = 0"
            >
              <v-icon class="mr-2">mdi-credit-card</v-icon>
              {{ t("$vuetify.label.card") }}
            </v-btn>

            <v-btn
              v-if="offersStore.payment_methods.includes('pix')"
              class="text-none rounded-lg text-caption"
              elevation="0"
              :color="tab === 1 ? 'primary' : 'tertiary'"
              :style="{ width: offersStore.payment_methods.length === 2 ? '48%' : '100%' }"
              @click="tab = 1"
            >
              <v-icon class="mr-2">mdi-rhombus-split</v-icon>
              {{ t("$vuetify.label.pix") }}
            </v-btn>
          </div>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item>
              <v-form ref="formCreditCard" @submit.prevent="submit">
                <p class="font-weight-bold mb-3 text-h6">
                  {{ t("$vuetify.label.personal_data") }}
                </p>

                <TextField
                  required
                  persistent-hint
                  type="tel"
                  class="mb-5"
                  :mask="['###.###.###-##', '##.###.###/####-##']"
                  :label="t('$vuetify.label.document')"
                  :hint="t('$vuetify.label.cpf_or_cnpj')"
                  :rules="[rules.document]"
                  v-model="body.document"
                />

                <template v-if="setPhone">
                  <TextField
                    required
                    type="tel"
                    class="mb-1"
                    mask="(##) 9####-####"
                    :label="t('$vuetify.label.mobile_phone_number')"
                    :rules="[rules.phone]"
                    v-model="body.phone"
                  />

                  <v-checkbox
                    class="mb-2"
                    hide-details="auto"
                    color="primary"
                    :label="t('$vuetify.label.save_number_to_account')"
                    v-model="savePhone"
                  />
                </template>

                <p class="font-weight-bold mb-3 text-h6">
                  {{ t("$vuetify.label.payment_details") }}
                </p>

                <TextField
                  required
                  type="tel"
                  class="mb-5"
                  :mask="service.getCreditCardMask(body.credit_card.card_number)"
                  :label="t('$vuetify.label.credit_card')"
                  :rules="[
                    (value: string) => service.isCreditCardValid(value) || t('$vuetify.errors.invalid_credit_card'),
                    (value: string) => !!service.getBand(value) || t('$vuetify.errors.card_brand_not_accepted')
                  ]"
                  v-model="body.credit_card.card_number"
                >
                  <template v-slot:append>
                    <div
                      v-if="service.getBand(body.credit_card.card_number)"
                      :style="{ height: '26px' }"
                    >
                      <img
                        :src="service.getBand(body.credit_card.card_number)"
                        :style="{ height: '26px', width: '31.6447px', borderRadius: '4px' }"
                      />
                    </div>
                  </template>
                </TextField>

                <v-row class="mb-5">
                  <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                    <TextField
                      required
                      id="validityField"
                      type="tel"
                      mask="##/##"
                      :placeholder="t('$vuetify.label.validity_format')"
                      :label="t('$vuetify.label.validity')"
                      :rules="[(value: string) => service.isExpirationDateValid(value) || t('$vuetify.errors.invalid_validity')]"
                      v-model="body.credit_card.validity"
                    />
                  </v-col>
                  <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                    <TextField
                      required
                      id="cvvField"
                      type="tel"
                      mask="####"
                      :label="t('$vuetify.label.cvv')"
                      :rules="[(value: string) => value.length >= 3 || t('$vuetify.errors.invalid_cvv')]"
                      v-model="body.credit_card.cvv"
                    >
                      <template v-slot:append>
                        <div :style="{ height: '26px' }">
                          <img
                            src="@/assets/images/cvv.png"
                            :style="{ width: '26px', borderRadius: '4px' }"
                          />
                        </div>
                      </template>
                    </TextField>
                  </v-col>
                </v-row>

                <TextField
                  required
                  class="mb-5"
                  id="cardholderField"
                  :label="t('$vuetify.label.name_on_the_card')"
                  v-model="body.credit_card.card_holder_name"
                  @update="body.credit_card.card_holder_name = body.credit_card.card_holder_name.toUpperCase()"
                />

                <v-btn
                  block
                  type="submit"
                  color="primary"
                  class="text-none pa-6 font-weight-bold"
                >{{ t("$vuetify.label.confirm_subscription_credit_card", currency(offersStore.amount)) }}</v-btn>
              </v-form>
            </v-tabs-window-item>

            <v-tabs-window-item>
              <div
                v-if="loadingPix"
                :style="{ height: '7rem' }"
                class="d-flex justify-center align-center"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="50"
                />
              </div>

              <v-form
                v-else-if="!pixCode"
                ref="formPix"
                @submit.prevent="submitGeneratePix"
              >
                <TextField
                  v-if="showCpfField"
                  required
                  type="tel"
                  class="mb-5"
                  mask="###.###.###-##"
                  :label="t('$vuetify.label.your_cpf')"
                  :rules="[rules.document]"
                  v-model="body.cpf"
                />

                <template v-if="setPhone">
                  <TextField
                    required
                    type="tel"
                    class="mb-1"
                    mask="(##) 9####-####"
                    :label="t('$vuetify.label.mobile_phone_number')"
                    :rules="[rules.phone]"
                    v-model="body.phone"
                  />

                  <v-checkbox
                    class="mb-2"
                    hide-details="auto"
                    color="primary"
                    :label="t('$vuetify.label.save_number_to_account')"
                    v-model="savePhone"
                  />
                </template>

                <v-btn
                  block
                  type="submit"
                  color="primary"
                  class="text-none pa-6 font-weight-bold"
                >{{ t("$vuetify.label.generate_pix") }}</v-btn>
              </v-form>
              <template v-else>
                <div class="pa-6 rounded-lg d-flex flex-column align-center bg-tertiary mb-5">
                  <div
                    :style="{ width: '11rem', height: '11rem' }"
                    class="bg-white rounded-lg d-flex justify-center align-center mb-5"
                  >
                    <img
                      :style="{ width: '100%' }"
                      :src="pixCodeImage"
                      class="rounded-lg"
                    />
                  </div>

                  <p class="text-center text-caption text-grey-lighten-1 mb-3">
                    {{ t("$vuetify.label.scan_the_qr_code_with_your_banks_app") }}
                  </p>

                  <p class="text-center text-caption text-grey-lighten-1">
                    {{ t("$vuetify.label.time_remaining") }}
                  </p>

                  <p class="text-center font-space-grotesk font-weight-bold">
                    {{ pixTime }}
                  </p>
                </div>

                <TextField
                  readonly
                  :label="t('$vuetify.label.copy_and_paste_code')"
                  :append-icon="'mdi-content-copy'"
                  v-model="pixCode"
                  @click:append="copy(pixCode)"
                />
              </template>
            </v-tabs-window-item>

            <v-tabs-window-item></v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useLocale } from "vuetify";
import { useRoute } from "vue-router";
import { useCopy, useCurrency } from "@/composables";
import { CreditCardPaymentService } from "@/services/credit-card-payment.service";
import { useForm } from "@/composables";
import { createConfetti } from "@/utils";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { useOffersStore } from "@/stores/offers";
import { useSubscriptionsStore } from "@/stores/subscriptions";
import { SystemBars, SystemBarType } from "@/mobile";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { attestationService } from "@/services/attestation.service";
import { type Subscription } from "@/types/subscription.type";

dayjs.extend(duration);

/// DATA
const { t } = useLocale();
const { currency } = useCurrency();
const { copy } = useCopy();
const { rules, validate } = useForm();
const route = useRoute();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);
const bottomSheet = ref(false);
const tabMaster = ref(0);
const tab = ref(0);
const accountsStore = useAccountsStore();
const offersStore = useOffersStore();
const subscriptionsStore = useSubscriptionsStore();
const persistentSession = usePersistentSession();

const service = ref(new CreditCardPaymentService());

const setPhone = ref(true);
const savePhone = ref(true);

const formCreditCard = ref();
const formPix = ref();
const showCpfField = ref(true);

const body = reactive({
  phone: "",
  document: "",
  cpf: "",
  credit_card: {
    card_number: "",
    validity: "",
    cvv: "",
    card_holder_name: "",
  }
});

const loadingPix = ref(false);
const pixCode = ref("");
const pixCodeImage = ref("");
const pixTime = ref("00:00");
const pixCreatedAt = ref("");
const pixExpiresAt = ref("");
const pixInterval = ref<null | number>(null);
const pixPolling = ref<null | number>(null);

const subscriptionId = ref("");

/// COMPUTED
const account = computed(() => accountsStore.account);
const list = computed(() => [
  { text: t("$vuetify.label.personalized_training"), free: false, premium: true },
  { text: t("$vuetify.label.meal_plan_with_ai"), free: false, premium: true },
  { text: t("$vuetify.label.activity_log"), free: true, premium: true },
  { text: t("$vuetify.label.community"), free: true, premium: true },
  { text: t("$vuetify.label.ai_coach"), free: false, premium: true },
  { text: t("$vuetify.label.advanced_analytics"), free: false, premium: true },
  { text: t("$vuetify.label.meal_analysis"), free: false, premium: true },
]);
const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

/// WATCH
watch(modelProxy, async (val) => {
  const isLogged = await persistentSession.isLogged();

  if (val) {
    tab.value = 0;
    tabMaster.value = 0;

    setPhone.value = true;
    savePhone.value = false;
    body.phone = "";

    body.credit_card = {
      card_number: "",
      validity: "",
      cvv: "",
      card_holder_name: "",
    };

    showCpfField.value = true;
    body.cpf = "";

    loadingPix.value = false;
    pixCode.value = "";
    pixCodeImage.value = "";
    pixTime.value = "00:00";

    subscriptionId.value = "";

    if (account.value?.phone?.number) {
      setPhone.value = false;
      body.phone = `(${account.value.phone.ddd}) ${account.value.phone.number}`;
      savePhone.value = false;
    } else {
      savePhone.value = true;
    }

    if (account.value?.cpf) {
      showCpfField.value = false;
      body.cpf = account.value.cpf;
    }

    SystemBars.show({
      bar: SystemBarType.StatusBar,
      animation: "NONE"
    });
  } else if (isLogged) {
    accountsStore.GET_ACCOUNT();

    if (pixInterval.value !== null) {
      clearInterval(pixInterval.value);
      pixInterval.value = null;
    }

    if (pixPolling.value !== null) {
      clearInterval(pixPolling.value);
      pixInterval.value = null;
    }

    if (route.name === "dashboard" && route.query.mode === "dashboard" && route.query.tab === "home") {
      SystemBars.hide({
        bar: SystemBarType.StatusBar,
        animation: "NONE"
      });
    }
  }
}, { immediate: true });

watch(bottomSheet, (val) => {
  if (val && offersStore.payment_methods.includes("pix") && offersStore.payment_methods.length === 1) {
    nextTick(() => tab.value = 1);
  }
});

watch(tab, (val) => {
  if (val === 1 && body.cpf && body.phone && !pixCode.value) {
    generatePix();
  }
});

watch(() => body.credit_card.card_number, (val) => {
  if (val.length === service.value.getCreditCardMask(body.credit_card.card_number).length) {
    (window.document.querySelector("#validityField") as HTMLElement)!.focus();
  }
});

watch(() => body.credit_card.validity, (val) => {
  if (val.length === 5) {
    (window.document.querySelector("#cvvField") as HTMLElement)!.focus();
  }
});

watch(() => body.credit_card.cvv, (val) => {
  const type = service.value.getType(body.credit_card.card_number);
  const length = type === "american-express" ? 4 : 3;

  if (val.length === length) {
    (window.document.querySelector("#cardholderField") as HTMLElement)!.focus();
  }
});

watch(tabMaster, (val) => {
  if (val === 1) {
    createConfetti();
  }
});

/// METHODS
const submit = async () => {
  const isValid = await validate(formCreditCard);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      // Obter token do cartão
      const identificationNumber = body.document.replace(/[-./]/g, "");
      const identificationType = identificationNumber.length === 11 ? "CPF" : "CNPJ";

      const bodyForm = {
        cardNumber: body.credit_card.card_number.replace(/\s/g, ""),
        cardholderName: body.credit_card.card_holder_name.toUpperCase(),
        cardExpirationMonth: body.credit_card.validity.split("/")[0]!,
        cardExpirationYear: `20${body.credit_card.validity.split("/")[1]}`,
        securityCode: body.credit_card.cvv,
        identificationNumber,
        identificationType
      } as const;

      const token = await service.value.getTokenCard(bodyForm);

      const [ddd, number] = body.phone.replace(/[()-]/g, "").split(" ");

      const attestationHeaders = await attestationService.getAssertionHeaders();

      const response = await subscriptionsStore.POST("", {
        offer_id: offersStore._id,
        phone: { ddi: "55", ddd, number },
        type: "credit_card",
        save_phone: savePhone.value,
        document: body.document.replace(/[-/.]/g, ""),
        credit_card: {
          card_number: body.credit_card.card_number.replace(/\s/g, ""),
          card_holder_name: body.credit_card.card_holder_name.toUpperCase().trim(),
          validity: {
            month: Number(body.credit_card.validity.split("/")[0]!),
            year: Number(`20${body.credit_card.validity.split("/")[1]}`)
          },
          cvv: body.credit_card.cvv,
          band: service.value.getType(body.credit_card.card_number),
          token
        }
      }, attestationHeaders);

      if (!response.error) {
        bottomSheet.value = false;
        tabMaster.value = 1;
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const submitGeneratePix = async () => {
  const isValid = await validate(formPix);
  if (isValid) generatePix();
};

const generatePix = async () => {
  try {
    const [ddd, number] = body.phone.replace(/[()-]/g, "").split(" ");

    loadingPix.value = true;

    const attestationHeaders = await attestationService.getAssertionHeaders();

    const response = await subscriptionsStore.POST("", {
      offer_id: offersStore._id,
      phone: { ddi: "55", ddd, number },
      type: "pix",
      save_phone: savePhone.value,
      cpf: body.cpf.replace(/[-/.]/g, "")
    }, attestationHeaders);

    if (!response.error) {
      subscriptionId.value = response._id;
      pixCode.value = response.qr_code_value;
      pixCodeImage.value = response.qr_code_image;
      pixCreatedAt.value = response.created_at;
      pixExpiresAt.value = response.expires_at;
      createPollingPix();
      createIntervalPix();
    }
  } catch {
    ///
  } finally {
    loadingPix.value = false;
  }
};

const createPollingPix = () => {
  pixPolling.value = setInterval(async () => {
    const response = await subscriptionsStore.GET(subscriptionId.value);

    if (!response.error) {
      const subscription = response.subscription as Subscription;

      if (subscription.status === "PAID") {
        if (pixInterval.value !== null) {
          clearInterval(pixInterval.value);
          pixInterval.value = null;
        }

        if (pixPolling.value !== null) {
          clearInterval(pixPolling.value);
          pixPolling.value = null;
        }

        bottomSheet.value = false;
        tabMaster.value = 1;
      }
    }
  }, 5000);
};

const createIntervalPix = () => {
  pixInterval.value = setInterval(() => {
    const diff = Math.max(0, dayjs(pixExpiresAt.value).diff(dayjs()));
    const duration = dayjs.duration(diff);

    const minutes = String(Math.floor(duration.minutes())).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");
    pixTime.value = `${minutes}:${seconds}`;

    if (diff <= 0) {
      clearInterval(pixInterval.value!);
      pixInterval.value = null;

      if (pixPolling.value !== null) {
        clearInterval(pixPolling.value);
        pixPolling.value = null;
      }

      generatePix();
    }
  }, 1000);
};
</script>