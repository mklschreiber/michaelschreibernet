---
type: AI Review
title: Review for Consistent Routing
description: Round 1 — positive; /imprint and /privacy replace the German paths with matching route names and pageMetadata keys, the old paths redirect, footer links are updated, tests cover the concept, and unit tests, lint and build pass.
tags: [MS-16, review]
timestamp: 2026-10-21T20:45:00+02:00
verdict: positive
---

## Round 1 — 2026-10-21T20:45:00+02:00

### Scope

- Concept `MS-16-consistent-routing.md` (D1–D4) and testing concept
  `MS-16-tests.md`. There is no design copy (`docs/design/MS-16/` does not
  exist).
- Uncommitted changes on `task/MS-16-consistent-routing`:
  `app/src/router/index.ts`, `app/src/seo.ts`,
  `app/src/components/AppFooter.vue`, `app/src/__tests__/router.spec.ts`
  (new), `app/src/__tests__/App.spec.ts`,
  `app/src/__tests__/AboutPage.spec.ts`, `docs/architecture/index.md`,
  `docs/architecture/log.md`.
- Repo-wide search (`git grep`) for `impressum`, `datenschutz` and
  `dataProtection`, plus all `to="/…"` / `#/` links in `app/src`.
- Checks in `app/`: `npm run test:unit -- --run` (16 files, 647/647 pass),
  `npm run lint:check` (clean), `npm run build` (succeeds).

Verified:

- **AC-1:** The route table has page routes `/`, `/about`, `/projects`,
  `/contact`, `/imprint` and `/privacy`, so all of them are English. The final
  table matches the concept's Interfaces section exactly.
- **D2:** Route names `imprint` / `privacy` and `pageMetadata` keys
  `imprint` / `privacy` follow the paths. The German metadata values are
  unchanged. The old keys `impressum` / `dataProtection` and the old route
  names are no longer referenced anywhere in `app/`.
- **D3:** `ImpressumPage.vue`, `DataProtectionPage.vue`, their CSS classes
  `.impressum-page` / `.datenschutz-page`, their specs and the German footer
  labels are unchanged, as the concept decides.
- **D4:** Static, unnamed redirect records `/impressum` → `/imprint` and
  `/datenschutz` → `/privacy` come after the real routes and carry the agreed
  comment. `afterEach` uses `to.path` from the redirect target, so the
  canonical URL is `…/#/imprint` or `…/#/privacy`.
- **Remaining German references:** The only remaining matches for
  `impressum` / `datenschutz` are the two redirect records, the D3 CSS
  classes, the MS-16 index entries and historical docs (`minor-changes.md`,
  `styling-improvements*.md`). No other source file, `app/public/*` or
  `app/index.html` links to the old paths.
- **Tests:** `router.spec.ts` uses the real router. It guards the route table
  with an exact path list and checks that the redirects are unnamed. It
  checks name, `meta.seo` and component for `/imprint` and `/privacy`, plus
  the redirect target, title and canonical URL after opening each old path.
  Head and route are reset after each test, and nothing waits on a fixed
  delay. `App.spec.ts` checks that the footer hrefs end in `#/imprint` /
  `#/privacy` and that the labels are still German. These tests would fail
  on a missing rename, a missing redirect, or a canonical URL built from the
  old path. Every row in the testing concept has a matching test.
- **Docs:** The concept and testing concept are listed under
  `## Current Concepts`, and `log.md` has a new top row.

### Findings

None.

Non-blocking notes:

- The concept still says `status: draft`. The orchestrator may want to set
  it to its final status when the story is closed.
- The optional manual browser check (opening `#/impressum` /
  `#/datenschutz` directly, back button) is not automated. The testing
  concept records this as an untested area.

### Verdict

positive
