import { motion, AnimatePresence } from "framer-motion";
import beadClear from "@assets/Group_17_1779916770855.svg";
import beadBlue from "@assets/Group_18_1779916770855.svg";
import beadPink from "@assets/Group_19_1779916770856.svg";
import beadLock from "@assets/Subtract_1779916770856.svg";
import beadCloverString from "@assets/clover+string_1780003143453.svg";
import chainString from "@assets/string+key_1780003143454.svg";
import squareOutline from "@assets/outline_1779919260546.svg";
import keyOutline from "@assets/Key_outline_1779919285967.svg";

/**
 * Chain — single 240×485 string SVG that already contains the curving line
 * and the final key shape integrated at the bottom right. We place beads on
 * top of it; the key "bead" is an invisible click target overlaying the
 * key drawn into the string SVG.
 *
 * Stage → representative bead:
 *   0 Emotion           → clear 1
 *   1 Why               → clear 2
 *   2 Take a breath     → clover (uses the "clover + string" asset so its
 *                          short connecting stem aligns with the main line)
 *   3 A different angle → blue
 *   4 What you can do   → square (lock)
 *   5 Take it with you  → key (invisible overlay on the integrated key)
 *
 * Decorative companions (clear 3, pink) animate in but are not clickable,
 * have no glow, and no pulse.
 */

type BeadKind = "clear" | "blue" | "pink" | "clover" | "lock" | "key";
type PulseShape = "circle" | "square" | "pill";

interface BeadDef {
  stage: number;
  kind: BeadKind;
  /** When undefined, the bead renders as an invisible click target (used for
   *  the integrated key shape that's already drawn into the string SVG). */
  src?: string;
  top: number;
  left: number;
  width: number;
  height: number;
  decorative?: boolean;
  representative?: boolean;
  pulseShape?: PulseShape;
}

const BEADS: BeadDef[] = [
  { stage: 0, kind: "clear",  src: beadClear,        top: 35,  left: 28,  width: 44, height: 42, representative: true, pulseShape: "circle" },
  { stage: 1, kind: "clear",  src: beadClear,        top: 104, left: 56,  width: 46, height: 44, representative: true, pulseShape: "circle" },
  { stage: 2, kind: "clover", src: beadCloverString, top: 120, left: 58,  width: 82, height: 83, representative: true, pulseShape: "circle" },
  { stage: 3, kind: "blue",   src: beadBlue,         top: 212, left: 134, width: 48, height: 46, representative: true, pulseShape: "circle" },
  // clear 3 — decorative, between blue and lock
  { stage: 4, kind: "clear",  src: beadClear,        top: 262, left: 154, width: 44, height: 42, decorative: true },
  { stage: 4, kind: "lock",   src: beadLock,         top: 288, left: 156, width: 64, height: 64, representative: true, pulseShape: "square" },
  // pink — decorative, between lock and key
  { stage: 5, kind: "pink",   src: beadPink,         top: 343, left: 176, width: 44, height: 42, decorative: true },
  // key — integrated into the string SVG. We render an invisible bead-sized
  //       button positioned over the drawn key so it stays clickable.
  { stage: 5, kind: "key",    /* no src */            top: 399, left: 172, width: 49, height: 86, representative: true, pulseShape: "pill" },
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
        ["--pulse-square" as string]: `url(${squareOutline})`,
        ["--pulse-pill" as string]: `url(${keyOutline})`,
      }}
    >
      {/* String + integrated key drawn first so all real beads sit on top.
          Always fades in on mount (the chain remounts around the breath step). */}
      <motion.img
        src={chainString}
        alt=""
        aria-hidden
        className="chain-string"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {BEADS.map((b, i) => {
        // Entrance reveal plays for ALL beads every time the chain mounts
        // (initial frame, and again when it remounts after the breath step).
        // Beads stagger in from the bottom of the chain upward so the eye
        // lands at the top where the current stage's content begins.
        const reverseIdx = BEADS.length - 1 - i;
        const delay = 0.45 + reverseIdx * 0.14;
        const isInvisibleTarget = !b.src;
        return (
          <motion.button
            key={i}
            type="button"
            className={beadClass(b) + (isInvisibleTarget ? " invisible-target" : "")}
            data-pulse-shape={b.pulseShape ?? "circle"}
            style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
            initial={{ opacity: 0, y: -8 }}
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
            {b.src && <img src={b.src} alt="" />}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Animated wrapper that fades the whole chain out together with the rest of
 * the previous stage when transitioning into the breath frame, then fades
 * back in afterwards. Keeps the transition seamless instead of having the
 * chain disappear instantly while cards are still leaving.
 */
export function ChainArtTransition(props: ChainArtProps & { show: boolean }) {
  const { show, ...rest } = props;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {show && (
        <motion.div
          key="chain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          style={{ flexShrink: 0, paddingTop: 12 }}
        >
          <ChainArt {...rest} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
