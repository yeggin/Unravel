import { motion } from "framer-motion";
import beadClear from "@assets/Group_17_1779916770855.svg";
import beadBlue from "@assets/Group_18_1779916770855.svg";
import beadPink from "@assets/Group_19_1779916770856.svg";
import beadClover from "@assets/Frame_28_1779916770846.svg";
import beadLock from "@assets/Subtract_1779916770856.svg";
import beadKey from "@assets/Union_1779916770856.svg";
import stringSvg from "@assets/Group_20_1779916770856.svg";
import squareOutline from "@assets/outline_1779919260546.svg";
import keyOutline from "@assets/Key_outline_1779919285967.svg";

/**
 * Chain layout — 8 beads total along the curving string, 6 are clickable
 * (one per content stage). Positions are tuned to lie on the visible string
 * path (string SVG sized 220×420, anchored at left:30 inside a 300×540 box).
 *
 * Clickable beads, in order: clear1, clear2, clover, blue, square (lock), key.
 * Decorative companions: clear3 and pink (animate in but no click / no pulse).
 *
 *   0 Emotion           → clear bead 1
 *   1 Why               → clear bead 2
 *   2 Take a breath     → clover
 *   3 A different angle → blue bead
 *   4 What you can do   → square (lock)
 *   5 Take it with you  → key
 */

type BeadKind = "clear" | "blue" | "pink" | "clover" | "lock" | "key";
type PulseShape = "circle" | "square" | "pill";

interface BeadDef {
  stage: number;
  kind: BeadKind;
  src: string;
  /** Top-left of the bead inside the 300×540 chain box, in px. */
  top: number;
  left: number;
  width: number;
  height: number;
  /** Decorative beads animate in but aren't clickable and don't pulse. */
  decorative?: boolean;
  /** Exactly one bead per stage is the "representative" — gets the pulse ring. */
  representative?: boolean;
  /** Shape of the pulsing outline ring around current bead. */
  pulseShape?: PulseShape;
}

const BEADS: BeadDef[] = [
  { stage: 0, kind: "clear",  src: beadClear,  top: 109, left: 75,  width: 44, height: 42, representative: true, pulseShape: "circle" },
  { stage: 1, kind: "clear",  src: beadClear,  top: 158, left: 95,  width: 46, height: 44, representative: true, pulseShape: "circle" },
  { stage: 2, kind: "clover", src: beadClover, top: 188, left: 100, width: 78, height: 78, representative: true, pulseShape: "circle" },
  { stage: 3, kind: "blue",   src: beadBlue,   top: 248, left: 152, width: 48, height: 46, representative: true, pulseShape: "circle" },
  // clear3 — decorative, sits between blue and lock on the string
  { stage: 4, kind: "clear",  src: beadClear,  top: 296, left: 178, width: 44, height: 42, decorative: true },
  { stage: 4, kind: "lock",   src: beadLock,   top: 334, left: 172, width: 64, height: 64, representative: true, pulseShape: "square" },
  // pink — decorative, between lock and key
  { stage: 5, kind: "pink",   src: beadPink,   top: 395, left: 188, width: 44, height: 42, decorative: true },
  { stage: 5, kind: "key",    src: beadKey,    top: 432, left: 188, width: 44, height: 82, representative: true, pulseShape: "pill" },
];

interface ChainArtProps {
  currentStage: number;
  animateInitial: boolean;
  onBeadClick?: (stage: number) => void;
}

export function ChainArt({ currentStage, animateInitial, onBeadClick }: ChainArtProps) {
  function beadClass(b: BeadDef): string {
    const dec = b.decorative ? " decorative" : "";
    if (b.stage === currentStage) {
      return `chain-bead visible${b.representative ? " current" : " past"}${dec}`;
    }
    if (b.stage < currentStage) return `chain-bead past visible${dec}`;
    if (b.stage === currentStage + 1) return `chain-bead next visible${dec}`;
    return `chain-bead visible locked${dec}`;
  }

  return (
    <div
      className="chain-art"
      aria-label="Insight chain progress"
      style={{
        // Expose the shape-specific outline SVGs to CSS via custom properties.
        ["--pulse-square" as string]: `url(${squareOutline})`,
        ["--pulse-pill" as string]: `url(${keyOutline})`,
      }}
    >
      <motion.img
        src={stringSvg}
        alt=""
        aria-hidden
        className="chain-string"
        initial={animateInitial ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {BEADS.map((b, i) => {
        const delay = animateInitial && currentStage === 0 ? 0.55 + i * 0.16 : 0;
        return (
          <motion.button
            key={i}
            type="button"
            className={beadClass(b)}
            data-pulse-shape={b.pulseShape ?? "circle"}
            style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
            initial={animateInitial ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            onClick={() => {
              if (b.decorative) return;
              if (b.stage > currentStage + 1) return;
              onBeadClick?.(b.stage);
            }}
            aria-label={`Stage ${b.stage + 1}`}
            disabled={b.decorative || b.stage > currentStage + 1}
            data-testid={`chain-bead-${b.stage}-${b.kind}`}
          >
            <img src={b.src} alt="" />
          </motion.button>
        );
      })}
    </div>
  );
}
