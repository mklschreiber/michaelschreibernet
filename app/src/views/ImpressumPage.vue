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
        <p>Grockelhofen 32</p>
        <p>89340 Leipheim</p>
      </section>

      <section class="section">
        <h2>Kontakt</h2>
        <p>Telefon: <a href="tel:+4915679724718">+49 (0) 15679 724718</a></p>
        <p>E-Mail: <a href="mailto:info@michaelschreiber.net">info@michaelschreiber.net</a></p>
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
  display: inline-block;
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xl);
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.section {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.section > * {
  position: relative;
  z-index: 1;
}

.section::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
    var(--gradient-brand-horizontal) border-box;
  mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 80%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 80%);
  pointer-events: none;
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

.section a {
  color: inherit;
  text-decoration: underline;
}
</style>

