---
name: AnimatePresence initial={false} suppresses descendant mount animations
description: framer-motion gotcha — initial={false} propagates via context to ALL nested motion children, not just keyed direct children
---

`<AnimatePresence initial={false}>` propagates `initial={false}` through context to
**every descendant** motion component, not only its keyed direct children. Any nested
`motion.*` element loses its own first-mount `initial` animation.

**Why:** In the emotional-insight result view, wrapping the bead chain in a
`ChainArtTransition` that used `<AnimatePresence mode="wait" initial={false}>` silently
killed the stage-0 staggered bead cascade — the beads' `initial={{opacity:0,y:-8}}`
mount animation was suppressed by the inherited context, even though they are nested
inside the wrapper's `motion.div`, not direct AnimatePresence children.

**How to apply:** If you need an enter/exit fade on a wrapper but still want nested
children to animate on first mount, do NOT use `initial={false}` on the AnimatePresence.
Instead gate any unwanted *replay* with component state (e.g. an `animated` flag that
flips true after the first reveal and switches children to a non-stagger path on
remount). That preserves the first-load animation while preventing replay on later
remounts.
