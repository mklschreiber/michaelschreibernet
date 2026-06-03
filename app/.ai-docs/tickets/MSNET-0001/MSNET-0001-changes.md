# Change-Log – MSNET-0001: "About Me" Section

**Date:** 2026-06-02
**Status:** ✅ Done
**Tests:** 32/32 green

---

## Summary

New page `/about` with interactive business card and CV timeline implemented. The page is bilingual (DE/EN), responsive and shows 7 career stations with scroll animations via IntersectionObserver.

---

## New Files

| File | Description |
|---|---|
| `src/data/timeline.ts` | 7 CV entries (chronologically descending), interface `TimelineEntry` |
| `src/composables/useTimelineAnimation.ts` | Multi-element IntersectionObserver, `visibilityMap` per entry ID |
| `src/components/TimelineEntry.vue` | Dot + dashed connector line + card, `side: left/right`, animation |
| `src/views/AboutPage.vue` | Business card (avatar "MS", name, role, email, Xing) + timeline |
| `src/__tests__/timeline.spec.ts` | 5 unit tests for timeline data |
| `src/__tests__/TimelineEntry.spec.ts` | 8 unit tests for component |
| `src/__tests__/useTimelineAnimation.spec.ts` | 6 unit tests for composable |
| `src/__tests__/AboutPage.spec.ts` | 12 integration tests for view |

## Changed Files

| File | Change |
|---|---|
| `src/router/index.ts` | Route `/about` → `AboutPage` (lazy load) |
| `src/components/AppNavigation.vue` | RouterLink to `/about` between Home and Projects |
| `src/i18n/types.ts` | `MessageSchema` extended with `nav.about` and `about.*` |
| `src/i18n/locales/de.ts` | Translations: nav, businessCard, 7 timeline entries |
| `src/i18n/locales/en.ts` | English translations equivalent |

---

## New Architecture Decisions

- **ADR-007:** Separate composable `useTimelineAnimation` (multi-element IntersectionObserver)
- **ADR-008:** Separate component `TimelineEntry.vue` (analogous to ADR-005/ProjectCard)
- **ADR-009:** CV data via i18n keys (language-dependent date information)

---

## Test Results

```
 ✓ src/__tests__/timeline.spec.ts          (5 tests)
 ✓ src/__tests__/useTimelineAnimation.spec.ts (6 tests)
 ✓ src/__tests__/TimelineEntry.spec.ts     (8 tests)
 ✓ src/__tests__/AboutPage.spec.ts         (12 tests)
 ✓ src/__tests__/App.spec.ts               (1 test)
 Tests  32 passed (32)
```
