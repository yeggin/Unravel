import type { ReactNode, CSSProperties } from "react";

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

const TOTAL_BEADS = 7;
const BLUE = "#0088ff";
const DOT_R = 3; // radius → 6×6px circles

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
function Dot({ dataDot, style }: { dataDot: string; style: CSSProperties }) {
  return (
    <span
      className="frame-dot"
      data-dot={dataDot}
      aria-hidden
      style={{
        width: DOT_R * 2,
        height: DOT_R * 2,
        ...style,
      }}
    />
  );
}

export function AppFrame({ children, currentBead = 0 }: AppFrameProps) {
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
            position: "relative",
            marginBottom: 18,
            minHeight: 78,
          }}
          role="progressbar"
          aria-valuenow={currentBead}
          aria-valuemax={TOTAL_BEADS}
          aria-label="Progress"
        >
          {/* Monogram — 106×78px window, pinned to the left */}
          <div
            style={{
              width: 106,
              height: 78,
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
            aria-label="unravel"
          >
            <img
              src="/figma-assets/monogram.png"
              alt=""
              style={{
                position: "absolute",
                left: -21,
                top: -43,
                width: 666,
                maxWidth: "none",
              }}
            />
          </div>

          {/* 7 beads — absolutely centered so they sit in the middle of the bar */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 55,
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
                  <div className="bead-default" />
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
              background: `linear-gradient(to bottom, ${BLUE} 0%, ${BLUE} calc(80% - 4px), transparent calc(80% - 4px), transparent calc(80% + 4px), ${BLUE} calc(80% + 4px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* ── Top-left short segment — starts 7px LEFT of frame ── */}
          <HLine style={{ left: -7, top: 0, width: 102 }} />

          {/* ── Dot on the short segment — on the line (center at ~45px from frame left) ── */}
          <Dot dataDot="top-left" style={{ left: 42, top: -DOT_R }} />

          {/*
           * ── Top-right long segment — extends 7px PAST the right vertical ──
           */}
          <HLine style={{ left: 120, top: 0, right: -7 }} />

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
              background: `linear-gradient(to bottom, ${BLUE} 0%, ${BLUE} calc(40% - 4px), transparent calc(40% - 4px), transparent calc(40% + 4px), ${BLUE} calc(40% + 4px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/*
           * ── Top-right dots — upper dot intersects both horizontal AND vertical lines ──
           * Upper: center at (right:0, top:0) = the corner intersection → right:-DOT_R, top:-DOT_R
           * Lower: ~16px below upper
           */}
          <Dot dataDot="top-right-upper" style={{ right: -DOT_R, top: -DOT_R }} />
          <Dot dataDot="top-right-lower" style={{ right: -DOT_R, top: DOT_R * 3 + 4 }} />

          {/*
           * ── Bottom horizontal — extends 7px past BOTH verticals, gap at 3/5 (60%) from left ──
           */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              height: 1,
              left: -7,
              right: -7,
              bottom: 0,
              background: `linear-gradient(to right, ${BLUE} 0%, ${BLUE} calc(60% - 4px), transparent calc(60% - 4px), transparent calc(60% + 4px), ${BLUE} calc(60% + 4px), ${BLUE} 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* ── Bottom dots — left pair closer together, right moved slightly right ── */}
          <Dot dataDot="bottom-left-1" style={{ left: 18, bottom: -DOT_R }} />
          <Dot dataDot="bottom-left-2" style={{ left: 30, bottom: -DOT_R }} />
          <Dot dataDot="bottom-right"  style={{ left: "82%", bottom: -DOT_R }} />

          {/* ── Bottom-left vertical extension ── */}
          <VLine style={{ left: 0, bottom: -24, height: 24 }} />

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
