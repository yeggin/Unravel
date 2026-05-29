import { useEffect, useState } from "react";
import frameA from "@assets/Frame_35_1780016696792.svg";
import frameB from "@assets/Frame_37_1780016696794.svg";

const FRAMES = [frameA, frameB];
const FRAME_MS = 620;

/**
 * Breathing animation — gently loops between two knot frames, alternating
 * back and forth for a slow, calming in/out cadence.
 */
export function BreathBloom() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, FRAME_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="breath-bloom" aria-hidden data-testid="breath-bloom">
      <img src={FRAMES[frame]} alt="" />
    </div>
  );
}
