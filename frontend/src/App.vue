<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NConfigProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider>
    <div class="container">
      <RouterView />
    </div>
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
/* body {
  background: var(--color-background);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  min-width: 360px;
} */
.container {
  margin: 0;
  padding: 0;
}
@media screen and (max-width: 768px) {
  :root {
    --base-font-size: 14px;
  }
  .container {
    padding: 0 16px;
  }
}
@media screen and (min-width: 1024px) {
  :root {
    --base-font-size: 16px;
  }
  .container {
    width: 88vw;
    display: grid;
    place-items: center;
  }
}
</style>
