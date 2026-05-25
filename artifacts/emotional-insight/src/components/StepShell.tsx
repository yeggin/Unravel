import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/AppFrame";

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  /** Show next button as primary blue fill (e.g. final step) */
  nextPrimary?: boolean;
}

export function StepShell({
  step,
  totalSteps: _totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  nextDisabled,
  nextPrimary,
}: StepShellProps) {
  return (
    <AppFrame currentBead={step}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col flex-1 h-full"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="font-heading text-xl md:text-2xl text-foreground leading-snug mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content — grows to fill */}
          <div className="flex-1">{children}</div>

          {/* Nav row */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              className="nav-btn-text"
              onClick={onBack}
              disabled={!onBack}
            >
              &lt; back
            </button>

            <div className="flex items-center gap-6">
              {onSkip && (
                <button type="button" className="nav-btn-text" onClick={onSkip}>
                  skip
                </button>
              )}
              <button
                type="button"
                className={`nav-btn-continue${nextPrimary ? " primary-fill" : ""}`}
                onClick={onNext}
                disabled={nextDisabled}
              >
                {nextLabel ?? "Continue"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </AppFrame>
  );
}
