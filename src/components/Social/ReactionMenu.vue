<template>
  <v-menu
    v-model="isOpen"
    location="top"
    :close-on-content-click="false"
    transition="scale-transition"
  >
    <template #activator="{ props: menuProps }">
      <slot name="activator" :props="menuProps"></slot>
    </template>

    <v-card
      rounded="pill"
      class="pa-2 bg-quintet border-sextet"
      elevation="4"
    >
      <div class="d-flex ga-1 align-center">
        <v-btn
          v-for="option in reactionOptions"
          icon
          :key="option.type"
          size="small"
          variant="text"
          :title="option.label"
          @click="select(option.type)"
        >
          <v-icon :color="option.color" :size="22">
            {{ option.icon }}
          </v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { type PostReactionType } from "@/types/social.type";

/// DATA
const { t } = useLocale();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [type: PostReactionType];
}>();

/// COMPUTED
const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const reactionOptions = computed(() => [
  { type: "LIKE" as PostReactionType, icon: "mdi-heart", color: "red-accent-4", label: t("$vuetify.label.reactions_like") },
  { type: "FIRE" as PostReactionType, icon: "mdi-fire", color: "orange-accent-4", label: t("$vuetify.label.reactions_fire") },
  { type: "STRENGTH" as PostReactionType, icon: "mdi-arm-flex", color: "yellow-accent-4", label: t("$vuetify.label.reactions_strength") },
  { type: "CLAP" as PostReactionType, icon: "mdi-hand-clap", color: "amber-darken-1", label: t("$vuetify.label.reactions_clap") },
]);

/// METHODS
const select = (type: PostReactionType) => {
  emit("select", type);
  isOpen.value = false;
};
</script>