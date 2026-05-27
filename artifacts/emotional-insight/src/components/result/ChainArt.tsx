import { motion } from "framer-motion";
import beadClear from "@assets/Group_17_1779916770855.svg";
import beadBlue from "@assets/Group_18_1779916770855.svg";
import beadPink from "@assets/Group_19_1779916770856.svg";
import beadClover from "@assets/Frame_28_1779916770846.svg";
import beadLock from "@assets/Subtract_1779916770856.svg";
import beadKey from "@assets/Union_1779916770856.svg";
import stringSvg from "@assets/Group_20_1779916770856.svg";

/**
 * The chain holds 5 logical stages matching the 5 output screens:
 *   0 Emotion          → top clear bead
 *   1 Why              → second clear bead
 *   2 Shift            → clover + blue cluster
 *   3 What you can do  → lock
 *   4 Take it with you → key (with pink bead next to it)
 *
 * Each bead is absolutely positioned in a 300×540 box, hand-tuned to align
 * with the curve of the string SVG and the reference CHAIN.png.
 */

type BeadKind = "clear" | "blue" | "pink" | "clover" | "lock" | "key";

interface BeadDef {
  stage: number;
  kind: BeadKind;
  src: string;
  /** Position in px within the 300×540 chain box (top-left of bead element) */
  top: number;
  left: number;
  width: number;
  height: number;
  /** A decorative bead that animates in with its stage but isn't clickable */
  decorative?: boolean;
  /** Exactly one bead per stage is the "representative" — it gets the current-stage pulse ring. */
  representative?: boolean;
}

const BEADS: BeadDef[] = [
  { stage: 0, kind: "clear", src: beadClear, top: 130, left: 78, width: 46, height: 44, representative: true },
  { stage: 1, kind: "clear", src: beadClear, top: 178, left: 102, width: 46, height: 44, representative: true },
  { stage: 2, kind: "clover", src: beadClover, top: 210, left: 100, width: 86, height: 86, decorative: true },
  { stage: 2, kind: "blue", src: beadBlue, top: 238, left: 156, width: 50, height: 48, representative: true },
  { stage: 3, kind: "clear", src: beadClear, top: 290, left: 158, width: 46, height: 44, decorative: true },
  { stage: 3, kind: "lock", src: beadLock, top: 320, left: 142, width: 66, height: 66, representative: true },
  { stage: 4, kind: "pink", src: beadPink, top: 378, left: 152, width: 46, height: 44, decorative: true },
  { stage: 4, kind: "key", src: beadKey, top: 414, left: 158, width: 46, height: 84, representative: true },
];

interface ChainArtProps {
  currentStage: number;
  /** Stage 0 = Emotion uses a sequential reveal animation (string+key, then beads cascading down). */
  animateInitial: boolean;
  onBeadClick?: (stage: number) => void;
}

export function ChainArt({ currentStage, animateInitial, onBeadClick }: ChainArtProps) {
  function beadClass(b: BeadDef): string {
    // Only the representative bead for the current stage gets the pulse ring —
    // companion/decorative beads at the same stage glow but don't pulse.
    if (b.stage === currentStage) {
      return b.representative ? "chain-bead current visible" : "chain-bead past visible";
    }
    if (b.stage < currentStage) return "chain-bead past visible";
    if (b.stage === currentStage + 1) return "chain-bead next visible";
    return "chain-bead visible locked";
  }

  return (
    <div className="chain-art" aria-label="Insight chain progress">
      {/* String — fades in first */}
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
        const visibleNow = b.stage <= currentStage || !animateInitial;
        // During initial Emotion reveal, beads cascade downward after the string.
        const delay = animateInitial && currentStage === 0
          ? 0.6 + i * 0.18
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
            animate={{ opacity: visibleNow ? 1 : 0.35, y: 0 }}
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
