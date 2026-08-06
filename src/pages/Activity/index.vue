<template>
  <div class="w-100 h-100 d-flex flex-column overflow-hidden">
    <!-- Loading -->
    <div
      v-if="loading"
      class="w-100 h-100 d-flex justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        :size="50"
      />
    </div>

    <!-- Error -->
    <div
      v-else-if="error || !activity"
      class="w-100 h-100 d-flex flex-column justify-center align-center ga-3 px-8"
    >
      <v-icon color="grey-lighten-1" :size="48">
        mdi-alert-circle-outline
      </v-icon>

      <p class="text-body-2 text-grey-lighten-1 text-center">
        {{ t("$vuetify.activity_detail.not_found") }}
      </p>

      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        class="text-none"
        @click="load"
      >{{ t("$vuetify.label.try_again") }}</v-btn>
    </div>

    <!-- Content -->
    <div
      v-else
      class="flex-fill overflow-y-auto d-flex flex-column"
      :style="{ overflowX: 'hidden' }"
    >
      <!-- HERO: mapa + gradiente + nav + título -->
      <ActivityHeader
        :map-picture="activity.map_picture"
        :title="activity.workout_title || activity.title"
        :type-label="typeLabel"
        :address="activity.address"
        :workout-intensity="activity.workout_intensity"
        :is-own="activity.is_own"
        :is-shared="!!myTag"
        @back="back"
        @share="shareActivity"
        @edit="openEdit"
        @delete="showDeleteDialog = true"
        @untag="untagMyself"
      />

      <div>
        <!-- AUTHOR -->
        <div
          class="px-4 py-3 d-flex align-center ga-3"
          @click="navigateToProfile"
        >
          <div>
            <ProfileImage
              :image="activity.account.image"
              :name="activity.account.name"
              size="42px"
            />
          </div>

          <div>
            <p class="font-weight-bold text-body-2">
              {{ activity.account.name }}
            </p>

            <div class="d-flex align-center ga-2 mt-1">
              <p class="text-caption text-grey-lighten-1">
                {{ dateLabel }}
              </p>

              <v-chip
                v-if="activity.visibility"
                size="x-small"
                variant="tonal"
                class="px-3"
                :prepend-icon="visibilityIcon"
                :style="{ fontSize: '10px', opacity: '0.7' }"
              >{{ visibilityLabel }}</v-chip>
            </div>
          </div>
        </div>

        <!-- Pessoas marcadas (aprovadas) -->
        <div
          v-if="activity.tagged_people?.length"
          class="px-4 pb-3 d-flex align-center flex-wrap ga-2"
        >
          <span class="text-caption text-grey-lighten-1">
            {{ t("$vuetify.label.with") }}
          </span>

          <v-chip
            v-for="person in activity.tagged_people"
            :key="person._id"
            size="small"
            variant="tonal"
            @click="router.push({ name: 'profile', params: { _id: person._id } })"
          >
            <template #prepend>
              <ProfileImage
                size="18px"
                :image="person.image"
                :name="person.name"
                class="mr-2"
              />
            </template>

            {{ `@${person.username}` }}
          </v-chip>
        </div>

        <!-- Detalhes ocultos configurados (somente o dono vê) -->
        <div
          v-if="activity.is_own && hiddenDetailsLabels.length"
          class="mt-2 px-4 text-caption text-grey-lighten-1 d-flex ga-2 mb-4"
        >
          <v-icon>mdi-eye-off-outline</v-icon>
          <span>{{ `${t("$vuetify.label.hidden_for_others")}: ${hiddenDetailsLabels.join(", ")}` }}</span>
        </div>

        <!-- Descrição (abaixo do autor, se houver) -->
        <p
          v-if="activity.description"
          class="px-4 pb-3 text-body-2"
          :style="{ whiteSpace: 'pre-line' }"
        >{{ activity.description }}</p>
      </div>

      <div class="pb-2">
        <!-- MÉTRICAS PRIMÁRIAS -->
        <div class="px-4 py-3 d-flex">
          <template v-if="distanceKm">
            <div class="primary-metric flex-fill d-flex flex-column align-center">
              <p class="primary-metric-value">
                {{ distanceKm }}

                <span class="primary-metric-unit text-lowercase text-grey-lighten-1">
                  {{ t("$vuetify.label.km") }}
                </span>
              </p>

              <p class="primary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.label.distance") }}
              </p>
            </div>

            <div class="primary-metric-divider"></div>
          </template>

          <div class="primary-metric flex-fill d-flex flex-column align-center">
            <p class="primary-metric-value">
              {{ formatTime(primaryDurationSeconds) }}
            </p>

            <p class="primary-metric-label text-grey-lighten-1">
              {{ t("$vuetify.label.time") }}
            </p>
          </div>

          <template v-if="activity.metrics?.avg_pace">
            <div class="primary-metric-divider"></div>

            <div class="primary-metric flex-fill d-flex flex-column align-center">
              <p class="primary-metric-value">
                {{ avgPaceLabel }}
                <span class="primary-metric-unit text-lowercase text-grey-lighten-1">
                  {{ `/${t("$vuetify.label.km")}` }}
                </span>
              </p>

              <p class="primary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.label.rhythm") }}
              </p>
            </div>
          </template>
        </div>

        <!-- MÉTRICAS SECUNDÁRIAS -->
        <div
          v-if="hasSecondaryStats"
          class="px-4 pb-2"
        >
          <v-divider class="mb-3" />

          <div class="d-flex flex-wrap">
            <div
              v-if="activity.metrics?.elevation?.gain"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ formatNumber(activity.metrics.elevation.gain) }}

                <span class="secondary-metric-unit text-grey-lighten-1">
                  {{ t("$vuetify.label.meters_abbreviation") }}
                </span>
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.activity_detail.elevation_gain") }}
              </p>
            </div>

            <div
              v-if="activity.calories"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ formatNumber(activity.calories) }}

                <span class="secondary-metric-unit text-grey-lighten-1">
                  {{ t("$vuetify.label.kcal_abbreviation") }}
                </span>
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.label.calories") }}
              </p>
            </div>

            <div
              v-if="activity.metrics?.steps"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ formatNumber(activity.metrics.steps) }}
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.label.steps") }}
              </p>
            </div>

            <div
              v-if="activity.metrics?.elevation?.max"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ formatNumber(activity.metrics.elevation.max) }}

                <span class="secondary-metric-unit text-grey-lighten-1">
                  {{ t("$vuetify.label.meters_abbreviation") }}
                </span>
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.activity_detail.max_elevation") }}
              </p>
            </div>

            <div
              v-if="showElapsedTime"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ formatTime(activity.metrics!.elapsed_seconds) }}
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.activity_detail.elapsed_time") }}
              </p>
            </div>

            <div
              v-if="fastestSplit"
              class="secondary-metric"
            >
              <p class="secondary-metric-value">
                {{ fastestSplit }}

                <span class="secondary-metric-unit text-lowercase text-grey-lighten-1">
                  {{ `/${t("$vuetify.label.km")}` }}
                </span>
              </p>

              <p class="secondary-metric-label text-grey-lighten-1">
                {{ t("$vuetify.activity_detail.fastest_split") }}
              </p>
            </div>
          </div>
        </div>

        <!-- FILES -->
        <div v-if="activity.files?.length">
          <div class="files-container mt-2 mb-1">
            <div
              v-for="file in activity.files"
              :key="file.url"
              class="file-item rounded-lg overflow-hidden"
            >
              <img
                v-if="file.mimetype.startsWith('image')"
                class="file-img"
                :src="file.url"
                @click="eventBus.emit('SHOW_IMAGE', { images: [file.url] })"
              />
              <Player
                v-else
                class="file-img"
                :video-id="[{ src: file.url, type: file.mimetype }]"
              />
            </div>
          </div>
        </div>

        <!-- CLIMA -->
        <ActivityWeather
          v-if="activity.weather"
          :weather="activity.weather"
          class="mt-3"
        />

        <!-- RESUMO DO TREINO (TRAINING e CHALLENGE) -->
        <ActivityTrainingSummaryCard
          v-if="hasExercises"
          class="mt-4"
          :duration-seconds="activity.duration_seconds"
          :calories="activity.calories"
          :exercises="activity.exercises"
        />
      </div>

      <div class="d-flex flex-column ga-2">
        <!-- MÚSCULOS TRABALHADOS (TRAINING e CHALLENGE) -->
        <div v-if="hasExercises">
          <div class="section-break"></div>
          <ActivityMusclesWorked :exercises="activity.exercises" />
        </div>

        <!-- PROGRESSO NO PLANO (CHALLENGE, todos os usuários) -->
        <div v-if="activity.type === 'CHALLENGE' && activity.challenge_plan_progress">
          <div class="section-break"></div>
          <ActivityChallengePlanProgress
            :ordinal="activity.challenge_plan_progress.ordinal"
            :total="activity.challenge_plan_progress.total"
            :completed="activity.challenge_plan_progress.completed"
            :percentage="activity.challenge_plan_progress.percentage"
          />
        </div>

        <!-- ZEN INSIGHTS (todos os tipos, quando disponível) -->
        <div v-if="activity.insight">
          <div class="section-break"></div>
          <div class="px-4 py-4 insight-card">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon
                :size="16"
                color="primary"
              >mdi-lightning-bolt</v-icon>
              <p
                class="text-caption text-uppercase font-weight-bold text-primary"
                :style="{ letterSpacing: '0.06em' }"
              >{{ t("$vuetify.activity_detail.insight") }}</p>
            </div>

            <p
              class="text-body-2"
              :style="{ lineHeight: '1.65' }"
            >{{ activity.insight }}</p>
          </div>
        </div>

        <!-- ── ANÁLISES PREMIUM — TOPO (Score → Próximo Objetivo) ── -->
        <template v-if="activity.type === 'AVULSE' && isPremium">
          <div v-if="activity.analysis?.score">
            <div class="section-break"></div>
            <ActivityScore :score="activity.analysis.score" />
          </div>

          <div v-if="activity.analysis?.context?.length">
            <div class="section-break"></div>
            <ActivityMetricContext :context="activity.analysis.context" />
          </div>

          <div v-if="activity.analysis?.highlights?.length">
            <div class="section-break"></div>
            <ActivityHighlights :highlights="activity.analysis.highlights" />
          </div>

          <div v-if="activity.analysis?.records?.length">
            <div class="section-break"></div>
            <ActivityAnalysisRecords :records="activity.analysis.records" />
          </div>

          <div v-if="activity.analysis?.next_goal">
            <div class="section-break"></div>
            <ActivityNextGoal :goal="activity.analysis.next_goal" />
          </div>
        </template>

        <!-- RESULTADOS -->
        <div v-if="bestEfforts.length">
          <div class="section-break"></div>
          <div class="px-4 py-4">
            <p class="text-subtitle-1 font-weight-bold mb-1">{{ t("$vuetify.activity_detail.results") }}</p>
            <p class="text-caption text-grey-lighten-1 mb-4">{{ t("$vuetify.activity_detail.best_marks") }}</p>
            <div
              v-for="(effort, i) in bestEfforts"
              :key="effort.distanceKm"
              :class="[
                'd-flex align-center py-3',
                i < bestEfforts.length - 1 ? 'border-bottom-tertiary' : ''
              ]"
            >
              <v-icon
                :size="22"
                :color="i === 0 ? 'primary' : 'grey-lighten-1'"
                class="mr-3"
              >{{ i === 0 ? "mdi-crown-outline" : "mdi-shoe-sneaker" }}</v-icon>

              <div class="flex-fill">
                <p class="text-body-2 font-weight-bold">{{ effort.label }}</p>
                <p class="text-caption text-grey-lighten-1 text-lowercase">{{ `${formatPaceSeconds(effort.paceSeconds)} /${t("$vuetify.label.km")}` }}</p>
              </div>

              <p class="text-body-2 font-weight-bold">{{ formatTime(effort.totalSeconds) }}</p>
            </div>
          </div>
        </div>

        <!-- PARCIAIS -->
        <div v-if="hasSplits">
          <div class="section-break"></div>
          <div class="py-4">
            <p class="px-4 text-subtitle-1 font-weight-bold mb-2">{{ t("$vuetify.label.splits_km") }}</p>
            <ActivitySplitsTable
              :splits="activity.metrics!.splits"
              :elevation-per-split="elevationPerSplit"
            />
          </div>
        </div>

        <!-- ANÁLISE DO RITMO -->
        <div v-if="hasSplits">
          <div class="section-break"></div>
          <div class="px-4 py-4">
            <p class="text-subtitle-1 font-weight-bold mb-3">{{ t("$vuetify.activity_detail.pace_chart") }}</p>
            <ActivityPaceChart :splits="activity.metrics!.splits" />

            <div class="stats-list mt-3">
              <div class="stats-row">
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.label.rhythm") }}</p>
                <p class="text-body-2 font-weight-bold text-lowercase">{{ `${avgPaceLabel} /${t("$vuetify.label.km")}` }}</p>
              </div>

              <div class="stats-row">
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.activity_detail.moving_time") }}</p>
                <p class="text-body-2 font-weight-bold">{{ formatTime(primaryDurationSeconds) }}</p>
              </div>

              <div v-if="showElapsedTime" class="stats-row">
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.activity_detail.elapsed_time") }}</p>
                <p class="text-body-2 font-weight-bold">{{ formatTime(activity.metrics!.elapsed_seconds) }}</p>
              </div>

              <div v-if="fastestSplit" class="stats-row">
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.activity_detail.fastest_split") }}</p>
                <p class="text-body-2 font-weight-bold text-lowercase">{{ `${fastestSplit} /${t("$vuetify.label.km")}` }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── ANÁLISES PREMIUM — APÓS PACE CHART ── -->
        <template v-if="activity.type === 'AVULSE' && isPremium && hasSplits">
          <div v-if="activity.analysis?.effort_distribution">
            <div class="section-break"></div>
            <ActivityEffortDistribution :effort="activity.analysis.effort_distribution" />
          </div>

          <div v-if="activity.analysis?.efficiency">
            <div class="section-break"></div>
            <ActivityEfficiency :efficiency="activity.analysis.efficiency" />
          </div>
        </template>

        <!-- ELEVAÇÃO -->
        <div v-if="activity.elevation_stream?.length">
          <div class="section-break"></div>
          <div class="px-4 py-4">
            <p class="text-subtitle-1 font-weight-bold mb-3">{{ t("$vuetify.activity_detail.elevation_chart") }}</p>
            <ActivityElevationChart :stream="activity.elevation_stream" />

            <div
              v-if="activity.metrics?.elevation"
              class="stats-list mt-3"
            >
              <div class="stats-row">
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.activity_detail.elevation_gain") }}</p>
                <p class="text-body-2 font-weight-bold">{{ `${formatNumber(activity.metrics.elevation.gain)} ${t("$vuetify.label.meters_abbreviation")}` }}</p>
              </div>

              <div
                v-if="activity.metrics.elevation.max"
                class="stats-row"
              >
                <p class="text-body-2 text-grey-lighten-1">{{ t("$vuetify.activity_detail.max_elevation") }}</p>
                <p class="text-body-2 font-weight-bold">{{ `${formatNumber(activity.metrics.elevation.max)} ${t("$vuetify.label.meters_abbreviation")}` }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── ANÁLISES PREMIUM — BLOCO FINAL ── -->
        <template v-if="activity.type === 'AVULSE' && isPremium">
          <div v-if="activity.analysis?.what_it_means?.length">
            <div class="section-break"></div>
            <ActivityWhatItMeans :items="activity.analysis.what_it_means" />
          </div>

          <div v-if="activity.analysis?.evolution?.length">
            <div class="section-break"></div>
            <ActivityEvolution :evolution="activity.analysis.evolution" />
          </div>

          <div v-if="activity.analysis?.compared_to_you">
            <div class="section-break"></div>
            <ActivityComparedToYou :comparison="activity.analysis.compared_to_you" />
          </div>

          <div v-if="activity.analysis?.consistency">
            <div class="section-break"></div>
            <ActivityConsistency :consistency="activity.analysis.consistency" />
          </div>

          <div v-if="activity.analysis?.training_load">
            <div class="section-break"></div>
            <ActivityTrainingLoad :load="activity.analysis.training_load" />
          </div>

          <div v-if="activity.analysis?.predictions?.items?.length">
            <div class="section-break"></div>
            <ActivityPredictions :predictions="activity.analysis.predictions" />
          </div>

          <div v-if="activity.analysis?.recovery">
            <div class="section-break"></div>
            <ActivityRecovery :recovery="activity.analysis.recovery" />
          </div>

          <div v-if="activity.analysis?.recommendations?.length">
            <div class="section-break"></div>
            <ActivityRecommendations :recommendations="activity.analysis.recommendations" />
          </div>
        </template>

        <!-- EQUIPAMENTO -->
        <div v-if="activity.equipment">
          <div class="section-break"></div>
          <ActivityEquipment :equipment="activity.equipment" />
        </div>

        <!-- CORREDORES PRÓXIMOS -->
        <div v-if="activity.nearby_runners?.length">
          <div class="section-break"></div>
          <ActivityNearbyRunners :runners="activity.nearby_runners" />
        </div>

        <!-- ── EXERCÍCIOS ─────────────────────────── -->
        <div v-if="hasExercises">
          <div class="section-break"></div>
          <ActivityExerciseList :exercises="activity.exercises" />
        </div>

        <!-- ── ESFORÇO + TAGS + OBSERVAÇÕES ──────── -->
        <div v-if="hasBottomSection">
          <div class="section-break"></div>
          <div class="px-4 py-4 d-flex flex-column ga-5">
            <div v-if="activity.perceived_effort">
              <div class="d-flex align-center justify-space-between mb-2">
                <p class="text-caption text-grey-lighten-1">{{ t("$vuetify.label.perceived_effort") }}</p>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="effortZoneColor"
                >{{ t(`$vuetify.activity_detail.${effortZoneKey}`) }}</v-chip>
              </div>

              <p class="text-h5 font-weight-bold mb-2">{{ `${activity.perceived_effort}/10` }}</p>

              <!-- Barra segmentada -->
              <div class="effort-bar mb-2">
                <div
                  v-for="n in 10"
                  :key="n"
                  class="effort-segment rounded-sm"
                  :class="{ 'effort-segment--active': n <= activity.perceived_effort }"
                  :style="{ ...(n <= activity.perceived_effort && { backgroundColor: effortZoneColor }) }"
                ></div>
              </div>

              <p class="text-body-2 text-grey-lighten-1">{{ t(`$vuetify.efforts.effort_${activity.perceived_effort}`) }}</p>
            </div>

            <div v-if="activity.tags?.length">
              <p class="text-caption text-grey-lighten-1 mb-2">{{ t("$vuetify.label.tags") }}</p>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="tag in activity.tags"
                  :key="tag"
                  size="small"
                  variant="tonal"
                  color="primary"
                >{{ t(`$vuetify.label.${tag}`) }}</v-chip>
              </div>
            </div>

            <div v-if="activity.private_observations">
              <p class="text-caption text-grey-lighten-1 mb-1 d-flex align-center ga-1">
                <v-icon :size="12">mdi-lock-outline</v-icon>
                {{ t("$vuetify.label.private_observations") }}
              </p>

              <p
                class="text-body-2"
                :style="{ whiteSpace: 'pre-line' }"
              >{{ activity.private_observations }}</p>
            </div>
          </div>
        </div>

        <!-- CARD PREMIUM ÚNICO (usuário free, AVULSE only) -->
        <div v-if="activity.type === 'AVULSE' && !isPremium && activity.is_own">
          <div class="section-break"></div>
          <PremiumInsightsCard />
        </div>

        <!-- ── ANÁLISES DE TREINO PREMIUM (TRAINING, isPremium) ── -->
        <div v-if="activity.type === 'TRAINING' && isPremium && activity.training_analysis">
          <div class="section-break"></div>

          <ActivityTrainingHighlights
            v-if="activity.training_analysis.highlights?.length"
            :highlights="activity.training_analysis.highlights"
          />

          <ActivityTrainingCoach
            :bullets="activity.training_analysis.coach_bullets ?? []"
            :weekly-count="activity.training_analysis.consistency?.weekly_count ?? 0"
            :streak="activity.training_analysis.consistency?.streak ?? 0"
          />

          <ActivityMuscleRecovery
            v-if="activity.training_analysis.recovery"
            :hours="activity.training_analysis.recovery.hours"
            :primary-muscles="activity.training_analysis.recovery.primary_muscles"
          />

          <ActivityMuscleBalance
            v-if="activity.training_analysis.muscle_balance"
            :neglected="activity.training_analysis.muscle_balance.neglected"
          />

          <ActivityMuscleFrequency
            v-if="activity.training_analysis.muscle_frequency"
            :counts="activity.training_analysis.muscle_frequency.counts"
            :period-days="activity.training_analysis.muscle_frequency.period_days"
          />
        </div>

        <!-- ── ANÁLISES DE DESAFIO PREMIUM (CHALLENGE, isPremium) ── -->
        <div
          v-if="activity.type === 'CHALLENGE' && isPremium && activity.challenge_analysis"
          class="pb-4"
        >
          <div class="section-break"></div>

          <ActivityChallengeCoach
            :bullets="activity.challenge_analysis.coach_bullets ?? []"
            :streak="activity.challenge_analysis.streak ?? 0"
          />

          <ActivityChallengeDifficulty
            v-if="activity.challenge_analysis.difficulty_breakdown"
            :breakdown="activity.challenge_analysis.difficulty_breakdown"
          />
        </div>
      </div>

      <div class="pb-8 bg-black"></div>
    </div>
  </div>

  <!-- Share flow (fullscreen) -->
  <Transition name="slide-up">
    <ActivityShareFlow
      v-if="showShareFlow && activity"
      :activity="activity"
      @close="showShareFlow = false"
    />
  </Transition>

  <ActivityDeleteDialog
    v-if="activity?.is_own"
    v-model="showDeleteDialog"
    :activity="activity!"
    @deleted="back"
  />

  <!-- MOSTRAR BOTTOMSHEET PARA ASSINAR -->
  <SubscriptionConversionSheet v-model="showPremiumConversionSheet" />

  <!-- MOSTRAR BOTTOMSHEET PARA COMPARTILHAR APÓS DETECTAR PRINT -->
  <ActivitySharePromptSheet
    v-model="showShareSheet"
    @share="shareActivity"
  />
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { date, getPrimaryDurationSeconds } from "@/utils";
import { Share } from "@/mobile";
import { eventBus } from "@/eventBus";
import { useFormatNumber, useSharePrewarm } from "@/composables";
import { RunningMetricsService } from "@/services/running-metrics.service";
import { type ActivityDetail } from "@/types/activity.type";
import { type BestEffort } from "@/types/global.type";

/// COMPONENTS
import ProfileImage from "@/components/ProfileImage.vue";
import ActivityHeader from "@/components/Activity/ActivityHeader.vue";
import ActivityWeather from "@/components/Activity/ActivityWeather.vue";
import ActivityScore from "@/components/Activity/ActivityScore.vue";
import ActivityMetricContext from "@/components/Activity/ActivityMetricContext.vue";
import ActivityAnalysisRecords from "@/components/Activity/ActivityAnalysisRecords.vue";
import ActivityEffortDistribution from "@/components/Activity/ActivityEffortDistribution.vue";
import ActivityWhatItMeans from "@/components/Activity/ActivityWhatItMeans.vue";
import ActivityEvolution from "@/components/Activity/ActivityEvolution.vue";
import ActivityPredictions from "@/components/Activity/ActivityPredictions.vue";
import ActivityRecovery from "@/components/Activity/ActivityRecovery.vue";
import ActivityEfficiency from "@/components/Activity/ActivityEfficiency.vue";
import ActivityHighlights from "@/components/Activity/ActivityHighlights.vue";
import ActivityNextGoal from "@/components/Activity/ActivityNextGoal.vue";
import ActivityRecommendations from "@/components/Activity/ActivityRecommendations.vue";
import ActivityConsistency from "@/components/Activity/ActivityConsistency.vue";
import ActivityTrainingLoad from "@/components/Activity/ActivityTrainingLoad.vue";
import ActivityComparedToYou from "@/components/Activity/ActivityComparedToYou.vue";
import ActivityEquipment from "@/components/Activity/ActivityEquipment.vue";
import ActivityNearbyRunners from "@/components/Activity/ActivityNearbyRunners.vue";
import PremiumInsightsCard from "@/components/Activity/PremiumInsightsCard.vue";
import ActivitySplitsTable from "@/components/Activity/ActivitySplitsTable.vue";
import ActivityPaceChart from "@/components/Activity/ActivityPaceChart.vue";
import ActivityElevationChart from "@/components/Activity/ActivityElevationChart.vue";
import ActivityExerciseList from "@/components/Activity/ActivityExerciseList.vue";
import ActivityTrainingSummaryCard from "@/components/Activity/ActivityTrainingSummaryCard.vue";
import ActivityMusclesWorked from "@/components/Activity/ActivityMusclesWorked.vue";
import ActivityTrainingHighlights from "@/components/Activity/ActivityTrainingHighlights.vue";
import ActivityTrainingCoach from "@/components/Activity/ActivityTrainingCoach.vue";
import ActivityMuscleRecovery from "@/components/Activity/ActivityMuscleRecovery.vue";
import ActivityMuscleBalance from "@/components/Activity/ActivityMuscleBalance.vue";
import ActivityMuscleFrequency from "@/components/Activity/ActivityMuscleFrequency.vue";
import ActivityChallengePlanProgress from "@/components/Activity/ActivityChallengePlanProgress.vue";
import ActivityChallengeCoach from "@/components/Activity/ActivityChallengeCoach.vue";
import ActivityChallengeDifficulty from "@/components/Activity/ActivityChallengeDifficulty.vue";
import Player from "@/components/Player.vue";
import ActivitySharePromptSheet from "@/components/Activity/Share/ActivitySharePromptSheet.vue";
import ActivityShareFlow from "@/components/Activity/Share/ActivityShareFlow.vue";
import ActivityDeleteDialog from "@/components/Activity/ActivityDeleteDialog.vue";
import SubscriptionConversionSheet from "@/components/Activity/SubscriptionConversionSheet.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { schedule: scheduleSharePrewarm, cancel: cancelSharePrewarm } = useSharePrewarm();
const { formatTime, formatDateTimeLong } = date();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();

const loading = ref(true);
const error = ref(false);
const activity = ref<ActivityDetail | null>(null);

const _id = computed(() => route.params._id as string);

const showShareSheet = ref(false);
const showShareFlow = ref(false);
const showDeleteDialog = ref(false);
const showPremiumConversionSheet = ref(false);

const HIDDEN_DETAIL_LABEL_KEYS: Record<string, string> = {
  started_at: "start_date_and_time",
  perceived_effort: "perceived_effort",
  calories: "calories",
  exercises: "exercises",
};

/// COMPUTED
const hasSplits = computed(() => (activity.value?.metrics?.splits?.length ?? 0) > 0);
const hasExercises = computed(() => (activity.value?.exercises?.length ?? 0) > 0);
const isPremium = computed(() => activity.value?.show_complete === true);
const hiddenDetailsLabels = computed(() => (activity.value?.hidden_details ?? []).map((key) => t(`$vuetify.label.${HIDDEN_DETAIL_LABEL_KEYS[key] ?? key}`)));
const myTag = computed(() =>
  activity.value?.is_own ?
    null :
    activity.value?.tagged_people?.find((person) => person._id === accountsStore._id) ?? null
);
const typeLabel = computed(() => {
  if (!activity.value) return "";
  if (activity.value.type === "TRAINING") return t("$vuetify.label.training");
  if (activity.value.type === "CHALLENGE") return t("$vuetify.label.challenge");
  return t(`$vuetify.label.${activity.value.category?.toLowerCase()}`);
});
const dateLabel = computed(() => {
  if (!activity.value?.started_at) return "";
  return formatDateTimeLong(activity.value.started_at);
});
const distanceKm = computed(() => {
  if (!activity.value?.metrics) return null;
  return formatNumber(activity.value.metrics.distance_meters / 1000);
});
const avgPaceLabel = computed(() => {
  if (!activity.value?.metrics?.avg_pace) return "--";
  return RunningMetricsService.formatPace(activity.value.metrics.avg_pace);
});
const fastestSplit = computed(() => {
  const splits = activity.value?.metrics?.splits;
  if (!splits?.length) return null;
  const fastest = Math.min(...splits.map((s) => s.duration_seconds));
  return RunningMetricsService.formatPace(fastest);
});
const primaryDurationSeconds = computed(() => {
  if (!activity.value) return 0;
  return getPrimaryDurationSeconds(activity.value);
});
const showElapsedTime = computed(() => {
  const a = activity.value;
  if (!a?.metrics?.elapsed_seconds) return false;
  return Math.abs(a.metrics.elapsed_seconds - a.duration_seconds) > 10;
});
const visibilityIcon = computed(() => {
  const v = activity.value?.visibility;
  if (v === "ALL") return "mdi-earth";
  if (v === "FOLLOWERS") return "mdi-account-group-outline";
  return "mdi-lock-outline";
});
const visibilityLabel = computed(() => {
  const v = activity.value?.visibility;
  if (v === "ALL") return t("$vuetify.label.public");
  if (v === "FOLLOWERS") return t("$vuetify.label.followers");
  return t("$vuetify.label.only_you");
});
const elevationPerSplit = computed<number[] | null>(() => {
  const stream = activity.value?.elevation_stream;
  const splits = activity.value?.metrics?.splits;
  if (!stream?.length || !splits?.length) return null;

  const findNearest = (target: number) => stream.reduce((prev, curr) =>
    Math.abs(curr.distance - target) < Math.abs(prev.distance - target) ? curr : prev,
  );

  return splits.map((split) => {
    const startElev = findNearest((split.km - 1) * 1000).elevation;
    const endElev = findNearest(split.km * 1000).elevation;
    return Math.round(endElev - startElev);
  });
});
const bestEfforts = computed<BestEffort[]>(() => {
  const splits = activity.value?.metrics?.splits;
  if (!splits?.length) return [];

  const targets = [1, 2, 3, 5, 10, 15, 21, 42];
  const results: BestEffort[] = [];

  const getLabel = (km: number) => `${formatNumber(km)} ${t("$vuetify.label.km")}`.toLocaleLowerCase();

  for (const dist of targets) {
    if (splits.length < dist) continue;

    let minTime = Infinity;
    for (let i = 0; i <= splits.length - dist; i++) {
      const total = splits
        .slice(i, i + dist)
        .reduce((sum, s) => sum + s.duration_seconds, 0);
      if (total < minTime) minTime = total;
    }

    if (minTime < Infinity) {
      results.push({
        distanceKm: dist,
        label: dist === 21 ? getLabel(21.1) : dist === 42 ? getLabel(42.2) : getLabel(dist),
        totalSeconds: minTime,
        paceSeconds: minTime / dist,
      });
    }
  }

  return results;
});
const hasSecondaryStats = computed(() => {
  const a = activity.value;
  if (!a) return false;
  return !!(
    a.metrics?.elevation?.gain ||
    a.calories ||
    a.metrics?.steps ||
    a.metrics?.elevation?.max ||
    showElapsedTime.value ||
    fastestSplit.value
  );
});
const effortZoneColor = computed(() => {
  const e = activity.value?.perceived_effort ?? 0;
  if (e <= 3) return "var(--primary)";
  if (e <= 6) return "var(--yellow)";
  if (e <= 8) return "var(--orange)";
  return "var(--red)";
});
const effortZoneKey = computed(() => {
  const e = activity.value?.perceived_effort ?? 0;
  if (e <= 3) return "effort_zone_light";
  if (e <= 6) return "effort_zone_moderate";
  if (e <= 8) return "effort_zone_hard";
  return "effort_zone_max";
});
const hasBottomSection = computed(() => {
  const a = activity.value;
  if (!a) return false;
  return !!(a.perceived_effort || a.tags?.length || a.private_observations);
});

/// LIFE CYCLES
onMounted(async () => {
  eventBus.on("BACK_BUTTON", backButton);
  await load();

  if (activity.value?.is_own || Boolean(myTag.value)) {
    eventBus.on("TAKE_SCREENSHOT", screenshot);
  }
});

onBeforeUnmount(() => {
  eventBus.off("BACK_BUTTON", backButton);
  eventBus.off("TAKE_SCREENSHOT", screenshot);
  cancelSharePrewarm();
});

/// METHODS
const formatPaceSeconds = (seconds: number) => RunningMetricsService.formatPace(seconds);
const screenshot = () => {
  if (!showShareFlow.value) showShareSheet.value = true;
};

const load = async () => {
  try {
    loading.value = true;
    error.value = false;
    const result = await activitiesStore.GET_ACTIVITY(_id.value);

    if (result) {
      activity.value = result;
      if (result.show_premium_sheet) showPremiumConversionSheet.value = true;

      // Warm up the share flow (fonts, html2canvas, CDN images) while the user is
      // still looking at the activity, so opening "Compartilhar" has nothing to wait on
      if (result.is_own || Boolean(myTag.value)) scheduleSharePrewarm(result);
    } else {
      error.value = true;
    }
  } catch {
    ///
  } finally {
    loading.value = false;
  }
};

const shareActivity = () => {
  if (!activity.value) return;

  if (activity.value.is_own || Boolean(myTag.value)) {
    showShareFlow.value = true;
  } else {
    shareLink();
  }
};

const shareLink = async () => {
  if (!activity.value) return;

  await Share.share({
    title: activity.value.workout_title || activity.value.title || typeLabel.value,
    url: `${import.meta.env.VITE_URL_ACTIVITY_SHARE}${activity.value._id}`,
    dialogTitle: t("$vuetify.label.share_activity"),
  });
};

const navigateToProfile = () => {
  if (!activity.value) return;

  if (activity.value.is_own) {
    router.push({ name: "dashboard", query: { tab: "account", list: "activities" } });
  } else {
    router.push({ name: "profile", params: { _id: activity.value.account._id } });
  }
};

const openEdit = () => {
  if (!activity.value) return;
  router.push({ name: "activity-edit", params: { _id: activity.value._id } });
};

const untagMyself = async () => {
  if (!myTag.value) return;

  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await activitiesStore.PATCH(`tags/${myTag.value.tag_id}`, { status: "REJECTED" });

    if (!response.error) back();
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const backButton = () => {
  if (showShareFlow.value) {
    showShareFlow.value = false;
    return;
  }

  back();
};

const back = () => {
  eventBus.emit("BACK_ROUTER");
};
</script>

<style lang="sass" scoped>
.primary-metric
  text-align: center

.primary-metric-value
  font-size: 1.6rem
  font-weight: 800
  line-height: 1
  letter-spacing: -0.02em

.primary-metric-unit
  font-size: 0.85rem
  font-weight: 400
  margin-left: 2px

.primary-metric-label
  font-size: 0.68rem
  text-transform: uppercase
  letter-spacing: 0.06em
  margin-top: 4px

.primary-metric-divider
  width: 1px
  height: 40px
  background: var(--tertiary)
  align-self: center

// Secondary metrics grid (2-col)
.secondary-metric
  width: 50%
  padding: 8px 0

.secondary-metric-value
  font-size: 1.15rem
  font-weight: 700
  line-height: 1.2

.secondary-metric-unit
  font-size: 0.75rem
  font-weight: 400
  margin-left: 2px

.secondary-metric-label
  font-size: 0.68rem
  text-transform: uppercase
  letter-spacing: 0.04em
  margin-top: 2px

// Files horizontal scroll
.files-container
  display: flex
  gap: 8px
  overflow-x: auto
  -webkit-overflow-scrolling: touch
  padding: 0 16px 4px 16px
  flex-wrap: nowrap

  &::-webkit-scrollbar
    display: none

.file-item
  flex-shrink: 0
  height: 150px
  width: auto

.file-img
  height: 150px
  width: auto
  object-fit: cover
  cursor: pointer
  border-radius: 8px

// Thick section separator
.section-break
  height: 8px
  background: #000000
  border-top: 1px solid var(--tertiary)
  border-bottom: 1px solid var(--tertiary)
  flex-shrink: 0

// Stats rows below charts
.stats-list
  border-top: 1px solid var(--tertiary)

.stats-row
  display: flex
  justify-content: space-between
  align-items: center
  padding: 10px 0
  border-bottom: 1px solid var(--tertiary)

  &:last-child
    border-bottom: none

// Zen Insights card
.insight-card
  background: rgba(72, 242, 109, 0.07)

// Effort bar
.effort-bar
  display: flex
  gap: 3px

.effort-segment
  flex: 1
  height: 5px
  background: rgba(255, 255, 255, 0.10)
  border-radius: 2px
  transition: background 0.2s ease

.effort-segment--active
  opacity: 0.85

// Share carousel slide-up transition
.slide-up-enter-active,
.slide-up-leave-active
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)

.slide-up-enter-from,
.slide-up-leave-to
  transform: translateY(100%)
</style>