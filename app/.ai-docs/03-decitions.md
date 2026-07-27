# Architecture Decisions (ADRs) – michaelschreiber.net

## ADR-007: Separate Composable `useTimelineAnimation` for Multi-Element Intersection Observer
- **Status:** ✅ Accepted
- **Decision:** A new composable `useTimelineAnimation.ts` is created instead of extending `useScrollAnimation.ts`.
- **Justification:** `useScrollAnimation` observes a single element (single-element + boolean). The timeline needs N elements with individual tracking (multi-element + set). Different signatures and behavior justify a separate composable. Consistent with ADR-004.
- **Alternatives:** useScrollAnimation per entry (too many observers), extend useScrollAnimation generically (complicates existing API)
- **Impact:** New composable in `src/composables/`. No changes to existing composables.

## ADR-008: Separate Component `TimelineEntry.vue` for CV Entries
- **Status:** ✅ Accepted
- **Decision:** Each CV entry is implemented as its own component `TimelineEntry.vue`.
- **Justification:** Rendered 7x in v-for, contains its own props logic (side-switching, animation state, dot/connector/card structure). Follows ADR-005 pattern (ProjectCard).
- **Alternatives:** Inline in AboutPage (too complex, poor readability with v-for)
- **Impact:** New component in `src/components/`. Only used by `AboutPage.vue`.

## ADR-009: CV Data via i18n Keys instead of Static Data Object
- **Status:** ✅ Accepted
- **Decision:** CV entries are referenced via i18n keys. Order and side assignment as a small array in the view.
- **Justification:** Date information is language-dependent ("heute" vs. "present", "Werkstudent" vs. "Working Student"). Full localization without data duplication.
- **Alternatives:** Data in separate TS file (unnecessary indirection), without i18n (no multilingual support)
- **Impact:** i18n files are extended with timeline entries. `MessageSchema = typeof de` reflects new keys automatically.

## ADR-010: Route Metadata Managed Centrally
- **Status:** Accepted
- **Decision:** Route-specific SEO metadata is maintained in `src/seo.ts` and applied by a router navigation hook.
- **Justification:** This keeps page titles, descriptions, Open Graph metadata, and canonical URLs consistent across every SPA route without duplicating document-head logic in views.
- **Alternatives:** Static metadata only (cannot describe subpages), per-view metadata updates (duplicates logic and risks inconsistency).
- **Impact:** Every declared route supplies a metadata entry; static SEO essentials remain in `index.html`.
