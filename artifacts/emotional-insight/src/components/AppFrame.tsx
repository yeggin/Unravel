import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import beadClear from "@assets/Frame_25_1779764468100.svg";
import beadBlue from "@assets/Frame_27_1779764468101.svg";
import beadClover from "@assets/Frame_18_1779764468100.svg";
import beadPink from "@assets/Frame_26_1779764468101.svg";
import beadKey from "@assets/Frame_16_1779764468096.svg";
import knotA from "@assets/Frame_21_1779761517804.png";
import knotB from "@assets/Frame_22_1779761986456.png";

/* Bead images in step order: clear, blue, clover, pink, key, clear (6 beads) */
const BEAD_IMAGES = [
  beadClear,
  beadBlue,
  beadClover,
  beadPink,
  beadKey,
  beadClear,
];

/*
 * AppFrame — full-page viewport shell matching the Figma design (node 138:2)
 *
 * Key Figma measurements (1440×1024 canvas → scaled to 1000px inner frame):
 *   Outer border:   4.609px solid #0088ff
 *   Inner frame:    w=977px, h=774px (content panel rgba(255,255,255,0.59))
 *   Beads:          11.856px diamond, container 16.767px, gap 72px center-to-center
 *   Short segment:  width ≈ 95px
 *   Gap:            25px
 *   Long segment:   starts at 120px
 *   Vert extend up: 19px above top line
 *   Dot (Ellipse5): center 36px from frame left → left edge at 31px
 *   Group11 dots:   2 stacked at top of right vertical
 *   Bottom dots:    at 3%, 6% and 77% from frame left
 *   Bottom extend:  24px below bottom line
 */

const TOTAL_BEADS = 6;
const BLUE = "#0088ff";
const DOT_R = 4; // radius → 8×8px circles

interface AppFrameProps {
  children: ReactNode;
  /** 0 = landing (none lit), 1–7 = current structured step */
  currentBead?: number;
}

function HLine({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        height: 1,
        background: BLUE,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
function VLine({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: 1,
        background: BLUE,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
/*
 * ── Animated border balls ──────────────────────────────────────────────────
 * Each ball lives on a single line "track" (a continuous segment of the
 * blue frame). It slides back and forth. When it reaches the end of its
 * track (a corner OR a gap in the line) it reverses direction. When two
 * balls on the same track collide head-on, they swap velocities (elastic
 * 1-D collision) so the bump is visible.
 */
type Track =
  | { id: string; axis: "h"; y: number; min: number; max: number }
  | { id: string; axis: "v"; x: number; min: number; max: number };
type Ball = { trackId: string; pos: number; vel: number };

function AnimatedBorderDots({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  // 7 balls — refs into the rendered span elements
  const ballRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PAD = 24; // matches how far the lines extend past the corners
    const COLLISION_DIST = 10; // px gap below which two balls "bump"

    // Initial balls — placed roughly where the static dots used to live
    const balls: Ball[] = [
      { trackId: "left-up", pos: 20, vel: 28 },
      { trackId: "top-long", pos: 260, vel: -22 },
      { trackId: "right-up", pos: 0, vel: 26 },
      { trackId: "right-up", pos: 18, vel: -30 },
      { trackId: "bottom-left", pos: 18, vel: 24 },
      { trackId: "bottom-left", pos: 30, vel: -27 },
      { trackId: "bottom-right", pos: 600, vel: -23 },
    ];

    let tracks: Track[] = [];

    function rebuildTracks() {
      const w = container!.offsetWidth;
      const h = container!.offsetHeight;
      tracks = [
        // top line, broken into short (left of gap) + long (right of gap)
        { id: "top-short", axis: "h", y: 0, min: -PAD, max: 95 },
        { id: "top-long", axis: "h", y: 0, min: 120, max: w + PAD },
        // bottom line — gap at 60% from left
        { id: "bottom-left", axis: "h", y: h, min: -PAD, max: w * 0.6 - 8 },
        { id: "bottom-right", axis: "h", y: h, min: w * 0.6 + 8, max: w + PAD },
        // right vertical — gap at 40% from top
        { id: "right-up", axis: "v", x: w, min: -19, max: h * 0.4 - 8 },
        { id: "right-down", axis: "v", x: w, min: h * 0.4 + 8, max: h + 15 },
        // left vertical — gap at 80% from top
        { id: "left-up", axis: "v", x: 0, min: -19, max: h * 0.8 - 8 },
        { id: "left-down", axis: "v", x: 0, min: h * 0.8 + 8, max: h + 24 },
      ];
      // clamp balls so a resize doesn't strand them outside their track
      for (const b of balls) {
        const t = tracks.find((tr) => tr.id === b.trackId);
        if (!t) continue;
        if (b.pos < t.min) b.pos = t.min;
        if (b.pos > t.max) b.pos = t.max;
      }
    }

    rebuildTracks();
    const ro = new ResizeObserver(rebuildTracks);
    ro.observe(container);

    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // 1) move + reverse at corners/gaps
      for (const b of balls) {
        const t = tracks.find((tr) => tr.id === b.trackId);
        if (!t) continue;
        b.pos += b.vel * dt;
        if (b.pos < t.min) {
          b.pos = t.min;
          b.vel = Math.abs(b.vel);
        } else if (b.pos > t.max) {
          b.pos = t.max;
          b.vel = -Math.abs(b.vel);
        }
      }

      // 2) elastic 1-D collisions between balls on the same track
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          if (a.trackId !== b.trackId) continue;
          const gap = b.pos - a.pos;
          if (Math.abs(gap) < COLLISION_DIST) {
            const movingTogether = gap > 0 ? a.vel > b.vel : b.vel > a.vel;
            if (movingTogether) {
              const tmp = a.vel;
              a.vel = b.vel;
              b.vel = tmp;
              // nudge apart so they don't stay overlapping next frame
              const sep = (COLLISION_DIST - Math.abs(gap)) / 2 + 0.5;
              if (gap >= 0) {
                a.pos -= sep;
                b.pos += sep;
              } else {
                a.pos += sep;
                b.pos -= sep;
              }
            }
          }
        }
      }

      // 3) write to DOM
      for (let i = 0; i < balls.length; i++) {
        const el = ballRefs.current[i];
        if (!el) continue;
        const b = balls[i];
        const t = tracks.find((tr) => tr.id === b.trackId);
        if (!t) continue;
        if (t.axis === "h") {
          el.style.left = `${b.pos - DOT_R}px`;
          el.style.top = `${t.y - DOT_R}px`;
        } else {
          el.style.left = `${t.x - DOT_R}px`;
          el.style.top = `${b.pos - DOT_R}px`;
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [containerRef]);

  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          ref={(el) => {
            ballRefs.current[i] = el;
          }}
          className="frame-dot"
          aria-hidden
          style={{
            width: DOT_R * 2,
            height: DOT_R * 2,
            left: 0,
            top: 0,
            willChange: "left, top",
          }}
        />
      ))}
    </>
  );
}

export function AppFrame({ children, currentBead = 0 }: AppFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  return (
    /*
     * PAGE ROOT — thick outer blue border (Figma: border-[4.609px] solid #08f)
     * This wraps the entire viewport.
     */
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        border: `4.6px solid ${BLUE}`,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/*
       * BACKGROUND BLOBS
       * Figma: image37 blur-[27.5px] left=-110 top=385, size=688
       *        image31 blur-[34.336px] left=318 top=516, w=603 h=653
       */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 688,
          height: 688,
          left: -110,
          top: "38%",
          filter: "blur(27.5px)",
          opacity: 0.67,
          backgroundImage: "url(/figma-assets/bg1.png)",
          backgroundSize: "cover",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 603,
          height: 653,
          left: "22%",
          top: "50%",
          filter: "blur(34px)",
          opacity: 0.54,
          backgroundImage: "url(/figma-assets/bg2.png)",
          backgroundSize: "cover",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* CONTENT COLUMN — centred, relative z-index above blobs */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "28px 48px 52px",
          minHeight: "calc(100vh - 9.2px)",
        }}
      >
        {/*
         * BEAD BAR — monogram pinned left, 7 beads centered in remaining space.
         * User request: progress indicator centered.
         */}
        <div
          style={{
            width: "100%",
            maxWidth: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            minHeight: 78,
            gap: 36,
          }}
          role="progressbar"
          aria-valuenow={currentBead}
          aria-valuemax={TOTAL_BEADS}
          aria-label="Progress"
        >
          {/* Knot — left of progress indicators, subtle alternation animation */}
          <div className="knot-wrap" aria-hidden style={{ width: 92, height: 46, position: "relative", flexShrink: 0 }}>
            <img src={knotA} alt="" className="knot-img knot-a" />
            <img src={knotB} alt="" className="knot-img knot-b" />
          </div>

          {/* 7 beads */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
            }}
          >
            {Array.from({ length: TOTAL_BEADS }).map((_, i) => {
              const beadState =
                i < currentBead - 1
                  ? "completed"
                  : i === currentBead - 1
                  ? "current"
                  : "upcoming";
              return (
                <div
                  key={i}
                  className="bead-slot"
                  data-bead-index={i}
                  data-bead-state={beadState}
                  aria-label={`Step ${i + 1}${
                    beadState === "current" ? " (current)" : beadState === "completed" ? " (done)" : ""
                  }`}
                >
                  {beadState === "completed" ? (
                    <img src={BEAD_IMAGES[i]} alt="" className="bead-img" />
                  ) : (
                    <div className="bead-default" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/*
         * INNER FRAME
         * The frame div top edge = the top horizontal line.
         * Left/right verticals extend 19px ABOVE the frame top (negative top).
         * Dot positions are relative to this div.
         *
         * Frame line structure (all scaled to 1000px max-width):
         *   Left vert:   left=0, top=-19 → bottom
         *   Short seg:   left=0, top=0, width=95px
         *   Gap:         25px (95→120)
         *   Long seg:    left=120, top=0 → right
         *   Ellipse5:    center at left=36, top=0 → dot left=31, top=-5
         *   Right vert:  right=0, top=-19 → bottom
         *   Group11 dots (2): right=-5, top=-24 and top=-5
         *   Bottom line: left=0 → right, bottom=0
         *   Dots bottom: left=3%, 6%, 77% at bottom=-5
         *   Ext below:   left=0, bottom=-24, height=24
         */}
        <div
          ref={frameRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1000,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/*
           * ── Left vertical — extends 19px above, gap at 4/5 (80%) from top ──
           * Uses CSS gradient to create a visible break at 80%.
           */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              width: 1,
              left: 0,
              top: -19,
              bottom: 0,
              background: `linear-gradient(to bottom, ${BLUE} 0%, ${BLUE} calc(80% - 8px), transparent calc(80% - 8px), transparent calc(80% + 8px), ${BLUE} calc(80% + 8px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* ── Top-left short segment — starts 24px LEFT of frame ── */}
          <HLine style={{ left: -24, top: 0, width: 119 }} />

          {/*
           * ── Top-right long segment — extends 24px PAST the right vertical ──
           */}
          <HLine style={{ left: 120, top: 0, right: -24 }} />

          {/*
           * ── Right vertical — gap at 2/5 (40%) from top, extended 15px below ──
           */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              width: 1,
              right: 0,
              top: -19,
              bottom: -15,
              background: `linear-gradient(to bottom, ${BLUE} 0%, ${BLUE} calc(40% - 8px), transparent calc(40% - 8px), transparent calc(40% + 8px), ${BLUE} calc(40% + 8px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/*
           * ── Bottom horizontal — extends 24px past BOTH verticals, gap at 3/5 (60%) from left ──
           */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              height: 1,
              left: -24,
              right: -24,
              bottom: 0,
              background: `linear-gradient(to right, ${BLUE} 0%, ${BLUE} calc(60% - 8px), transparent calc(60% - 8px), transparent calc(60% + 8px), ${BLUE} calc(60% + 8px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* ── Bottom-left vertical extension ── */}
          <VLine style={{ left: 0, bottom: -24, height: 24 }} />

          {/* ── Animated border balls — slide along their line, reverse at corners/gaps, bump on collision ── */}
          <AnimatedBorderDots containerRef={frameRef} />

          {/*
           * CONTENT PANEL — rgba(255,255,255,0.59) semi-transparent white
           * Matches Figma's inner white overlay; padding sized from Figma proportions.
           * padding-top ≈ 65px, padding-bottom ≈ 40px, horizontal ≈ 8% (≈80px on 1000px)
           */}
          <div
            style={{
              background: "rgba(255,255,255,0.59)",
              flex: 1,
              padding: "65px 80px 40px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
