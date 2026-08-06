<template>
  <v-bottom-sheet v-model="model">
    <v-card>
      <v-card-text class="py-5">
        <div class="d-flex justify-center align-center mb-5">
          <div class="size-4rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="30">
              mdi-clock-alert-outline
            </v-icon>
          </div>
        </div>

        <p class="text-center font-weight-bold text-h6 mb-3">
          {{ t("$vuetify.label.renew_subscription_expiring_tomorrow") }}
        </p>

        <p class="text-center mb-5 text-grey-lighten-1">
          {{ t("$vuetify.message.renew_subscription_description") }}
        </p>

        <v-btn
          block
          color="primary"
          class="text-black font-weight-bold text-none mb-3 pa-7"
          @click="$emit('renew')"
        >{{ t("$vuetify.label.renew_subscription") }}</v-btn>

        <v-btn
          block
          variant="text"
          class="text-none pa-7"
          @click="model = false"
        >{{ t("$vuetify.label.not_now") }}</v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

/// DATA
const { t } = useLocale();
const model = defineModel<boolean>({ default: false });

defineEmits<{ renew: [] }>();
</script>