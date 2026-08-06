<template>
  <EmojiPicker
    theme="dark"
    :native="true"
    :hide-search="true"
    :disable-sticky-group-names="true"
    :static-texts="{ skinTone: t('$vuetify.label.skin_tone') }"
    :group-names="{
      smileys_people: t('$vuetify.emojis_categories.smileys_people'),
      animals_nature: t('$vuetify.emojis_categories.animals_nature'),
      food_drink: t('$vuetify.emojis_categories.food_drink'),
      activities: t('$vuetify.emojis_categories.activities'),
      travel_places: t('$vuetify.emojis_categories.travel_places'),
      objects: t('$vuetify.emojis_categories.objects'),
      symbols: t('$vuetify.emojis_categories.symbols'),
      flags: t('$vuetify.emojis_categories.flags')
    }"
    @select="handleSendEmoji"
  />
</template>

<script lang="ts" setup>
// @ts-ignore
import "vue3-emoji-picker/css";
import { useLocale } from "vuetify";
import EmojiPicker from "vue3-emoji-picker";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["add"]);

/// METHODS
const handleSendEmoji = (emoji: any) => {
  emit("add", emoji.i);
};
</script>

<style lang="sass">
div.v3-emoji-picker
  background: var(--secondary)
  border: 2px solid var(--tertiary)

  .v3-body
    padding-bottom: 0

  .v3-group
    h5
      background: transparent !important
</style>