---
type: AI Review
title: Review for Animated SVG Logo Instead of GIF
description: Round 4 is positive. The P4 and D5 circles reach the bottom-right junction together, merge and run on to D5 without a pop, every keyframe matches an independent recomputation, real-time Chrome playback shows clean ring holes, and all checks pass; Safari and Firefox still need the manual check.
tags: [MS-17, review]
timestamp: 2026-10-21T08:10:00+02:00
verdict: positive
---

## Round 1 — 2026-10-21T06:05:00+02:00

### Scope

- Concept: [MS-17-animated-svg-logo.md](MS-17-animated-svg-logo.md) (draft,
  2026-10-21), including the revised D5 (`steps(1, start)` for the glyph
  reveal).
- Testing concept: [MS-17-tests.md](MS-17-tests.md).
- Design copy: `docs/design/MS-17/` (`README.md`, `logo-outlined.svg`,
  `compare-gif-vs-outlined.png`, `gif-frames/`).
- Code: uncommitted changes on `feature/MS-17-animated-svg-logo-instead-of-gif`
  against `main` (`ae20c7a`): new `app/src/components/AnimatedLogo.vue`,
  `app/src/views/LandingPage.vue`, staged deletion of
  `app/public/logo_anim.gif`, `docs/architecture/index.md` and `log.md`.
- Tests: new `app/src/__tests__/AnimatedLogo.spec.ts`, updated
  `app/src/__tests__/LandingPage.spec.ts`.
- Checks (in `app/`): `npm run test:unit -- --run` (15 files, 441/441
  passed), `npm run lint:check` (clean), `npm run build` (type-check and
  Vite build pass; `dist/` has no GIF).
- Browser check (headless Chrome against `vite preview` of the build):
  `--force-prefers-reduced-motion` with a 300 ms virtual time budget, the same
  without reduced motion, and the end state after 8 s.

What was verified:

- **AC 1, D2:** The template is the `logo-outlined.svg` markup with only the
  D2 edits. There is no `<text>` or `<image>` and no font reference. The 20
  glyph paths, all transforms, circle geometry and stroke widths are
  identical to the design file (the spec parses the design file and compares
  them). Five traces (P1, P2, P6, P8, P9) are the reversed design polylines,
  as in the D3 table.
- **AC 2, D3–D5:** Traces use `pathLength="1"`, `stroke-dasharray: 1 2` and
  the `logo-draw` keyframe from `stroke-dashoffset: 1.01`. Every
  `--logo-delay`/`--logo-duration` matches the D3 tables. Only the root dot
  starts at 0 s, and the last trace ends at 3.55 s, before the typing start at
  3.7 s. Glyphs are indexed 0–19 and use
  `logo-type 1ms steps(1, start) calc(...) both`. The jump-start step returns
  0 in the before phase, so the backwards fill keeps the glyphs hidden until
  their delay. Base rules contain no opacity or visibility, so the base style
  is the end state.
- **AC 3:** In the headless Chrome screenshot after 8 s, all traces, dots and
  all 20 glyphs are visible and match `compare-gif-vs-outlined.png`. The logo
  is centred and square above the heading.
- **AC 4 and the `App.vue` interaction:** The global rule in `App.vue` is
  unscoped and sets only `animation-duration: 0.01ms !important` (plus the
  iteration count). It does not override `animation-name`. The scoped
  `animation: none` in the component sets `animation-name: none`, so no
  animation is created, whatever the `!important` duration. Delays therefore
  no longer apply, and the elements show their base (end) style. The headless
  Chrome check confirms this. With `--force-prefers-reduced-motion`, the full
  logo is visible at 300 ms. Without it, only the root dot and the start of
  the first traces are visible at the same time. The concept's D8 note (the
  global rule alone would keep the elements hidden until their delay) is
  correct, so the component rule is needed and works.
- **AC 5, D8:** `role="img"` and `:aria-label="t('landing.logoAlt')"` are on
  the root `<svg>`. Tests cover the label in de and en, in the component and
  on the landing page.
- **AC 6, D9:** `LandingPage.vue` renders `<AnimatedLogo class="hero__logo" />`.
  The `.hero__logo` scoped rule reaches the component root. The GIF is
  deleted (`git rm`), and no source, `index.html` or `public/` file still
  references it. The only remaining mentions are historical docs and a local
  `.obsidian/workspace.json`.
- **D6:** All paint is `currentColor`, and the markup has no black.
- **Test coverage:** It matches every row of the testing concept. The tests
  would fail on real regressions: a wrong `d` or delay, a missing reversal,
  geometry drift from the design, `steps(1, end)`, a missing reduced-motion
  block, or a hidden base style. The animation playback itself remains a
  manual browser check, as documented.

### Findings

None.

Non-blocking notes:

- `docs/design/MS-17/` is still untracked. `AnimatedLogo.spec.ts` reads
  `docs/design/MS-17/logo-outlined.svg` at test time, so the directory must be
  committed with the story (D9 already says so). Otherwise CI (`ci.yml`) will
  fail.

### Verdict

positive

## Round 2 — 2026-10-21T06:30:00+02:00

### Scope

- Trigger: user review round 1 (Jira comment "Review — Round 1
  (2026-10-21)"; design README section "User review round 1"). It asks for
  (1) circles that travel on the growing traces, with new circles at the
  branches, as in the GIF, and (2) a blinking block cursor. The cursor
  appears at `m` after the circuit, moves with the typing, stays briefly
  after `michaelschreiber.net`, then disappears.
- Concept: [MS-17-animated-svg-logo.md](MS-17-animated-svg-logo.md), revised.
  Changed: the new "User Review Round 1" section, D3 (dot and head tables),
  D3a (travelling circles), D4 (typing start 4.8 s), D4a (cursor), D5 and D8.
- Testing concept: [MS-17-tests.md](MS-17-tests.md), revised.
- Code: reworked `app/src/components/AnimatedLogo.vue`, rewritten
  `app/src/__tests__/AnimatedLogo.spec.ts`. `LandingPage.vue` and its spec
  are unchanged since round 1.
- Checks (in `app/`): `npm run test:unit -- --run` (15 files, 541/541
  passed), `npm run lint:check` (clean), `npm run build` (`vue-tsc` and the
  Vite build pass).
- Independent recomputation (Python, outside the repo):
  - Flattened circle centres and radius from the design file's circle
    matrices.
  - All nine `logo-move-*` keyframe stops (translate offsets and cumulative
    length percentages) from the transformed trace polylines.
  - All 20 cursor offsets from the glyph path extents (right ink edge
    + 3 − 566.19).
- Browser check: headless Chrome against `vite preview` of the build, at
  virtual times of about 1.7 s, 4.0 s, 5.5 s and 9 s, plus
  `--force-prefers-reduced-motion` at 0.3 s.

What was verified:

- **Travelling circles (user point 1, D3a):**
  - **Centres and size:** the seven dots are flattened to root-level
    circles. Their centres equal the design circle centres after the
    `matrix(0.579683,…)` transform: `r` 10.144 (= 17.5 × 0.579683) and stroke
    width 8.336 (= 14.38 × 0.579683). The circles have no `transform`
    attribute, so the CSS `transform` animation cannot override any geometry.
  - **Keyframe paths:** every `logo-move-*` stop matches my recomputation to
    within 0.1 units and 0.1 %. Each path is the trace vertices, with the
    last vertex replaced by the dot centre. The trace-end vertex is left out
    where it is (almost) collinear with the dot centre, with a deviation
    below 1 unit.
  - **Heads:** P4, P7 and P8 end exactly at their trace end points.
  - **Timing:** each moving circle uses exactly its trace's delay, duration
    and `linear` timing. The hand-offs line up in time and place: P7's head
    ends at 0.35 s where P8's head and D5 start; P8 ends at 1.55 s where D2
    (P1) starts. The other branches start where their parent tip passes,
    within ±0.05 s (round 1 timing).
  - **Visibility:** dots stay hidden until their delay
    (`logo-show steps(1, start) both`). Heads are visible only while active
    (fill `none` on base `opacity: 0`). At 1.7 s the headless screenshot
    shows several circles riding the tips at once, including the doubled
    circle at the M branch.
- **Block cursor (user point 2, D4a):**
  - **Element:** one `rect` in the glyph coordinate system, filled with
    `currentColor`. `translateX` in CSS `px` is in that element's user
    units, so the offsets use glyph units as intended.
  - **Timeline:**
    - `logo-cursor-blink` (4.4 s from 3.8 s) gives: on 3.8 s, off 4.3 s,
      on 4.8–7.2 s, off 7.2 s, on 7.7 s, end at 8.2 s.
    - `logo-cursor-move` (3.4 s from 4.8 s) steps to the right of glyph j at
      4.8 + 0.1·j s, at the same moment glyph j appears, and holds after `t`
      until 8.2 s.
    - Both use fill `none` on a base `opacity: 0`. The end state never
      depends on the held end-of-animation value, so the round 1
      `steps(1, end)` rounding bug cannot leave the cursor visible.
  - **Offsets:** all 20 offsets match the glyph extents exactly.
  - **Screenshots:** a solid block at `m` before typing at about 4.0 s; the
    cursor right of `michael` at about 5.5 s; at 9 s the full logo with no
    cursor and no heads.
- **Reduced motion (AC 4):** the media block lists `.animated-logo__dot` and
  `.animated-logo__head`. These have the same specificity as the modifier
  rules (`.animated-logo__dot--d1[data-v]` etc.), and the block wins because
  it comes last in the `<style>`. As in round 1, the global `App.vue` rule
  touches only the duration, not `animation-name`. Headless Chrome with
  `--force-prefers-reduced-motion` shows the full static end state at
  0.3 s: seven dots at their final positions, the whole wordmark, no heads
  and no cursor.
- **Unchanged contracts:**
  - AC 1, 3, 5 and 6 still hold: no `<text>`, the glyph outlines and
    transforms are equal to the design, `role="img"` with the localized label,
    and no GIF.
  - The base style is still the end state.
  - The concept, testing concept, log and index entries are updated
    consistently.
- **Tests:** the rewritten spec covers every row of the revised testing
  concept. It derives the keyframe checks from the rendered trace geometry,
  not from copied constants, and would catch a circle leaving its trace, a
  desynchronised delay or duration, a cursor out of step with the glyphs, a
  visible base style, or a missing reduced-motion selector.

### Findings

None.

Non-blocking notes:

1. `AnimatedLogo.spec.ts` (tester): the reduced-motion block only beats the
   per-modifier animation rules (`.animated-logo__dot--d*`,
   `.animated-logo__head--p*`) because it comes last in the source. They have
   the same specificity. No test pins this order. If the media block were
   moved above those rules, reduced motion would silently stop working for
   dots and heads, while all current tests stayed green. A source-order
   assertion would close the gap. The current code is correct.
2. `AnimatedLogo.spec.ts` (tester): the cursor offsets are checked against
   the concept constants, not against the glyph path extents. I recomputed
   them independently and they match. A derived check would only matter if
   the glyph outlines change.
3. From round 1, still open: `docs/design/MS-17/` is untracked, and the spec
   reads `logo-outlined.svg` from it. It must be committed with the story,
   otherwise CI fails.

### Verdict

positive

## Round 3 — 2026-10-21T07:20:00+02:00

### Scope

- Trigger: user review round 2 (Jira comment "Review — Round 2
  (2026-10-21)"; design README section "User review round 2"). It asks for
  (1) traces that dock exactly onto the rings, with no line inside any ring
  hole and no notch, at every moment and in the end state, and (2) a calmer,
  natural typing rhythm.
- Concept: [MS-17-animated-svg-logo.md](MS-17-animated-svg-logo.md), revised.
  Changed: the new "User Review Round 2" section, D3 (snapped ring centres),
  D3a (recomputed keyframes), D3b (hole mask), D4 (fixed glyph delays), D4a
  (cursor timeline), D5 (rule order), D6 and D8. New
  `docs/design/MS-17/ring-geometry.py`.
- Testing concept: [MS-17-tests.md](MS-17-tests.md), revised.
- Code: reworked `app/src/components/AnimatedLogo.vue` (mask
  `animated-logo-holes` with 10 holes, masked trace group), rewritten
  `app/src/__tests__/AnimatedLogo.spec.ts`.
- Checks (in `app/`): `npm run test:unit -- --run` (15 files, 619/619
  passed), `npm run lint:check` (clean), `npm run build` (`vue-tsc` and the
  Vite build pass).
- Independent verification:
  - I ran `ring-geometry.py` and compared its output with the component. All
    nine `logo-move-*` keyframe blocks match exactly (difference 0.0).
  - The geometry agrees with my round 2 recomputation: the snapped centres are
    projections of the design centres onto the last trace segment (D3 is the
    P4×P7 intersection), and the shifts are 0–1.1 units.
  - All joint distances are 9.93–12.45, inside [5.976, 13.69].
  - The glyph delays equal the D4 table. Intervals are 0.16–0.24 s, with
    0.45 s and 0.40 s word pauses.
  - The `logo-cursor-move` stops equal (t_j − 5.0) / 5.68 to within 0.0005 %,
    and the `logo-cursor-blink` stops equal (t − 3.8) / 6.88.
- Browser check (Chrome 4× and 2× device scale, `vite preview` of the build):
  - **Real-time playback from page load,** recorded with a CDP screencast of
    every painted frame (about 45 fps, 0–4 s). I looked at frame series
    around the P7, P8 and P4 head hand-offs and ends, plus the start of the
    circuit.
  - **Paused seeks** at 1.60–1.75 s.
  - **High-DPI screenshots** at about 0.7, 1.6, 2.6 and 12 s.
  - **`--force-prefers-reduced-motion`** at 0.3 s.

What was verified:

- **Joints (user point 1, D3b):**
  - **Mask setup:** the mask is `userSpaceOnUse` over 0 0 512 512 and is
    applied only to the trace group, which has no transform, so mask and
    viewBox coordinates are the same. Every hole has the same centre,
    `r="10.144"`, timing and animation rule as its ring, through grouped
    selectors.
  - **Visibility:** dot holes stay at `opacity: 0` before their delay (the
    backwards fill of `logo-show`), so a waiting hole does not cut the line.
    Head holes have base `opacity: 0` and fill `none`, so they vanish with
    their head.
  - **Real-time frames:** none shows line ink inside a ring hole, a gap
    without a ring, or a notch.
  - **End state and reduced motion:** at 4× scale the end state and the
    reduced-motion state show clean, centred joints on all seven rings.
  - **Expected overlaps:** the rings overlap at the root at 0.1–0.35 s and at
    the M branch at about 1.55–1.6 s. The concept intends this (GIF "split",
    Open Question 1).
- **Typing (user point 2, D4/D4a):** typing uses fixed per-glyph delays with
  no runtime randomness, so it is reproducible. The cursor appears at 3.8 s,
  after the last dot arrives at 3.55 s. It blinks, then hesitates
  (4.8–5.0 s), stays solid while typing including the word pauses, jumps
  together with each glyph, blinks after `t` and is gone at 10.68 s. Both
  cursor animations use fill `none` on a base `opacity: 0`.
- **Reduced motion (AC 4):** the media block also lists
  `.animated-logo__hole`, and it is the last block of the `<style>`. My round
  2 note is closed: two tests now check that no `animation` follows the
  block and that it is the last rule block. Headless Chrome with reduced
  motion shows the static end state: seven rings with clean holes, no heads
  and no cursor.
- **Unchanged contracts:**
  - AC 1, 3 (within the ≤ 1.1-unit ring snap that the user requested), 5 and 6
    hold.
  - The base style is the end state.
  - The concept, testing concept, log and index are consistent.
- **Tests:** they cover every row of the revised testing concept. This
  includes the mask structure, the one-to-one ring/hole pairing (position,
  radius, timing, shared animation rule), the joint distances computed from
  the trace `d` and matrix, the collinearity of the snapped centres, the D4
  delays and the cursor stops in sync with them.

Observation on the browser-check method (no action for the code):
`element.getAnimations()` returns only *relevant* animations. Head and
head-hole animations use fill `none`, so once they have finished (P7 at
0.35 s, P8 at 1.55 s, P4 at 1.70 s) they are not returned. A
"pause all and set `currentTime`" seek run after page load therefore leaves
out the heads and their holes for any T those animations have already
passed. My first replay hit this. The real-time screencast from page load
does not have this problem and confirms the heads and holes are correct. For
the remaining manual checks, record playback from load or seek within the
first seconds after load. Separately, one headless screenshot taken with
`--virtual-time-budget` showed a hole near P4's end without its ring. The
paused seeks and the real-time frames over the same span (1.60–1.80 s) did
not reproduce it, so I treat it as a virtual-time capture artefact.

### Safari / Firefox risk of the animated mask (requested assessment)

- **Chrome:** verified above in real-time playback.
- **Firefox (Gecko):** a style change on a mask child invalidates the
  masked element, and CSS-animated mask content is a common pattern. Low
  risk, but not verified here.
- **Safari (WebKit):** medium risk. The legacy SVG renderer caches the
  rendered mask per masked element and relies on style-change notifications
  from the mask children to invalidate that cache. Over the years there have
  been reports of CSS animations inside `<clipPath>`/`<mask>` not repainting
  in Safari. I cannot verify this here (no WebKit automation). The possible
  failures, from the code:
  1. **The mask is never repainted during the animation:** it stays as it was
     at first paint. Only the static D3 hole is then visible; all dot holes
     are still `opacity: 0` and the heads have not started. The result is the
     round 2 look: lines visible inside the moving rings and, in the end
     state, inside D1, D2, D4 and D5–D7. Nothing breaks, but the user's
     requirement is not met in Safari.
  2. **The mask is repainted only sometimes:** the holes could freeze at
     intermediate positions and cut visible gaps into the finished lines.
     Dot holes end with fill `both` on a style identical to their last
     keyframe, so finishing may not trigger a repaint. This is the
     unpleasant case.
- **Is a fallback advisable?** Not ahead of time. The Chrome behaviour is
  correct and the concept deliberately stays pure CSS. The Safari check
  (and a quick Firefox check) must gate acceptance. In it, look specifically
  at:
  1. moving rings during the circuit;
  2. the end state: holes clean, and no gaps in lines where rings travelled
     (P2's corners, the M branch, the S corners);
  3. the same after switching tabs and returning.
- **If Safari fails (architect, then developer):** the cheapest robust fix is
  to make the end state independent of the animated mask. Add a second,
  static mask (`animated-logo-holes-final`, the seven dot holes at their
  final centres, no animation) and switch the trace group to it once the
  circuit has finished: on `animationend` of the last ring (D1, 3.55 s) and
  immediately under reduced motion. The end state, which visitors see for
  most of the time, is then correct in every browser. Only the 3.6 s circuit
  phase would show the round 2 look in a non-repainting browser. A fully
  equivalent fix during the animation would need the rejected pure-geometry
  approach (D3b), so it is not recommended.

### Findings

None.

Non-blocking notes:

1. **Gating manual check (user, orchestrator):** Safari and Firefox
   playback of the animated hole mask, as described in the risk assessment
   above. If Safari fails, the architect revises D3b with the static
   end-state mask, as proposed.
2. **From earlier rounds, still open (whoever commits):** `docs/design/MS-17/`
   is untracked. The spec reads `logo-outlined.svg` from it, so it must be
   committed with the story, otherwise CI fails.

### Verdict

positive

## Round 4 — 2026-10-21T08:10:00+02:00

### Scope

- Trigger: user review round 3 (Jira comment "Review — Round 3
  (2026-10-21)"; design README section "User review round 3";
  `gif-frames-bottom-junction-f010-f023.png`). The circle on the outer bottom
  trace (P4) and the circle on the parallel inner trace (P3/D5) must reach
  the bottom-right junction J at the same moment, merge, and continue
  together to the end point. In round 3 the P4 head vanished at J.
- Concept: [MS-17-animated-svg-logo.md](MS-17-animated-svg-logo.md), revised.
  Changed: the new "User Review Round 3" section, D3c, the D3 tables, D3a
  (all keyframe percentages recomputed: each stop sits at the time the dash
  tip reaches that vertex), D3b, Interfaces and Tests. Rewritten
  `docs/design/MS-17/ring-geometry.py`.
- Testing concept: [MS-17-tests.md](MS-17-tests.md), revised.
- Code: `app/src/components/AnimatedLogo.vue` changed as follows:
  - the P4 trace runs 0.10 s + 1.38 s;
  - the P4 head and its hole run 0.10 s + 1.90 s and rest at D5's centre;
  - `logo-move-p4` has six stops, with J at 73.0 %;
  - all move percentages are recomputed.

  `app/src/__tests__/AnimatedLogo.spec.ts` was extended.
- Checks (in `app/`): `npm run test:unit -- --run` (15 files, 631/631
  passed), `npm run lint:check` (clean), `npm run build` (`vue-tsc` and the
  Vite build pass).
- Independent recomputation (Python, from the component source only: the
  trace `d` and group matrix, the ring `cx`/`cy`, and the inline timing).
  For every circle I computed when the dash tip passes each vertex,
  delay + duration × (cumulative trace length ÷ trace length), and compared
  the absolute time and position of every keyframe stop:
  - D1, D2, D4, D5, D6, D7, P7 and P8: all stops match to within 0.001 s and
    0.01 units. The last stop is the snapped ring centre.
  - **P4 head:** the stops at the P4 start, the two corners and the P4 end are
    on the P4 tip at 0.100, 0.965, 1.227 and 1.479 s (expected 1.480). J
    (433.14, 250.44) is reached at 0.10 + 0.730 × 1.90 = 1.487 s, and
    logo-move-d5 reaches J at 0.35 + 0.689 × 1.65 = 1.487 s. Both then
    interpolate linearly from J to D5's centre and end at 2.000 s. So
    the two rings are congruent from J to D5, apart from a rounding drift
    below 1 ms (≤ 0.15 units).
  - P3 keeps its timing, so P5, P6 and the D6 and D7 dots are unchanged. The
    circuit still ends at 3.55 s.
- Browser check (Chrome, `vite preview` of the build):
  - **Real-time CDP screencast** of every painted frame from page load
    (2× scale, about 45 fps, 0–3.2 s). Same method as round 3: it covers the
    temporary circles, which `getAnimations()` seeks miss once finished. I
    looked at the frames between 1.28 and 2.25 s, cropped around J and D5.
  - **4× screenshots** of the end state (12 s) and of
    `--force-prefers-reduced-motion` at 0.3 s.

What was verified:

- **Merge (user point):**
  - **Approach:** the P4 circle (from below, up the S's right edge) and the
    D5 circle (from the left along P3) converge on J. For a few frames they
    overlap, offset from each other, as the concept's ≈ 0.09 s meeting
    intends (GIF `f015`/`f016`).
  - **Merge:** they then coincide and one ring runs up-left along P3's last
    segment to D5. No frame shows a circle disappearing at J.
  - **At 2.00 s:** the P4 head (fill `none`) drops to `opacity: 0` in the same
    frame in which D5 arrives and stops. The frames before and after are
    identical apart from the end of D5's movement, so there is no visible pop.
- **Holes:** across the recorded span, no frame shows line ink inside any ring
  hole, and no notch. The P4 hole is congruent with the D5 hole from J on and
  vanishes together with the head, so the mask has no stray cut when it
  ends. The end state and reduced motion at 4× show seven clean, centred
  joints, with no leftover head ring and no cursor.
- **Reduced motion:** unchanged and correct. The P4 head and hole take their
  base `opacity: 0`, and the media block is still the last rule block. The
  tests pin both.
- **Tests:** the spec covers every new contract of the testing concept.
  - P4 timing: trace 1.38 s, head and hole 0.10 s / 1.90 s, both resting at
    D5's centre.
  - The six-stop head path: the first four stops on the P4 vertices, the head
    on the P4 tip until 1.48 s, and the J stop on P3's corner.
  - The J stop shared with `logo-move-d5`'s 68.9 % stop, and both circles at
    J at 1.487 s within 5 ms.
  - The same keyframe tail as D5 from J to the end.
  - The recomputed tip-synchronous percentages for all circles.

### Findings

None.

Non-blocking notes (unchanged from round 3):

1. **Gating manual check (user, orchestrator):** Safari and Firefox
   playback of the animated hole mask. See the round 3 risk assessment and
   the proposed static end-state mask fallback (architect, then developer,
   only if Safari fails). In this round, also watch the J merge and the
   P4 head hiding under D5 at 2.00 s, because the P4 hole leaves the mask at
   that moment.
2. **Whoever commits:** `docs/design/MS-17/` (now including the rewritten
   `ring-geometry.py`) must be committed with the story. The spec reads
   `logo-outlined.svg`, otherwise CI fails.

### Verdict

positive
