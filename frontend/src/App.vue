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
}
</style>

<style scoped>
/* @media (max-width: 1024px) {
} */
</style>
