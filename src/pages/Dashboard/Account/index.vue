<template>
  <div class="w-100 h-100 overflow-hidden d-flex flex-column">
    <header class="heading border-bottom-tertiary">
      <p
        class="text-h6 font-space-grotesk font-weight-bold"
      >{{ t("$vuetify.menu.account") }}</p>

      <p
        class="text-body-2 text-grey-lighten-1"
      >{{ t("$vuetify.message.manage_your_account") }}</p>
    </header>

    <div class="flex-fill overflow-y-auto px-4 py-3">
      <div class="d-flex ga-4">
        <div class="d-flex justify-center">
          <ProfileImage
            :image="image"
            :name="account.name"
          />
        </div>

        <div class="d-flex flex-column w-100 mb-2">
          <p
            class="font-space-grotesk font-weight-bold mb-1"
            :style="{ fontSize: '1.125rem' }"
          >
            <span>{{ name }}</span>

            <v-icon
              v-if="account.verified"
              color="blue"
              class="ml-1"
              :size="18"
              @click="bottomSheet.verified = true"
            >mdi-shield-check</v-icon>

            <span class="mx-1">
              -
            </span>

            <span
              class="text-grey-lighten-1"
              :style="{ fontSize: '0.8rem' }"
              @click="copy(`@${account.username}`)"
            >{{ `@${account.username}` }}</span>
          </p>

          <p class="text-caption text-yellow-lighten-1 mb-1">
            <v-icon>mdi-flash-outline</v-icon>

            <span>
              {{ `${t("$vuetify.label.level")} ${account.level}` }}
            </span>

            <span class="mx-2">•</span>

            <span>
              {{ t(`$vuetify.levels.${account.classification}`) }}
            </span>
          </p>

          <div class="d-flex align-center ga-2">
            <div
              class="rounded-lg bg-grey-darken-1 w-100"
              :style="{ height: '0.6rem' }"
            >
              <div
                class="bg-primary h-100 rounded-lg"
                :style="{ width: `${Math.min(100, calculatePercentageXp(animatedXp, account.max_xp))}%`, transition: 'width 0.15s linear' }"
              ></div>
            </div>

            <span
              :style="{ fontSize: '10px' }"
              class="text-grey-lighten-1"
            >
              {{ `${formatNumber(Math.round(animatedXp))}/${formatNumber(parseInt(`${account.max_xp}`))}` }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-5 w-100 d-flex ga-2">
        <div
          v-if="account.indication.status"
          v-ripple
          class="px-2 py-3 d-flex ga-3 align-center rounded-lg bg-quintet border-sextet"
          :style="{ flex: '0 0 calc(50% - 4px)', height: '5rem' }"
          @click="bottomSheet.balance = true"
        >
          <div>
            <v-icon color="primary" :size="20">
              mdi-wallet-outline
            </v-icon>
          </div>

          <div class="flex-fill text-left">
            <p
              class="text-grey-lighten-1 mb-1"
              :style="{ fontSize: '11px' }"
            >{{ t("$vuetify.label.available_balance") }}</p>

            <p class="font-weight-bold">
              {{ currency(account.balance.available) }}
            </p>
          </div>
        </div>

        <div
          v-ripple
          class="px-2 py-3 d-flex ga-3 align-center rounded-lg bg-quintet border-sextet"
          :style="{ flex: account.indication.status ? '0 0 calc(50% - 4px)' : '1', height: '5rem' }"
          @click="!accountsStore.isSubscriber ? eventBus.emit('START_SUBSCRIPTION') : bottomSheet.ai = true"
        >
          <div>
            <v-icon color="primary" :size="20">
              mdi-star-four-points-outline
            </v-icon>
          </div>

          <div class="flex-fill text-left">
            <p
              class="text-grey-lighten-1 mb-1"
              :style="{ fontSize: '11px' }"
            >{{ t("$vuetify.label.ia_credits") }}</p>

            <p class="font-weight-bold">
              {{ formatNumber(account.credits.plan + account.credits.purchased) }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-3 w-100 d-flex ga-2">
        <div
          :style="{ width: '25%' }"
          class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
        >
          <p
            class="text-grey-lighten-1 text-center"
            :style="{ fontSize: '11px' }"
          >{{ t("$vuetify.label.weight") }}</p>

          <p class="font-weight-bold text-center">
            {{ formatNumber(account.weight) }}
          </p>
        </div>

        <div
          :style="{ width: '25%' }"
          class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
        >
          <p
            class="text-grey-lighten-1 text-center"
            :style="{ fontSize: '11px' }"
          >{{ t("$vuetify.label.activities") }}</p>

          <p class="font-weight-bold text-center">
            {{ account.historical.activities }}
          </p>
        </div>

        <div
          :style="{ width: '25%' }"
          class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
        >
          <p
            class="text-grey-lighten-1 text-center"
            :style="{ fontSize: '11px' }"
          >{{ t("$vuetify.label.km") }}</p>

          <p class="font-weight-bold text-center">
            {{ formatNumber(account.historical.distances) }}
          </p>
        </div>

        <div
          :style="{ width: '25%' }"
          class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
        >
          <p
            class="text-grey-lighten-1 text-center"
            :style="{ fontSize: '11px' }"
          >{{ t("$vuetify.label.calories") }}</p>

          <p class="font-weight-bold text-center">
            {{ formatNumber(account.historical.calories) }}
          </p>
        </div>
      </div>

      <div
        v-if="!accountsStore.isSubscriber"
        class="mt-3"
      >
        <div
          v-ripple
          class="pa-3 rounded-lg d-flex align-center ga-3 bg-theme-primary-15 border-sm border-primary border-opacity-100"
          @click="eventBus.emit('START_SUBSCRIPTION')"
        >
          <div class="d-flex justify-center align-center">
            <v-icon color="primary" :size="20">
              mdi-crown-outline
            </v-icon>
          </div>

          <div class="text-left">
            <p class="font-weight-bold font-space-grotesk">
              {{ t("$vuetify.label.go_premium") }}
            </p>

            <p
              class="text-caption text-grey-lighten-1"
              :style="{ textWrap: 'wrap', lineHeight: '1rem' }"
            >{{ t("$vuetify.message.unlock_all_features_for_month", currency(priceSubscription)) }}</p>
          </div>
        </div>
      </div>

      <div class="mt-5 w-100 d-flex ga-2 flex-wrap">
        <v-btn
          :class="[
            'rounded-pill text-none text-body-2',
            tab === 0 ? 'text-black font-weight-bold' : ''
          ]"
          :color="tab === 0 ? 'primary' : 'tertiary'"
          @click="tab = 0"
        >{{ t("$vuetify.label.activities") }}</v-btn>

        <v-btn
          :class="[
            'rounded-pill text-none text-body-2',
            tab === 1 ? 'text-black font-weight-bold' : ''
          ]"
          :color="tab === 1 ? 'primary' : 'tertiary'"
          @click="tab = 1"
        >{{ t("$vuetify.label.achievements") }}</v-btn>

        <v-btn
          :class="[
            'rounded-pill text-none text-body-2',
            tab === 2 ? 'text-black font-weight-bold' : ''
          ]"
          :color="tab === 2 ? 'primary' : 'tertiary'"
          @click="tab = 2"
        >{{ t("$vuetify.label.habits") }}</v-btn>
      </div>

      <v-tabs-window v-model="tab" class="mt-5">
        <v-tabs-window-item>
          <div>
            <div
              v-if="!activities?.length"
              class="py-3 d-flex flex-column justify-center align-center"
            >
              <div class="size-4rem rounded-circle d-flex justify-center align-center bg-theme-primary-15 mb-5">
                <v-icon color="primary" :size="35">
                  mdi-package-variant
                </v-icon>
              </div>

              <p class="text-center font-weight-bold font-space-grotesk">
                {{ t("$vuetify.message.no_activities_registered") }}
              </p>
            </div>
            <div v-else class="d-flex flex-column ga-3">
              <div
                v-ripple
                v-for="activity in activities"
                :key="activity._id"
                :style="{ height: '14.5rem' }"
                class="rounded-lg d-flex flex-column bg-quintet border-sextet"
                @click="router.push({ name: 'activity', params: { _id: activity._id } })"
              >
                <div
                  :style="{ height: '7.8rem', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }"
                  class="w-100 thumb"
                >
                  <!-- TREINO -->
                  <svg
                    v-if="activity.type === 'TRAINING'"
                    viewBox="0 0 320 130"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    display="block"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#0F1F0F" />
                        <stop offset="100%" stop-color="#071407" />
                      </linearGradient>
                      <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#22C55E" />
                        <stop offset="100%" stop-color="#16A34A" />
                      </linearGradient>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#mg1)" />

                    <!-- grid lines subtle -->
                    <line x1="0" y1="43" x2="320" y2="43" stroke="#22C55E" stroke-width="0.3" opacity="0.12" />
                    <line x1="0" y1="86" x2="320" y2="86" stroke="#22C55E" stroke-width="0.3" opacity="0.12" />
                    <line x1="80" y1="0" x2="80" y2="130" stroke="#22C55E" stroke-width="0.3" opacity="0.12" />
                    <line x1="160" y1="0" x2="160" y2="130" stroke="#22C55E" stroke-width="0.3" opacity="0.12" />
                    <line x1="240" y1="0" x2="240" y2="130" stroke="#22C55E" stroke-width="0.3" opacity="0.12" />

                    <!-- Barbell group, animates up/down -->
                    <g id="barbell">
                      <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />

                      <!-- bar center -->
                      <rect x="70" y="62" width="180" height="7" rx="3.5" fill="#1E3320" />

                      <!-- left collar -->
                      <rect x="90" y="56" width="10" height="19" rx="3" fill="#2D4A30" />

                      <!-- left plate big -->
                      <rect x="66" y="44" width="26" height="43" rx="5" fill="url(#mg2)" opacity="0.95" />

                      <!-- left plate small -->
                      <rect x="58" y="50" width="10" height="31" rx="3" fill="#16A34A" opacity="0.8" />

                      <!-- right collar -->
                      <rect x="220" y="56" width="10" height="19" rx="3" fill="#2D4A30" />

                      <!-- right plate big -->
                      <rect x="228" y="44" width="26" height="43" rx="5" fill="url(#mg2)" opacity="0.95" />

                      <!-- right plate small -->
                      <rect x="252" y="50" width="10" height="31" rx="3" fill="#16A34A" opacity="0.8" />

                      <!-- shine on plates -->
                      <rect x="68" y="46" width="4" height="39" rx="2" fill="white" opacity="0.08" />
                      <rect x="230" y="46" width="4" height="39" rx="2" fill="white" opacity="0.08" />
                    </g>

                    <!-- motion blur lines below -->
                    <line x1="72" y1="106" x2="72" y2="112" stroke="#22C55E" stroke-width="1" opacity="0.0">
                      <animate attributeName="opacity" values="0;0.35;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
                    </line>
                    <line x1="80" y1="108" x2="80" y2="116" stroke="#22C55E" stroke-width="1" opacity="0.0">
                      <animate attributeName="opacity" values="0;0.25;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
                    </line>
                    <line x1="240" y1="106" x2="240" y2="112" stroke="#22C55E" stroke-width="1" opacity="0.0">
                      <animate attributeName="opacity" values="0;0.35;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
                    </line>
                    <line x1="248" y1="108" x2="248" y2="116" stroke="#22C55E" stroke-width="1" opacity="0.0">
                      <animate attributeName="opacity" values="0;0.25;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
                    </line>

                    <!-- glow floor -->
                    <ellipse cx="160" cy="120" rx="80" ry="8" fill="#22c55e" opacity="0.07">
                      <animate attributeName="opacity" values="0.07;0.14;0.07" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="rx" values="80;90;80" dur="2s" repeatCount="indefinite" />
                    </ellipse>
                  </svg>

                  <!-- DESAFIO -->
                  <svg
                    v-else-if="activity.type === 'CHALLENGE'"
                    viewBox="0 0 320 130"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    display="block"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#1A1100" />
                        <stop offset="100%" stop-color="#0D0900" />
                      </linearGradient>
                    </defs>

                    <rect width="320" height="130" fill="url(#cg1)" />

                    <!-- radial glow -->
                    <ellipse cx="160" cy="62" rx="100" ry="60" fill="#F59E0B" opacity="0.05">
                      <animate attributeName="opacity" values="0.05;0.1;0.05" dur="2.5s" repeatCount="indefinite" />
                    </ellipse>

                    <!-- confetti particles -->
                    <rect x="52" y="20" width="5" height="5" rx="1" fill="#22C55E" opacity="0.8" transform="rotate(30, 54, 22)">
                      <animateTransform attributeName="transform" type="rotate" values="30 54 22;60 54 30;30 54 22" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="y" values="20;28;20" dur="3s" repeatCount="indefinite" />
                    </rect>

                    <rect x="260" y="15" width="5" height="5" rx="1" fill="#22C55E" opacity="0.7" transform="rotate(-20, 262, 17)">
                      <animateTransform attributeName="transform" type="rotate" values="-20 262 17;-50 262 25;-20 262 17" dur="2.8s" repeatCount="indefinite" />
                      <animate attributeName="y" values="15;24;15" dur="2.8s" repeatCount="indefinite" />
                    </rect>

                    <circle cx="90" cy="25" r="3" fill="#F59E0B" opacity="0.8">
                      <animate attributeName="cy" values="25;32;25" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.2s" repeatCount="indefinite" />
                    </circle>

                    <circle cx="225" cy="20" r="3" fill="#F59E0B" opacity="0.7">
                      <animate attributeName="cy" values="20;28;20" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.6s" repeatCount="indefinite" />
                    </circle>

                    <circle cx="130" cy="15" r="2" fill="#FB923C" opacity="0.8">
                      <animate attributeName="cy" values="15;23;15" dur="1.9s" repeatCount="indefinite" />
                    </circle>

                    <circle cx="185" cy="18" r="2.5" fill="#FBBF24" opacity="0.7">
                      <animate attributeName="cy" values="18;26;18" dur="2.4s" repeatCount="indefinite" />
                    </circle>

                    <rect x="280" y="22" width="4" height="8" rx="1" fill="#FB923C" opacity="0.7">
                      <animate attributeName="y" values="22;30;22" dur="2s" repeatCount="indefinite" />
                    </rect>

                    <rect x="42" y="35" width="4" height="8" rx="1" fill="#FBBF24" opacity="0.6">
                      <animate attributeName="y" values="35;42;35" dur="2.7s" repeatCount="indefinite" />
                    </rect>

                    <!-- Trophy cup -->
                    <g transform="translate(160, 65)">
                      <path d="M-22,-28 L-18,18 Q0,28 18,18 L22,-28 Z" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round" />
                      <path d="M-14,-24 L-12,12 Q0,20 12,12 L14,-24 Z" fill="#F59E0B" opacity="0.07" />
                      <path d="M-22,-16 Q-38,-16 -38,0 Q-38,12 -22,14" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />
                      <path d="M22,-16 Q38,-16 38,0 Q38,12 22,14" fill="none" stroke="#F59E0b" stroke-width="2" stroke-linecap="round" />
                      <line x1="0" y1="18" x2="0" y2="28" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />
                      <rect x="-16" y="28" width="32" height="5" rx="2.5" fill="#F59E0B" />
                      <text x="0" y="2" font-size="16" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" opacity="0.9">★</text>
                      <animate type="translate" values="0 0;0 -3;0 0" attributeName="transform" dur="2s" repeatCount="indefinite" />
                    </g>

                    <!-- glow floor -->
                    <ellipse cx="160" cy="118" rx="55" ry="7" fill="#F59E0B" opacity="0.1">
                      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
                    </ellipse>
                  </svg>

                  <!-- ATIVIDADE AVULSA -->
                  <svg
                    v-else
                    viewBox="0 0 320 130"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    display="block"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#020D1A" />
                        <stop offset="100%" stop-color="#010810" />
                      </linearGradient>

                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <clipPath id="trailClip">
                        <rect x="0" y="0" width="0" height="130">
                          <animate attributeName="width" from="0" to="320" dur="3s" repeatCount="indefinite" />
                        </rect>
                      </clipPath>
                    </defs>

                    <rect width="320" height="130" fill="url(#rg1)" />

                    <!-- subtle grid -->
                    <line x1="0" y1="32" x2="320" y2="32" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="0" y1="65" x2="320" y2="65" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="0" y1="98" x2="320" y2="98" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="64" y1="0" x2="64" y2="130" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="128" y1="0" x2="128" y2="130" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="192" y1="0" x2="192" y2="130" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />
                    <line x1="256" y1="0" x2="256" y2="130" stroke="#3B82F6" stroke-width="0.3" opacity="0.08" />

                    <!-- route path (dim) -->
                    <path
                      id="routePath"
                      d="M18,95 C40,95 50,45 80,50 C110,55 120,80 150,65 C180,50 185,30 215,35 C245,40 255,75 285,60 C300,52 308,48 310,45"
                      fill="none"
                      stroke="#3B82F6"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      opacity="0.2"
                    />

                    <!-- animated trail -->
                    <path
                      d="M18,95 C40,95 50,45 80,50 C110,55 120,80 150,65 C180,50 185,30 215,35 C245,40 255,75 285,60 C300,52 308,48 310,45"
                      fill="none"
                      stroke="#3B82F6"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      opacity="0.9"
                      clip-path="url(#trailClip)"
                    />

                    <!-- moving dot -->
                    <circle r="5" fill="#60a5fa" filter="url(#glow)">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M18,95 C40,95 50,45 80,50 C110,55 120,80 150,65 C180,50 185,30 215,35 C245,40 255,75 285,60 C300,52 308,48 310,45"
                      />
                    </circle>

                    <!-- start pin -->
                    <circle cx="18" cy="95" r="4" fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.6" />
                    <circle cx="18" cy="95" r="1.5" fill="#3B82F6" opacity="0.6" />

                    <!-- finish pin -->
                    <circle cx="310" cy="45" r="4" fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.6" />
                    <circle cx="310" cy="45" r="1.5" fill="#3B82F6" opacity="0.6" />
                  </svg>
                </div>

                <div
                  :style="{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }"
                  class="flex-fill d-flex flex-column px-2 py-2 bg-quintet"
                >
                  <div class="d-flex justify-space-between align-center ga-3 mb-2">
                    <span class="font-weight-bold text-h6 text-truncate d-flex align-center ga-1">
                      {{
                        activity.type === "TRAINING" ? activity.workout_title : activity.title
                      }}

                      <v-icon
                        v-if="activity.is_shared"
                        :size="16"
                        color="grey-lighten-1"
                        class="flex-shrink-0"
                        :title="t('$vuetify.label.shared_activity')"
                      >mdi-account-multiple</v-icon>
                    </span>

                    <span class="text-body-2 text-grey-lighten-1 flex-shrink-0">
                      {{ dayjs(activity.created_at!).format(t("$vuetify.label.date_format")) }}
                    </span>
                  </div>

                  <div class="d-flex ga-2 flex-fill">
                    <template v-if="activity.type !== 'AVULSE'">
                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-dumbbell</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${activity.exercises?.length} ${t("$vuetify.label.exercises")}` }}
                        </span>
                      </div>

                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${fromSecondsToMinutes(getPrimaryDurationSeconds(activity))} ${fromSecondsToMinutes(getPrimaryDurationSeconds(activity)) >= 2 ? t("$vuetify.label.minutes") : t("$vuetify.label.minute")}` }}
                        </span>
                      </div>

                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-fire</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-map-marker-outline</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${formatNumber(activity.metrics!.distance_meters / 1000)} ${t("$vuetify.label.km")}` }}
                        </span>
                      </div>

                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${fromSecondsToMinutes(getPrimaryDurationSeconds(activity))} ${fromSecondsToMinutes(getPrimaryDurationSeconds(activity)) >= 2 ? t("$vuetify.label.minutes") : t("$vuetify.label.minute")}` }}
                        </span>
                      </div>

                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-speedometer</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${formatNumber(activity.metrics!.avg_speed)} ${t("$vuetify.label.km_h")}` }}
                        </span>
                      </div>

                      <div class="w-100 h-100 rounded-lg bg-tertiary d-flex flex-column justify-center align-center ga-1 text-truncate">
                        <v-icon>mdi-fire</v-icon>
                        <span class="text-caption text-center text-lowercase text-truncate px-2 w-100">
                          {{ `${formatNumber(activity.calories)} ${t("$vuetify.label.kcal_abbreviation")}` }}
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <LoadingData v-if="loadingActivities" />

            <v-btn
              v-if="(pageActivities + 1) <= pagesActivities"
              block
              color="primary"
              class="mt-5 mb-3 pa-6 text-black font-weight-bold text-none d-flex"
              @click="pageActivities += 1"
            >{{ t("$vuetify.label.load_more") }}</v-btn>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item>
          <div>
            <p class="d-flex ga-2 align-center text-caption text-grey-lighten-1 mb-3">
              <v-icon color="primary">
                mdi-trophy-outline
              </v-icon>

              {{ `${t("$vuetify.label.unlocked")}: ${account.achievements.filter(({ conquered }) => conquered).length} / ${account.achievements.length}` }}
            </p>

            <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }">
              <div
                v-ripple
                v-for="achievement in account.achievements"
                :key="achievement.id"
                :style="{ height: '8rem', textWrap: 'wrap' }"
                class="w-100 pa-2 d-flex flex-column justify-center align-center rounded-lg bg-quintet border-sextet"
                @click="showAchievement(achievement)"
              >
                <span
                  :style="{ fontSize: '1.6rem' }"
                  :class="['mb-3', !achievement.conquered ? 'grayscale' : '']"
                >{{ achievement.emoji }}</span>

                <span
                  :class="['text-center text-caption', !achievement.conquered ? 'grayscale' : '']"
                  :style="{ lineHeight: '0.8rem' }"
                >{{ t(`$vuetify.achievements.${achievement.id}`) }}</span>

                <v-icon
                  v-if="!achievement.conquered"
                  :size="15" color="grey-lighten-1" class="mt-3">
                  mdi-lock-outline
                </v-icon>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item>
          <div class="py-3 d-flex flex-column justify-center align-center">
            <div class="size-4rem rounded-circle d-flex justify-center align-center bg-theme-primary-15 mb-5">
              <v-icon color="primary" :size="35">
                mdi-timer-sand
              </v-icon>
            </div>

            <p class="text-center mb-3 font-weight-bold font-space-grotesk">
              {{ t("$vuetify.message.coming_soon_smart_reminders_title") }}
            </p>

            <p class="text-center text-body-2 font-space-grotesk text-grey-lighten-1">
              {{ t("$vuetify.message.coming_soon_smart_reminders_message") }}
            </p>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item></v-tabs-window-item>
      </v-tabs-window>

      <div class="mt-5 w-100">
        <p class="font-weight-bold text-body-2 text-grey-lighten-1 mb-3">
          {{ t("$vuetify.label.settings") }}
        </p>

        <div class="d-flex flex-column ga-2">
          <div
            v-ripple
            v-for="button in buttons"
            :key="button.id"
            :style="{ height: '3rem' }"
            class="d-flex align-center ga-3 pa-3 bg-tertiary rounded-lg"
            @click="handleButton(button.id)"
          >
            <v-icon :size="20">
              {{ button.icon }}
            </v-icon>

            <span>
              {{ t(`$vuetify.label.${button.id}`) }}
            </span>

            <v-chip
              v-if="('premium' in button ? button.premium : false) && !accountsStore.isSubscriber"
              color="primary"
            >
              <v-icon class="mr-2">mdi-crown</v-icon>
              {{ t("$vuetify.label.premium") }}
            </v-chip>

            <v-badge
              v-if="'badge' in button && button.badge"
              inline
              location="top right"
              color="error"
              :content="button.badge"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM SHEET DE SALDO -->
    <v-bottom-sheet v-model="bottomSheet.balance">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.balance = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex align-center ga-3 mb-4">
            <v-icon color="primary">
              mdi-wallet-outline
            </v-icon>

            <span class="font-weight-bold font-space-grotesk">
              {{ t("$vuetify.label.referral_balance") }}
            </span>
          </div>

          <p class="text-body-2 text-grey-lighten-1 mb-4">
            {{ t("$vuetify.message.referral_balance", currency(minimumWithdraw)) }}
          </p>

          <div class="d-flex ga-1 mb-5">
            <div
              :style="{ width: '33%' }"
              class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
            >
              <p class="font-weight-bold text-success">
                {{ currency(account.balance.available) }}
              </p>

              <p
                class="text-grey-lighten-1 text-center"
                :style="{ fontSize: '11px' }"
              >{{ t("$vuetify.label.available") }}</p>
            </div>

            <div
              :style="{ width: '33%' }"
              class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
            >
              <p class="font-weight-bold text-yellow">
                {{ currency(account.balance.pendant) }}
              </p>

              <p
                class="text-grey-lighten-1 text-center"
                :style="{ fontSize: '11px' }"
              >{{ t("$vuetify.label.pending") }}</p>
            </div>

            <div
              :style="{ width: '33%' }"
              class="rounded-lg pa-3 bg-quintet border-sextet d-flex flex-column ga-2 align-center"
            >
              <p class="font-weight-bold text-orange">
                {{ currency(account.balance.transferred) }}
              </p>

              <p
                class="text-grey-lighten-1 text-center"
                :style="{ fontSize: '11px' }"
              >{{ t("$vuetify.label.total_withdrawn") }}</p>
            </div>
          </div>

          <v-btn
            block
            color="primary"
            class="text-none text-black pa-6"
            @click="router.push({ name: 'refer_and_earn', query: { my_recommendations: '1' } })"
          >{{ t("$vuetify.label.see_referrals") }}</v-btn>

          <v-btn
            v-if="account.recipient.identification && account.balance.available > 0"
            block
            variant="outlined"
            color="primary"
            class="mt-3 text-none text-black pa-6"
            @click="openWithdrawal"
          >{{ t("$vuetify.label.request_withdrawal") }}</v-btn>

          <v-btn
            v-else
            block
            variant="outlined"
            color="primary"
            class="mt-3 text-none text-black pa-6"
            @click="router.push({ name: 'refer_and_earn', query: { configure_recipient: '1' } })"
          >{{ t("$vuetify.label.set_up_account") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE SAQUE -->
    <v-bottom-sheet v-model="bottomSheet.withdrawal">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.withdrawal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex align-center ga-3 mb-1">
            <v-icon color="primary">
              mdi-cash-fast
            </v-icon>

            <span class="font-weight-bold font-space-grotesk">
              {{ t("$vuetify.label.request_withdrawal") }}
            </span>
          </div>

          <p class="text-caption text-grey-lighten-1 mt-4 mb-4">
            {{ `${t("$vuetify.label.available")}: ${currency(account.balance.available)}` }}
          </p>

          <v-form
            ref="withdrawalForm"
            @submit.prevent="submitWithdrawal"
          >
            <TextField
              v-model="withdrawalAmount"
              is-money
              class="mb-6"
              :label="t('$vuetify.label.withdrawal_amount_label', currency(minimumWithdraw))"
              :rules="[
                () => withdrawalAmount >= minimumWithdraw || t('$vuetify.message.below_minimum_withdrawal', currency(minimumWithdraw)),
                () => withdrawalAmount > withdrawalFee || t('$vuetify.message.below_fee_withdrawal', currency(withdrawalFee)),
                () => withdrawalAmount <= account.balance.available || t('$vuetify.message.insufficient_balance_withdrawal'),
              ]"
            />

            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span class="text-grey-lighten-1">{{ t("$vuetify.label.withdrawal_fee_label") }}</span>
              <span>{{ currency(withdrawalFee) }}</span>
            </div>

            <div class="d-flex justify-space-between text-body-2 mb-4">
              <span class="text-grey-lighten-1">{{ t("$vuetify.label.you_will_receive") }}</span>
              <span class="font-weight-bold">{{ currency(netWithdrawalAmount) }}</span>
            </div>

            <v-alert
              v-if="withdrawalError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >{{ withdrawalError }}</v-alert>

            <v-btn
              block
              type="submit"
              color="primary"
              class="text-none text-black pa-6"
              :loading="withdrawalSubmitting"
            >{{ t("$vuetify.label.confirm_withdrawal") }}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE SAIR DA CONTA -->
    <v-bottom-sheet v-model="bottomSheet.logout">
      <v-card>
        <v-card-text class="py-5">
          <div class="d-flex justify-center align-center mb-5">
            <div class="size-4rem rounded-lg d-flex justify-center align-center bg-theme-primary-15">
              <v-icon color="primary" :size="30">
                mdi-logout
              </v-icon>
            </div>
          </div>

          <p class="text-center font-weight-bold text-h6 mb-3">
            {{ t("$vuetify.label.log_out_of_account") }}
          </p>

          <p class="text-center mb-5 text-grey-lighten-1">
            {{ t("$vuetify.message.log_out_of_account") }}
          </p>

          <v-btn
            block
            color="primary"
            class="font-weight-bold text-none pa-7 mb-3"
            @click="bottomSheet.logout = false"
          >{{ t("$vuetify.label.no") }}</v-btn>

          <v-btn
            block
            color="tertiary"
            class="font-weight-bold text-none pa-7"
            @click="logout"
          >{{ t("$vuetify.label.yes") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE CONQUISTA -->
    <v-bottom-sheet v-model="bottomSheet.achievement">
      <div class="d-flex justify-end px-4 mb-3">
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.achievement = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card v-if="selectedAchiement">
        <v-card-text class="py-5">
          <p
            :class="[
              'text-center text-h2 mb-4',
              !selectedAchiement.conquered ? 'grayscale' : ''
            ]"
          >{{ selectedAchiement.emoji }}</p>

          <p
            :class="[
              'text-center font-weight-bold text-h6 mb-3',
              !selectedAchiement.conquered ? 'grayscale' : ''
            ]"
          >{{ t(`$vuetify.achievements.${selectedAchiement.id}`) }}</p>

          <p class="text-center mb-5 text-grey-lighten-1">
            {{
              !selectedAchiement.conquered ?
                t("$vuetify.message.not_yet_unlocked") :
                `${t("$vuetify.message.conquered_in")}: ${dayjs(selectedAchiement.conquered_at).format(t("$vuetify.label.date_format"))}`
            }}
          </p>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- BOTTOM SHEET DE CONTA VERIFICADA -->
    <AuthenticatedAccount v-model="bottomSheet.verified" />

    <!-- BOTTOM SHEET DE COMPRAR CRÉDITOS -->
    <v-bottom-sheet
      v-model="bottomSheet.ai"
      :persistent="!offersStore.offers_credits.length || loadingPix"
    >
      <div
        v-if="!(!offersStore.offers_credits.length || loadingPix)"
        class="d-flex justify-end px-4 mb-3"
      >
        <v-btn
          icon=""
          color="tertiary"
          size="small"
          @click="bottomSheet.ai = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card>
        <v-card-text class="py-5">
          <v-tabs-window v-model="tabPurchase">
            <v-tabs-window-item>
              <div
                v-if="!offersStore.offers_credits.length"
                class="d-flex justify-center align-center py-5"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="50"
                />
              </div>
              <template v-else>
                <p class="mb-4 d-flex align-center ga-3 font-weight-bold font-space-grotesk text-h6">
                  <v-icon color="primary">
                    mdi-star-four-points-outline
                  </v-icon>

                  <span>{{ t("$vuetify.label.buy_credits") }}</span>
                </p>

                <p class="mb-4 text-body-2 text-grey-lighten-1">
                  {{ t("$vuetify.message.buy_credits") }}
                </p>

                <div class="d-flex flex-column ga-3">
                  <v-btn
                    v-for="offer in offersStore.offers_credits"
                    :key="offer.id"
                    block
                    :class="[
                      'rounded-lg position-relative text-none',
                      offer.popular ? 'bg-theme-primary-15 border-sm border-primary border-opacity-100' : 'bg-quintet border-sextet'
                    ]"
                    :style="{ height: '60px' }"
                    @click="offePurchaseId = offer.id; tabPurchase = 1;"
                  >
                    <div class="position-absolute top-0 left-0 right-0 bottom-0 px-3 py-2 rounded-lg d-flex justify-space-between">
                      <div class="d-flex flex-column justify-center">
                        <p class="font-weight-bold font-space-grotesk text-left text-capitalize">
                          {{ offer.id }}

                          <v-chip
                            v-if="offer.popular"
                            variant="elevated"
                            color="primary"
                            size="small" class="ml-2"
                          >{{ t("$vuetify.label.popular") }}</v-chip>
                        </p>

                        <p class="text-caption text-left text-grey-lighten-1 text-lowercase">
                          {{ `${formatNumber(offer.credits)} ${t("$vuetify.label.credits")}` }}
                        </p>
                      </div>

                      <div class="d-flex align-center font-weight-bold text-primary">
                        {{ currency(offer.price) }}
                      </div>
                    </div>
                  </v-btn>
                </div>
              </template>
            </v-tabs-window-item>

            <v-tabs-window-item>
              <div
                v-if="loadingPix"
                class="d-flex justify-center align-center py-5"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="50"
                />
              </div>
              <template v-else>
                <div class="d-flex flex-column align-center mb-5">
                  <div class="w-100 mb-6">
                    <v-btn
                      variant="text"
                      class="text-none"
                      @click="tabPurchase = 0"
                    >
                      <v-icon class="mr-2">mdi-arrow-left</v-icon>
                      {{ t("$vuetify.label.back_button") }}
                    </v-btn>
                  </div>

                  <div class="size-11rem bg-white rounded-lg d-flex justify-center align-center mb-5">
                    <img
                      :style="{ width: '100%' }"
                      :src="pixCodeImage"
                      class="rounded-lg"
                    />
                  </div>

                  <p class="text-center text-caption text-grey-lighten-1 mb-3">
                    {{ t("$vuetify.label.scan_the_qr_code_with_your_banks_app") }}
                  </p>

                  <p class="text-center text-caption text-grey-lighten-1">
                    {{ t("$vuetify.label.time_remaining") }}
                  </p>

                  <p class="text-center font-space-grotesk font-weight-bold">
                    {{ pixTime }}
                  </p>
                </div>

                <TextField
                  readonly
                  :label="t('$vuetify.label.copy_and_paste_code')"
                  :append-icon="'mdi-content-copy'"
                  v-model="pixCode"
                  @click:append="copy(pixCode)"
                />
              </template>
            </v-tabs-window-item>

            <v-tabs-window-item>
              <div class="w-100 h-100 px-5 py-7 d-flex flex-column justify-center align-center ga-7">
                <div class="size-7rem rounded-circle d-flex justify-center align-center bg-theme-primary-15">
                  <v-icon color="primary" :size="65">
                    mdi-check
                  </v-icon>
                </div>

                <p class="text-center font-weight-bold text-h5 font-space-grotesk">
                  {{ t("$vuetify.message.your_credits_have_been_successfully_purchased") }}
                </p>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item></v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useLocale } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { useAccountsStore } from "@/stores/accounts";
import { useActivitiesStore } from "@/stores/activities";
import { useNotificationsStore } from "@/stores/notifications";
import { useOffersStore } from "@/stores/offers";
import { usePublicSettingsStore } from "@/stores/public-settings";
import { usePurchaseOfCreditsStore } from "@/stores/purchase-of-credits";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { attestationService } from "@/services/attestation.service";
import { eventBus } from "@/eventBus";
import { useAnimatedNumber, useCelebration, useCopy, useCurrency, useForm, useFormatNumber, useLogout, useWebView } from "@/composables";
import { calculatePercentageXp, date, getPrimaryDurationSeconds } from "@/utils";
import { type Account } from "@/types/account.type";
import { type Activity } from "@/types/activity.type";
import { type PurchaseOfCredits } from "@/types/purchase-of-credits.type";

dayjs.extend(duration);

import TABS from "@/json/tabs-accounts.json";

/// COMPONENTS
import LoadingData from "@/components/LoadingData.vue";
import AuthenticatedAccount from "@/components/AuthenticatedAccount.vue";
import ProfileImage from "@/components/ProfileImage.vue";

/// DATA
const { t } = useLocale();
const { copy } = useCopy();
const { currency } = useCurrency();
const { logout } = useLogout();
const { formatNumber } = useFormatNumber();
const { fromSecondsToMinutes } = date();
const { celebrate } = useCelebration();
const { validate } = useForm();
const route = useRoute();
const router = useRouter();
const accountsStore = useAccountsStore();
const activitiesStore = useActivitiesStore();
const notificationsStore = useNotificationsStore();
const offersStore = useOffersStore();
const publicSettingsStore = usePublicSettingsStore();
const purchaseOfCreditsStore = usePurchaseOfCreditsStore();
const WV = useWebView();
const persistentSession = usePersistentSession();

const tab = ref(TABS.findIndex((item) => item === route.query.list));

const tabPurchase = ref(0);
const offePurchaseId = ref("");
const loadingPix = ref(false);
const purchaseId = ref("");
const pixCodeImage = ref("");
const pixTime = ref("00:00");
const pixCode = ref("");
const pixCreatedAt = ref("");
const pixExpiresAt = ref("");
const pixInterval = ref<null | number>(null);
const pixPolling = ref<null | number>(null);

const loadingActivities = ref(false);
const pageActivities = ref(1);
const pagesActivities = ref(1);
const activities = ref<null | Activity[]>(null);

const bottomSheet = reactive({
  balance: false,
  withdrawal: false,
  ai: false,
  logout: false,
  achievement: false,
  verified: false,
});

const selectedAchiement = ref<Account["achievements"][number]>();

const withdrawalForm = ref();
const withdrawalAmount = ref(0);
const withdrawalError = ref("");
const withdrawalSubmitting = ref(false);

const image = ref("");

/// COMPUTED
const account = computed(() => accountsStore.account);
const name = computed(() => account.value.name.split(" ")[0]);
const priceSubscription = computed(() => offersStore.amount || Number(import.meta.env.VITE_PRICE_SUBSCRIPTION));
const minimumWithdraw = computed(() => publicSettingsStore.settings?.min_withdrawal_amount ?? 0);
const withdrawalFee = computed(() => publicSettingsStore.settings?.withdrawal_fee ?? 0);
const netWithdrawalAmount = computed(() => Math.max(0, withdrawalAmount.value - withdrawalFee.value));
const buttons = computed(() => {
  const pendantsNotifications = notificationsStore.pendants_notifications;

  const totalNotifications = pendantsNotifications ?
    (pendantsNotifications <= 99 ? String(pendantsNotifications) : `${pendantsNotifications}+`) :
    undefined;

  return [
    { id: "settings", icon: "mdi-cog-outline" },
    { id: "notifications", icon: "mdi-bell-outline", badge: totalNotifications },
    { id: "equipments", icon: "mdi-shoe-sneaker" },
    { id: "subscription", icon: "mdi-credit-card-outline" },
    { id: "ai_coach", icon: "mdi-robot-outline", premium: true },
    { id: "terms_of_use", icon: "mdi-file-document-outline" },
    { id: "privacy_policies", icon: "mdi-shield-outline" },
    ...(account.value?.indication?.status ? [{ id: "refer_and_earn", icon: "mdi-gift-outline" }] : []),
    ...(account.value?.backoffice?.enabled ? [{ id: "backoffice", icon: "mdi-briefcase" }] : []),
    { id: "log_out_of_account", icon: "mdi-logout" },
  ] as const;
});

/// WATCH
watch(tab, (val) => {
  const list = TABS.find((_, i) => i === val)!;

  router.replace({
    replace: true,
    query: { ...route.query, list }
  });
});

watch(pageActivities, async (val) => {
  loadingActivities.value = true;
  await loadActivities();
  loadingActivities.value = false;
});

watch(() => bottomSheet.ai, async (val) => {
  if (val) {
    await offersStore.GET_OFFERS_CREDITS();
  } else {
    tabPurchase.value = 0;
    if (pixPolling.value !== null) clearInterval(pixPolling.value);
    if (pixInterval.value !== null) clearInterval(pixInterval.value);
  }
});

watch(tabPurchase, async (val) => {
 if (val === 1) {
  loadingPix.value = true;

  const attestationHeaders = await attestationService.getAssertionHeaders();

  const response = await purchaseOfCreditsStore.POST("", {
    offer_id: offePurchaseId.value,
    type: "pix"
  }, attestationHeaders);

  if (response.error) {
    tabPurchase.value = 0;
  } else {
    purchaseId.value = response._id;
    pixCode.value = response.qr_code_value;
    pixCodeImage.value = response.qr_code_image;
    pixCreatedAt.value = response.created_at;
    pixExpiresAt.value = response.expires_at;
    createPollingPix();
    createIntervalPix();
  }

  loadingPix.value = false;
 }
});

watch(() => route.query.list, (val) => {
  const index = TABS.findIndex((item) => item === val);
  tab.value = index >= 0 ? index : 0;
});

watch(() => account.value.level, (level, previous) => {
  if (previous !== undefined && level > previous) celebrate("success");
});

/// LIFE CYCLES
onMounted(async () => {
  const file = JSON.parse((await persistentSession.get("picture")) || "{}");

  image.value = file?.path || account.value.image;

  eventBus.on("RELOAD_ACTIVITIES", loadActivities);

  publicSettingsStore.GET_SETTINGS();

  await loadActivities();
});

onBeforeUnmount(() => {
  eventBus.off("RELOAD_ACTIVITIES", loadActivities);
  if (pixPolling.value !== null) clearInterval(pixPolling.value);
  if (pixInterval.value !== null) clearInterval(pixInterval.value);
});

/// METHODS
const animatedXp = useAnimatedNumber(() => account.value.xp ?? 0);
const loadActivities = async () => {
  try {
    loadingActivities.value = true;

    const response = await activitiesStore.GET(`?page=${pageActivities.value}&limit=${pageActivities.value === 1 ? 5 : 10}`);

    if (!response.error) {
      pagesActivities.value = response.result.pages;

      if (!activities.value) activities.value = [];

      activities.value.push(
        ...response.result.results.filter((result: Activity) =>
          !activities.value!.some((activity) => activity._id === result._id)
        )
      );
    }
  } catch {
    ///
  } finally {
    loadingActivities.value = false;
  }
};

const showAchievement = (achievement: Account["achievements"][number]) => {
  selectedAchiement.value = achievement;
  bottomSheet.achievement = true;
};

const openWithdrawal = () => {
  withdrawalAmount.value = 0;
  withdrawalError.value = "";
  bottomSheet.balance = false;
  bottomSheet.withdrawal = true;
};

const submitWithdrawal = async () => {
  withdrawalError.value = "";

  const isValid = await validate(withdrawalForm);
  if (!isValid) return;

  withdrawalSubmitting.value = true;
  const response = await accountsStore.REQUEST_WITHDRAWAL(withdrawalAmount.value);
  withdrawalSubmitting.value = false;

  if (response.error) {
    withdrawalError.value = response.code === "BELOW_MINIMUM" ?
      t("$vuetify.message.below_minimum_withdrawal", currency(minimumWithdraw.value)) :
      response.code === "BELOW_FEE" ?
        t("$vuetify.message.below_fee_withdrawal", currency(withdrawalFee.value)) :
        t("$vuetify.message.insufficient_balance_withdrawal");
    return;
  }

  bottomSheet.withdrawal = false;
};

const createPollingPix = () => {
  if (pixPolling.value !== null) clearInterval(pixPolling.value);

  pixPolling.value = setInterval(async () => {
    const response = await purchaseOfCreditsStore.GET(purchaseId.value);

    if (!response.error) {
      const purchase = response.purchase_of_credits as PurchaseOfCredits;

      if (purchase.status === "PAID") {
        if (pixInterval.value !== null) {
          clearInterval(pixInterval.value);
          pixInterval.value = null;
        }

        if (pixPolling.value !== null) {
          clearInterval(pixPolling.value);
          pixPolling.value = null;
        }

        tabPurchase.value = 2;

        accountsStore.GET_ACCOUNT();
      }
    }
  }, 5000);
};

const createIntervalPix = () => {
  if (pixInterval.value !== null) clearInterval(pixInterval.value);

  pixInterval.value = setInterval(() => {
    const diff = Math.max(0, dayjs(pixExpiresAt.value).diff(dayjs()));
    const duration = dayjs.duration(diff);

    const minutes = String(Math.floor(duration.minutes())).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");
    pixTime.value = `${minutes}:${seconds}`;

    if (diff <= 0) {
      clearInterval(pixInterval.value!);
      pixInterval.value = null;

      if (pixPolling.value !== null) {
        clearInterval(pixPolling.value);
        pixPolling.value = null;
      }

      tabPurchase.value = 0;
    }
  }, 1000);
};

const handleButton = (event: typeof buttons.value[number]["id"]) => {
  switch(event) {
    case "settings":
      router.push({ name: "settings" });
      break;
    case "notifications":
      router.replace({
        replace: true,
        query: { ...route.query, mode: "notification" }
      });
      break;
    case "equipments":
      router.push({ name: "equipments" });
      break;
    case "subscription":
      router.push({ name: "subscription" });
      break;
    case "ai_coach":
      const { plan, purchased } = account.value.credits;
      if ((plan + purchased) > 0 || accountsStore.isSubscriber) router.push({ name: "ai_coach" });
      else eventBus.emit("START_SUBSCRIPTION");
      break;
    case "terms_of_use":
      WV.open(`${import.meta.env.VITE_API_FRONTEND}terms-of-use`);
      break;
    case "privacy_policies":
      WV.open(`${import.meta.env.VITE_API_FRONTEND}privacy-policies`);
      break;
    case "backoffice":
      router.replace({
        replace: true,
        query: { ...route.query, mode: "backoffice" }
      });
      break;
    case "refer_and_earn":
      router.push({ name: "refer_and_earn" });
      break;
    case "log_out_of_account":
      bottomSheet.logout = true;
      break;
  };
};
</script>

<style lang="sass" scoped>
div.profile
  width: 72px
  height: 72px
  border-radius: 50%
  background-position: center
  background-size: cover

div.thumb
  svg
    border-radius: 12px 12px 0 0

.grayscale
  filter: blur(0.3px) grayscale(100%)
</style>