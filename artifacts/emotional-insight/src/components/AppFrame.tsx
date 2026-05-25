import type { ReactNode, CSSProperties } from "react";

const TOTAL_BEADS = 7;
const BLUE = "#0088ff";
const DOT_SIZE = 10;

interface AppFrameProps {
  children: ReactNode;
  /** 0 = landing (no bead lit), 1–7 = current structured step */
  currentBead?: number;
}

// Thin helpers to keep JSX clean
function HLine({ style }: { style: CSSProperties }) {
  return (
    <div
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
      style={{ width: DOT_SIZE, height: DOT_SIZE, ...style }}
    />
  );
}

export function AppFrame({ children, currentBead = 0 }: AppFrameProps) {
  const half = DOT_SIZE / 2;

  return (
    /*
     * PAGE ROOT — thick outer blue border around the entire viewport (Figma: border 4.6px #0088ff)
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
       * BACKGROUND BLOBS — downloaded from Figma, soft blurred colour washes.
       * User can replace these images or add additional ones at any time.
       * Positions mirror the Figma canvas layout (1440×1024 reference).
       */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 688,
          height: 688,
          left: -110,
          bottom: -180,
          filter: "blur(27px)",
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
          bottom: -140,
          filter: "blur(34px)",
          opacity: 0.54,
          backgroundImage: "url(/figma-assets/bg2.png)",
          backgroundSize: "cover",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* CONTENT COLUMN */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "28px 48px 48px",
          minHeight: "calc(100vh - 9.2px)",
        }}
      >
        {/*
         * BEAD BAR
         * Monogram image is downloaded from Figma — replace with brand SVG later.
         * Each bead slot has data-bead-index + data-bead-state for custom bead hookup:
         *   [data-bead-index="0"] .bead-default { background-image: url('...') }
         *   [data-bead-state="current"] .bead-default { ... }
         */}
        <div
          style={{
            width: "100%",
            maxWidth: 1000,
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 16,
          }}
          role="progressbar"
          aria-valuenow={currentBead}
          aria-valuemax={TOTAL_BEADS}
        >
          {/*
           * Monogram — the Figma artwork is a large PNG cropped to a 106×78 window.
           * Offsets from Figma: left=-19.79%, top=-55% of the container (% of 106×78).
           * Replace this container + image with your own brand asset when ready.
           */}
          <div
            style={{
              width: 106,
              height: 78,
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
              marginRight: 10,
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
          {Array.from({ length: TOTAL_BEADS }).map((_, i) => {
            const state =
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
                data-bead-state={state}
                aria-label={`Step ${i + 1}${
                  state === "current"
                    ? " (current)"
                    : state === "completed"
                    ? " (done)"
                    : ""
                }`}
              >
                <div className="bead-default" />
              </div>
            );
          })}
        </div>

        {/*
         * INNER FRAME
         * Thin 1px blue line decorations matching the Figma layout.
         * Circle dots are each individually addressable via [data-dot="..."] for idle animations.
         *
         * Structure:
         *   - Left vertical: full height, extends 20px above top line
         *   - Top-left short segment (~120px), ends in a circle dot
         *   - ~28px gap
         *   - Top-right long segment (rest of width), starts with a circle dot
         *   - Right vertical: full height, extends 20px above, has sub-dot near top
         *   - Bottom horizontal: full width
         *   - Two circle dots on bottom line (left ~12%, right ~72%)
         *   - Short vertical extending 22px below bottom-left
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
          {/* Left vertical — starts 20px above the top horizontal */}
          <VLine style={{ left: 0, top: -20, bottom: 0 }} />

          {/* Top-left short segment */}
          <HLine style={{ left: 0, top: 0, width: 120 }} />
          {/* Circle at the right end of the top-left segment */}
          <Dot dataDot="top-left-end" style={{ left: 120 - half, top: -half }} />

          {/* Top-right long segment (starts 28px after the short one ends) */}
          <HLine style={{ left: 148, top: 0, right: 0 }} />
          {/* Circle at the left start of the top-right segment */}
          <Dot dataDot="top-right-start" style={{ left: 148 - half, top: -half }} />

          {/* Right vertical — also extends 20px above */}
          <VLine style={{ right: 0, top: -20, bottom: 0 }} />
          {/* Sub-dot on the right line, ~24px below where top segment meets */}
          <Dot dataDot="right-sub" style={{ right: -half, top: 24 }} />

          {/* Bottom horizontal */}
          <HLine style={{ left: 0, right: 0, bottom: 0 }} />
          {/* Two dots on the bottom line */}
          <Dot dataDot="bottom-left-1" style={{ left: "8%", bottom: -half }} />
          <Dot dataDot="bottom-left-2" style={{ left: "11%", bottom: -half }} />
          <Dot dataDot="bottom-right" style={{ left: "72%", bottom: -half }} />

          {/* Short vertical extension below the bottom-left corner */}
          <VLine style={{ left: 0, bottom: -22, height: 22 }} />

          {/*
           * CONTENT PANEL — semi-transparent white overlay (Figma: rgba(255,255,255,0.59))
           * Sits inside the frame decorations.
           */}
          <div
            style={{
              background: "rgba(255,255,255,0.59)",
              flex: 1,
              padding: "48px 56px 36px",
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
