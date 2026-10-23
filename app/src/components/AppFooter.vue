<template>
  <footer class="app-footer">
    <div class="footer-container">
      <nav class="legal-links" aria-label="Rechtliches">
        <RouterLink class="legal-link" to="/imprint">Impressum</RouterLink>
        <RouterLink class="legal-link" to="/privacy">Datenschutz</RouterLink>
      </nav>
      <p class="copyright">Copyright 2026 - michael<strong>schreiber</strong>.net</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  min-height: 76px;
  background: var(--gradient-footer);
  color: var(--color-on-footer);
}

.footer-container {
  max-width: calc(var(--container-max-width) + 2 * var(--page-padding-inline));
  margin: 0 auto;
  padding: var(--spacing-lg) var(--page-padding-inline);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.legal-links {
  display: flex;
  gap: var(--spacing-xl);
}

.legal-link {
  font: var(--font-label-lg);
  color: var(--color-on-footer);
  text-decoration: none;
}

.legal-link:hover {
  text-decoration: underline;
}

.copyright {
  font: var(--font-label-sm);
}

.copyright strong {
  font-weight: var(--font-weight-bold);
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-lg);
  }

  .legal-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
