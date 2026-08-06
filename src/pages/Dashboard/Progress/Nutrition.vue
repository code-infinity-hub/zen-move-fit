<template>
  <div class="d-flex flex-column w-100 h-100">
    <!-- SEM ASSINATURA -->
    <template v-if="!accountsStore.isSubscriber">
      <div class="mb-7 px-5 py-5 border-sm border-primary border-opacity-100 rounded-xl d-flex flex-column bg-theme-primary-background-10">
        <div class="mb-4">
          <div class="size-3rem bg-theme-primary-15 rounded-lg d-flex justify-center align-center">
            <v-icon color="primary" :size="25">
              mdi-food-apple-outline
            </v-icon>
          </div>
        </div>

        <p class="font-weight-bold text-h6 font-space-grotesk mb-2">
          {{ t("$vuetify.label.personalized_nutrition") }}
        </p>

        <p class="text-body-2 text-grey-lighten-1">
          {{ t("$vuetify.message.personalized_nutrition") }}
        </p>
      </div>

      <div class="mb-5 px-4 py-4 rounded-xl d-flex flex-column bg-quintet border-sextet">
        <p class="font-weight-bold font-space-grotesk mb-3">
          {{ `${t("$vuetify.message.what_you_unlock")}:` }}
        </p>

        <div class="d-flex flex-column ga-2">
          <div
            v-for="(item, i) in unlockItems"
            :key="i"
            class="pa-3 rounded-lg d-flex align-center ga-3 bg-tertiary"
          >
            <div class="size-2-2rem rounded-lg bg-theme-primary-15 d-flex justify-center align-center">
              <v-icon color="primary" :size="18">
                {{ item.icon }}
              </v-icon>
            </div>

            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>

      <div class="px-4 py-4 rounded-xl d-flex flex-column bg-quintet border-sextet mb-5">
        <p class="font-weight-bold font-space-grotesk mb-3">
          {{ `${t("$vuetify.label.example_of_a_meal")}:` }}
        </p>

        <div class="px-3 py-3 rounded-lg bg-tertiary position-relative">
          <div
            class="position-relative"
            :style="{ filter: 'blur(2px)' }"
          >
            <p class="text-body-2 text-uppercase font-weight-bold text-primary font-space-grotesk mb-1">
              {{ t("$vuetify.label.lunch") }}
            </p>

            <p class="text-body-2 font-space-grotesk mb-2">
              {{ t("$vuetify.label.grilled_chicken_with_sweet_potato") }}
            </p>

            <div class="d-flex ga-3">
              <div class="d-flex ga-1 align-center">
                <v-icon
                  :size="20"
                  color="error"
                >mdi-fire</v-icon>

                <span class="text-caption">
                  {{ `${formatNumber(450)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                </span>
              </div>

              <span class="text-grey-darken-1">
                •
              </span>

              <div class="d-flex ga-1 align-center">
                <v-icon
                  :size="20"
                  color="blue"
                >mdi-food-drumstick</v-icon>

                <span class="text-caption">
                  {{ `${formatNumber(42)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>
              </div>

              <span class="text-grey-darken-1">
                •
              </span>

              <div class="d-flex ga-1 align-center">
                <v-icon
                  :size="20"
                  color="yellow"
                >mdi-bread-slice</v-icon>

                <span class="text-caption">
                  {{ `${formatNumber(38)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>
              </div>
            </div>
          </div>

          <div class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg d-flex justify-center align-center">
            <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center border-md border-opacity-100">
              <v-icon :size="20" color="grey-lighten-1">
                mdi-lock-outline
              </v-icon>
            </div>
          </div>
        </div>
      </div>

      <v-btn
        color="primary"
        class="text-none text-h6 px-6 py-7 d-flex font-weight-bold mb-5"
        @click="eventBus.emit('START_SUBSCRIPTION')"
      >{{ offersStore.cta_subscription }}</v-btn>

      <div
        v-if="account.guarantee_activated"
        class="mb-3 pa-3 rounded-xl d-flex align-center ga-4 border-sm border-primary border-opacity-100 bg-theme-primary-15"
      >
        <div class="d-flex justify-center align-center">
          <v-icon color="primary" :size="30">
            mdi-shield-check-outline
          </v-icon>
        </div>

        <div class="text-left">
          <p class="font-weight-bold font-space-grotesk mb-1">
            {{ t("$vuetify.label.s7_day_guarantee") }}
          </p>

          <p
            class="text-caption text-grey-lighten-1"
            :style="{ whiteSpace: 'normal' }"
          >{{ t("$vuetify.message.well_give_you_a_100_refund_if_youre_not_satisfied_cancel_anytime") }}</p>
        </div>
      </div>
    </template>

    <!-- PREPARANDO PLANO -->
    <template v-else-if="account.preparing_plan">
      <CreatingPlan class="py-0" />
    </template>

    <!-- PREPARAR PLANO -->
    <template v-else-if="!account.plan.status">
      <div class="mb-5 px-5 py-5 border-sm border-primary border-opacity-100 rounded-xl d-flex flex-column align-center justify-center bg-theme-primary-background-10">
        <div class="mb-4">
          <div class="size-3-5rem bg-primary rounded-lg d-flex justify-center align-center">
            <v-icon color="black" :size="35">
              mdi-star-four-points-outline
            </v-icon>
          </div>
        </div>

        <p class="font-weight-bold text-h6 font-space-grotesk mb-2 text-center">
          {{ t("$vuetify.message.lets_build_your_plan") }}
        </p>

        <p class="text-body-2 text-grey-lighten-1 text-center">
          {{ t("$vuetify.message.lets_build_your_plan_message") }}
        </p>
      </div>

      <div
        class="px-5 py-5 mb-5 rounded-xl bg-quintet border-sextet text-body-2 font-space-grotesk"
        v-html="t('$vuetify.message.complete_plan_with_personalized_workouts_nutrition_and_goals_to_suit_your_objective')"
      ></div>

      <div class="px-4 py-4 rounded-xl d-flex flex-column bg-quintet border-sextet mb-5">
        <p class="font-weight-bold font-space-grotesk mb-3">
          {{ `${t("$vuetify.label.includes")}:` }}
        </p>

        <div class="d-flex flex-column ga-2">
          <div
            v-for="(item, i) in includedItemsGeneratePlan"
            :key="i"
            class="px-3 py-3 rounded-lg d-flex align-center ga-3 bg-tertiary"
          >
            <div class="size-2-2rem rounded-lg bg-theme-primary-15 d-flex justify-center align-center">
              <v-icon color="primary" :size="18">
                {{ item.icon }}
              </v-icon>
            </div>

            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>

      <v-btn
        color="primary"
        class="text-none px-6 py-7 text-h6 d-flex align-center justify-center font-weight-bold mb-3"
        @click="eventBus.emit('CREATE_PLAN')"
      >
        <span>
          {{ t("$vuetify.label.create_my_plan_now") }}
        </span>

        <v-icon class="ml-2">mdi-arrow-right-thin</v-icon>
      </v-btn>

      <div class="d-flex justify-center align-center ga-2 text-caption text-grey-lighten-1 mb-3">
        <v-icon :size="18">
          mdi-clock-outline
        </v-icon>

        {{ t("$vuetify.message.it_takes_less_than_1_minute") }}
      </div>
    </template>

    <!-- PLANO CRIADO -->
    <template v-else>
      <div
        v-if="loading || !currentMeal"
        class="w-100 h-100 d-flex justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="50"
        />
      </div>
      <template v-else-if="plan && currentMeal">
        <div class="px-3 py-4 mb-4 rounded-xl d-flex bg-quintet border-sextet">
          <div class="d-flex justify-center align-center">
            <v-btn
              :disabled="previousMealDisabled"
              :style="{ visibility: previousMealDisabled ? 'hidden' : 'visible' }"
              icon=""
              color="transparent"
              size="small"
              @click="previousMeal"
            >
              <v-icon
                :size="25"
                color="grey-lighten-1"
              >mdi-chevron-left</v-icon>
            </v-btn>
          </div>

          <div class="flex-fill d-flex flex-column justify-center">
            <p
              v-if="dateLabel"
              class="text-center font-weight-bold font-space-grotesk"
            >{{ dateLabel }}</p>

            <p
              :class="{
                'text-center': true,
                'text-caption text-grey-lighten-1': Boolean(dateLabel),
                'font-weight-bold font-space-grotesk': !Boolean(dateLabel)
              }"
            >{{ dateFormatted }}</p>
          </div>

          <div class="d-flex justify-center align-center">
            <v-btn
              :disabled="nextMealDisabled"
              :style="{ visibility: nextMealDisabled ? 'hidden' : 'visible' }"
              icon=""
              color="transparent"
              size="small"
              @click="nextMeal"
            >
              <v-icon
                :size="25"
                color="grey-lighten-1"
              >mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>

        <v-chip
          v-if="getCaloriesStatus && date === dateToday"
          size="large"
          variant="tonal"
          :color="getCaloriesStatus.color"
          :class="[
            'mb-4 rounded-xl d-flex border-sm border-opacity-100',
            `border-${getCaloriesStatus.color}`
          ]"
        >
          <v-icon class="mr-2">
            {{ getCaloriesStatus.icon }}
          </v-icon>

          {{ getCaloriesStatus.label }}
        </v-chip>

        <div class="px-3 py-4 mb-4 rounded-xl d-flex flex-column bg-quintet border-sextet">
          <p class="mb-4 d-flex align-center ga-2 text-body-2">
            <v-icon color="primary">
              mdi-food-apple-outline
            </v-icon>

            <span class="font-weight-bold font-space-grotesk">
              {{ t("$vuetify.label.summary_of_the_day") }}
            </span>
          </p>

          <div class="d-flex flex-column">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-grey-lighten-1">
                {{ t("$vuetify.label.calories") }}
              </span>

              <span class="text-caption font-weight-bold">
                {{
                  `${formatNumber(currentMeal.informative.consumed_calories)} / ${formatNumber(currentMeal.informative.total_calories)} ${t("$vuetify.label.kcal_abbreviation")}`
                }}
              </span>
            </div>

            <div
              :style="{ height: '1rem' }"
              class="rounded-lg bg-secondary mb-3"
            >
              <div
                :style="{ width: `${currentMeal.informative.percentage_calories}%` }"
                class="bg-primary h-100 rounded-lg"
              ></div>
            </div>

            <div class="d-flex ga-2">
              <div
                :style="{ width: 'calc(100% / 3)' }"
                class="rounded-lg pa-2 bg-tertiary d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-blue">
                  {{ `${formatNumber(currentMeal.informative.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.protein") }}
                </span>
              </div>

              <div
                :style="{ width: 'calc(100% / 3)' }"
                class="flex-fill rounded-lg pa-2 bg-tertiary d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-yellow">
                  {{ `${formatNumber(currentMeal.informative.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.carbohydrate") }}
                </span>
              </div>

              <div
                :style="{ width: 'calc(100% / 3)' }"
                class="flex-fill rounded-lg pa-2 bg-tertiary d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-error">
                  {{ `${formatNumber(currentMeal.informative.nutrition.fat)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.fat") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="date === dateToday && currentMeal.meals.length !== historical.length"
          class="mb-4 d-flex justify-center ga-2"
        >
          <div
            v-ripple
            class="bg-quintet border-sextet d-flex justify-center align-center ga-2 px-2 rounded-lg flex-fill"
            :style="{ height: '4rem' }"
            @click="bottomSheet.register = true"
          >
            <div>
              <div class="size-2-5rem rounded-lg bg-primary d-flex justify-center align-center">
                <v-icon :size="22">
                  mdi-plus
                </v-icon>
              </div>
            </div>

            <div class="flex-fill d-flex flex-column align-start ga-1">
              <p class="font-weight-bold font-space-grotesk">
                {{ t("$vuetify.label.register") }}
              </p>

              <p
                class="text-grey-lighten-1 text-left"
                :style="{ fontSize: '0.6rem', whiteSpace: 'normal' }"
              >{{ t("$vuetify.label.add_meal") }}</p>
            </div>
          </div>

          <div
            v-ripple
            class="bg-quintet border-sextet d-flex justify-center align-center ga-2 px-2 rounded-lg flex-fill"
            :style="{ height: '4rem' }"
            @click="bottomSheet.analyze = true"
          >
            <div>
              <div class="size-2-5rem rounded-lg bg-sextet d-flex justify-center align-center">
                <v-icon :size="22" color="grey-lighten-1">
                  mdi-camera-outline
                </v-icon>
              </div>
            </div>

            <div class="flex-fill d-flex flex-column align-start ga-1">
              <p class="font-weight-bold font-space-grotesk">
                {{ t("$vuetify.label.register") }}
              </p>

              <p
                class="text-grey-lighten-1 text-left"
                :style="{ fontSize: '0.6rem', whiteSpace: 'normal' }"
              >{{ t("$vuetify.label.add_meal") }}</p>
            </div>
          </div>
        </div>

        <div class="px-4 py-4 rounded-xl d-flex flex-column bg-quintet border-sextet mb-5">
          <p class="font-weight-bold font-space-grotesk mb-3">
            {{ `${t("$vuetify.label.suggested_meal_plan")}:` }}
          </p>

          <div class="d-flex flex-column ga-3">
            <div
              v-for="meal in currentMeal.meals"
              v-ripple="meal.status !== 'DONE'"
              :key="meal.snack_id"
              class="bg-tertiary position-relative rounded-lg"
              @click="meal.status === 'PENDING' ? selectMeal(meal) : null"
            >
              <div class="px-3 py-3 d-flex ga-1">
                <div class="flex-fill text-left d-flex flex-column justify-center">
                  <div class="d-flex justify-space-between mb-1">
                    <span
                      :class="[
                        'text-body-2 text-uppercase font-weight-bold text-primary font-space-grotesk',
                        meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                      ]"
                    >{{ t(`$vuetify.label.${meal.type}`) }}</span>

                    <span
                      :class="[
                        'text-caption text-grey-lighten-1',
                        meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                      ]"
                    >{{ meal.time }}</span>
                  </div>

                  <p
                    :class="[
                      'text-body-2 font-space-grotesk mb-2',
                      meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                    ]"
                    :style="{ whiteSpace: 'normal' }"
                  >{{ meal.name }}</p>

                  <div class="d-flex ga-3">
                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="error"
                      >mdi-fire</v-icon>

                      <span
                        :class="[
                          'text-caption',
                          meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                        ]"
                      >
                        {{ `${formatNumber(meal.nutrition.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                      </span>
                    </div>

                    <span class="text-grey-darken-1">
                      •
                    </span>

                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="blue"
                      >mdi-food-drumstick</v-icon>

                      <span
                        :class="[
                          'text-caption',
                          meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                        ]"
                      >
                        {{ `${formatNumber(meal.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
                      </span>
                    </div>

                    <span class="text-grey-darken-1">
                      •
                    </span>

                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="yellow"
                      >mdi-bread-slice</v-icon>

                      <span
                        :class="[
                          'text-caption',
                          meal.status === 'DONE' ? 'text-decoration-line-through' : ''
                        ]"
                      >
                        {{ `${formatNumber(meal.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-center align-center">
                  <v-icon :size="30" color="grey-lighten-1">
                    mdi-chevron-right
                  </v-icon>
                </div>
              </div>

              <div
                v-if="Boolean(meal.done_at)"
                :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
                class="position-absolute top-0 left-0 right-0 bottom-0 rounded-lg"
              ></div>
            </div>
          </div>
        </div>

        <div
          v-if="historical.length"
          class="px-4 py-4 rounded-xl d-flex flex-column bg-quintet border-sextet mb-5"
        >
          <p class="font-weight-bold font-space-grotesk mb-3">
            {{ `${t("$vuetify.label.meals_recorded")}:` }}
          </p>

          <div class="d-flex flex-column ga-3">
            <div
              v-ripple
              v-for="meal in historical"
              :key="meal._id"
              class="bg-tertiary rounded-lg"
              @click="viewRecordedMeal(meal)"
            >
              <div class="px-3 py-3 d-flex ga-1">
                <div class="flex-fill text-left d-flex flex-column justify-center">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="text-body-2 text-uppercase font-weight-bold text-primary font-space-grotesk">
                      {{ t(`$vuetify.label.${meal.type}`) }}
                    </span>
                  </div>

                  <p
                    class="text-body-2 font-space-grotesk mb-2"
                    :style="{ whiteSpace: 'normal' }"
                  >{{ meal.name }}</p>

                  <div class="d-flex ga-3">
                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="error"
                      >mdi-fire</v-icon>

                      <span class="text-caption">
                        {{ `${formatNumber(meal.nutrition.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                      </span>
                    </div>

                    <span class="text-grey-darken-1">
                      •
                    </span>

                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="blue"
                      >mdi-food-drumstick</v-icon>

                      <span class="text-caption">
                        {{ `${formatNumber(meal.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
                      </span>
                    </div>

                    <span class="text-grey-darken-1">
                      •
                    </span>

                    <div class="d-flex ga-1 align-center">
                      <v-icon
                        :size="20"
                        color="yellow"
                      >mdi-bread-slice</v-icon>

                      <span class="text-caption">
                        {{ `${formatNumber(meal.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-center align-center">
                  <v-icon :size="30" color="grey-lighten-1">
                    mdi-chevron-right
                  </v-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- BOTTOM SHEET DE ANALISAR FOTO -->
    <v-bottom-sheet v-model="bottomSheet.analyze">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.analyze = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5 d-flex flex-column">
          <v-tabs-window v-model="tab" class="flex-fill">
            <v-tabs-window-item>
              <p class="font-weight-bold text-h6 mb-3">
                {{ t("$vuetify.label.analyze_meal") }}
              </p>

              <p class="mb-5 text-grey-lighten-1 text-body-2">
                {{ t("$vuetify.message.select_or_take_a_photo_of_your_meal_for_nutritional_analysis") }}
              </p>

              <v-menu
                v-model="menu"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ props }">
                  <div
                    v-ripple
                    :style="{ height: '10rem' }"
                    class="w-100 rounded-lg bg-tertiary border-md border-dotted border-primary border-opacity-100 text-none"
                    v-bind="props"
                  >
                    <div
                      class="w-100 h-100 rounded-lg d-flex flex-column justify-center align-center"
                      :style="{
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: photo.base64 ? `url(${photo.base64})` : ''
                      }"
                    >
                      <template v-if="!photo.base64">
                        <v-icon :size="35" color="primary">
                          mdi-camera-outline
                        </v-icon>

                        <p class="mt-2 text-center text-none text-primary">
                          {{ t("$vuetify.label.take_a_photo_or_select_from_the_gallery") }}
                        </p>
                      </template>
                    </div>
                  </div>
                </template>

                <List>
                  <v-list-item
                    v-for="(option, i) in options"
                    :key="i"
                  >
                    <v-list-item-title>
                      <div
                        v-ripple
                        class="bg-secondary rounded-lg"
                        @click="option.method"
                      >
                        <div class="pa-2 d-flex align-center ga-3">
                          <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
                            <v-icon :size="25">
                              {{ option.icon }}
                            </v-icon>
                          </div>

                          <span class="text-h6">
                            {{ option.text }}
                          </span>
                        </div>
                      </div>
                    </v-list-item-title>
                  </v-list-item>
                </List>
              </v-menu>

              <v-btn
                v-if="photo.base64"
                block
                color="primary"
                class="font-weight-bold text-none pa-6 mt-4"
                @click="analyzeMeal"
              >
                <v-icon class="mr-1">mdi-star-four-points-outline</v-icon>
                {{ t("$vuetify.label.analyze_meal") }}
              </v-btn>
            </v-tabs-window-item>

            <v-tabs-window-item>
              <p
                class="font-weight-bold font-space-grotesk text-h6 mb-4"
                :style="{ lineHeight: '1.5rem' }"
              >{{ analyzeResult.name }}</p>

              <div class="d-flex ga-2 mb-2">
                <div
                  :style="{ width: 'calc(100% / 2)' }"
                  class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
                >
                  <span class="font-weight-bold text-orange text-center">
                    {{ `${formatNumber(analyzeResult.nutrition.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                  </span>

                  <span class="text-caption text-grey-lighten-1 text-center">
                    {{ t("$vuetify.label.calories") }}
                  </span>
                </div>

                <div
                  :style="{ width: 'calc(100% / 2)' }"
                  class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
                >
                  <span class="font-weight-bold text-blue text-center">
                    {{ `${formatNumber(analyzeResult.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
                  </span>

                  <span class="text-caption text-grey-lighten-1 text-center">
                    {{ t("$vuetify.label.protein") }}
                  </span>
                </div>
              </div>

              <div class="d-flex ga-2 mb-6">
                <div
                  :style="{ width: 'calc(100% / 2)' }"
                  class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
                >
                  <span class="font-weight-bold text-yellow text-center">
                    {{ `${formatNumber(analyzeResult.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
                  </span>

                  <span class="text-caption text-grey-lighten-1 text-center">
                    {{ t("$vuetify.label.carbohydrate") }}
                  </span>
                </div>

                <div
                  :style="{ width: 'calc(100% / 2)' }"
                  class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
                >
                  <span class="font-weight-bold text-error text-center">
                    {{ `${formatNumber(analyzeResult.nutrition.fat)} ${t("$vuetify.label.grams_abbreviation")}` }}
                  </span>

                  <span class="text-caption text-grey-lighten-1 text-center">
                    {{ t("$vuetify.label.fat") }}
                  </span>
                </div>
              </div>

              <v-btn
                block
                color="primary"
                class="font-weight-bold text-none pa-6 mt-6"
                @click="registerCustomMeal"
              >
                <v-icon class="mr-1">mdi-check</v-icon>
                {{ t("$vuetify.label.record_this_meal") }}
              </v-btn>
            </v-tabs-window-item>

            <v-tabs-window-item></v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE COMIDA SELECIONADA -->
    <v-bottom-sheet v-model="bottomSheet.selected_meal">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.selected_meal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card v-if="selectedMeal">
        <v-card-text class="py-5 d-flex flex-column overflow-hidden">
          <div class="flex-fill d-flex flex-column overflow-y-auto">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-uppercase font-weight-bold text-primary font-space-grotesk">
                {{ t(`$vuetify.label.${selectedMeal.type}`) }}
              </span>

              <span class="text-caption text-grey-lighten-1">
                {{ selectedMeal.time }}
              </span>
            </div>

            <p
              class="font-weight-bold font-space-grotesk text-h6 mb-4"
              :style="{ lineHeight: '1.5rem' }"
            >{{ selectedMeal.name }}</p>

            <div class="d-flex ga-2 mb-2">
              <div
                :style="{ width: 'calc(100% / 2)' }"
                class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-orange text-center">
                  {{ `${formatNumber(selectedMeal.nutrition.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.calories") }}
                </span>
              </div>

              <div
                :style="{ width: 'calc(100% / 2)' }"
                class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-blue text-center">
                  {{ `${formatNumber(selectedMeal.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.protein") }}
                </span>
              </div>
            </div>

            <div class="d-flex ga-2 mb-4">
              <div
                :style="{ width: 'calc(100% / 2)' }"
                class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-yellow text-center">
                  {{ `${formatNumber(selectedMeal.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.carbohydrate") }}
                </span>
              </div>

              <div
                :style="{ width: 'calc(100% / 2)' }"
                class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
              >
                <span class="font-weight-bold text-error text-center">
                  {{ `${formatNumber(selectedMeal.nutrition.fat)} ${t("$vuetify.label.grams_abbreviation")}` }}
                </span>

                <span class="text-caption text-grey-lighten-1 text-center">
                  {{ t("$vuetify.label.fat") }}
                </span>
              </div>
            </div>

            <div class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column mb-4">
              <p class="font-weight-bold mb-3">
                {{ `${t("$vuetify.label.ingredients")}:` }}
              </p>

              <div class="d-flex flex-column ga-2">
                <p
                  v-for="(ingredient, i) in selectedMeal.ingredients"
                  :key="`ingredient_${i}`"
                  class="d-flex ga-3"
                >
                  <span class="font-weight-bold text-primary">
                    •
                  </span>

                  {{ `${ingredient}${(i + 1) === selectedMeal.ingredients.length ? "." : ";"}` }}
                </p>
              </div>
            </div>

            <div class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column mb-4">
              <p class="font-weight-bold mb-3">
                {{ `${t("$vuetify.label.preparation_method")}:` }}
              </p>

              <div class="d-flex flex-column ga-3">
                <div
                  v-for="(step, i) in selectedMeal.steps"
                  :key="`step_${i}`"
                  class="d-flex ga-3 align-center"
                >
                  <div>
                    <div class="size-2rem rounded-circle bg-theme-primary-15 d-flex justify-center align-center font-weight-bold text-primary">
                      {{ i + 1 }}
                    </div>
                  </div>

                  {{ step }}
                </div>
              </div>
            </div>
          </div>

          <v-btn
            block
            variant="tonal"
            color="primary"
            class="font-weight-bold text-none pa-6 mb-3 mt-4"
            @click="openSimilar"
          >
            <v-icon class="mr-2">mdi-launch</v-icon>
            {{ t("$vuetify.label.view_similar_recipes") }}
          </v-btn>

          <v-btn
            v-if="date === dateToday"
            block
            color="primary"
            class="font-weight-bold text-none pa-6"
            @click="registerMeal"
          >{{ t("$vuetify.label.register_meal") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE REGISTRAR REFEIÇÃO -->
    <v-bottom-sheet v-model="bottomSheet.register">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.register = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5 d-flex flex-column overflow-hidden">
          <v-form
            ref="form"
            class="flex-fill overflow-x-hidden overflow-y-auto"
            @submit.prevent="saveMeal"
          >
            <p class="font-weight-bold text-h6 mb-3">
              {{ t("$vuetify.label.new_meal") }}
            </p>

            <TextField
              required
              class="mb-5"
              :label="t('$vuetify.label.name')"
              :disabled="disabled"
              v-model="body.name"
            />

            <ItemSelect
              required
              class="mb-5"
              :disabled="disabled"
              :label="t('$vuetify.label.type')"
              :items="types"
              v-model="body.type"
            />

            <TextareaField
              no-resize
              :label="t('$vuetify.label.description')"
              class="mb-5"
              v-model="body.description"
            />

            <v-row class="mb-5">
              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  required
                  is-money
                  hide-symbol
                  :disabled="disabled"
                  :label="t('$vuetify.label.calories')"
                  :rules="[() => body.nutrition.calories > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                  v-model="body.nutrition.calories"
                />
              </v-col>

              <v-col cols="6" sm="6" md="6" lg="6" class="pb-0">
                <TextField
                  required
                  is-money
                  hide-symbol
                  :disabled="disabled"
                  :label="t('$vuetify.label.protein')"
                  :rules="[() => body.nutrition.protein > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                  v-model="body.nutrition.protein"
                />
              </v-col>
            </v-row>

            <v-row class="mb-5">
              <v-col cols="6" sm="6" md="6" lg="6" class="py-0">
                <TextField
                  required
                  is-money
                  hide-symbol
                  :disabled="disabled"
                  :label="t('$vuetify.label.carbohydrate')"
                  :rules="[() => body.nutrition.carbs > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                  v-model="body.nutrition.carbs"
                />
              </v-col>

              <v-col cols="6" sm="6" md="6" lg="6" class="py-0">
                <TextField
                  required
                  is-money
                  hide-symbol
                  :disabled="disabled"
                  :label="t('$vuetify.label.fat')"
                  :rules="[() => body.nutrition.fat > 0 || t('$vuetify.errors.the_value_must_be_greater_that', 0)]"
                  v-model="body.nutrition.fat"
                />
              </v-col>
            </v-row>

            <input type="submit" v-show="false" />
          </v-form>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-6 mt-2"
            @click="saveMeal"
          >{{ t("$vuetify.label.record_this_meal") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE REFEIÇÃO REGISTRADA -->
    <v-bottom-sheet v-model="bottomSheet.historical_meal">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.historical_meal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card v-if="historicalMealSelected">
        <v-card-text class="py-5 d-flex flex-column">
          <p class="text-caption text-grey-lighten-1 mb-2">
            {{ t(`$vuetify.label.created_by_${historicalMealSelected.creation_method.toLowerCase()}`) }}
          </p>

          <p class="text-body-2 text-uppercase font-weight-bold text-primary font-space-grotesk mb-2">
            {{ t(`$vuetify.label.${historicalMealSelected.type}`) }}
          </p>

          <p
            class="font-weight-bold font-space-grotesk text-h6 mb-3"
            :style="{ lineHeight: '1.5rem' }"
          >{{ historicalMealSelected.name }}</p>

          <p
            v-if="historicalMealSelected.description"
            class="text-body-2 text-grey-lighten-1 mb-3"
            :style="{ lineHeight: '1.5rem' }"
          >{{ historicalMealSelected.description }}</p>

          <div
            v-if="historicalMealSelected.creation_method === 'PHOTO'"
            class="rounded-lg mb-4 border-sm border-primary border-opacity-100"
            :style="{ height: '12rem', backgroundImage: `url(${historicalMealSelected.url_photo})`, backgroundPosition: 'center', backgroundSize: 'cover' }"
          ></div>

          <div class="d-flex ga-2 mb-2">
            <div
              :style="{ width: 'calc(100% / 2)' }"
              class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
            >
              <span class="font-weight-bold text-orange text-center">
                {{ `${formatNumber(historicalMealSelected.nutrition.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
              </span>

              <span class="text-caption text-grey-lighten-1 text-center">
                {{ t("$vuetify.label.calories") }}
              </span>
            </div>

            <div
              :style="{ width: 'calc(100% / 2)' }"
              class="rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
            >
              <span class="font-weight-bold text-blue text-center">
                {{ `${formatNumber(historicalMealSelected.nutrition.protein)} ${t("$vuetify.label.grams_abbreviation")}` }}
              </span>

              <span class="text-caption text-grey-lighten-1 text-center">
                {{ t("$vuetify.label.protein") }}
              </span>
            </div>
          </div>

          <div class="d-flex ga-2 mb-4">
            <div
              :style="{ width: 'calc(100% / 2)' }"
              class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
            >
              <span class="font-weight-bold text-yellow text-center">
                {{ `${formatNumber(historicalMealSelected.nutrition.carbs)} ${t("$vuetify.label.grams_abbreviation")}` }}
              </span>

              <span class="text-caption text-grey-lighten-1 text-center">
                {{ t("$vuetify.label.carbohydrate") }}
              </span>
            </div>

            <div
              :style="{ width: 'calc(100% / 2)' }"
              class="flex-fill rounded-lg pa-2 bg-quintet border-sextet d-flex flex-column align-center ga-1"
            >
              <span class="font-weight-bold text-error text-center">
                {{ `${formatNumber(historicalMealSelected.nutrition.fat)} ${t("$vuetify.label.grams_abbreviation")}` }}
              </span>

              <span class="text-caption text-grey-lighten-1 text-center">
                {{ t("$vuetify.label.fat") }}
              </span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { useLocale } from "vuetify";
import { useAccountsStore } from "@/stores/accounts";
import { useOffersStore } from "@/stores/offers";
import { usePlansStore } from "@/stores/plans";
import { useFormatNumber, useWebView } from "@/composables";
import { eventBus } from "@/eventBus";
import { MediaService } from "@/services/media.service";
import { useForm } from "@/composables";
import type { Plan, PlanMeal } from "@/types/plan.type";

/// COMPONENTS
import CreatingPlan from "@/components/CreatingPlan.vue";
import List from "@/components/List.vue";

/// DATA
const { t } = useLocale();
const { formatNumber } = useFormatNumber();
const { open } = useWebView();
const { validate } = useForm();
const accountsStore = useAccountsStore();
const offersStore = useOffersStore();
const plansStore = usePlansStore();
const loading = ref(true);

const plan = ref<Plan>();

const date = ref(dayjs().format("YYYY-MM-DD"));

const meals = reactive<Record<string, PlanMeal>>({ });

const selectedMeal = ref<PlanMeal["meals"][number]>();

const bottomSheet = reactive({
  register: false,
  analyze: false,
  selected_meal: false,
  historical_meal: false,
});

const mediaService = new MediaService();
const tab = ref(0);
const menu = ref(false);
const photo = reactive({ base64: "", format: "", mimetype: "" });
const analyzeResult = ref({
  name: "",
  description: "",
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }
});
const urlPhoto = ref("");

const form = ref();
const mealType = ref<"AI" | "PHOTO" | "MANUAL">("MANUAL");
const body = reactive({
  name: "",
  type: "",
  description: "",
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }
});

const disabled = ref(false);

const historicalMealSelected = ref<PlanMeal["historical"][number]>();

/// COMPUTED
const account = computed(() => accountsStore.account);
const dateToday = computed(() => dayjs().format("YYYY-MM-DD"));
const currentMeal = computed(() => meals[date.value]);
const dateFormatted = computed(() =>dayjs(date.value).format(t("$vuetify.label.date_format")));
const previousMealDisabled = computed(() => {
  if (loading.value === true) return true;
  if (plan.value?.preferences.food.date_start === date.value) return true;
  return false;
});
const nextMealDisabled = computed(() => {
  if (loading.value === true) return true;
  if (plan.value?.preferences.food.date_end === date.value) return true;
  return false;
});
const dateLabel = computed(() => {
  const today = dateToday.value;
  if (date.value === today) return t("$vuetify.label.today");
  if (date.value === dayjs(today).subtract(1, "day").format("YYYY-MM-DD")) return t("$vuetify.label.yesterday");
  if (date.value === dayjs(today).subtract(2, "day").format("YYYY-MM-DD")) return t("$vuetify.label.day_before_yesterday");
  if (date.value === dayjs(today).add(1, "day").format("YYYY-MM-DD")) return t("$vuetify.label.tomorrow");
  return "";
});
const getCaloriesStatus = computed(() => {
  if (!currentMeal.value) return null;
  const percentage = (currentMeal.value.informative.consumed_calories / currentMeal.value.informative.total_calories) * 100;

  if (percentage <= 35) {
    return {
      label: t("$vuetify.message.low_consumption_today"),
      color: "blue",
      icon: "mdi-weather-windy"
    };
  }

  if (percentage <= 80) {
    return {
      label: t("$vuetify.message.as_expected"),
      color: "green",
      icon: "mdi-check-circle"
    };
  }

  if (percentage <= 110) {
    return {
      label: t("$vuetify.message.goal_almost_achieved"),
      color: "yellow",
      icon: "mdi-fire"
    };
  }

  if (percentage <= 130) {
    return {
      label: t("$vuetify.message.above_target"),
      color: "orange",
      icon: "mdi-alert-circle"
    };
  }

  return {
    label: t("$vuetify.message.well_above_target"),
    color: "red",
    icon: "mdi-alert"
  };
});
const unlockItems = computed(() => [
  { text: t("$vuetify.label.personalized_meal_plan"), icon: "mdi-silverware-fork-knife" },
  { text: t("$vuetify.label.calorie_and_macro_control"), icon: "mdi-fire" },
  { text: t("$vuetify.label.intelligent_suggestions_with_ai"), icon: "mdi-robot-outline" },
  { text: t("$vuetify.label.daily_evolution"), icon: "mdi-trending-up" },
]);
const includedItemsGeneratePlan = computed(() => [
  { text: t("$vuetify.label.personalized_training"), icon: "mdi-dumbbell" },
  { text: t("$vuetify.label.personalized_meal_plan"), icon: "mdi-silverware-fork-knife" },
  { text: t("$vuetify.label.weekly_goals"), icon: "mdi-bullseye" },
  { text: t("$vuetify.label.monitoring_progress"), icon: "mdi-trending-up" },
]);
const options = computed(() => [
  {
    icon: "mdi-camera-outline",
    text: t("$vuetify.label.take_a_picture"),
    method: takePicture
  },
  {
    icon: "mdi-image-outline",
    text: t("$vuetify.label.select_photo"),
    method: selectPhotos
  },
]);
const types = computed(() => {
  const isDisabled = (type: PlanMeal["meals"][number]["type"]) => {
    return currentMeal.value?.meals?.find((meal) => meal.type === type)?.status === "DONE" || false;
  };

  const food = plan.value?.preferences.food;

  return [
    { title: t("$vuetify.label.breakfast"), value: "breakfast", icon: "mdi-coffee", disabled: isDisabled("breakfast") },
    ...(food?.pre_workout ? [{ title: t("$vuetify.label.pre_workout"), value: "pre_workout", icon: "mdi-lightning-bolt", disabled: isDisabled("pre_workout") }] : []),
    ...(food?.post_workout ? [{ title: t("$vuetify.label.post_workout"), value: "post_workout", icon: "mdi-arm-flex", disabled: isDisabled("post_workout") }] : []),
    { title: t("$vuetify.label.lunch"), value: "lunch", icon: "mdi-silverware-fork-knife", disabled: isDisabled("lunch") },
    { title: t("$vuetify.label.snack"), value: "snack", icon: "mdi-food-apple", disabled: isDisabled("snack") },
    { title: t("$vuetify.label.dinner"), value: "dinner", icon: "mdi-weather-night", disabled: isDisabled("dinner") },
    ...(food?.supper ? [{ title: t("$vuetify.label.supper"), value: "supper", icon: "mdi-bed-outline", disabled: isDisabled("supper") }] : []),
  ];
});
const historical = computed(() => {
  if (!currentMeal.value) return [];

  const order = [
    "breakfast",
    "lunch",
    "snack",
    "dinner",
    "pre_workout",
    "post_workout",
    "supper",
  ];

  const ranking = Object.fromEntries(order.map((type, index) => [type, index]));

  return currentMeal.value.historical.sort((a, b) => {
    return (ranking[a.type as keyof typeof ranking] ?? Infinity) - (ranking[b.type as keyof typeof ranking] ?? Infinity);
  });
});

/// WATCH
watch(date, async () => {
  try {
    loading.value = true;
    eventBus.emit("SET_LOADER", { enabled: true });
    await loadMealsByDate();
  } catch {
    ///
  } finally {
    loading.value = false;
    eventBus.emit("SET_LOADER", { enabled: false });
  }
});

watch(() => account.value.plan_id, async (val, oldVal) => {
  if (!oldVal) {
    loading.value = true;
    await loadData();
    loading.value = false;
  }
});

watch(() => bottomSheet.analyze, (val) => {
  if (!val) {
    tab.value = 0;

    photo.base64 = "";
    photo.format = "";
    photo.mimetype = "";

    analyzeResult.value = {
      name: "",
      description: "",
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    };

    urlPhoto.value = "";
  }
});

watch(() => bottomSheet.register, (val) => {
  if (!val) {
    mealType.value = "MANUAL";

    body.name = "";
    body.type = "";
    body.description = "";
    body.nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    disabled.value = false;
  }
});

/// LIFE CYCLES
onMounted(async () => {
  if (account.value.plan_id) {
    await loadData();
    loading.value = false;
  }
});

/// METHODS
const loadData = async () => {
  const [response] = await Promise.all([
    plansStore.GET(account.value.plan_id),
    loadMealsByDate(),
  ]);
  if (!response.error) plan.value = response.plan;
};

const loadMealsByDate = async (forced = false) => {
  if (meals[date.value] && !forced) return;
  const response = await plansStore.GET(`meals/${date.value}`);
  if (!response.error) meals[date.value] = response.meal_plan;
};

const previousMeal = () => {
  loading.value = true;
  date.value = dayjs(date.value).subtract(1, "day").format("YYYY-MM-DD");
};

const nextMeal = () => {
  loading.value = true;
  date.value = dayjs(date.value).add(1, "day").format("YYYY-MM-DD");
};

const selectMeal = (meal: PlanMeal["meals"][number]) => {
  selectedMeal.value = meal;
  bottomSheet.selected_meal = true;
};

const openSimilar = () => {
  open(`https://www.google.com/search?q=site:tudogostoso.com.br ${selectedMeal.value!.name}`);
};

const registerMeal = () => {
  const selected = selectedMeal.value!;

  mealType.value = "AI";

  body.name = selected.name;
  body.type = selected.type;
  body.nutrition = {
    calories: selected.nutrition.calories,
    protein: selected.nutrition.protein,
    carbs: selected.nutrition.carbs,
    fat: selected.nutrition.fat,
  };

  disabled.value = true;

  bottomSheet.register = true;
};

const takePicture = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });
  try {
    const { base64, format, mimetype } = await mediaService.takePicture();
    photo.base64 = base64;
    photo.format = format;
    photo.mimetype = mimetype;
    menu.value = false;
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const selectPhotos = async () => {
  eventBus.emit("SET_LOADER", { enabled: true });
  try {
    const results = await mediaService.getFiles("Photo", 1);
    const { base64, format, mimetype } = results[0]!;
    photo.base64 = base64;
    photo.format = format;
    photo.mimetype = mimetype;
    menu.value = false;
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const analyzeMeal = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const response = await plansStore.POST("meals/analyze", photo);

    if (!response.error) {
      urlPhoto.value = response.url;

      analyzeResult.value = {
        name: response.name,
        description: response.description,
        nutrition: response.nutrition,
      };

      tab.value = 1;
    }
  } catch {
    ///
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
    accountsStore.GET_ACCOUNT();
  }
};

const registerCustomMeal = async () => {
  mealType.value = "PHOTO";

  body.name = analyzeResult.value.name;
  body.description = analyzeResult.value.description;
  body.nutrition = {
    calories: analyzeResult.value.nutrition.calories,
    protein: analyzeResult.value.nutrition.protein,
    carbs: analyzeResult.value.nutrition.carbs,
    fat: analyzeResult.value.nutrition.fat,
  };

  disabled.value = false;

  bottomSheet.register = true;
};

const saveMeal = async () => {
  const isValid = await validate(form);

  if (isValid) {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      const snack_id = currentMeal.value!.meals.find((meal) => meal.type === body.type)?.snack_id;

      const response = await plansStore.POST("meals", {
        snack_id,
        plan_id: account.value.plan_id,
        meal_plan_id: currentMeal.value!._id,
        date: dateToday.value,
        creation_method: mealType.value,
        url_photo: mealType.value === "PHOTO" ? urlPhoto.value : undefined,
        ...body
      });

      if (!response.error) {
        await loadMealsByDate(true);
        bottomSheet.register = false;
        bottomSheet.analyze = false;
        bottomSheet.selected_meal = false;
      }
    } catch {
      ///
    } finally {
      eventBus.emit("SET_LOADER", { enabled: false });
    }
  }
};

const viewRecordedMeal = (meal: PlanMeal["historical"][number]) => {
  historicalMealSelected.value = meal;
  bottomSheet.historical_meal = true;
};
</script>