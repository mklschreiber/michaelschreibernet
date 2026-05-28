<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="legal-links">
        <RouterLink class="legal-link" to="/impressum">Impressum</RouterLink>
        <RouterLink class="legal-link" to="/datenschutz">Datenschutz</RouterLink>
      </div>
      <p class="copyright">Copyright 2026 - michaelschreiber.net</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-primary-hover);
  color: var(--color-text-light);
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.legal-links {
  display: flex;
  gap: var(--spacing-md);
}

.legal-link {
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}

.legal-link:hover,
.legal-link:focus-visible {
  text-decoration: underline;
}

.copyright {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .legal-links {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
</style>
