---
type: Test Concept
title: Tests for Animated Header Title
description: Covers the generic useTypewriter engine (including the idle lead phase), the useBrandTitle brand wiring (three title segments, intro once per page load, hover delete, retype on leave, touch filter, reduced motion), the AppNavigation brand markup, segment weights, accessible name, underscore cursor and unchanged navigation, and the AnimatedLogo reduced to the circuit with the cropped viewBox.
tags: [MS-18, tests]
timestamp: 2026-10-22T00:00:00+02:00
---

## Scope

Tested (Vitest, Vue Test Utils, jsdom; files in `app/src/__tests__/`). All
timing uses `vi.useFakeTimers()`; no real delays. Brand tests call
`resetBrandTitleIntro()` in `beforeEach`.

- `useTypewriter.spec.ts` (unit, new): the engine runs in a bare
  `effectScope()` with the delays `[10, 20, 30]` and `deleteDelay: 5`.
  Initial state (default 0, `initialCount`, clamping, idle, no timer, error on
  a delay/text length mismatch). `type()`: one character per pause, checked
  1 ms before and at each boundary, `typing` then `idle`, the lead delay only
  before the first character. Lead phase (D4): `idle` during the lead and
  still at lead − 1 ms, `typing` when it ends, exactly one pending timer
  during and after the lead, `idle` even when called while typing, `type()`
  and `type(0)` are `typing` at once, no-op at full count, `stop()` and
  `erase()` cancel the lead (and with visible characters `erase()` deletes
  and never types afterwards), scope disposal clears it. Continuing from `initialCount`, no-op at full
  count, a repeated call restarts the pending pause. `erase()`: one character
  synchronously, then one per `deleteDelay`, `idle` at 0, no-op at 0.
  Reversals in both directions from the current count with `typeDelays[count]`
  as the next pause, and never more than one pending timer. `stop()` and scope
  disposal clear the timer and freeze `count`. `count` is readonly.
- `useBrandTitle.spec.ts` (unit, new; mounted in a render-function harness
  because of `onMounted`): constants (title, `BRAND_SEGMENTS` gap-free over
  0–20 and slicing to `michael` / `schreiber` / `.net`, 20 delays equal to the D4
  table written out in the test, sum 4380, word pauses before `s` and `.`,
  60 ms delete, 800 ms lead). Intro: empty at mount, `idle` at 0 and 799 ms,
  `typing` (still empty) at 800 ms, one pending timer during the lead,
  `m` at 1000 ms, one
  character short at 5179 ms, full and idle at 5180 ms, no timer left. Once
  per page load: a second instance is full and idle at once with no timer,
  also after the first instance was unmounted mid-intro;
  `resetBrandTitleIntro()` re-enables the intro. `first`/`strong`/`tld` split
  at count 0, 5, 7, 10, 16, 18 and 20 (D2a). Hover/leave wiring (AC 4, AC 5), mid-intro reversal,
  `pen`, a missing and an empty `pointerType` act; `touch` is ignored.
  Reduced motion with a stubbed `window.matchMedia` (query string, full title,
  no timer, both handlers inert; `matches: false` still plays the intro).
  Unmount cleanup.
- `AppNavigation.spec.ts` (component, new; memory router, real de/en
  locales): the D3 template contract (`.brand__sr` always
  `michaelschreiber.net` at mount, mid-typing and fully deleted;
  `.brand__title[aria-hidden="true"]`; mark `aria-hidden`; no `aria-label`,
  no `aria-live`), the ghost (full text and one non-blinking cursor in every
  state). Segments (D2a): `.brand__typed` and `.brand__ghost` each consist of
  exactly `.brand__first`, `.brand__strong`, `.brand__tld`, `.brand__cursor`
  with no text nodes between (also when empty); full segment texts after the
  intro and in the ghost, partial ones at count 10. Intro through the DOM
  (`data-phase` `idle` until 799 ms, `typing` from 800 ms, growing text).
  Cursor: exactly one in `.brand__typed`, empty element, blinking during the
  lead (0–799 ms), solid during the 200 ms hesitation before `m` and while
  typing or deleting, blinking when idle after the intro and after a full
  delete.
  Hover/leave via `trigger('pointerenter' | 'pointerleave', { pointerType })`:
  first character at once, empty after 19 × 60 ms, leave at count 12 keeps
  `michaelschre` and types `i` 160 ms later, full and blinking in the end,
  retype from empty, hover mid-intro deletes from the current count. Touch
  enter/leave, `focus` and plain `mouseenter` change nothing. Reduced motion.
  No pending timer after unmount (intro and deleting), remount shows the full
  title with no timer. Regression: de/en navigation labels and hrefs,
  hamburger open/close with `aria-expanded` and `is-open`, close on nav-link
  and brand click, hamburger `aria-label`. Source level (`?raw`): underscore
  size, `currentColor` on the baseline, `brand-cursor-blink 1s steps(1, end)
  infinite`, keyframes 0 % on / 50 % off; `.brand__strong` uses
  `var(--font-weight-bold)`, `.brand__first` and `.brand__tld` use
  `var(--font-weight-normal)` (grouped selectors are resolved), no `color` on
  `.brand__tld`, no `--color-primary` in any brand rule, no font weight on
  `.brand__name`; reduced-motion `animation: none`
  after the blink rule, `visibility: hidden` ghost, single grid cell,
  `inline-grid`, visually-hidden pattern, `nowrap`.
- `AnimatedLogo.spec.ts` (updated MS-17 suite): viewBox `0 32 512 376` and
  `aspect-ratio: 512 / 376` (no `aspect-ratio: 1`); no wordmark group, no
  glyph or `data-char` paths, no cursor, no `<rect>` outside the mask, no
  glyph/cursor/wordmark CSS and no `logo-cursor-*` keyframes; root children
  without the wordmark; each of the 10 rings (centre ± 14.312) and every trace
  vertex inside the cropped viewBox; reduced-motion block lists only traces,
  dots, heads and holes and stays last. Removed: the D4/D4a typing-rhythm,
  cursor-markup and cursor-animation tests, "circuit completes before the
  cursor", the glyph reveal / jump-end tests, and the wordmark transform and
  glyph outline design comparisons. Everything else (traces, rings, mask,
  joints, merge, `steps(1, start)` guard for dots) is unchanged.

Not tested: real layout (no layout shift, ghost width, underscore position
below the baseline, the rendered bold/normal contrast), rendered blinking, real pointer behaviour on touch
devices, screen reader output, and the hero spacing after the crop. jsdom has
no layout or CSS animation engine; these are manual browser checks (see the
architecture concept, "Manual browser check").

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| useTypewriter | starts at count 0, idle, with no timer | Unit | ✅ |
| useTypewriter | uses and clamps `initialCount` (negative → 0, too large → length) | Unit | ✅ |
| useTypewriter | throws when the delay count does not match the text length | Unit | ✅ |
| useTypewriter | `type()` switches to typing and types one character per pause (1 ms before / at each boundary) | Unit | ✅ |
| useTypewriter | `type()` goes idle after the last character and leaves no timer | Unit | ✅ |
| useTypewriter | `type(lead)` delays only the first character | Unit | ✅ |
| useTypewriter | lead: `idle` during the lead and at lead − 1 ms, `typing` when it ends | Unit | ✅ |
| useTypewriter | lead: exactly one pending timer during and after the lead | Unit | ✅ |
| useTypewriter | lead: `idle` even when called while typing; `type()`/`type(0)` typing at once; no-op at full count | Unit | ✅ |
| useTypewriter | lead: `stop()` and `erase()` cancel it; `erase()` with visible characters deletes and never types | Unit | ✅ |
| useTypewriter | lead: scope disposal clears the lead timer | Unit | ✅ |
| useTypewriter | `type()` continues from `initialCount` with that character's pause | Unit | ✅ |
| useTypewriter | `type()` at full count stays idle, no timer | Unit | ✅ |
| useTypewriter | a repeated `type()` restarts the pending pause, one timer | Unit | ✅ |
| useTypewriter | `erase()` removes one character synchronously, then one per `deleteDelay` | Unit | ✅ |
| useTypewriter | `erase()` goes idle at 0 with no timer; no-op at 0; never below 0 | Unit | ✅ |
| useTypewriter | `erase()` during typing deletes from the current count | Unit | ✅ |
| useTypewriter | `type()` during deleting types upwards with `typeDelays[count]` and ends full, idle | Unit | ✅ |
| useTypewriter | alternating calls never keep more than one pending timer | Unit | ✅ |
| useTypewriter | `stop()` keeps the count, goes idle, clears the timer | Unit | ✅ |
| useTypewriter | disposing the scope clears the timer and freezes the count (typing and deleting) | Unit | ✅ |
| useTypewriter | `count` is readonly | Unit | ✅ |
| useBrandTitle | `BRAND_TITLE` is `michaelschreiber.net` | Unit | ✅ |
| useBrandTitle | `BRAND_SEGMENTS` covers 0–20 without gaps and slices to `michael`, `schreiber`, `.net` | Unit | ✅ |
| useBrandTitle | 20 delays equal to the D4 table, sum 4380, word pauses before `s` and `.` | Unit | ✅ |
| useBrandTitle | delete delay 60 ms, intro lead 800 ms | Unit | ✅ |
| useBrandTitle | intro: empty at mount, `m` at 1000 ms, full and idle at 5180 ms, no timer | Unit | ✅ |
| useBrandTitle | intro: `idle` at 0 and 799 ms, `typing` (empty) at 800 ms, one timer during the lead | Unit | ✅ |
| useBrandTitle | second instance: full, idle, no timer (also after an unmount mid-intro) | Unit | ✅ |
| useBrandTitle | `resetBrandTitleIntro()` re-enables the intro | Unit | ✅ |
| useBrandTitle | `first`/`strong`/`tld` at count 0, 5, 7, 10, 16, 18, 20 | Unit | ✅ |
| useBrandTitle | pointer enter deletes one at once, empty and idle after 19 × 60 ms | Unit | ✅ |
| useBrandTitle | pointer leave retypes from the current count with the D4 pause, ends full | Unit | ✅ |
| useBrandTitle | hover mid-intro deletes from the current count | Unit | ✅ |
| useBrandTitle | `pen`, missing and empty `pointerType` act like a mouse | Unit | ✅ |
| useBrandTitle | touch enter and touch leave are ignored | Unit | ✅ |
| useBrandTitle | reduced motion: queries the media feature, full title, no timer, handlers inert | Unit | ✅ |
| useBrandTitle | `matchMedia` with no preference still plays the intro | Unit | ✅ |
| useBrandTitle | no pending timer after unmount (intro, deleting) | Unit | ✅ |
| AppNavigation | `.brand__sr` is `michaelschreiber.net` at mount, mid-typing and fully deleted | Component | ✅ |
| AppNavigation | `.brand__title` and the mark are `aria-hidden`; no `aria-label`, no `aria-live`; brand links to `/` | Component | ✅ |
| AppNavigation | ghost holds the full text and one non-blinking cursor in every state | Component | ✅ |
| AppNavigation | `.brand__typed` contains no whitespace text | Component | ✅ |
| AppNavigation | typed and ghost: exactly first, strong, tld, cursor, no text nodes between (also when empty) | Component | ✅ |
| AppNavigation | segment texts: full after the intro and in the ghost, `michael`/`sch`/`` at count 10 | Component | ✅ |
| AppNavigation | intro: empty, `m` at 1000 ms, grows, full at 5180 ms | Component | ✅ |
| AppNavigation | intro: `data-phase` idle until 799 ms, typing from 800 ms, idle after the intro | Component | ✅ |
| AppNavigation | exactly one empty cursor element in `.brand__typed` | Component | ✅ |
| AppNavigation | cursor blinking during the lead, solid 800–999 ms, while typing and deleting, blinking when idle (AC 3) | Component | ✅ |
| AppNavigation | mouse enter removes one at once, next after 60 ms, empty and idle after 19 × 60 ms | Component | ✅ |
| AppNavigation | leave at count 12 keeps the text, types `i` after 160 ms, ends full, idle, blinking | Component | ✅ |
| AppNavigation | leave after a full delete retypes from empty | Component | ✅ |
| AppNavigation | hover mid-intro deletes from the current count | Component | ✅ |
| AppNavigation | `pen` and an event without `pointerType` act | Component | ✅ |
| AppNavigation | touch enter, touch leave, `focus` and `mouseenter` change nothing | Component | ✅ |
| AppNavigation | reduced motion: full title, no timer, idle cursor, no delete on hover | Component | ✅ |
| AppNavigation | no pending timer after unmount (intro, deleting) | Component | ✅ |
| AppNavigation | remount in the same page load: full, idle, no timer | Component | ✅ |
| AppNavigation | de/en navigation labels and hrefs unchanged | Component | ✅ |
| AppNavigation | hamburger opens/closes (`aria-expanded`, `is-open`), closes on nav-link and brand click, keeps its `aria-label` | Component | ✅ |
| AppNavigation (source) | underscore size, `currentColor`, baseline | Unit (raw SFC) | ✅ |
| AppNavigation (source) | `brand-cursor-blink 1s steps(1, end) infinite`; keyframes 0 % on, 50 % off | Unit (raw SFC) | ✅ |
| AppNavigation (source) | reduced-motion `animation: none` for the blinking cursor, after the blink rule | Unit (raw SFC) | ✅ |
| AppNavigation (source) | `.brand__strong` bold, `.brand__first`/`.brand__tld` normal weight (D2a) | Unit (raw SFC) | ✅ |
| AppNavigation (source) | no `color` on `.brand__tld`, no `--color-primary` in brand rules, no weight on `.brand__name` (D2a) | Unit (raw SFC) | ✅ |
| AppNavigation (source) | hidden ghost, single grid cell, `inline-grid`, visually-hidden `.brand__sr`, `nowrap` | Unit (raw SFC) | ✅ |
| AnimatedLogo | viewBox `0 32 512 376`; `aspect-ratio: 512 / 376`, no `aspect-ratio: 1` | Component / raw SFC | ✅ |
| AnimatedLogo | no wordmark group, glyphs, `data-char`, cursor, `<rect>` outside the mask | Component | ✅ |
| AnimatedLogo | no glyph/cursor/wordmark CSS, no `logo-cursor-*` keyframes, no `--logo-glyph` | Unit (raw SFC) | ✅ |
| AnimatedLogo | root children: defs, traces, 7 dots, 3 heads (no wordmark) | Component | ✅ |
| AnimatedLogo | each ring ± 14.312 and each trace vertex inside the cropped viewBox | Component | ✅ |
| AnimatedLogo | reduced-motion block: traces, dots, heads, holes only; no glyph/cursor; still last | Unit (raw SFC) | ✅ |
| AnimatedLogo | MS-17 circuit, ring, mask, joint, merge and `steps(1, start)` tests unchanged | Component / raw SFC | ✅ |

Totals: `useTypewriter` 55, `useBrandTitle` 52, `AppNavigation` 86,
`AnimatedLogo` 272 tests; the whole suite has 824 tests in 18 files.

## Findings

1. **Resolved — cursor solid during the intro lead.** Round 1 found that
   `type(800)` switched to `typing` at once, so the cursor was solid from 0 to
   1.0 s instead of blinking until the intro starts, which contradicted the
   intro description in D4/D6. The concept now defines a lead phase (D4): the
   lead is spent in `idle` inside the engine, and the phase switches to
   `typing` when the lead ends. The implementation matches. The tests now
   assert `idle` (blinking) from 0 to 799 ms and `typing` (solid) from 800 ms,
   with `m` at 1000 ms.

No open findings.

## Untested Areas

- Layout stability, cursor geometry and blinking are CSS effects that jsdom
  does not render; they are asserted at source level only and remain manual
  browser checks (Chrome, Safari, Firefox).
- Real touch input (a tap emits `pointerenter` with `pointerType: 'touch'`
  plus emulated mouse events): covered by the touch filter tests and the
  `mouseenter` test, the device behaviour itself is a manual check.
- Screen reader announcement ("michaelschreiber.net, link"): the accessible
  name is covered structurally (`.brand__sr`, `aria-hidden` title, mark);
  VoiceOver/NVDA output is a manual check.
- Hero spacing and clipping after the viewBox crop: geometry bounds are
  tested, the visual result is a manual check.
