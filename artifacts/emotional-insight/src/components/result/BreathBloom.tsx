import { useEffect, useRef, useState } from "react";
import f34 from "@assets/Property_1=Frame_34_1780007170989.png";
import f35 from "@assets/Property_1=Frame_35_1780007170990.png";
import f36 from "@assets/Property_1=Frame_36_1780007170990.png";
import f37 from "@assets/Property_1=Frame_37_1780007170991.png";
import f38 from "@assets/Property_1=Frame_38_1780007170991.png";
import f39 from "@assets/Property_1=Frame_39_1780007170991.png";
import f40 from "@assets/Property_1=Frame_40_1780007170991.png";
import f41 from "@assets/Property_1=Frame_41_1780007170991.png";
import f42 from "@assets/Property_1=Frame_42_1780007170991.png";
import f43 from "@assets/Property_1=Frame_43_1780007170992.png";
import f44 from "@assets/Property_1=Frame_44_1780007170992.png";
import f45 from "@assets/Property_1=Frame_45_1780007170992.png";
import f46 from "@assets/Property_1=Frame_46_1780007170993.png";
import f47 from "@assets/Property_1=Frame_47_1780007170993.png";

/** Ordered bloom-and-dissolve frames from the Figma design. */
const FRAMES = [f34, f35, f36, f37, f38, f39, f40, f41, f42, f43, f44, f45, f46, f47];
const FRAME_MS = 85;

/**
 * Click-to-play breathing animation. Shows the full quatrefoil (first frame)
 * at rest; tapping plays the frame sequence once — the clover opens, blooms
 * apart and dissolves — then resets so it can be played again.
 */
export function BreathBloom() {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);

  function clearTimers() {
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    if (resetRef.current != null) window.clearTimeout(resetRef.current);
    intervalRef.current = null;
    resetRef.current = null;
  }

  useEffect(() => clearTimers, []);

  function play() {
    if (playing) return;
    clearTimers();
    setPlaying(true);
    setFrame(0);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i >= FRAMES.length) {
        clearTimers();
        // Hold on the empty final frame briefly, then restore the clover.
        resetRef.current = window.setTimeout(() => {
          setFrame(0);
          setPlaying(false);
        }, 700);
        return;
      }
      setFrame(i);
    }, FRAME_MS);
  }

  return (
    <button
      type="button"
      className="breath-bloom"
      onClick={play}
      aria-label="Play a breathing animation"
      data-testid="button-breath-bloom"
    >
      <img src={FRAMES[frame]} alt="" aria-hidden />
      {!playing && (
        <span className="breath-bloom-hint" aria-hidden>
          tap to breathe
        </span>
      )}
    </button>
  );
}
