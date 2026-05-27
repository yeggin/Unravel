import { motion } from "framer-motion";
import beadClear from "@assets/Group_17_1779916770855.svg";
import beadBlue from "@assets/Group_18_1779916770855.svg";
import beadPink from "@assets/Group_19_1779916770856.svg";
import beadClover from "@assets/Frame_28_1779916770846.svg";
import beadLock from "@assets/Subtract_1779916770856.svg";
import beadKey from "@assets/Union_1779916770856.svg";
import stringSvg from "@assets/Group_20_1779916770856.svg";

/**
 * 6 logical stages, mapped to chain beads (top → bottom).
 * Per user feedback: selectable = first four round beads, then the square
 * (lock), then the key. Clover and pink ball are decorative companions.
 *
 *   0 Emotion          → clear bead 1
 *   1 Why              → clear bead 2
 *   2 Take a breath    → blue bead (clover companion)
 *   3 A different angle→ clear bead 3
 *   4 What you can do  → square (lock)
 *   5 Take it with you → key (pink-ball companion)
 *
 * Positions are tuned against the latest CHAIN reference image so the chain
 * curves down and to the right, with all beads strung along the visible path.
 */

type BeadKind = "clear" | "blue" | "pink" | "clover" | "lock" | "key";

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
  /** Exactly one bead per stage is the "representative" — gets the pulse glow. */
  representative?: boolean;
}

const BEADS: BeadDef[] = [
  // First four round beads
  { stage: 0, kind: "clear", src: beadClear, top: 132, left: 78,  width: 44, height: 42, representative: true },
  { stage: 1, kind: "clear", src: beadClear, top: 188, left: 100, width: 46, height: 44, representative: true },
  { stage: 2, kind: "clover", src: beadClover, top: 222, left: 108, width: 78, height: 78, decorative: true },
  { stage: 2, kind: "blue",  src: beadBlue,  top: 250, left: 158, width: 48, height: 46, representative: true },
  { stage: 3, kind: "clear", src: beadClear, top: 308, left: 178, width: 44, height: 42, representative: true },
  // Square (lock)
  { stage: 4, kind: "lock",  src: beadLock,  top: 348, left: 170, width: 64, height: 64, representative: true },
  // Pink decorative + key
  { stage: 5, kind: "pink",  src: beadPink,  top: 414, left: 184, width: 44, height: 42, decorative: true },
  { stage: 5, kind: "key",   src: beadKey,   top: 448, left: 186, width: 44, height: 82, representative: true },
];

interface ChainArtProps {
  currentStage: number;
  /** Stage 0 = Emotion uses a sequential reveal animation (string first, then beads cascade). */
  animateInitial: boolean;
  onBeadClick?: (stage: number) => void;
}

export function ChainArt({ currentStage, animateInitial, onBeadClick }: ChainArtProps) {
  function beadClass(b: BeadDef): string {
    if (b.stage === currentStage) {
      return b.representative ? "chain-bead current visible" : "chain-bead past visible";
    }
    if (b.stage < currentStage) return "chain-bead past visible";
    if (b.stage === currentStage + 1) return "chain-bead next visible";
    return "chain-bead visible locked";
  }

  return (
    <div className="chain-art" aria-label="Insight chain progress">
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
        const delay = animateInitial && currentStage === 0
          ? 0.55 + i * 0.16
          : 0;
        return (
          <motion.button
            key={i}
            type="button"
            className={beadClass(b)}
            style={{
              top: b.top,
              left: b.left,
              width: b.width,
              height: b.height,
            }}
            initial={animateInitial ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            onClick={() => {
              if (b.decorative) return;
              if (b.stage > currentStage + 1) return; // only next + past clickable
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
