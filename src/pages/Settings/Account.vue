<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
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
        {{ t("$vuetify.label.account_settings") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 px-3 py-5">
      <v-form ref="form" @submit.prevent="submit(false)">
        <div class="d-flex justify-center align-center mb-3">
          <ProfileImage
            size="7rem"
            :image="image"
            :name="account.name"
            class="position-relative"
            @click="seePicture"
          >
            <v-btn
              icon=""
              color="tertiary"
              class="position-absolute right-0 bottom-0"
              size="x-small"
              @click="selectFile"
            >
              <v-icon :size="15">
                mdi-pencil
              </v-icon>
            </v-btn>
          </ProfileImage>
        </div>

        <TextField
          disabled
          class="mb-5"
          :label="t('$vuetify.label.name')"
          v-model="name"
        />

        <TextField
          disabled
          class="mb-5"
          :label="t('$vuetify.label.created_in')"
          v-model="createdIn"
        />

        <TextField
          disabled
          class="mb-5"
          :label="t('$vuetify.label.email')"
          v-model="email"
        />

        <TextField
          disabled
          class="mb-5"
          :label="t('$vuetify.label.date_of_birth')"
          v-model="dateOfBirth"
        />

        <TextField
          required
          persistent-hint
          class="mb-5"
          type="tel"
          mask="###.###.###-##"
          :disabled="disabledCpf"
          :label="t('$vuetify.label.your_cpf')"
          :hint="t('$vuetify.message.used_for_registering_bank_accounts_and_receiving_referral_payments')"
          :rules="[rules.document]"
          v-model="bodyForm.cpf"
        />

        <TextField
          required
          class="mb-5"
          :label="t('$vuetify.label.username')"
          v-model="bodyForm.username"
        />

        <TextField
          required
          is-money
          hide-symbol
          class="mb-5"
          :label="t('$vuetify.label.weight_kg')"
          :rules="[() => bodyForm.weight > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
          v-model="bodyForm.weight"
        />

        <TextField
          required
          is-money
          hide-symbol
          class="mb-5"
          :label="t('$vuetify.label.height_m')"
          :rules="[() => bodyForm.height > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
          v-model="bodyForm.height"
        />

        <TextField
          required
          type="tel"
          class="mb-1"
          mask="(##) 9####-####"
          :label="t('$vuetify.label.mobile_phone_number')"
          :rules="[rules.phone]"
          v-model="bodyForm.phone"
        />

        <input type="submit" v-show="false" />
      </v-form>
    </div>

    <footer
      class="pa-3"
      :style="{ paddingBottom: 'calc(6px + var(--bottom-saved)) !important', borderTop: '1px solid var(--tertiary)' }"
    >
      <v-btn
        block
        color="primary"
        class="text-black font-weight-bold text-none pa-7 text-h6 d-flex"
        @click="submit(false)"
      >{{ t("$vuetify.label.save") }}</v-btn>
    </footer>

    <BottomSheetSaveChanges
      v-model="bottomSheetChanges"
      @save-and-exit="submit(true)"
      @save-without-exit="emit('back')"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { MediaService } from "@/services/media.service";
import { eventBus } from "@/eventBus";
import { isDeepEqual } from "@/utils";
import { useForm } from "@/composables";

/// COMPONENTS
import BottomSheetSaveChanges from "@/components/BottomSheetSaveChanges.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { rules, validate } = useForm();
const emit = defineEmits(["back"]);
const accountsStore = useAccountsStore();

const bottomSheetChanges = ref(false);

const form = ref();
const bodyForm = reactive({
  cpf: "",
  username: "",
  weight: 0,
  height: 0,
  phone: "",
  photo: { base64: "", format: "", mimetype: "" }
});

const disabledCpf = ref(false);

const mediaService = new MediaService();

/// COMPUTED
const account = computed(() => accountsStore.account);
const name = computed(() => account.value.name);
const email = computed(() => account.value.email);
const hasImage = computed(() => Boolean(image.value));
const createdIn = computed(() => dayjs(account.value.created_at).format(t("$vuetify.label.full_date_format")));
const dateOfBirth = computed(() => dayjs(account.value.date_of_birth).format(t("$vuetify.label.date_format")));
const image = computed(() => bodyForm.photo.base64 || account.value.image || "");

const body = computed(() => {
  const [ddd, number] = bodyForm.phone.replace(/[()-]/g, "").split(" ");

  return {
    username: bodyForm.username,
    weight: bodyForm.weight,
    height: bodyForm.height,
    cpf: bodyForm.cpf.replace(/[-/.]/g, ""),
    phone: { ddi: "55", ddd, number }
  };
});

const isEdited = computed(() => {
  const original = {
    username: account.value.username,
    weight: account.value.weight,
    height: account.value.height,
    phone: account.value.phone,
    cpf: account.value.cpf
  };

  return !isDeepEqual(original, body.value) || Boolean(bodyForm.photo.base64);
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", back);

  bodyForm.username = account.value.username;
  bodyForm.cpf = account.value.cpf;
  bodyForm.weight = account.value.weight;
  bodyForm.height = account.value.height;

  if (bodyForm.cpf) disabledCpf.value = true;
  if (account.value?.phone?.number) bodyForm.phone = `(${account.value.phone.ddd}) ${account.value.phone.number}`;
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
const seePicture = (event: Event) => {
  const tag = (event.target as HTMLElement).tagName.toLowerCase();

  const accessible = !["i", "button"].includes(tag);

  if (hasImage.value && accessible) {
    eventBus.emit("SHOW_IMAGE", { images: [image.value] });
  }
};

const selectFile = async () => {
  try {
    const results = await mediaService.getFiles("Photo", 1);
    const file = results[0];

    bodyForm.photo = {
      base64: file!.base64,
      format: file!.format,
      mimetype: file!.mimetype,
    };
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  }
};

const back = () => {
  if (isEdited.value) {
    bottomSheetChanges.value = true;
    return;
  }

  emit("back");
};

const submit = async (exit = false) => {
  const isValid = await validate(form);

  if (!isValid) return;

  if (!isEdited.value) {
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.there_are_no_changes_made")
    });
    return;
  }

  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await accountsStore.UPDATE_ACCOUNT(
      {
        ...body.value,
        profile: bodyForm.photo.base64 ? bodyForm.photo : undefined
      },
      false
    );

    if (!response.error) {
      bodyForm.photo = {
        base64: "",
        format: "",
        mimetype: ""
      };

      if (exit) emit("back");
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>