---
type: AI Review
title: Review for Animated Header Title
description: Round 1 positive — header typewriter, underscore cursor, hover delete and retype from the current character, segment weights and the circuit-only logo match the concept; tests, lint and build pass; one non-blocking stale test comment.
tags: [MS-18, review]
timestamp: 2026-10-22T20:55:39+07:00
verdict: positive
---

## Round 1 — 2026-10-22T20:55:39+07:00

### Scope

- Architecture concept `MS-18-animated-header-title.md` (draft, including D2a
  for the user change and the D4 lead phase), testing concept `MS-18-tests.md`,
  and the `index.md` and `log.md` entries. There is no design copy
  (`docs/design/MS-18/` does not exist).
- Uncommitted changes on `task/MS-18-animation-adjustments`, compared with `main`:
  `app/src/composables/useTypewriter.ts` (new),
  `app/src/composables/useBrandTitle.ts` (new),
  `app/src/components/AppNavigation.vue`, `app/src/components/AnimatedLogo.vue`.
- Tests: `useTypewriter.spec.ts`, `useBrandTitle.spec.ts`,
  `AppNavigation.spec.ts` (new) and `AnimatedLogo.spec.ts` (updated).
- Checks in `app/`: `npm run test:unit -- --run` (824/824 in 18 files),
  `npm run lint:check` (clean) and `npm run build` (succeeds).

Verified against the acceptance criteria and the concept:

- **AC 1 / D1.** The wordmark group, its 20 glyphs, the cursor `rect`, the
  glyph and cursor CSS, the `logo-cursor-*` keyframes and the two
  reduced-motion selectors are removed from `AnimatedLogo.vue`. `logo-show`
  is kept because the dots still use it. The viewBox is `0 32 512 376` and
  `aspect-ratio` is `512 / 376`. The reduced-motion block is still the last
  rule block. No `wordmark`, `glyph` or `logo-cursor` references remain in
  `app/src`. The header brand now renders the animated title.
- **AC 2 / D6.** The cursor is a CSS underscore (`0.6em` wide,
  `max(2px, 0.1em)` high) in `currentColor` on the baseline. It is not a
  text character.
- **AC 3 / D6, D4.** The `brand__cursor--blinking` class is bound to
  `phase === 'idle'`, and the engine ends every run in `idle`. The cursor
  blinks during the 800 ms lead, after the intro, after a full delete and
  after a retype. It is solid while typing or deleting. Reduced motion stops
  the blink with `animation: none`.
- **AC 4 / D4, D8.** `erase()` cancels the pending step and removes one
  character at once, then one every 60 ms, and ends in `idle` at 0. Touch
  pointers and reduced motion are filtered out. Keyboard focus and a plain
  `mouseenter` do nothing.
- **AC 5 / D4.** `type()` without a lead continues from the current `count`
  with `typeDelays[count]`. Reversal works in both directions because every
  call cancels the single pending timer first. I traced edge cases by hand:
  hover during the lead or the 200 ms hesitation at count 0 goes `idle` and
  cancels the lead, and a later leave types from 0. Leave at full count
  stays `idle` and starts no timer.
- **User change D2a.** `schreiber` uses `--font-weight-bold` (700), and
  `michael` and `.net` use `--font-weight-normal` (400). The
  `--color-primary` rule on `.brand__tld` and the semibold weight on
  `.brand__name` are removed. The ghost uses the same three segment spans,
  so it reserves the bold width. The segment slices use half-open, clamped
  indices from `BRAND_SEGMENTS`.
- **D3.** The accessible name comes from the visually hidden `.brand__sr`,
  which is always the full title. The `.brand__title` is `aria-hidden`.
  There is no `aria-label` and no `aria-live`. The ghost and the typed text
  share one `inline-grid` cell. The `></span\n>` formatting means there are
  no whitespace text nodes, and a test checks this.
- **D5 / D7.** The module flag is set when the intro starts, and a remount
  shows the full title with no timer. `resetBrandTitleIntro` is only a test
  seam. Reduced motion is detected through a guarded `matchMedia` and gives
  `count = n`, no intro and inert handlers.
- **Cleanup.** `onScopeDispose(stop)` clears the single timer when the
  component unmounts.
- **Tests.** The tests cover every row of the testing concept and check the
  boundaries 1 ms before and at each step. I confirmed that jsdom provides
  `PointerEvent`, so `trigger('pointerenter', { pointerType: 'touch' })`
  really sets `pointerType`, and the touch-filter tests would fail without
  the filter. The source-level CSS tests resolve grouped selectors.

### Findings

None blocking.

Non-blocking note (route: tester):

1. `app/src/__tests__/useBrandTitle.spec.ts`, lines 130–132. A stale comment
   above `it('is idle at mount (cursor blinks during the lead)')` says that
   `type(800)` "switches to 'typing' at once, so the cursor is solid during
   the lead" and calls this an open discrepancy. That was the behaviour
   before the D4 lead-phase fix. The test below the comment, the engine and
   `MS-18-tests.md` (Finding 1, resolved) now say the opposite. The comment
   should be removed or reworded so it does not mislead maintainers. It has
   no effect at runtime or on any test.

Open for the user review (concept Open Questions, not findings):

- The hover target is the whole brand link (logo mark and title), not only
  the title text or the whole header bar (D8, Open Question 1).
- The manual browser checks from the concept are still needed: layout
  stability while bold glyphs are typed, the underscore position, the hero
  spacing after the viewBox crop, touch devices, reduced motion and screen
  reader output. jsdom cannot check these.

### Verdict

positive
