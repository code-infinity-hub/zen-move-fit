<template>
  <v-bottom-sheet persistent v-model="bottomSheet">
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
      <div
        v-if="loading"
        class="d-flex justify-center align-center py-5"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="50"
        />
      </div>
      <v-card-text
        v-else
        class="px-4 py-3 d-flex flex-column overflow-y-hidden"
      >
        <p class="text-h6 font-weight-bold text-center font-space-grotesk mb-2">
          {{ t("$vuetify.label.bank_account_setup") }}
        </p>

        <p class="text-body-2 text-center text-grey-lighten-1 mb-2">
          {{ t("$vuetify.message.register_your_bank_account_details_where_you_will_receive_the_payments_for_your_referrals") }}
        </p>

        <v-form
          ref="form"
          class="pt-4 overflow-x-hidden overflow-y-auto"
          @submit.prevent="submit"
        >
          <div>
            <p class="font-weight-bold mb-5">
              {{ `1. ${t("$vuetify.label.personal_data")}` }}
            </p>

            <TextField
              required
              :disabled="disabled"
              :label="t('$vuetify.label.full_name')"
              class="mb-5"
              v-model="body.personal_data.full_name"
            />

            <TextField
              v-if="showFieldPhone"
              required
              type="tel"
              class="mb-5"
              :disabled="disabled"
              :mask="'(##) 9####-####'"
              :label="t('$vuetify.label.mobile_phone_number')"
              :rules="[rules.phone]"
              v-model="body.personal_data.phone_number"
            />

            <TextField
              required
              is-money
              class="mb-5"
              :disabled="disabled"
              :label="t('$vuetify.label.monthly_income')"
              :rules="[() => body.personal_data.monthly_income > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
              v-model="body.personal_data.monthly_income"
            />

            <TextField
              required
              class="mb-5"
              :disabled="disabled"
              :label="t('$vuetify.label.occupational_occupation')"
              v-model="body.personal_data.professional_occupation"
            />

            <TextField
              v-if="showFieldDocument"
              required
              class="mb-5"
              type="tel"
              :disabled="disabled"
              :label="t('$vuetify.label.your_cpf')"
              :mask="'###.###.###-##'"
              :rules="[rules.document]"
              v-model="body.personal_data.document"
            />
          </div>

          <v-divider class="my-6"></v-divider>

          <div>
            <p class="font-weight-bold mb-5">
              {{ `2. ${t("$vuetify.label.address")}` }}
            </p>

            <TextField
              required
              id="field-zipcode"
              class="mb-5"
              type="tel"
              :disabled="disabled"
              :label="t('$vuetify.label.zip_code')"
              :mask="'#####-###'"
              :rules="[
                rules.zipcode,
                () => isValidZipcode || t('$vuetify.errors.invalid_postal_code'),
              ]"
              v-model="body.address.zipcode"
            />

            <template v-if="isValidZipcode">
              <TextField
                required
                disabled
                class="mb-5"
                :label="t('$vuetify.label.street')"
                v-model="body.address.street"
              />

              <TextField
                required
                :disabled="disabled"
                :label="t('$vuetify.label.number')"
                class="mb-5"
                v-model="body.address.number"
              />

              <TextField
                :disabled="disabled"
                :label="t('$vuetify.label.complement')"
                class="mb-5"
                v-model="body.address.complement"
              />

              <TextField
                :disabled="disabled"
                :label="t('$vuetify.label.reference_point')"
                class="mb-5"
                v-model="body.address.reference_point"
              />

              <TextField
                required
                disabled
                :label="t('$vuetify.label.neighborhood')"
                class="mb-5"
                v-model="body.address.neighborhood"
              />

              <TextField
                required
                disabled
                :label="t('$vuetify.label.city')"
                class="mb-5"
                v-model="body.address.city"
              />

              <ItemSelect
                required
                disabled
                class="mb-5"
                :label="t('$vuetify.label.states')"
                :items="states"
                v-model="body.address.state"
              />
            </template>
          </div>

          <v-divider class="my-6"></v-divider>

          <div>
            <p class="font-weight-bold mb-5">
              {{ `3. ${t("$vuetify.label.bank_account")}` }}
            </p>

            <ItemSelect
              required
              class="mb-5"
              :label="t('$vuetify.label.type')"
              :items="[
                { title: t('$vuetify.label.checking_account'), value: 'checking' },
                { title: t('$vuetify.label.saving_account'), value: 'savings' },
              ]"
              v-model="body.account.type"
            />

            <Autocomplete
              required
              class="mb-5"
              :label="t('$vuetify.label.bank')"
              :items="banks"
              v-model="body.account.bank"
            />

            <TextField
              required
              :label="t('$vuetify.label.account_holder')"
              class="mb-5"
              v-model="body.account.holder_name"
            />

            <v-row class="mb-5">
              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  required
                  type="tel"
                  :label="t('$vuetify.label.agency_number')"
                  v-model="body.account.branch_number"
                />
              </v-col>

              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  type="tel"
                  :label="t('$vuetify.label.agency_digit')"
                  :placeholder="t('$vuetify.label.if_there_is')"
                  v-model="body.account.branch_check_digit"
                />
              </v-col>
            </v-row>

            <v-row class="mb-5">
              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  required
                  mask="#############"
                  type="tel"
                  :label="t('$vuetify.label.account_number')"
                  v-model="body.account.account_number"
                />
              </v-col>

              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  required
                  type="tel"
                  :label="t('$vuetify.label.account_digit')"
                  v-model="body.account.account_check_digit"
                />
              </v-col>
            </v-row>
          </div>

          <input
            type="submit"
            v-show="false"
          />
        </v-form>

        <div class="py-2">
          <v-btn
            block
            class="text-none pa-7 font-weight-bold"
            color="primary"
            @click="submit"
          >{{ t("$vuetify.label.save") }}</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts" setup>
import bancosBrasileiros from "bancos-brasileiros";
import { State } from "country-state-city";
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { useAppStore } from "@/stores/app";
import { useAccountsStore } from "@/stores/accounts";
import { useForm } from "@/composables";
import { type AccountRecipient } from "@/types/account.type";

/// DATA
const { t } = useLocale();
const { rules, validate } = useForm();
const appStore = useAppStore();
const accountsStore = useAccountsStore();
const bottomSheet = ref(true);
const emit = defineEmits(["close"]);

const loading = ref(false);
const disabled = ref(false);
const form = ref();

const showFieldPhone = ref(true);
const showFieldDocument = ref(true);
const isValidZipcode = ref(false);

const body = reactive({
  personal_data: {
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    monthly_income: 0,
    professional_occupation: "",
    document: ""
  },
  address: {
    zipcode: "",
    street: "",
    number: "",
    complement: "",
    reference_point: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  account: {
    type: "",
    bank: "",
    holder_name: "",
    branch_number: "",
    branch_check_digit: "",
    account_number: "",
    account_check_digit: "",
  }
});

/// COMPUTED
const account = computed(() => accountsStore.account);

const states = computed(() => {
  return State.getStatesOfCountry("BR").map((state) => ({
    title: state.name,
    value: state.isoCode
  }));
});

const banks = computed(() => {
  return bancosBrasileiros.map((banco) => ({
    title: `${banco.LongName} - ${banco.COMPE}`,
    value: banco.COMPE
  }));
});

/// WATCH
watch(bottomSheet, (val) => {
  if (!val) emit("close");
});

watch(() => body.address.zipcode, async (val) => {
  if (val.length === 9 && !disabled.value) {
    const element = document.querySelector("#field-zipcode") as HTMLElement;
    element?.blur();

    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await appStore.GET_ADDRESS_BY_ZIPCODE(val);
    eventBus.emit("SET_LOADER", { enabled: false });

    if (response.error) {
      isValidZipcode.value = false;

      body.address.street = "";
      body.address.number = "";
      body.address.neighborhood = "";
      body.address.city = "";
      body.address.state = "";

      eventBus.emit("SNACKBAR", { message: t("$vuetify.message.address_not_found") });
    } else {
      isValidZipcode.value = true;

      body.address.street = response.street;
      body.address.neighborhood = response.neighborhood;
      body.address.city = response.city;
      body.address.state = response.state;

      eventBus.emit("SNACKBAR", { message: t("$vuetify.message.address_found") });
    }
  }
});

watch(() => body.account.holder_name, (val) => {
  const maxSize = 30;

  if (val.length > maxSize) {
    nextTick(() => body.account.holder_name = val.substring(0, maxSize));
  }
});

/// LIFE CYCLES
onMounted(async () => {
  body.personal_data.date_of_birth = account.value.date_of_birth;

  if (account.value.phone.number) {
    body.personal_data.phone_number = `(${account.value.phone.ddd}) ${account.value.phone.number}`;
    showFieldPhone.value = false;
  }

  if (account.value.cpf) {
    body.personal_data.document = account.value.cpf;
    showFieldDocument.value = false;
  }

  if (account.value.recipient.identification) {
    try {
      loading.value = true;
      const response = await accountsStore.GET(`recipients/${account.value.recipient.identification}`);

      if (!response.error) {
        const recipient = response.recipient as AccountRecipient;
        const { address, default_bank_account } = recipient;
        disabled.value = true;
        showFieldPhone.value = true;
        showFieldDocument.value = true;
        isValidZipcode.value = true;

        body.personal_data.full_name = recipient.name;
        body.personal_data.phone_number = recipient.phone_number;
        body.personal_data.monthly_income = recipient.monthly_income;
        body.personal_data.professional_occupation = recipient.professional_occupation;
        body.personal_data.document = recipient.document;

        body.address = {
          zipcode: address.zipcode,
          street: address.street,
          number: address.number,
          complement: address.complement || "",
          reference_point: address.reference_point || "",
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        };

        body.account = { ...default_bank_account };
      }
    } catch {
      ///
    } finally {
      loading.value = false;
    }
  }
});

/// METHODS
const submit = async () => {
  const isValid = await validate(form);

  if (isValid) {
    try {
      const [ddd, number] = body.personal_data.phone_number.replace(/[()-]/g, "").split(" ");

      const bodyForm = {
        ...(
          !account.value.recipient.identification && {
            personal_data: {
              ...body.personal_data,
              full_name: body.personal_data.full_name.trim(),
              professional_occupation: body.personal_data.professional_occupation.trim(),
              phone_number: { ddi: "55", ddd, number },
            },
            address: {
              zipcode: body.address.zipcode.replace("-", "").trim(),
              street: body.address.street.trim(),
              number: body.address.number.trim(),
              complement: body.address.complement.trim(),
              reference_point: body.address.reference_point.trim(),
              neighborhood: body.address.neighborhood.trim(),
              city: body.address.city.trim(),
              state: body.address.state,
            }
          }
        ),
        account: {
          ...body.account,
          holder_name: body.account.holder_name.trim()
        }
      };

      eventBus.emit("SET_LOADER", { enabled: true });

      const response = !account.value.recipient.identification ?
        await accountsStore.POST("recipients", bodyForm) :
        await accountsStore.PATCH(`recipients/${account.value.recipient.identification}`, bodyForm);

      if (!response.error && !account.value.recipient.identification) {
        disabled.value = true;
        await accountsStore.GET_ACCOUNT();
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};
</script>