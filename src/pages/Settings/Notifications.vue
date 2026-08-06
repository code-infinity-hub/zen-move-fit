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
        {{ t("$vuetify.label.notification_settings") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 px-3 py-5">
      <v-form ref="form" @submit.prevent="submit(false)">
        <p
          class="font-weight-bold mb-3"
        >{{ t("$vuetify.label.training") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.workout.daily_reminder"
          color="primary"
          :label="t('$vuetify.label.daily_reminder')"
        />

        <!-- <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.workout.plan_ready"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_the_plan_is_ready')"
        /> -->

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.workout.missed_workout"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_i_miss_a_workout')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.habits") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.habits.reminders"
          color="primary"
          :label="t('$vuetify.label.reminder')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.habits.streak_alerts"
          color="primary"
          :label="t('$vuetify.label.sequence_alerts')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.social") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.likes"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_someone_likes')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.comments"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_someone_comments')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.messages"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_someone_sends_me_a_message')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.new_followers"
          color="primary"
          :label="t('$vuetify.label.notify_new_followers')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.mentions"
          color="primary"
          :label="t('$vuetify.label.notify_when_mentioned')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.tags"
          color="primary"
          :label="t('$vuetify.label.notify_me_when_you_are_scheduled_for_training')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.social.workout_invites"
          color="primary"
          :label="t('$vuetify.label.notify_me_of_invitations_for_shared_workouts')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.system") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.system.push"
          color="primary"
          :label="t('$vuetify.label.push_notifications')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.system.email"
          color="primary"
          :label="t('$vuetify.label.email_notifications')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.indication") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.referral.enabled"
          color="primary"
          :label="t(`$vuetify.label.${bodyForm.referral.enabled ? 'enabled' : 'disabled'}`)"
        />

        <v-switch
          v-if="bodyForm.quiet_hours.enabled"
          inset
          hide-details="auto"
          v-model="bodyForm.referral.apply_quiet_hours"
          color="primary"
          :label="t('$vuetify.label.do_not_disturb')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.do_not_disturb") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.quiet_hours.enabled"
          color="primary"
          :label="t(`$vuetify.label.${bodyForm.quiet_hours.enabled ? 'enabled' : 'disabled'}`)"
        />

        <template v-if="bodyForm.quiet_hours.enabled">
          <TextField
            required
            class="mt-3 mb-5"
            type="time"
            :label="t('$vuetify.label.start')"
            v-model="bodyForm.quiet_hours.start"
          />

          <TextField
            required
            class="mt-3 mb-5"
            type="time"
            :label="t('$vuetify.label.end')"
            v-model="bodyForm.quiet_hours.end"
          />
        </template>
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
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { useAccountsStore } from "@/stores/accounts";
import { useForm } from "@/composables";
import { isDeepEqual } from "@/utils";

/// COMPONENTS
import BottomSheetSaveChanges from "@/components/BottomSheetSaveChanges.vue";

/// DATA
const { t } = useLocale();
const { validate } = useForm();
const emit = defineEmits(["back"]);
const accountsStore = useAccountsStore();

const form = ref();
const bodyForm = reactive({
  workout: {
    daily_reminder: false,
    plan_ready: false,
    missed_workout: false,
  },
  habits: {
    reminders: false,
    streak_alerts: false,
  },
  social: {
    likes: false,
    comments: false,
    messages: false,
    new_followers: false,
    mentions: false,
    tags: false,
    workout_invites: false,
  },
  system: {
    push: false,
    email: false,
  },
  referral: {
    enabled: false,
    apply_quiet_hours: false,
  },
  quiet_hours: {
    enabled: false,
    start: "",
    end: "",
  }
});

const bottomSheetChanges = ref(false);

/// COMPUTED
const account = computed(() => accountsStore.account);
const body = computed(() => ({ ...bodyForm }));
const isEdited = computed(() => {
  return !isDeepEqual(account.value.settings.notifications, body.value);
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", back);

  const notifications = structuredClone(toRaw(unref(account.value.settings.notifications)));

  bodyForm.workout = { ...notifications.workout };
  bodyForm.habits = { ...notifications.habits };
  bodyForm.social = { ...notifications.social };
  bodyForm.system = { ...notifications.system };
  bodyForm.referral = { ...notifications.referral };
  bodyForm.quiet_hours = { ...notifications.quiet_hours };
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", back);
});

/// METHODS
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

    const response = await accountsStore.UPDATE_ACCOUNT({
      settings: {
        ...account.value.settings,
        notifications: body.value,
      }
    }, false);

    if (!response.error && exit) emit("back");
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>