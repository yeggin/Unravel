---
name: Negative z-index children need an isolated parent
description: A child with z-index:-1 falls behind ancestor backgrounds (and becomes non-clickable) unless the parent forms its own stacking context
---

To tuck a child's visuals *behind a sibling* (e.g. a glow that should sit behind an
image drawn into a lower-layer SVG) using `z-index: -1`, the child can sink behind the
**ancestor's** background too — and if it does, its hit target stops receiving clicks.
`pointer-events: none` on the covering sibling does NOT save it, because the problem is
the ancestor/background painting above it.

**Why:** Without a local stacking context on the parent, a negative z-index resolves
against the nearest ancestor that has one — often the page/panel — so the element paints
behind that ancestor's background.

**How to apply:** Give the immediate parent its own stacking context (`isolation: isolate`,
or a non-auto `z-index`) so the negative-z child is clamped to the parent's context —
behind its siblings but in front of the parent's own backdrop, staying visible and
clickable. Encountered with the emotional-insight bead chain's key charm.
