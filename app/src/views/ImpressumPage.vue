<script setup lang="ts">
import AppNavigation from '@/components/AppNavigation.vue'
</script>

<template>
  <AppNavigation />

  <main class="section legal-page">
    <div class="section__inner">
      <h1 class="section__title legal-page__title">Impressum</h1>

      <section class="card legal-card">
        <p>Michael Schreiber</p>
        <p>Grockelhofen 32</p>
        <p>89340 Leipheim</p>
      </section>

      <section class="card legal-card">
        <h2>Kontakt</h2>
        <p>Telefon: <a href="tel:+491624337334">+49 (0) 162 4337334</a></p>
        <p>E-Mail: <a href="mailto:info@michaelschreiber.net">info@michaelschreiber.net</a></p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.legal-page__title {
  margin-bottom: var(--spacing-xl);
}

.legal-card {
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.legal-card h2 {
  font: var(--font-headline-md);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-md);
}

.legal-card h3 {
  font: var(--font-title-lg);
  color: var(--color-on-surface);
  margin: var(--spacing-lg) 0 var(--spacing-sm);
}

.legal-card h4 {
  font: var(--font-title-md);
  color: var(--color-on-surface);
  margin: var(--spacing-md) 0 var(--spacing-xs);
}

.legal-card p,
.legal-card li {
  font: var(--font-body-sm);
  color: var(--color-on-surface-variant);
}

.legal-card p + p {
  margin-top: var(--spacing-sm);
}

.legal-card ul {
  margin: var(--spacing-sm) 0 0 var(--spacing-xl);
  display: grid;
  gap: var(--spacing-sm);
}

.legal-card a {
  color: inherit;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .legal-card {
    padding: var(--spacing-lg);
  }
}
</style>
