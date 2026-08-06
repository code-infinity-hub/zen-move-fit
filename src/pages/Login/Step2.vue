<template>
  <div id="step-2">
    <div class="d-flex align-center py-2">
      <v-icon
        v-if="![2, 3].includes(tab)"
        class="mr-4"
        @click="tab === 0 ? emit('set-tab', 0) : tab--"
      >mdi-arrow-left</v-icon>

      <img src="@/assets/images/logo.png" />

      <p class="font-weight-bold ml-2 font-space-grotesk">
        {{ t("$vuetify.company_name") }}
      </p>
    </div>

    <v-tabs-window v-model="tab" class="overflow-y-auto">
      <!-- LOGIN -->
      <v-tabs-window-item>
        <v-form
          ref="formLogin"
          class="pt-4"
          @submit.prevent="submitLogin"
        >
          <TextField
            type="email"
            class="mb-5"
            :placeholder="t('$vuetify.label.placeholder_email')"
            :label="t('$vuetify.label.email')"
            :disabled="emailPurchased"
            :rules="[rules.required, rules.email]"
            v-model="login.email"
          />

          <TextField
            type="password"
            :placeholder="t('$vuetify.label.placeholder_password')"
            :label="t('$vuetify.label.password')"
            :rules="[rules.required, rules.min_length_pasword]"
            v-model="login.password"
          />

          <p
            class="text-center text-primary text-subtitle-2 mt-6"
            @click="tab = 1"
          >{{ t("$vuetify.label.i_forgot_my_password") }}</p>

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >
            <v-icon class="mr-2">mdi-arrow-right</v-icon>
            {{ t("$vuetify.label.log_in_to_account") }}
          </v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- ENVIAR NOVA SENHA -->
      <v-tabs-window-item>
        <v-form
          ref="formNewPassword"
          class="pt-4"
          @submit.prevent="submitNewPassword"
        >
          <p class="mb-5 text-body-1 text-grey-lighten-1">
            {{ t("$vuetify.message.recovery_password") }}
          </p>

          <TextField
            type="email"
            class="mb-5"
            :placeholder="t('$vuetify.label.placeholder_email')"
            :label="t('$vuetify.label.email')"
            :disabled="emailPurchased"
            :rules="[rules.required, rules.email]"
            v-model="login.email"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.send_temporary_password") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- ALTERAR SENHA -->
      <v-tabs-window-item>
        <v-form
          ref="formChangePassword"
          class="pt-4"
          @submit.prevent="submitChangePassword"
        >
          <p class="mb-5 text-body-1 text-grey-lighten-1">
            {{ t("$vuetify.message.required_change_password") }}
          </p>

          <TextField
            persistent-hint
            type="password"
            class="mb-5"
            :placeholder="t('$vuetify.label.placeholder_password')"
            :label="t('$vuetify.label.old_password')"
            :rules="[rules.required, rules.min_length_pasword]"
            :hint="t('$vuetify.message.its_the_password_you_received_in_the_email')"
            v-model="reset_password.old_password"
          />

          <TextField
            type="password"
            :placeholder="t('$vuetify.label.placeholder_password')"
            :label="t('$vuetify.label.new_password')"
            :rules="[rules.required, rules.min_length_pasword]"
            v-model="reset_password.new_password"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.save_and_sign_in_to_account") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <!-- CÓDIGO DE CONVITE -->
      <v-tabs-window-item>
        <v-form
          ref="formInviteCode"
          class="pt-4"
          @submit.prevent="submitInviteCode"
        >
          <p class="mb-5 text-body-1 text-grey-lighten-1">
            {{ t("$vuetify.message.required_invite_code") }}
          </p>

          <TextField
            type="tel"
            mask="######"
            :placeholder="t('$vuetify.label.invite_code')"
            :label="t('$vuetify.label.invite_code')"
            :rules="[rules.required, (v: string) => v.length === 6 || t('$vuetify.errors.invalid_invite_code')]"
            v-model="inviteCode"
          />

          <v-btn
            block
            class="text-none mt-6 pa-7 font-weight-bold"
            type="submit"
            color="primary"
          >{{ t("$vuetify.label.confirm_invite_code") }}</v-btn>
        </v-form>
      </v-tabs-window-item>

      <v-tabs-window-item></v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { useForm } from "@/composables";
import { attestationService } from "@/services/attestation.service";

/// DATA
const { t } = useLocale();
const { rules, validate } = useForm();
const emit = defineEmits(["set-tab"]);
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const persistentSession = usePersistentSession();
const tab = ref(0);
const _id = ref("");

const emailPurchased = ref(false);

const login = reactive({
  email: "",
  password: "",
});

const reset_password = reactive({
  old_password: "",
  new_password: "",
});

const inviteCode = ref("");

const formLogin = ref();
const formNewPassword = ref();
const formChangePassword = ref();
const formInviteCode = ref();

/// WATCH
watch(tab, (val) => {
  router.replace({
    replace: true,
    query: { ...route.query, step: val + 1 }
  });
});

watch(() => route.query.step, (val) => {
  tab.value = Number(val) - 1;
});

/// LIFE CYCLES
onMounted(() => {
  router.replace({
    replace: true,
    query: { ...route.query, step: tab.value + 1 }
  });
});

/// METHODS
const submitLogin = async () => {
  const isValid = await validate(formLogin);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const attestationHeaders = await attestationService.getAssertionHeaders();

      const response = await accountsStore.POST("authenticate", {
        email: login.email.toLowerCase().trim(),
        password: login.password
      }, attestationHeaders);

      if (!response.error) {
        _id.value = response._id;

        if (response.action === "NEW_PASSWORD") {
          tab.value = 2;
        } else if (response.action === "INVITE_CODE_REQUIRED") {
          tab.value = 3;
        } else {
          await setToken(response.token, response.refresh_token);
        }
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const submitNewPassword = async () => {
  const isValid = await validate(formNewPassword);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const attestationHeaders = await attestationService.getAssertionHeaders();

      const response = await accountsStore.POST("password", {
        email: login.email.toLowerCase().trim()
      }, attestationHeaders);

      if (!response.error) tab.value = 0;
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const submitChangePassword = async () => {
  const isValid = await validate(formChangePassword);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const attestationHeaders = await attestationService.getAssertionHeaders();

      const response = await accountsStore.PATCH(`${_id.value}/password`, {
        ...reset_password,
        from_login: true
      }, attestationHeaders);

      if (!response.error) {
        if (response.action === "INVITE_CODE_REQUIRED") {
          tab.value = 3;
        } else {
          await setToken(response.token, response.refresh_token);
        }
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const submitInviteCode = async () => {
  const isValid = await validate(formInviteCode);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const response = await accountsStore.PATCH(`${_id.value}/invite-code`, {
        code: inviteCode.value
      });

      if (!response.error) await setToken(response.token, response.refresh_token);
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const setToken = async (token: string, refreshToken?: string) => {
  await persistentSession.set("_id", _id.value);
  await persistentSession.set("token", token);

  if (refreshToken) {
    await persistentSession.set("refresh-token", refreshToken);
  }

  eventBus.emit("UPDATE_APP_ICONS");
  router.push({ name: "dashboard" });
};
</script>

<style lang="sass" scoped>
div#step-2
  width: 100%
  height: 100%
  padding: calc(var(--top-saved) + 0.5rem) 1rem calc(var(--bottom-saved) + 0.5rem) 1rem

  img
    width: 1.8rem
</style>