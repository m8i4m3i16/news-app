<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NConfigProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider>
    <RouterView />
  </n-config-provider>
</template>

<style>
:root {
  --base-font-size: 16px;
  --color-background: var(--vt-c-white);
  --color-background-soft: var(--vt-c-white-soft);
  --color-background-mute: var(--vt-c-white-mute);
  --color-border: var(--vt-c-divider-light-2);
  --color-border-hover: var(--vt-c-divider-light-1);
  --color-heading: var(--vt-c-text-light-1);
  --color-text: var(--vt-c-text-light-1);
}

body {
  background: var(--color-background);
}
</style>

<style scoped>
/* @media (max-width: 1024px) {
} */
</style>
