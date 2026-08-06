<template>
  <div class="px-4 py-4">
    <p class="text-caption text-uppercase mb-3 font-weight-bold">
      {{ t("$vuetify.activity_analysis.context_title") }}
    </p>

    <div class="context-scroll d-flex ga-2">
      <div
        v-for="item in context"
        :key="item.key"
        class="context-chip flex-shrink-0 d-flex align-center ga-3 pa-3 rounded-lg"
        :class="`context-chip--${item.type}`"
      >
        <div
          class="context-icon-wrap rounded-lg d-flex align-center justify-center flex-shrink-0"
          :class="`context-icon-wrap--${item.type}`"
        >
          <v-icon
            :size="16"
            :color="iconColor(item.type)"
          >{{ item.icon }}</v-icon>
        </div>

        <div>
          <p
            class="context-chip-title font-weight-bold"
            :style="{ fontSize: '0.75rem', lineHeight: '1.3' }"
          >{{ t(`$vuetify.activity_analysis.${item.key}_title`) }}</p>

          <p
            class="context-chip-desc mt-1 text-grey-lighten-1"
            :style="{ fontSize: '0.68rem', lineHeight: '1.4' }"
          >
            {{
              item.value !== undefined ?
                t(`$vuetify.activity_analysis.${item.key}_desc`, formattedValue(item)) :
                t(`$vuetify.activity_analysis.${item.key}_desc`)
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisContextItem } from "@/types/activity.type";
import { formatPaceDiff } from "@/utils";

/// DATA
const { t } = useLocale();
defineProps<{ context: ActivityAnalysisContextItem[] }>();

/// METHODS
const iconColor = (type: string) => {
  if (type === "positive") return "primary";
  if (type === "negative") return "red";
  return "grey-lighten-1";
};

const formattedValue = (item: ActivityAnalysisContextItem): string | number => {
  if (item.value === undefined) return "";
  if (item.key.startsWith("context_pace_")) return formatPaceDiff(item.value);
  return item.value;
};
</script>

<style lang="sass" scoped>
.context-scroll
  overflow-x: auto
  -webkit-overflow-scrolling: touch
  &::-webkit-scrollbar
    display: none

.context-chip
  background: var(--tertiary)
  border: 1px solid rgba(255, 255, 255, 0.06)
  min-width: 172px
  max-width: 200px

.context-chip--positive
  border-color: rgba(72, 242, 109, 0.18)

.context-chip--negative
  border-color: rgba(244, 67, 54, 0.16)

.context-icon-wrap
  width: 30px
  height: 30px

.context-icon-wrap--positive
  background: rgba(72, 242, 109, 0.1)

.context-icon-wrap--negative
  background: rgba(244, 67, 54, 0.1)

.context-icon-wrap--neutral
  background: rgba(255, 255, 255, 0.06)
</style>