<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <main class="app-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

#app {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
}
</style>
