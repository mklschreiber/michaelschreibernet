---
type: Architecture Concept
title: Animated SVG Logo Instead of GIF
description: Replaces the 160 KB logo_anim.gif on the landing page with an inline AnimatedLogo.vue SVG component whose circuit traces, travelling circles (with a hole mask so traces dock cleanly onto the rings), outlined wordmark typed in a natural rhythm and blinking block cursor are animated with CSS only and show the end state immediately under prefers-reduced-motion.
tags: [MS-17, components, views, tests]
timestamp: 2026-10-21T00:00:00+02:00
status: draft
---

## Story

As a visitor of michaelschreiber.net, I want the animated logo on the landing
page to be a crisp, lightweight inline SVG animation instead of the 160 KB GIF
(`app/public/logo_anim.gif`), so that the page loads faster and the logo looks
sharp on every display.

Jira: MS-17 — https://mklschreiber.atlassian.net/browse/MS-17

Acceptance criteria (Jira):

1. The wordmark under the "MS" is made of paths (outlines) — no `<text>`
   elements, no font dependency.
2. The logo is rendered inline (Vue component), animation via CSS: traces are
   drawn (`stroke-dashoffset`), dots appear, the wordmark is revealed.
3. The look matches the existing GIF (end state).
4. `prefers-reduced-motion: reduce` shows the end state immediately.
5. Accessible label (`role="img"` + `aria-label`, via i18n; reuse
   `landing.logoAlt` if suitable).
6. `logo_anim.gif` is no longer loaded on the landing page.
7. Lint, tests and build pass.

Design input: [docs/design/MS-17/README.md](../design/MS-17/README.md). It
provides `logo-outlined.svg` (end state, 512×512 viewBox, wordmark as one
`<path>` per glyph, already fitted to the GIF's last frame), the GIF frame
analysis and the frames in `docs/design/MS-17/gif-frames/`. The design is the
source of truth for geometry; this concept only adds structure, colour and
animation.

This concept supersedes [Animated Landing-Page Logo](animated-logo.md) and
its [tests](animated-logo-tests.md) (Trello era), which describe the GIF
integration.

## User Review Round 1 (2026-10-21)

The user's feedback after round 1 adds two requirements. They are recorded in
the design README, section "User review round 1":

1. **Travelling circles.** In the GIF, a circle rides the head of every growing
   trace. At a branch point a new circle appears and runs along the new branch.
   Where a trace ends in a dot, its circle stops there and *is* that dot.
   → D3, D3a, D5.
2. **Blinking block cursor** (the user's own idea, not in the GIF). First only
   the MS animates. Then a blinking block cursor appears where the `m` will be,
   moves along with the typed text, blinks briefly after `michaelschreiber.net`
   is complete, and disappears. → D4, D4a, D5.

## User Review Round 2 (2026-10-21)

Recorded in the design README, section "User review round 2", and in the
Jira comment "Review — Round 2":

1. **Traces dock exactly onto the circles.** Some rings show the line inside
   their hole, both in the end state and while they travel. A trace must meet
   a ring with nothing of the line in the hole and no gap or notch at the joint,
   at every moment and in the end state. → D2, D3, D3b, D5.
2. **Calmer typing.** The fixed 0.1 s per glyph looks "rattled off". The
   wordmark should be typed in a natural rhythm, with pauses at the word
   boundaries. → D4, D4a.

The total runtime is now 10.68 s (round 1: 8.2 s; GIF: 5.8 s); the user
accepted a longer runtime in round 1.

## User Review Round 3 (2026-10-21)

"Fast perfekt." One open point, recorded in the design README, section "User
review round 3", and in the Jira comment "Review — Round 3". See
`docs/design/MS-17/gif-frames-bottom-junction-f010-f023.png`.

The circle on the outer bottom trace **P4** (from the root dot to the right,
then up the S's right edge) and the circle on the parallel inner trace **P3**
(from the M base to the right) must reach the bottom-right junction **J** at
the same moment. J is P3's corner at (433.141, 250.444), where P4 ends. There
the two circles merge into one, which continues along P3's last segment to the
end dot **D5**. In round 2 the P4 circle reached J alone and vanished.
→ D3, D3a, D3c.

The circuit still ends at 3.55 s; the cursor and typing timeline (D4, D4a) is
unchanged.

## Architecture Decisions

### D1. New presentation component `app/src/components/AnimatedLogo.vue`

One SFC with `<script setup lang="ts">`, no props, no emits, no composable,
no store. It is a leaf presentation component like the icon SFCs; the logic
is pure CSS. A composable or a data module for the geometry would add
indirection without any reuse (the logo is used on one page).

The component calls `useI18n()` itself and renders
`:aria-label="t('landing.logoAlt')"`. It is only used on the landing page, so
owning the landing key is acceptable and keeps `LandingPage.vue` trivial. No
prop for the label (no gold plating).

### D2. SVG markup is inlined in the template, copied from `logo-outlined.svg`

The developer copies the `<svg>` from `docs/design/MS-17/logo-outlined.svg`
into the `<template>` and applies only these edits:

- Drop the XML declaration, the `DOCTYPE`, `width="100%" height="100%"`,
  `version`, `xmlns:xlink`, `xmlns:serif`, `xml:space` and the root `style`.
  Keep `viewBox="0 0 512 512"` and `xmlns="http://www.w3.org/2000/svg"`.
- Turn the root `style` into presentation attributes on `<svg>`:
  `fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round"
  stroke-linejoin="round" stroke-miterlimit="1.5"`.
- Root attributes: `class="animated-logo" role="img"
  :aria-label="t('landing.logoAlt')"`.
- Trace paths: replace the inline `style` with `fill="none"
  stroke="currentColor" stroke-width="10.68"`, add
  `class="animated-logo__trace" pathLength="1"`. Five of them get their point
  order reversed (D3). Their `<g transform>` wrappers stay unchanged.
  **Round 2:** all nine trace groups are wrapped in one
  `<g class="animated-logo__traces" mask="url(#animated-logo-holes)">` (D3b).
- **Dots: flattened into viewBox coordinates** (round 1). The seven
  `<g transform="matrix(0.579683,…)"><circle cx="582.5" cy="1164.5" r="17.5">`
  wrappers are replaced by plain root-level circles:
  `<circle class="animated-logo__dot animated-logo__dot--dN" cx=… cy=…
  r="10.144" fill="none" stroke="currentColor" stroke-width="8.336">`.
  The radius is `0.579683 × 17.5` and the stroke width `0.579683 × 14.38`.
  **Round 2:** the centres are snapped onto their trace axis (D3b); the D3 dot
  table holds the values. Why flattened: the dots move (D3a). A CSS
  `transform` on an element replaces its own `transform` attribute. In viewBox
  coordinates, all moving circles share one unit, and their base position (no
  transform) is the final position.
- **Head circles** (round 1): three extra root-level circles,
  `class="animated-logo__head animated-logo__head--pN"`, with the same `r`,
  `fill`, `stroke` and `stroke-width` as the dots. One each for the traces
  that end without a dot (P4, P7, P8, see D3a).
- **Hole mask** (round 2): a `<defs><mask id="animated-logo-holes">` with
  one hole circle per ring (10), specified in D3b.
- Order in the template: `<defs>` (mask), the masked trace group, then the 7
  dots (design order D1–D7), then the 3 heads, then the wordmark. The rings
  are not masked and are painted after the traces.
- Glyph paths: add `class="animated-logo__glyph"`, keep `data-char` and
  `data-weight`. The outer wordmark `<g transform="matrix(0.9508,…)">` gets
  `class="animated-logo__wordmark" fill="currentColor"`. The inner wordmark
  `<g>` also contains the cursor `<rect>` (D4a).
- Every animated element gets a static inline `style` with its timing custom
  properties (D3, D4).
- The trace and wordmark transforms are not flattened. That is optional per
  the design README and would risk the geometry drifting.

Why inline instead of `<img src="/logo.svg">` or an SVG file import: CSS
animation of individual elements, `currentColor` and an i18n `aria-label` need
the SVG in the DOM, and the project has no SVG loader plugin (no new
dependencies). The markup is ~13 KB uncompressed (vs. 160 KB GIF) and ships in
the JS chunk, so there is no extra request.

### D3. Circuit: trace order, direction and timing

The GIF grows the circuit as a tree from the root dot at the bottom-left of the
S (`f000`): first the S's bottom lines to the right and the short link to the
M's vertical, then the M's vertical upwards and the S's inner line, then the M's
diagonals and the S's upper traces, each trace ending in its dot (`f001`–`f036`).
The GIF also moves and scales the nodes. Per AC 2 we draw the final traces in
place with `stroke-dashoffset`, in the same tree order, and a circle rides
every trace tip (D3a).

All traces are drawn at one constant speed of 150 viewBox units/s (`linear`),
each starting when its parent trace reaches the junction. **Exception (round
3): P4 runs at 176 units/s**, so that it reaches the junction J together with
P3 (D3c). This yields a
circuit phase of about 3.6 s, matching the GIF. Every trace is drawn from its
`d` start point, so traces that must grow from a junction outward have their
point order reversed in the template. The trace `d` strings are unchanged in
round 2 (D3b).

Traces, in the design file order (`P1`–`P9`), coordinates in the 512 viewBox:

| # | Trace | Direction | `d` to use | `--logo-delay` | `--logo-duration` | Circle on its tip |
|---|---|---|---|---|---|---|
| P1 | M top → V → top-left dot D2 | reversed | `M793.161,888.192L663.676,1017.676L555,909` | 1.55s | 1.75s | dot D2 |
| P2 | M right column → V → up → down to bottom-left dot D1 | reversed | `M791.529,950.641L661.085,1079.085L580,998L580,1152` | 1.20s | 2.35s | dot D1 |
| P3 | M vertical base → right → up → S inner dot D5 | as is | `M794,1118L937,1118L995,1067L918,1004` | 0.35s | 1.65s | dot D5 |
| P4 | root D3 → S bottom line right → up to junction J | as is | `M759,1166L954,1166L997,1125L996,1068` | 0.10s | **1.38s** (round 3; was 1.60s) | head P4, merges into D5 at J |
| P5 | from P3's diagonal → S middle → S right dot D6 | as is | `M961,1097L843,997L899,947L985,946` | 1.30s | 1.65s | dot D6 |
| P6 | from P5's corner → S top → S top dot D7 | reversed | `M841,995L842,942L887,899L951.719,899` | 2.10s | 0.95s | dot D7 |
| P7 | root D3 → short diagonal to the M vertical base | as is | `M755.281,988.719L791.999,952.001` | 0.10s | 0.25s | head P7 |
| P8 | M tall vertical, bottom → top | reversed | `M795,1116L795,889` | 0.35s | 1.20s | head P8 |
| P9 | from P2's diagonal → down to M inner dot D4 | reversed | `M746,996L746,1072` | 1.55s | 0.40s | dot D4 |

Dots in the design file order, with the final centres in viewBox units (round
2: snapped onto the trace axis, D3b; the design value is in brackets). A
moving dot uses the **same** `--logo-delay` and `--logo-duration` as its
trace. The root dot D3 does not move:

| Dot | Modifier | Final centre `cx, cy` (design) | Rides trace | `--logo-delay` | `--logo-duration` |
|---|---|---|---|---|---|
| D1 M bottom-left | `--d1` | 109.298, 326.917 (108.518, 326.917) | P2 | 1.20s | 2.35s |
| D2 M top-left | `--d2` | 82.766, 120.126 (unchanged) | P1 | 1.55s | 1.75s |
| D3 root, S bottom-left | `--d3` | 237.275, 327.697 (238.055, 326.917) | — (static) | 0s | — |
| D4 M inner | `--d4` | 238.835, 264.489 (238.055, 264.489) | P9 | 1.55s | 0.40s |
| D5 S inner | `--d5` | 363.620, 193.563 (363.690, 193.478) | P3 | 0.35s | 1.65s |
| D6 S right | `--d6` | 436.260, 155.895 (436.262, 156.022) | P5 | 1.30s | 1.65s |
| D7 S top | `--d7` | 409.730, 119.346 (409.730, 119.345) | P6 | 2.10s | 0.95s |

Head circles. For P7 and P8, `cx, cy` is the end point of their trace and the
timing is the trace's. **Round 3:** the P4 head ends on D5, so its `cx, cy`
is D5's centre, and its timing (0.10 s + 1.90 s = D5's arrival at 2.00 s) is
its own, not P4's:

| Head | Modifier | `cx, cy` | Rides trace | `--logo-delay` | `--logo-duration` |
|---|---|---|---|---|---|
| P4 | `--p4` | 363.620, 193.563 (= D5) | P4, then J → D5 together with D5 | 0.10s | 1.90s |
| P7 | `--p7` | 274.730, 290.242 | P7 | 0.10s | 0.25s |
| P8 | `--p8` | 275.511, 111.542 | P8 | 0.35s | 1.20s |

The last circle (D1) arrives at 3.55 s. Delays and durations are rounded to
0.05 s, except P4's 1.38 s (D3c). A dot and its trace must use identical
values, otherwise the circle leaves the tip.

### D3a. Travelling circles (round 1, keyframes updated in rounds 2 and 3)

**What the GIF does** (frames `f001`–`f036`):

- Every growing trace has a circle on its tip.
- At a branch point a new circle appears on top of the parent's circle or line
  and runs the new branch (`f016`, `f019`, `f023`: two overlapping circles at
  the M branch).
- Traces ending in a dot: the circle stops there and is the dot.
- Traces ending without a dot: P7's circle reaches the M vertical base, and
  the circles of P8 and P3 continue from that point. P8's circle reaches the
  top of the M, and P1's circle continues from there. P4's circle meets P3's
  circle at the S corner J; they merge and run on together to D5 (`f015`–`f019`,
  round 3, D3c).

**How we do it:** CSS `transform: translate()` keyframes. Each moving circle has
one `@keyframes` block, generated from its trace polyline in viewBox units.
Keyframe stops sit at the polyline vertices. **Since round 3, each stop's
percentage is the cumulative *trace* length at that vertex divided by the trace
length**, which is exactly when the dash tip reaches the vertex. The animation
uses the trace's `--logo-delay`/`--logo-duration` and
`linear` timing, like the trace. Between vertices the browser interpolates
linearly. Traces are straight segments, so the circle stays exactly on the
line. Every block ends at `translate(0px, 0px)`, which is the base (final)
position.

- **Centre on the tip.** The circle centre starts at the trace's start point
  and is exactly on the tip at every vertex. For traces that end in a dot, the
  last stop is the dot centre instead of the trace end. Only on that last
  segment does the centre run slightly ahead of the tip, so it arrives at the
  dot centre when the tip arrives at the ring. (Round 2 spread the extra
  ~10 units over the whole path. Round 3 changes this so that the D5 circle is
  exactly at J when P3's tip is, D3c.)
- **On the line axis.** Since round 2 the dot centre lies exactly on the
  extension of the last segment (D3b), so the circle never leaves the line
  axis. Whatever part of the line lies under the ring's hole is cut away by
  the hole mask (D3b).
- **Dots (6 moving)** use two animations: the move (fill `both`, so before its
  delay the circle waits at the start point) and `logo-show` (1 ms
  `steps(1, start)`, fill `both`). The second keeps the circle invisible until
  its trace starts. The root dot D3 keeps the 0.15 s `logo-pop` at 0 s.
- **Heads (3 transient)** have base `opacity: 0`. They use their move plus
  `logo-head-on` (`opacity: 1` at `from` and `to`), both with fill `none`.
  So a head is visible only while its trace grows and disappears when it ends.
  At that same moment the follow-up circle starts at the same point (P7 → P8
  and P3 at 0.35 s; P8 → P1 at 1.55 s), so it reads as one circle travelling
  on. The P4 head is the exception (D3c): it merges into D5 at J and is hidden
  under D5 at 2.00 s. Fill `none` is used on purpose: the outcome depends on the base style, not on the end-of-animation
  progress (see the `steps(1, end)` rounding bug in D5).
- **Ring overlaps at branch points are intended.** A new circle appears where
  its parent passed, so for 0.03–0.15 s two rings overlap: D3/P4/P7 at 0.10 s,
  D5/P8 at 0.35 s, D1/P8 at 1.20 s, D6/D5 at 1.30 s, D4/D1 at 1.55 s,
  D7/D6 at 2.10 s. This is the GIF's "split" (`f001`, `f016`, `f019`,
  `f023`). In addition, P4 and D5 meet at J from about 1.40 s, then coincide
  exactly from 1.487 s to 2.00 s (D3c). The hole mask applies to traces only. See Open Questions.

**Alternatives rejected:**

- **CSS `offset-path` on SVG elements:** support and coordinate-system
  behaviour inside transformed SVG groups are inconsistent, especially in
  Safari.
- **SMIL `<animateMotion>`:** its clock is the SVG document timeline, not the
  component mount, and `prefers-reduced-motion` CSS cannot stop it.
- **Transform keyframes:** plain CSS, supported in Chrome, Firefox and Safari,
  and removable with `animation: none`.

Keyframes (translate = position − final centre, in viewBox px; round 3
values, printed by `docs/design/MS-17/ring-geometry.py`):

```css
@keyframes logo-move-d1 { /* P2 */
  0%    { transform: translate(165.07px, -167.27px); }
  40.5% { transform: translate(63.27px, -67.04px); }
  65.9% { transform: translate(0px, -130.32px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-d2 { /* P1 */
  0%    { transform: translate(192.87px, -9.21px); }
  54.4% { transform: translate(91.83px, 91.83px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-d4 { /* P9 */
  0%    { transform: translate(0px, -69.45px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-d5 { /* P3; 68.9% = J at 1.487 s */
  0%    { transform: translate(-87.33px, 96.68px); }
  44.7% { transform: translate(24.26px, 96.68px); }
  68.9% { transform: translate(69.52px, 56.88px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-d6 { /* P5 */
  0%    { transform: translate(-29.65px, 117.96px); }
  49%   { transform: translate(-121.73px, 39.92px); }
  72.8% { transform: translate(-78.03px, 0.91px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-d7 { /* P6 */
  0%    { transform: translate(-96.76px, 74.91px); }
  29.5% { transform: translate(-95.98px, 33.55px); }
  64%   { transform: translate(-60.87px, 0px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-p4 { /* P4 head, 1.90 s from 0.10 s, relative to D5 */
  0%    { transform: translate(-114.64px, 134.13px); }  /* P4 start        0.100 s */
  45.5% { transform: translate(37.53px, 134.13px); }   /* P4 corner 1     0.965 s */
  59.3% { transform: translate(71.08px, 102.14px); }   /* P4 corner 2     1.226 s */
  72.6% { transform: translate(70.3px, 57.66px); }     /* P4 end          1.480 s */
  73%   { transform: translate(69.52px, 56.88px); }    /* J, = D5 at 68.9% 1.487 s */
  100%  { transform: translate(0px, 0px); }            /* D5 centre       2.000 s */
}
@keyframes logo-move-p7 {
  0%    { transform: translate(-28.65px, 28.65px); }
  100%  { transform: translate(0px, 0px); }
}
@keyframes logo-move-p8 {
  0%    { transform: translate(0px, 177.14px); }
  100%  { transform: translate(0px, 0px); }
}
```

In SVG, CSS `px` in a `transform` are user units of the element's coordinate
system, which is the 512 viewBox for root-level circles and the mask holes.
`translate` does not depend on `transform-origin`/`transform-box`.

### D3b. Trace–ring joints: a hole mask (round 2)

**Root cause.** Ring: r = 10.144, stroke 8.336, so the band runs from
radius 5.976 (inner edge) to 14.312 (outer edge). Trace: stroke
10.68 × 0.780343 = 8.334, half width 4.167, round caps. A trace stays out of
the hole only if its axis keeps ≥ 5.976 + 4.167 = 10.143 from the ring centre.
That is exactly r, so there is no margin at all.

- **End state, design geometry:** the trace ends sit 9.93–12.19 from the
  centres. P1 enters D2's hole (axis 9.933 from the centre). D1, D3 and D4 sit
  0.78 units off their trace axis, so the line meets those rings visibly off
  centre. The caps of P2 and P9 touch the inner edge with zero margin, and
  anti-aliasing leaves grey pixels in the hole.
- **During travel:** the circle centre sits on the tip, so the last ~10 units
  of the line are inside the hole (round 1 accepted this; round 2 does not).

**Pure geometry was considered and rejected.** We could shorten the trace
ends and let the circle lead the tip by a distance d. But a hollow ring on a
line needs ≥ 10.143 clearance from *every* drawn line, not just its own tip:

- At P2's 45° corner (top-left of the M), the drawn diagonal passes the ring
  at b·sin 45°. The ring then needs b ≥ 14.35 from the corner, while the end
  joint needs d ≤ 13.69 to avoid a notch. So d would have to vary along the
  path.
- New circles spawn on 45°–48° branches (P2 off P8, P9 off P2, P6 off P5) and
  would need ≥ 14–15 units offset from the junction while the parent line
  keeps growing past them.
- To keep the clearance, the tip would have to stall or jump at corners. That
  needs densely sampled `stroke-dashoffset` keyframes per trace, and it is
  still fragile with respect to timing.

**Decision: cut the holes out of the traces with one SVG mask.** The rings
stay hollow and unmasked. Every ring has a matching black hole circle in a
mask that is applied to the trace group only:

```html
<defs>
  <mask id="animated-logo-holes" maskUnits="userSpaceOnUse"
        x="0" y="0" width="512" height="512">
    <rect width="512" height="512" fill="white" />
    <!-- one per ring: d1 d2 d3 d4 d5 d6 d7 p4 p7 p8 -->
    <circle class="animated-logo__hole animated-logo__hole--d1"
            cx="109.298" cy="326.917" r="10.144" fill="black"
            style="--logo-delay: 1.2s; --logo-duration: 2.35s" />
    …
  </mask>
</defs>
<g class="animated-logo__traces" mask="url(#animated-logo-holes)">
  <!-- the nine trace <g transform><path/></g> -->
</g>
```

- Each hole has the same `cx`/`cy`, timing custom properties and animations
  as its ring: the same `logo-move-*` keyframes, plus `logo-show` for dot
  holes and base `opacity: 0` + `logo-head-on` for head holes. The D3 hole is
  static. So a hole exists exactly where and when its ring is visible.
  - Before a dot appears, its hole is transparent (`opacity: 0`), so it does
    not cut the line passing its waiting point.
  - In the end state and under reduced motion, the holes sit on the final
    centres.
  - CSS shares the rules between ring and hole through grouped selectors
    (D5).
- **Hole radius = 10.144** (the ring's centreline), not the inner edge 5.976.
  The line is cut out up to the middle of the band, and the band (5.976–14.312)
  covers everything between the cut and the outer edge.
  - The visible line therefore ends inside the band: nothing in the hole, and
    no gap or notch. The line's flat sides cross the outer edge at radius
    13.69, inside the band.
  - The mask edge sits 4.17 units away from both ring edges, so its
    anti-aliasing never meets the ring's anti-aliasing. There are no grey
    fringes in the hole.
- **Ring centres are snapped onto the trace axis** (≤ 1.1 units ≈ 0.65 px at
  304 px; D3 table). Each dot centre is projected onto the line of its trace's
  last segment. D3 moves to the intersection of the P4 and P7 axes. The lines
  now meet every ring radially, centred and symmetric. The joint distances
  (trace end to centre: 9.9–12.4) are all below 13.69, so no notch. The trace
  `d` strings and the P7/P8 head positions do not change (the P4 head moves to
  D5's centre in round 3, D3c).
- **Branch spawns:** a new ring appears over its parent line. Its hole cuts
  that line there, so it reads as a node sitting on the line; the line closes
  again behind the ring as it moves on. Ring-over-ring overlaps at spawn stay
  as in the GIF (D3a).
- **Mask id:** fixed `animated-logo-holes`. The component is rendered once per
  page. A second instance would need a per-instance id via Vue's `useId()`,
  which is not needed now.
- **Masking only the traces:** the rings, the cursor and the glyphs are
  outside the masked group, so currentColor, sizes and the wordmark are
  unaffected.

**Verified** (architect prototype, headless Chrome 2× render, every 25 ms
from 0 to 3.8 s):

- With the rings hidden, no trace pixel was found inside any visible ring's
  hole: 868 ring-frames, darkest hole pixel 255.
- A hidden hole at a waiting point does not cut the line.
- Zoomed end-state joints are clean and centred.
- Without the mask the same check finds trace ink in 117 of 222 ring-frames.

The mask is plain SVG 1.1; animating its children with CSS works in Chrome.
Safari and Firefox are part of the manual check (Tests).

Round 3 re-run with the merged P4 head and the new keyframes, same method:
880 ring-frames. Only one frame was flagged: t = 1.5499… s, where floating-point
accumulation put the sample on P8's end time, at which the checker still
counted P8's head as visible while the browser had already removed it. A
re-check at 1.545, 1.549 and 1.551 s is clean. So there is no trace ink in any
hole.

### D3c. Synchronised merge at the bottom-right junction (round 3)

**Which traces.** P4, the outer bottom trace: root D3 → right → up-right → up
the S's right edge, ending at (433.921, 251.224), 1.10 units from J. P3, the
inner parallel trace: M base → right → up-right to its corner J (433.141,
250.444) → up-left to D5. The continuation after J is P3's last segment
J → D5.

**Arrival at the same moment.** P3 keeps its timing (0.35 s + 1.65 s), because
its children P5 (and P6 after it) branch off it at fixed tip times. Its tip,
and since round 3 also the D5 circle centre (D3a), reaches J at
t_J = 0.35 + 1.65 × 171.82 / 249.40 = **1.487 s**. P4 has no children, so only
P4 is retimed. It starts at 0.10 s (it leaves the root with P7) and must cover
its 243.02 units plus the 1.10 units to J by t_J: speed 176.1 units/s, trace
duration **1.38 s** (tip at P4's end at 1.480 s). The outer line is longer and
runs faster, which is what makes the two meet, as in the GIF. P4 starts at the
same time as before, and the circuit still ends at 3.55 s.

**Merge without a disappearance.** The P4 head keeps riding P4's tip, and
covers the last 1.10 units to J in the 7 ms between 1.480 s and 1.487 s.
From J it follows exactly D5's path and timing (J at 1.487 s → D5 centre at
2.00 s). The two rings are congruent from J on and are drawn as one; this is
the "continue together". At 2.00 s the head's fill-`none` animation ends and
it falls back to `opacity: 0` exactly underneath the identical D5 ring, so
nothing visibly changes. Its hole is congruent with D5's hole for the same
time, so the mask is unchanged too.

- The head therefore has its own timing (`--logo-delay: 0.10s;
  --logo-duration: 1.90s`) and its base position is D5's centre (363.620,
  193.563). These differ from the P4 trace (0.10 s / 1.38 s). The head's hole
  uses the same values.
- Before J the two rings approach from below (P4) and from the left (P3) and
  overlap for ≈ 0.09 s. This is the meeting in GIF `f015`/`f016`.
- Rejected: slowing P3 instead. That would shift P5, P6 and D6/D7 and lengthen
  the circuit, for the same visual result.
- Rejected: letting the head end at J under a still-moving D5. That is the
  round 2 "sudden disappearance" again, since the D5 ring has already moved
  on.

Reduced motion is unchanged: under `animation: none`, the P4 head and its hole
take their base `opacity: 0`.

### D4. Wordmark: natural typing rhythm (round 2)

The 20 glyph paths (`michael` light, `schreiber` medium, `.net` light, already
in this order in the design file) are revealed one at a time. They are filled
shapes, so they are not stroke-animated; each switches from `opacity: 0` to `1`
in one step (`steps(1, start)`, see D5).

Round 2 replaces the fixed 0.1 s step with a fixed, hand-set rhythm, with no
runtime randomness. Within a word, intervals vary between 0.16 and 0.24 s
(mean 0.196 s). There is a pause of 0.45 s before `schreiber` and 0.40 s before
`.net`. The first glyph comes 0.2 s after the cursor's second "on" phase begins
(a small hesitation). Each glyph gets its own static
`style="--logo-delay: <t>s"`. The index-based `--logo-glyph`,
`--logo-typing-start` and `--logo-glyph-step` are removed.

| # | Glyph | Interval | `--logo-delay` |
|---|---|---|---|
| 0 | m | — | 5.00s |
| 1 | i | 0.17 | 5.17s |
| 2 | c | 0.21 | 5.38s |
| 3 | h | 0.19 | 5.57s |
| 4 | a | 0.23 | 5.80s |
| 5 | e | 0.18 | 5.98s |
| 6 | l | 0.20 | 6.18s |
| 7 | s | 0.45 (word pause) | 6.63s |
| 8 | c | 0.19 | 6.82s |
| 9 | h | 0.17 | 6.99s |
| 10 | r | 0.22 | 7.21s |
| 11 | e | 0.18 | 7.39s |
| 12 | i | 0.16 | 7.55s |
| 13 | b | 0.24 | 7.79s |
| 14 | e | 0.19 | 7.98s |
| 15 | r | 0.20 | 8.18s |
| 16 | . | 0.40 (word pause) | 8.58s |
| 17 | n | 0.22 | 8.80s |
| 18 | e | 0.18 | 8.98s |
| 19 | t | 0.20 | 9.18s |

Typing takes 4.18 s instead of 1.9 s, with an average interval of 0.22 s
including pauses. Why fixed values instead of a formula or randomness: they
are reproducible, testable and reviewable, and the varying intervals avoid the
mechanical feel.

### D4a. Blinking block cursor (round 1, timeline updated in round 2)

**Element:** one `<rect class="animated-logo__cursor" x="566.19" y="1218.66"
width="22" height="41.26" fill="currentColor"/>`. It goes inside the inner
wordmark `<g>` after the glyphs, so it uses the glyph coordinates of
`text2path.py` (baseline y = 1259.92, font size 54.167).

- **Size:** a terminal-style block from the baseline up to the ascender line
  (top of `h`/`l`/`b`, y = 1218.66, height 41.26). The width is 22, about the
  ink width of a lowercase `n` (21.88). This is about 17 × 12 px at the
  304 px logo size. Why: the wordmark is all lowercase with no descenders. A
  block from the baseline to the ascender is as tall as the tallest glyphs and
  reads as a classic block cursor.
- **Positions:** the cursor's left edge x is
  - before typing, at the left edge of `m` (566.19);
  - after glyph j, at glyph j's right ink edge + 3 units.

  The x values come from the glyph path bounding boxes in `logo-outlined.svg`.
  The steps are `translateX` offsets from the start x, in glyph units:

  `0, 42.86, 54.66, 84.6, 113.19, 142.86, 172.03, 181.98, 212.34, 240.99,
  270.29, 291.98, 318.61, 330.67, 362.99, 391.69, 411.92, 420.57, 451.52,
  481.27, 499.23` (index 0 = before typing, index k = after glyph k−1).

- **Timeline** (round 2, absolute times since mount):

  | Time | Cursor |
  |---|---|
  | 0 – 3.8 s | hidden (only the MS animates; last dot arrives 3.55 s) |
  | 3.8 – 4.3 s | on, at `m` |
  | 4.3 – 4.8 s | off (blink period 1 s) |
  | 4.8 – 5.0 s | on, at `m` (hesitation before the first glyph) |
  | 5.0 – 9.18 s | on (solid while typing, also during the word pauses); jumps right of glyph j at its D4 time, together with the glyph |
  | 9.18 – 9.68 s | on, right of `t` |
  | 9.68 – 10.18 s | off |
  | 10.18 – 10.68 s | on |
  | 10.68 s | gone; the animation is complete |

- **CSS:** base `opacity: 0` (the end state is "no cursor"). Two animations,
  both with fill `none`, both `steps(1, end)`, so each keyframe interval holds
  its start value:
  - `logo-cursor-blink 6.88s steps(1, end) 3.8s none`, opacity stops:

    ```css
    @keyframes logo-cursor-blink {
      0% { opacity: 1; }
      7.267% { opacity: 0; }
      14.535% { opacity: 1; }
      85.465% { opacity: 0; }
      92.733% { opacity: 1; }
      100% { opacity: 0; }
    }
    ```

    The stops are (t − 3.8) / 6.88 for t = 3.8, 4.3, 4.8, 9.68, 10.18 and
    10.68.

  - `logo-cursor-move 5.68s steps(1, end) 5s none`. Stop j is at
    (t_j − 5.0) / 5.68, where t_j is glyph j's D4 time, and holds offset
    index j+1. A final `100%` holds the last offset:

    ```css
    @keyframes logo-cursor-move {
      0% { transform: translateX(42.86px); }
      2.993% { transform: translateX(54.66px); }
      6.69% { transform: translateX(84.6px); }
      10.035% { transform: translateX(113.19px); }
      14.085% { transform: translateX(142.86px); }
      17.254% { transform: translateX(172.03px); }
      20.775% { transform: translateX(181.98px); }
      28.697% { transform: translateX(212.34px); }
      32.042% { transform: translateX(240.99px); }
      35.035% { transform: translateX(270.29px); }
      38.908% { transform: translateX(291.98px); }
      42.077% { transform: translateX(318.61px); }
      44.894% { transform: translateX(330.67px); }
      49.12% { transform: translateX(362.99px); }
      52.465% { transform: translateX(391.69px); }
      55.986% { transform: translateX(411.92px); }
      63.028% { transform: translateX(420.57px); }
      66.901% { transform: translateX(451.52px); }
      70.07% { transform: translateX(481.27px); }
      73.592% { transform: translateX(499.23px); }
      100% { transform: translateX(499.23px); }
    }
    ```

  Before 5.0 s the base transform (none) puts the cursor at `m`. Fill `none`
  is used on purpose: before 3.8 s and after 10.68 s the cursor falls back to
  its base `opacity: 0`. It never depends on a held end value, so the Chrome
  rounding issue from D5 cannot leave it visible.
- The cursor keyframes are tied to the glyph times in D4. If any glyph time
  changes, the cursor durations and percentages must be recomputed (formulas
  above).
- A pure CSS solution with absolute keyframes is chosen over a JS timer or a
  composable: it starts in sync with the glyph reveals on the same CSS
  clock, and `animation: none` disables it with no script state.

### D5. CSS: the base style is the end state

All styles are in `<style scoped>` of `AnimatedLogo.vue` (scoped attributes
are applied to SVG elements in the template, including the children of
`<mask>`). The rule: **the non-animated style of every element is its end
state**. Traces are fully drawn, dots and dot holes sit at their final centres
and are visible, glyphs are visible, and heads, head holes and the cursor are
invisible. Hidden or moving states exist only in keyframes.

```css
.animated-logo {
  display: block;
  aspect-ratio: 1;
}

.animated-logo__trace {
  stroke-dasharray: 1 2;
  stroke-dashoffset: 0;
  animation: logo-draw var(--logo-duration) linear var(--logo-delay) both;
}

.animated-logo__dot--d3 {
  animation: logo-pop 0.15s ease-out var(--logo-delay) both;
}

/* one rule per moving dot (d1 d2 d4 d5 d6 d7), shared with its hole */
.animated-logo__dot--d1,
.animated-logo__hole--d1 {
  animation:
    logo-move-d1 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__head,
.animated-logo__hole--p4,
.animated-logo__hole--p7,
.animated-logo__hole--p8 {
  opacity: 0;
}

/* one rule per head (p4 p7 p8), shared with its hole */
.animated-logo__head--p4,
.animated-logo__hole--p4 {
  animation:
    logo-move-p4 var(--logo-duration) linear var(--logo-delay) none,
    logo-head-on var(--logo-duration) linear var(--logo-delay) none;
}

.animated-logo__glyph {
  animation: logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__cursor {
  opacity: 0;
  animation:
    logo-cursor-blink 6.88s steps(1, end) 3.8s none,
    logo-cursor-move 5.68s steps(1, end) 5s none;
}

@keyframes logo-draw    { from { stroke-dashoffset: 1.01; } }
@keyframes logo-pop     { from { opacity: 0; } }
@keyframes logo-show    { from { opacity: 0; } to { opacity: 1; } }
@keyframes logo-head-on { from, to { opacity: 1; } }
/* logo-move-* (D3a), logo-cursor-blink and logo-cursor-move (D4a) */

/* must stay the last rule block of the style (see below) */
@media (prefers-reduced-motion: reduce) {
  .animated-logo__trace,
  .animated-logo__dot,
  .animated-logo__head,
  .animated-logo__hole,
  .animated-logo__glyph,
  .animated-logo__cursor {
    animation: none;
  }
}
```

Why these details:

- `pathLength="1"` normalises every trace to length 1, so one dash pattern
  and one keyframe serve all nine traces regardless of their real length.
- `stroke-dasharray: 1 2` (gap longer than the path) and a start offset of
  `1.01` (not `1`) keep the dash completely outside the path at the start, so
  the round line cap does not paint a dot at the path start before the trace
  begins.
- Glyphs, moving dots and dot holes use `steps(1, start)`, not
  `steps(1, end)`, for their reveal. With `end`, Chrome's float rounding at the
  end of the 1 ms animation can leave the progress just below 1. The step
  function then returns 0 and the element stays at `opacity: 0` (seen for `m`,
  `i`, `c` in the MS-17 browser check). With `start`, any progress above 0
  gives 1, so every glyph ends visible. Before the delay, the backwards fill
  (`both`) still holds `opacity: 0`, because the step function returns 0 in
  the before phase.
- Heads, head holes and the cursor use fill `none` and an invisible base style
  instead, so their final state never depends on end-of-animation progress
  (D3a, D4a).
- **The reduced-motion block must come after every per-element `animation`
  rule.** Its selectors (one class) have the same or lower specificity than
  the grouped modifier rules. Only source order makes `animation: none` win.
- Under reduced motion, `animation: none` on everything leaves exactly the
  base styles: the static logo with its seven dots (and holes) at their final
  positions, no heads and no cursor (AC 4).
- The animation plays once per mount of the component (GIF: plays once, no
  loop). Navigating back to `/` replays it, which matches the GIF behaviour.

### D6. Colour follows the theme via `currentColor`

Strokes, glyph fills and the cursor use `currentColor`. The logo inherits
`color: var(--color-text-primary)` (`#18181b`) from `body` (`App.vue`); no
colour is set in the component or the landing page. On the light landing
background this is visually the same as the GIF's black, and the logo
follows any future theme change automatically. The site has no dark mode, so
nothing else is needed. The mask uses literal `white`/`black`: a mask works on
luminance, so its colours are not theme colours.

### D7. Landing page integration and sizing

`LandingPage.vue` replaces the `<img class="hero__logo" src="/logo_anim.gif" …>`
with `<AnimatedLogo class="hero__logo" />` (import from
`@/components/AnimatedLogo.vue`). The class falls through to the component's
root `<svg>`, and the existing scoped rule
`.hero__logo { width: min(100%, 19rem); height: auto; margin-bottom: … }`
keeps applying (a parent's scoped style reaches the child root element). The
SVG viewBox is 512×512 like the GIF, so size and whitespace stay identical;
`aspect-ratio: 1` in the component guarantees the square height for
`height: auto` on an inline SVG.

`landing.logoAlt` is suitable and reused unchanged ("Animiertes
michaelschreiber.net Logo als verbundenes IT-Netzwerk" / "Animated
michaelschreiber.net logo as a connected IT network"); no i18n change.

### D8. Accessibility

The root `<svg>` has `role="img"` and the localized `aria-label`. With
`role="img"`, assistive technology treats the children, including the cursor
rect and the mask, as presentational. So no `aria-hidden` on children and no
`<title>` is needed. The animation does not flash. The cursor blinks at 1 Hz
for a few seconds only. The animation runs once and ends after 10.68 s. With
`prefers-reduced-motion: reduce`, the end state is shown at once and there is
no cursor (D5).

Note: the global reduced-motion rule in `App.vue` only shortens
`animation-duration`, not `animation-delay`. Without the component's own
`animation: none`, elements would stay hidden until their delay (up to
9.18 s). That is why D5's media query is mandatory.

### D9. `logo_anim.gif` is deleted

`app/public/logo_anim.gif` is only referenced by `LandingPage.vue` and
`LandingPage.spec.ts` (checked: not in `index.html`, Open Graph meta,
`sitemap.xml`, README or other components). After this story it is dead
weight in the deployed `dist`, so it is removed with `git rm`. `logo.svg`,
`logo_simple_*.svg` and the favicons are unrelated and stay.

Historical documents (`animated-logo*.md`, `log.md`, `minor-changes.md`) that
mention `logo_anim.gif` are records and stay unchanged; the index marks the
two `animated-logo*` entries as superseded by MS-17.
`docs/design/MS-17/` (including `text2path.py` and `ring-geometry.py`) is
committed as design input; it is not part of the build.

## Affected Components

| File | Change |
|---|---|
| `app/src/components/AnimatedLogo.vue` | **New.** Inline SVG (D2), trace/dot/head timing (D3, D3a), hole mask (D3b), glyphs and cursor (D4, D4a), scoped CSS (D5), i18n label (D1, D8). Round 2: mask + 10 holes, snapped dot centres, new move keyframes, per-glyph delays, new cursor keyframes. |
| `app/src/views/LandingPage.vue` | `<img>` → `<AnimatedLogo class="hero__logo" />`, import added. CSS unchanged. |
| `app/public/logo_anim.gif` | **Deleted.** |
| `app/src/__tests__/AnimatedLogo.spec.ts` | **New** component test (see Tests). Extended in rounds 1 and 2. |
| `app/src/__tests__/LandingPage.spec.ts` | Updated: asserts the inline logo instead of the GIF `<img>`. |
| `docs/design/MS-17/` | Committed design input, including `ring-geometry.py` (round 2). |

No change to i18n messages, types, router, stores, `material-web.ts` or
`package.json` dependencies.

## Data Flow

```
LandingPage.vue
  └─ <AnimatedLogo class="hero__logo" />
        ├─ useI18n().t('landing.logoAlt') ──> <svg role="img" aria-label>
        ├─ color: inherited --color-text-primary ──> currentColor
        └─ CSS (no JS timing)
             t=0.00s       root dot D3
             0.10–3.55s    9 traces draw (stroke-dashoffset 1.01 → 0) inside a
                           mask whose 10 holes follow the 10 rings; a ring rides
                           every tip: 6 become dots D1 D2 D4–D7; P7/P8 heads
                           vanish, P4 head merges into D5 at J (1.487 s)
             3.80s         block cursor appears at "m", blinks once
             5.00–9.18s    20 glyphs at hand-set times (D4), cursor steps along
             9.18–10.68s   cursor right of "t", blinks, gone at 10.68 s
           prefers-reduced-motion: reduce ──> animation: none ──> end state
                                              (static logo, no heads, no cursor)
```

## Interfaces

```ts
// app/src/components/AnimatedLogo.vue — no props, no emits, no slots
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

Template contract (relied on by tests):

- Exactly one root `<svg class="animated-logo" viewBox="0 0 512 512"
  role="img" aria-label="…">`.
- One `mask#animated-logo-holes` with `maskUnits="userSpaceOnUse"`, a white
  full-size `rect` and 10 `circle.animated-logo__hole` (modifiers `--d1`…`--d7`,
  `--p4`, `--p7`, `--p8`), `r="10.144"`, `fill="black"`, each with the same
  `cx`/`cy` and timing custom properties as the ring with the same modifier.
- One `g.animated-logo__traces` with `mask="url(#animated-logo-holes)"`,
  containing all 9 `path.animated-logo__trace` (`pathLength="1"`,
  `stroke="currentColor"`, `--logo-delay`, `--logo-duration`) and nothing
  else (no circles, no glyphs).
- 7 `circle.animated-logo__dot` (`--d1`…`--d7`) as direct children of the root
  `svg`, `r="10.144"`, `stroke-width="8.336"`, `stroke="currentColor"`,
  `cx`/`cy` as in the D3 dot table. D3 has `--logo-delay: 0s`; every other dot
  has the same `--logo-delay`/`--logo-duration` as the trace it rides.
- 3 `circle.animated-logo__head` (`--p4`, `--p7`, `--p8`), same ring
  attributes, `cx`/`cy` and timing as in the D3 head table. The P4 head sits
  at D5's centre with 0.10 s / 1.90 s (round 3).
- 20 `path.animated-logo__glyph` inside `g.animated-logo__wordmark`
  (`fill="currentColor"`), `data-char` in order spelling
  `michaelschreiber.net`, `--logo-delay` as in the D4 table.
- 1 `rect.animated-logo__cursor` inside `g.animated-logo__wordmark`,
  `x="566.19" y="1218.66" width="22" height="41.26" fill="currentColor"`.
- No `<text>`, no `<image>`, no reference to a font or to `logo_anim.gif`.

## Tests

The Tester writes the test concept `MS-17-tests.md`. Expected coverage
(Vitest + Vue Test Utils, real `de`/`en` locales):

`AnimatedLogo.spec.ts`

- Renders one `svg` with `viewBox="0 0 512 512"`, `role="img"` and the de
  and en `landing.logoAlt` text as `aria-label`.
- Contains no `<text>` element (AC 1); the 20 glyph paths' `data-char`
  values joined equal `michaelschreiber.net`, with `light`/`medium` weights
  as in the design.
- 9 traces, each with `pathLength="1"` and `stroke="currentColor"`; wordmark
  group `fill="currentColor"`.
- Dots: 7 dots with the round 2 D3-table `cx`/`cy` (exact strings),
  `r="10.144"`, `stroke="currentColor"`, parent is the root `svg`. The root dot
  `--d3` has delay `0s`. Each moving dot's `--logo-delay`/`--logo-duration`
  equals that of its trace (P2→D1, P1→D2, P9→D4, P3→D5, P5→D6, P6→D7). This
  is the sync guarantee.
- Heads: exactly 3 `circle.animated-logo__head` (`--p4`, `--p7`, `--p8`) with
  the D3-table position and timing (P7 and P8 equal their trace; P4 see
  below).
- **Bottom-right merge (round 3):**
  - P4 trace `--logo-duration: 1.38s`.
  - The P4 head and its hole have `cx`/`cy` equal to D5's.
  - The P4 head and its hole have `--logo-delay: 0.10s` and
    `--logo-duration: 1.90s`, so delay + duration equals D5's delay +
    duration (2.00 s).
  - Source level: `logo-move-p4` has a `73%` stop with
    `translate(69.52px, 56.88px)`, identical to `logo-move-d5`'s `68.9%`
    stop (J), and ends at `translate(0px, 0px)`.
  - Arithmetic: 0.10 + 0.73 × 1.90 and 0.35 + 0.689 × 1.65 both give
    1.487 s, within 0.005 s.
- Exactly 10 ring circles outside the mask.
- **Joint geometry (round 2):**
  - Mask structure as in the contract. All 9 traces, and only they, are
    descendants of the masked group; no dot, head, glyph or cursor is inside
    it.
  - For each of the 10 rings there is exactly one hole with the same modifier,
    `cx`, `cy`, `--logo-delay`, `--logo-duration` and `r="10.144"`.
  - Each moving dot centre lies on the axis of its trace's last segment:
    collinearity within 0.01 units. Compute it from the trace `d` and its
    group `matrix`, or from the D3 table values. Each trace end is within
    [5.976, 13.69] units of its ring centre (no notch). P4 and P7 start within
    that range of D3.
- Typing: the glyph `--logo-delay` values equal the D4 table, strictly
  increasing, last `9.18s`. No element starts before the root dot.
- Custom properties: read them with `element.style.getPropertyValue(...)`;
  if jsdom drops them, assert them on the raw source (`AnimatedLogo.vue?raw`)
  instead.
- Cursor: exactly one `rect.animated-logo__cursor` inside
  `g.animated-logo__wordmark`, with `x`/`y`/`width`/`height` from the
  contract and `fill="currentColor"`.
- Source level (`?raw`, jsdom does not apply scoped CSS):
  - the `@media (prefers-reduced-motion: reduce)` block sets
    `animation: none` for traces, dots, heads, holes, glyphs and the cursor
    (AC 4);
  - **the reduced-motion block comes after every other rule that sets
    `animation`** (its start index in the `<style>` source is greater than the
    index of the last `animation:` declaration outside it) (D5, review note);
  - `.animated-logo__head`, the head holes and `.animated-logo__cursor` have
    base `opacity: 0`;
  - traces use `stroke-dashoffset` keyframes (AC 2);
  - each of the nine `logo-move-*` keyframes ends at `translate(0px, 0px)`;
  - `logo-cursor-move` ends at `translateX(499.23px)`;
  - the cursor uses `6.88s … 3.8s` and `5.68s … 5s`;
  - glyph and dot reveals use `steps(1, start)`.

`LandingPage.spec.ts`

- The logo is an `svg.hero__logo` (the `AnimatedLogo` root) placed before
  the `h1`, with the localized `aria-label`.
- No `img` with `src` `/logo_anim.gif` is rendered (AC 6); optionally assert
  that `app/public/logo_anim.gif` no longer exists.

**Joint verification in a real browser** (jsdom renders nothing):

1. Open the landing page and run in the console:
   `document.getAnimations().forEach(a => { a.pause(); a.currentTime = T })`
   for T = 0 … 3800 ms in steps of 25–50 ms. Alternatively use the DevTools
   Animations panel at 10 % speed.
2. At each step, check every visible ring hole: the background must show,
   with no line pixels.

The architect ran this check automatically on a prototype with the same
geometry, mask and keyframes (headless Chrome, 2× render, every 25 ms; D3b).
It can be repeated on the real component the same way.

Manual browser check, in Chrome, Safari and Firefox:

- the circles ride the trace tips and new circles appear at branch points,
  compared with GIF frames `f001`–`f036`;
- no line inside any ring hole at any moment or in the end state, and no
  notch where a line meets a ring. This includes the Safari repaint of the
  animated mask: if a browser does not update the mask holes while they move,
  report it to the architect;
- the six dots end exactly on their final rings; the P7 and P8 heads vanish
  at their trace end. The P4 head meets the D5 circle at the bottom-right
  junction at the same moment, and the two continue as one ring to D5, with
  no disappearance (compare `gif-frames-bottom-junction-f010-f023.png`);
- the cursor appears at `m` only after the circuit, blinks, steps with each
  glyph in the D4 rhythm with the two word pauses, blinks after `.net` and
  disappears at about 10.7 s;
- the end state matches `compare-gif-vs-outlined.png`, within the ≤ 1.1-unit
  ring snap;
- with `prefers-reduced-motion: reduce` (DevTools → Rendering), the static
  end state shows at once, with no extra circles, no cursor and clean ring
  holes.

## Open Questions

Not blocking. The defaults below are implemented unless the user decides
otherwise in the next review:

1. **Ring overlaps at branch points** (0.03–0.15 s each, as in the GIF): when
   a new circle spawns, its ring briefly overlaps the parent's ring (D3a).
   This is kept as the GIF's "split". The alternative: a new circle becomes
   visible only once it is clear of the parent ring, so its branch starts
   without a circle for about 0.1 s.
2. **Typing rhythm** (D4): about 0.2 s per glyph with 0.45 s and 0.40 s word
   pauses. Typing takes about 4.2 s, and the total runtime is 10.68 s.
3. **Cursor look** (D4a): a block from the baseline to the ascender, about as
   wide as an `n`, solid while typing.

Deviations of ±0.05 s from the timing tables are at the developer's
discretion, as long as each moving circle and its hole keep their trace's
exact values and the cursor keyframes match the glyph times.
