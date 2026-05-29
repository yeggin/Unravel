import { useEffect, useRef, useState } from "react";
import f38 from "@assets/Property_1=Frame_38_1780022440210.svg";
import f39 from "@assets/Property_1=Frame_39_1780022440213.svg";
import f40 from "@assets/Property_1=Frame_40_1780022440214.svg";
import f41 from "@assets/Property_1=Frame_41_1780022440214.svg";
import f42 from "@assets/Property_1=Frame_42_1780022440214.svg";
import f43 from "@assets/Property_1=Frame_43_1780022440214.svg";
import f44 from "@assets/Property_1=Frame_44_1780022440215.svg";

/** Ordered frames — the knot progressively unravels into a straight line. */
const FRAMES = [f38, f39, f40, f41, f42, f43, f44];
const FRAME_MS = 150;

/**
 * A clickable knot that unravels when tapped. At rest it shows the tied knot
 * with a "click to unravel your thoughts" prompt; clicking plays the frame
 * sequence once (knot → straight line), then calls `onComplete`.
 */
export function UnravelKnot({ onComplete }: { onComplete: () => void }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const doneRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
      if (doneRef.current != null) window.clearTimeout(doneRef.current);
    },
    [],
  );

  function play() {
    if (intervalRef.current != null || doneRef.current != null) return;
    setPlaying(true);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i >= FRAMES.length) {
        if (intervalRef.current != null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        // Hold on the straightened line a beat, then advance to the result.
        doneRef.current = window.setTimeout(onComplete, 650);
        return;
      }
      setFrame(i);
    }, FRAME_MS);
  }

  return (
    <div className="unravel-stage">
      <button
        type="button"
        className="unravel-knot"
        onClick={play}
        disabled={playing}
        aria-label="Unravel your thoughts"
        data-testid="button-unravel"
      >
        <img src={FRAMES[frame]} alt="" aria-hidden />
      </button>
      <p className="unravel-hint" aria-live="polite">
        {playing ? "unraveling…" : "click to unravel your thoughts"}
      </p>
    </div>
  );
}
