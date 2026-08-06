<template>
  <v-list
    class="rounded-xl bg-secondary"
    :style="{ border: '2px solid var(--tertiary)', minWidth: '20rem' }"
  >
    <slot></slot>
  </v-list>
</template>