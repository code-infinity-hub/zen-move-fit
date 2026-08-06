<template>
  <div class="px-4 py-4">
    <p class="text-subtitle-1 font-weight-bold mb-3">
      {{ t("$vuetify.activity_analysis.records_title") }}
    </p>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="record in records"
        :key="record.title_key"
        :class="[
          'rec-card pa-3 rounded-lg d-flex align-center ga-3',
          record.is_pr ? 'rec-card--pr' : 'rec-card--default'
        ]"
      >
        <div
          :class="[
            'rec-icon d-flex align-center justify-center rounded-lg flex-shrink-0',
            record.is_pr ? 'rec-icon--pr' : 'rec-icon--default'
          ]"
        >
          <v-icon
            :size="20"
            :color="record.is_pr ? 'primary' : 'grey-lighten-1'"
            :class="{ 'rec-trophy-pulse': record.is_pr }"
          >{{ record.is_pr ? "mdi-trophy" : "mdi-podium" }}</v-icon>
        </div>

        <!-- Text -->
        <div class="flex-fill min-w-0">
          <div class="d-flex align-center ga-2 mb-1">
            <p class="text-body-2 font-weight-bold text-truncate">
              {{ t(`$vuetify.activity_analysis.${record.title_key}`) }}
            </p>

            <v-chip
              v-if="record.is_pr"
              size="x-small"
              color="primary"
              variant="flat"
              class="flex-shrink-0"
            >{{ t("$vuetify.label.pr") }}</v-chip>
          </div>

          <p class="text-caption text-grey-lighten-1">
            {{
              record.value !== undefined
                ? t(`$vuetify.activity_analysis.${record.description_key}`, record.value)
                : record.rank !== undefined
                  ? t(`$vuetify.activity_analysis.${record.description_key}`, record.rank)
                  : t(`$vuetify.activity_analysis.${record.description_key}`)
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { type ActivityAnalysisRecord } from "@/types/activity.type";

/// DATA
const { t } = useLocale();
defineProps<{ records: ActivityAnalysisRecord[] }>();
</script>

<style lang="sass" scoped>
.rec-card
  border: 1px solid rgba(255, 255, 255, 0.06)

.rec-card--pr
  background: rgba(72, 242, 109, 0.05)
  border-color: rgba(72, 242, 109, 0.2)

.rec-card--default
  background: var(--tertiary)

.rec-icon
  width: 40px
  height: 40px
  flex-shrink: 0

.rec-icon--pr
  background: rgba(72, 242, 109, 0.12)
  border: 1px solid rgba(72, 242, 109, 0.25)

.rec-icon--default
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid rgba(255, 255, 255, 0.08)

@keyframes trophy-pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.65

.rec-trophy-pulse
  animation: trophy-pulse 2s ease-in-out infinite
</style>