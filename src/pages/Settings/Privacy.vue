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
        {{ t("$vuetify.label.privacy_settings") }}
      </p>
    </header>

    <div class="flex-fill overflow-y-auto d-flex flex-column ga-3 px-3 py-5">
      <v-form ref="form" @submit.prevent="submit(false)">
        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.visibility") }}
          </p>

          <v-radio-group
            v-model="bodyForm.visibility"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.public')"
              value="public"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.private')"
              value="private"
              color="primary"
            />
          </v-radio-group>
        </div>

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.content_visibility") }}</p>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.training") }}
          </p>

          <v-radio-group
            v-model="bodyForm.content_visibility.workouts"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.public')"
              value="public"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.only_me')"
              value="only_me"
              color="primary"
            />
          </v-radio-group>
        </div>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.challenges") }}
          </p>

          <v-radio-group
            v-model="bodyForm.content_visibility.challenges"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.public')"
              value="public"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.only_me')"
              value="only_me"
              color="primary"
            />
          </v-radio-group>
        </div>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.progress") }}
          </p>

          <v-radio-group
            v-model="bodyForm.content_visibility.progress"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.public')"
              value="public"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.only_me')"
              value="only_me"
              color="primary"
            />
          </v-radio-group>
        </div>

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.sensitive_data") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.sensitive_data.show_weight"
          color="primary"
          :label="t('$vuetify.label.show_weight')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.sensitive_data.show_measurements"
          color="primary"
          :label="t('$vuetify.label.show_measurements')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.sensitive_data.show_calories"
          color="primary"
          :label="t('$vuetify.label.show_calories_burned')"
        />

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.interactions") }}</p>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.who_can_comment_on_your_workouts_posts") }}
          </p>

          <v-radio-group
            v-model="bodyForm.interactions.who_can_comment"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.all')"
              value="all"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.nobody')"
              value="none"
              color="primary"
            />
          </v-radio-group>
        </div>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.who_can_tag_you_in_workouts_activities") }}
          </p>

          <v-radio-group
            v-model="bodyForm.interactions.who_can_tag"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.all')"
              value="all"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.nobody')"
              value="none"
              color="primary"
            />
          </v-radio-group>
        </div>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.who_can_mention_you") }}
          </p>

          <v-radio-group
            v-model="bodyForm.interactions.who_can_mention"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.all')"
              value="all"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.nobody')"
              value="none"
              color="primary"
            />
          </v-radio-group>
        </div>

        <div class="mb-5">
          <p class="mb-2 text-subtitle-2">
            {{ t("$vuetify.label.who_can_invite_you_to_shared_workouts") }}
          </p>

          <v-radio-group
            v-model="bodyForm.interactions.who_can_invite_to_workout"
            hide-details="auto"
          >
            <v-radio
              :label="t('$vuetify.label.all')"
              value="all"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.followers')"
              value="followers"
              color="primary"
            />

            <v-radio
              :label="t('$vuetify.label.nobody')"
              value="none"
              color="primary"
            />
          </v-radio-group>
        </div>

        <p
          class="font-weight-bold mt-8 mb-3"
        >{{ t("$vuetify.label.marking") }}</p>

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.tagging.auto_approve_tags"
          color="primary"
          :label="t('$vuetify.label.automatic_approvals')"
        />

        <v-switch
          inset
          hide-details="auto"
          v-model="bodyForm.tagging.review_tags_before_post"
          color="primary"
          :label="t('$vuetify.label.approvals_before_reaching_the_profile')"
        />
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
import { useForm } from "@/composables";
import { useAccountsStore } from "@/stores/accounts";
import { isDeepEqual } from "@/utils";
import { type Account } from "@/types/account.type";

/// COMPONENTS
import BottomSheetSaveChanges from "@/components/BottomSheetSaveChanges.vue";

/// DATA
const { t } = useLocale();
const { validate } = useForm();
const emit = defineEmits(["back"]);
const accountsStore = useAccountsStore();

const bottomSheetChanges = ref(false);

const form = ref();

const bodyForm = reactive({
  visibility: "private",
  content_visibility: {
    workouts: "followers",
    challenges: "followers",
    progress: "followers",
  },
  sensitive_data: {
    show_weight: false,
    show_measurements: false,
    show_calories: false,
  },
  interactions: {
    who_can_comment: "all",
    who_can_tag: "all",
    who_can_mention: "all",
    who_can_invite_to_workout: "all",
  },
  tagging: {
    auto_approve_tags: false,
    review_tags_before_post: false,
  }
});

/// COMPUTED
const account = computed(() => accountsStore.account);

const body = computed(() => {
  return { ...bodyForm } as Account["settings"]["privacy"];
});

const isEdited = computed(() => {
  const original = account.value.settings.privacy;
  return !isDeepEqual(original, body.value);
});

/// LIFE CYCLES
onMounted(() => {
  eventBus.on("BACK_BUTTON", back);

  const privacy = structuredClone(toRaw(unref(account.value.settings.privacy)));

  bodyForm.visibility = privacy.visibility;
  bodyForm.content_visibility = { ...privacy.content_visibility };
  bodyForm.sensitive_data = { ...privacy.sensitive_data };
  bodyForm.interactions = { ...privacy.interactions };
  bodyForm.tagging = { ...privacy.tagging };
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
        privacy: body.value,
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