import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TOTAL_BEADS = 6;

interface AppFrameProps {
  children: ReactNode;
  /** 0 = landing (no bead lit), 1–6 = current structured step */
  currentBead?: number;
  className?: string;
}

export function AppFrame({ children, currentBead = 0, className }: AppFrameProps) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start pt-8 pb-10 px-6 bg-background">

      {/* Top bar: brand label right */}
      <div className="w-full max-w-3xl flex items-center justify-end mb-4">
        <span className="font-heading text-sm tracking-tight text-foreground/80 select-none">
          unravel
        </span>
      </div>

      {/* Bead progress bar
          Each slot is data-bead-index + data-bead-state for custom design hookup.
          Replace .bead-default inner element with a custom bead component per index. */}
      <div
        className="w-full max-w-3xl flex items-center justify-center gap-5 mb-5"
        role="progressbar"
        aria-valuenow={currentBead}
        aria-valuemax={TOTAL_BEADS}
      >
        {/* Decorative monogram — replace with brand mark / SVG later */}
        <span
          className="mr-3 text-foreground/20 select-none"
          style={{ fontFamily: "serif", fontSize: "1.6rem", lineHeight: 1 }}
          aria-hidden
        >
          𝒰
        </span>

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
                state === "current" ? " (current)" : state === "completed" ? " (done)" : ""
              }`}
            >
              {/* Default diamond — swap this element for a custom bead */}
              <div className="bead-default" />
            </div>
          );
        })}
      </div>

      {/* Main frame panel */}
      <div
        className={cn(
          "relative w-full max-w-3xl border border-primary flex flex-col",
          "min-h-[520px]",
          className,
        )}
      >
        {/*
          Corner dots — individually addressable for idle animation.
          Style each with [data-dot="…"] selector.
          Future: give each one a subtle pulse or float on a different timing.
        */}
        <span className="frame-dot" data-dot="top-left"     style={{ top: -4,  left:  -4 }} />
        <span className="frame-dot" data-dot="top-right"    style={{ top: -4,  right: -4 }} />
        <span className="frame-dot" data-dot="top-right-sub" style={{ top: 18, right: -4 }} />
        <span className="frame-dot" data-dot="bottom-left"  style={{ bottom: -4, left:  -4 }} />
        <span className="frame-dot" data-dot="bottom-right" style={{ bottom: -4, right: -4 }} />

        {/* Content */}
        <div className="flex-1 flex flex-col px-10 pt-10 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
