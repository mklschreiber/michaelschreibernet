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
  position: relative;
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #0e7490 100%);
  color: var(--color-text-light);
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-brand);
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
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.legal-link:hover,
.legal-link:focus-visible {
  color: var(--color-text-light);
  text-decoration: underline;
}

.copyright {
  color: rgba(255, 255, 255, 0.7);
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
