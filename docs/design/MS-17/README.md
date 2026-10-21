# MS-17 — Design input: animated SVG logo

Prepared by the orchestrator before the agent workflow. Source: the current
`app/public/logo_anim.gif` and `app/public/logo.svg`.

## Files

| File | Content |
|---|---|
| `logo-outlined.svg` | Static end state of the logo, 512×512 viewBox. Same as `app/public/logo.svg`, but the wordmark `michaelschreiber.net` is converted to one `<path>` per glyph (`data-char`, `data-weight="light"|"medium"`) — no `<text>`, no font dependency. An extra wrapper transform `matrix(0.9508,0,0,0.9508,17.25,46.7)` moves/scales the wordmark so it matches the GIF's last frame. |
| `compare-gif-vs-outlined.png` | GIF last frame (left), `logo-outlined.svg` rendered in Chrome (middle), overlay (right). Glyph columns match the GIF to ±1 px at 512 px. |
| `gif-frames-contact-sheet.png`, `gif-frames/` | Every 3rd frame of the GIF and selected single frames (`fNNN.png`, frame number). |
| `text2path.py` | Script used for the glyph conversion (fontTools, Roboto Light/Medium 54.167 px, positions from `logo.svg`). Only for traceability — not part of the build. |

## The GIF animation

- 58 frames × 100 ms = 5.8 s, plays **once** (no loop). Black strokes on a transparent background.
- **0–3.6 s (frames 0–36): the circuit grows.** It starts with the single dot at the bottom-left
  end of the S's bottom line (`f000`), then the traces grow outward from there like a circuit
  being drawn: bottom lines of the S to the right and up, the vertical trace of the M, then the
  M's diagonals and the S's upper traces; each trace ends in its dot, which appears when the
  trace reaches it. See `f000`–`f036` for the order.
- **3.6–5.7 s (frames ~37–56): the wordmark is typed** letter by letter, ~100 ms per glyph,
  `michael` (light) → `schreiber` (medium) → `.net` (light). No cursor.
- Frame 57: final state (= `logo-outlined.svg`).

## Notes

- The dots are circles drawn with a stroke (`fill:none`), the traces are open polylines with
  a stroke — both suit a `stroke-dashoffset` "draw" animation. The glyphs are filled shapes —
  reveal them (opacity / visibility per glyph, stepped), do not stroke-animate them.
- The SVG's `<g transform="matrix(...)">` wrappers come from Affinity Designer; flattening them
  is optional.

## User review round 1 (2026-10-21) — additional requirements

`gif-frames/` now contains all 58 frames; `gif-frames-contact-sheet.png` shows every frame.

1. **Travelling circles (missing in round 1).** In the GIF the traces do not only grow — a
   circle (same look as the end dots) sits on the **head of every growing trace** and travels
   along with it. When the head reaches a branch point, a **new circle appears** there and
   travels along the new branch, while the original circle continues on its own trace. Where a
   trace ends in a dot, its travelling circle stops there and *is* that end dot. See
   `f001`–`f035` (e.g. `f003`, `f016`, `f019`, `f023`, `f029`): several circles move at once.
   Check every trace end without a dot in the final logo (traces that end at a junction or
   corner) for what the GIF does with its circle there.
2. **New: blinking block cursor** (not in the GIF — the user's wish). Sequence:
   - First only the MS circuit animates; no cursor.
   - When the circuit is complete, a **blinking block cursor** (filled rectangle, like a
     terminal cursor) appears in the wordmark line at the position of the first glyph `m`.
   - It blinks a moment, then typing starts; the cursor **moves along with the text**, always
     just right of the last typed glyph.
   - After `michaelschreiber.net` is complete, the cursor **stays briefly (blinking)**, then
     **disappears**.

## User review round 2 (2026-10-21) — additional requirements

1. **Traces dock exactly onto the circles.** In round 2 the line is visible inside some rings
   (end state and while circles travel). Requirement: a trace must end exactly at the ring —
   nothing of the line visible in the ring's hole, no gap or notch at the joint — at every
   moment of the animation and in the end state. This deliberately deviates from the GIF/design
   geometry where traces run to the circle centre.
2. **Calmer typing.** The fixed 100 ms per glyph looks "rattled off". Use a calmer, natural
   typing rhythm: longer, slightly varying intervals, short pauses at word boundaries
   (`michael` | `schreiber` | `.net`). The cursor keeps following the text.

## User review round 3 (2026-10-21) — additional requirement

**Synchronised merge at the bottom-right junction.** The circle travelling along the outermost
bottom trace (from the root dot to the right and up the right edge of the S) and the circle on the
parallel inner bottom trace must reach the bottom-right junction (where both lines meet on the
right side of the S) **at the same moment**, merge there into one circle, and **continue together**
to the end point. In round 3 the inner circle reaches the junction and suddenly disappears.
See `gif-frames-bottom-junction-f010-f023.png` (zoomed crop of frames 10–23; meeting at ~f015–f018).
