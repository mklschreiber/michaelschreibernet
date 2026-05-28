<script setup lang="ts">
import AppNavigation from '@/components/AppNavigation.vue'
</script>

<template>
  <div class="impressum-page">
    <AppNavigation />

    <main class="content">
      <h1>Impressum</h1>

      <section class="section">
        <p>Michael Schreiber</p>
        <p>Grockelhofen 32a</p>
        <p>89340 Leipheim</p>
      </section>

      <section class="section">
        <h2>Kontakt</h2>
        <p>Telefon: +49 (0) 15679 724718</p>
        <p>E-Mail: info@michaelschreiber.net</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.impressum-page {
  min-height: 100%;
}

.content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.content h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
}

.section {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.section h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.section p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.5;
}
</style>

