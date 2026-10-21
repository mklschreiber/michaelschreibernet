---
type: Test Concept
title: Tests for Animated SVG Logo Instead of GIF
description: Covers the inline AnimatedLogo SVG (accessible label, outlined wordmark, currentColor, trace timing, travelling rings synced to their traces, the P4/D5 merge at the bottom-right junction, the trace hole mask and joint geometry, the typing rhythm and blinking cursor, geometry against the design file, CSS animation, rule order and reduced motion) and its landing-page integration replacing logo_anim.gif.
tags: [MS-17, tests]
timestamp: 2026-10-21T11:00:00+07:00
---

## Scope

Jira: [MS-17](https://mklschreiber.atlassian.net/browse/MS-17).
Concept: [Animated SVG Logo Instead of GIF](MS-17-animated-svg-logo.md). It
includes "User Review Round 1" (travelling circles, blinking block cursor),
"User Review Round 2" (hole mask, snapped ring centres, typing rhythm) and
"User Review Round 3" (the P4 circle merges into the D5 circle at J, D3c).
Design input: [docs/design/MS-17/README.md](../design/MS-17/README.md),
`logo-outlined.svg` and `ring-geometry.py`.

Tested (Vitest, Vue Test Utils, jsdom, real `de`/`en` locales; files in
`app/src/__tests__/`). Custom properties are read with
`style.getPropertyValue`, because jsdom keeps them. CSS is checked on the raw
SFC (`?raw`), because jsdom does not apply scoped styles. The source helper
finds a rule by any selector in a grouped selector list, so the shared
ring/hole rules are read correctly.

### `AnimatedLogo.spec.ts` (272 tests)

- **Root and accessibility (AC 5):** one root `svg` with
  `viewBox="0 0 512 512"` and `role="img"`. The de and en `landing.logoAlt`
  is the `aria-label`. A parent class falls through to the root.
- **Outlined wordmark (AC 1):** no `<text>` and no `<image>`. There are 20
  glyph paths spelling `michaelschreiber.net`, weighted light / medium /
  light. The wordmark has `fill="currentColor"`.
- **Traces:** 9 traces with `pathLength="1"`, `currentColor`, no fill and
  width 10.68. Each `d`, delay and duration follows the D3 table (round 3:
  P4 takes 1.38s). Literal
  black appears only inside the mask (D6).
- **Rings (D2, D3, D3a):**
  - Exactly 10 ring circles outside the mask: dots `--d1`…`--d7` and heads
    `--p4`, `--p7`, `--p8`.
  - All are direct children of the root, with `r="10.144"`, stroke width
    8.336 and `currentColor`.
  - Root child order: `defs`, then the masked trace group, then 7 dots, then
    3 heads, then the wordmark.
  - `cx`/`cy` are the exact strings from the D3 tables. The P4 head rests on
    D5's centre (round 3).
  - The root dot is at `0s`. Each moving dot and the P7 and P8 heads have
    their trace's exact delay and duration (the sync guarantee). The P4 head
    has its own timing (see the merge below). Nothing else starts at 0 s.
  - The circuit ends by 3.8 s, when the cursor appears.
- **Hole mask (D3b):**
  - There is one `defs > mask#animated-logo-holes` with
    `maskUnits="userSpaceOnUse"` and x/y/width/height 0/0/512/512.
  - Its first child is a white 512×512 `rect`.
  - It holds 10 black holes with `r="10.144"`, using the ring modifiers in
    ring order.
  - Each hole has the same `cx`/`cy` and the same delay and duration as its
    ring.
  - `g.animated-logo__traces` carries `mask="url(#animated-logo-holes)"` and
    is the only masked element. It contains exactly the 9 trace groups and
    traces, and nothing else.
- **Joint geometry (D3b):**
  - Each moving dot centre lies on the axis of its trace's last segment
    (< 0.01 units). D3 lies on the axes of P4 and P7.
  - Each trace end, and the P4 and P7 starts, is within [5.976, 13.69] of its
    ring centre. Below that range, line would show in the hole; above it, the
    joint would have a notch.
  - Every dot moved less than 1.11 units from its design centre. The concept
    says "≤ 1.1"; D3's diagonal snap is 1.103.
- **Typing and cursor markup (D4, D4a):**
  - The glyph `--logo-delay` values match the D4 table, rise strictly, and
    end at `9.18s`.
  - Both word pauses are longer than any gap between letters.
  - `--logo-glyph` and `--logo-typing-start` are gone.
  - There is exactly one cursor `rect`, in the glyph group, and it is the only
    `rect` outside the mask. It has `x="566.19" y="1218.66" width="22"
    height="41.26"` and `currentColor`.
- **Design geometry (AC 3):**
  - The trace group transforms are identical, and each trace is the design
    polyline as is or reversed.
  - `r` and stroke width are the scaled design values. Each head sits on its
    trace's end point.
  - Both wordmark transforms and all 20 glyph outlines are identical.
- **Travelling circles (D3a, source):** for the 8 keyframes that follow a
  single trace (6 dots, P7 and P8 heads):
  - one stop per trace vertex;
  - the stops lie on the vertices, with the last stop at the circle centre
    (< 0.05 units);
  - **round 3 method:** each stop percentage is the cumulative *trace* length
    at that vertex divided by the trace length (< 0.1 %). So the circle sits
    on the tip at every vertex and runs slightly ahead only on the last
    segment into its dot.

  For all 9 keyframes, the last stop is `translate(0px, 0px)` and the move
  is linear with the element's delay and duration.
- **Bottom-right merge (D3c, round 3):**
  - The P4 trace runs 0.10s / 1.38s.
  - The P4 head and its hole rest on D5's centre and use 0.10s / 1.90s. So
    the head arrives at D5 together with the D5 circle (2.00 s).
  - `logo-move-p4` has six stops. The first four lie on the P4 vertices and
    match the P4 tip time at each vertex (< 5 ms), up to the P4 end at 1.48 s.
  - Stop 5 is exactly `73% translate(69.52px, 56.88px)`. That equals
    `logo-move-d5`'s `68.9%` stop, and it lies on P3's corner J.
  - 0.10 + 0.73 × 1.90 and 0.35 + 0.689 × 1.65 both give 1.487 s and agree
    within 5 ms.
  - P4 ends 1.10 units before J. From J on, the P4 head's keyframe tail is
    identical to D5's, ending at `translate(0px, 0px)`.

  Moving dots use fill `both` plus `logo-show 1ms steps(1, start)`. D3 uses
  `logo-pop`. Heads use exactly `logo-move-pN … none, logo-head-on … none`
  with base `opacity: 0`.
- **Holes animate with their rings (D3b, source):** each of the 9 moving
  holes has exactly its ring's `animation` declaration. Hole `--d3` is
  static. Head holes have base `opacity: 0`; dot holes are not hidden in
  their base rule.
- **Cursor (D4a, source):**
  - The base style is `opacity: 0`.
  - The blink is `logo-cursor-blink 6.88s steps(1, end) 3.8s none` and the
    move is `logo-cursor-move 5.68s steps(1, end) 5s none`. Both end at
    10.68 s.
  - The blink alternates 1/0, and its stops fall at 3.8, 4.3, 4.8, 9.68,
    10.18 and 10.68 s. The cursor turns solid 0.2 s before the first glyph and
    stays solid until 0.5 s after the last one.
  - The move stops hold the 20 offsets plus `100%` at `499.23px`. Stop j fires
    at glyph j's D4 time (< 1 ms). The offsets never decrease.

  `steps(1, end)` with fill `none` on a base `opacity: 0` is intentional for
  the cursor.
- **CSS contract (source):**
  - `logo-draw` starts from `stroke-dashoffset: 1.01`, with the trace
    shorthand (AC 2). The trace base style is the end state.
  - The glyph reveal is exactly `logo-show 1ms steps(1, start)
    var(--logo-delay) both`, and `logo-show` goes from 0 to 1.
  - **Regression guard:** glyph, moving-dot and dot-hole reveals use no
    jump-end timing (`steps(1)`, `steps(1, end)`, `jump-end`, `step-end`).
    With `steps(1, end)` Chrome left m/i/c invisible.
  - The base rules of traces, glyphs and dots never hide anything.
  - `@media (prefers-reduced-motion: reduce)` sets `animation: none` for
    traces, dots, heads, holes, glyphs and the cursor (AC 4).
  - **Rule order (D5):** no `animation` declaration follows the reduced-motion
    block, and that block is the last thing before `</style>`.
  - There is no font and no `logo_anim.gif` reference.

### `LandingPage.spec.ts` (7 tests, unchanged since round 0)

- The hero logo is `svg.hero__logo.animated-logo`, placed before the `h1`,
  with the de and en `aria-label`.
- AC 6: no `img[src="/logo_anim.gif"]`, no `img` in the hero, and
  `app/public/logo_anim.gif` no longer exists.

Not tested automatically: rendering and playback (see Untested Areas).

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| AnimatedLogo | svg root, 512 viewBox, `role="img"`, de / en aria-label, class fall-through | Component | ✅ |
| AnimatedLogo | no `text` / `image`; 20 glyphs spelling the wordmark with design weights; currentColor fill | Component | ✅ |
| AnimatedLogo | 9 traces: `pathLength="1"`, currentColor, width 10.68, `d` / delay / duration per D3, P4 1.38s (9 × 2) | Component | ✅ |
| AnimatedLogo | literal black only inside the mask | Component | ✅ |
| AnimatedLogo | 10 root-level rings d1–d7, p4, p7, p8 with ring attributes | Component | ✅ |
| AnimatedLogo | root child order: defs, masked traces, dots, heads, wordmark | Component | ✅ |
| AnimatedLogo | ring `cx`/`cy` per round 2 D3 tables (10 cases) | Component | ✅ |
| AnimatedLogo | d3 at 0s, nothing else at or before 0s; dot / P7 / P8 head timing = trace timing (8 cases) | Component | ✅ |
| AnimatedLogo | circuit complete before the cursor appears | Component | ✅ |
| AnimatedLogo | mask id, units, area and white base rect | Component | ✅ |
| AnimatedLogo | 10 black holes r 10.144 in ring order; centre and timing = ring (2 × 10 cases) | Component | ✅ |
| AnimatedLogo | only the trace group is masked, and it holds the 9 traces only | Component | ✅ |
| AnimatedLogo | dot centres on their trace axis, D3 on the P4 / P7 axes (8 cases) | Component | ✅ |
| AnimatedLogo | trace end / start within [5.976, 13.69] of the ring centre (8 cases) | Component | ✅ |
| AnimatedLogo | ring snap < 1.11 units from the design centre (7 cases) | Component | ✅ |
| AnimatedLogo | glyph delays per D4, strictly increasing, word pauses longest, no `--logo-glyph` | Component | ✅ |
| AnimatedLogo | one cursor rect in the glyph group with contract geometry, the only rect outside the mask | Component | ✅ |
| AnimatedLogo | trace transforms / polylines, ring size, head positions, glyph outlines equal the design | Component | ✅ |
| AnimatedLogo | single-trace `logo-move-*`: stops on the trace vertices, percentages = trace length to vertex / trace length (8 × 3) | Source | ✅ |
| AnimatedLogo | all 9 `logo-move-*` end at `translate(0px, 0px)` and run linearly | Source | ✅ |
| AnimatedLogo | merge: P4 trace 1.38s; P4 head and hole on D5's centre with 0.10s / 1.90s, arriving with D5 at 2.00 s | Component | ✅ |
| AnimatedLogo | merge: `logo-move-p4` has six stops, the first four on the P4 tip; the 73% J stop equals d5's 68.9% stop on P3's corner | Source | ✅ |
| AnimatedLogo | merge: both circles reach J at 1.487 s (within 5 ms); P4 ends 1.10 before J; the tail after J is identical to D5's | Source | ✅ |
| AnimatedLogo | moving circles linear with trace timing; dots fill `both` + `logo-show steps(1, start)` | Source | ✅ |
| AnimatedLogo | heads: fill `none` + `logo-head-on`, base `opacity: 0`; d3 `logo-pop` | Source | ✅ |
| AnimatedLogo | holes share their ring's animation; d3 hole static; head holes hidden in base, dot holes not | Source | ✅ |
| AnimatedLogo | cursor base `opacity: 0`; blink 6.88 s @ 3.8 s, move 5.68 s @ 5 s, `steps(1, end)`, fill `none`; end 10.68 s | Source | ✅ |
| AnimatedLogo | blink stops at 3.8 / 4.3 / 4.8 / 9.68 / 10.18 / 10.68 s, on / off alternating | Source | ✅ |
| AnimatedLogo | cursor offsets per concept, each step at its glyph's D4 time, monotonic, end 499.23px | Source | ✅ |
| AnimatedLogo | `logo-draw` from 1.01; trace base is the end state; glyph `logo-show steps(1, start)` | Source | ✅ |
| AnimatedLogo | regression: no jump-end timing for glyph, dot and dot-hole reveals | Source | ✅ |
| AnimatedLogo | base rules of traces, glyphs and dots never hide | Source | ✅ |
| AnimatedLogo | reduced motion: `animation: none` for traces, dots, heads, holes, glyphs, cursor | Source | ✅ |
| AnimatedLogo | reduced-motion block is the last rule block, with no `animation` after it | Source | ✅ |
| AnimatedLogo | no font and no `logo_anim.gif` reference | Source | ✅ |
| LandingPage | hero logo is the inline AnimatedLogo svg, before the heading, de / en label | Component | ✅ |
| LandingPage | no GIF `img`, no `img` in the hero, `logo_anim.gif` deleted | Component / fs | ✅ |

## Untested Areas

jsdom does not render SVG and applies neither scoped CSS, masks nor
animations. The tests pin the markup, the geometry and the CSS contract. That
the browser renders it as intended remains a browser check.

**Joint verification** (Chrome; the architect ran it on a prototype, see
concept D3b):

1. Open `/` and run
   `document.getAnimations().forEach(a => { a.pause(); a.currentTime = T })`
   for T = 0 … 3800 ms in steps of 25–50 ms. Alternatively, use the DevTools
   Animations panel at 10 % speed.
2. At each step, check that every visible ring hole shows the background with
   no line pixels.

**Manual check** in Chrome, Safari and Firefox:

- The circles ride the trace tips, and new circles appear at branch points,
  compared with GIF frames `f001`–`f036`.
- No line shows inside any ring hole at any moment or in the end state, and
  no notch shows at a joint. Watch the Safari repaint of the animated mask.
- The six dots end on their final rings, and the P7 and P8 heads vanish at
  their trace end. The P4 head meets the D5 circle at the bottom-right
  junction J at the same moment, and the two continue as one ring to D5 with
  no disappearance. Compare `gif-frames-bottom-junction-f010-f023.png`.
- The cursor appears at `m` after the circuit, blinks, and steps with each
  glyph in the D4 rhythm, including the two word pauses. It blinks after
  `.net` and is gone at about 10.7 s. All glyphs, including m/i/c, stay
  visible.
- The end state matches `compare-gif-vs-outlined.png`, within the ≤ 1.1-unit
  ring snap.
- Under `prefers-reduced-motion: reduce`, the static end state shows at once,
  with no extra circles, no cursor and clean ring holes.
