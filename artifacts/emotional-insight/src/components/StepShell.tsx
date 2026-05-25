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
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "var(--app-font-heading)",
                fontSize: "1.25rem",
                color: "#1d2e48",
                lineHeight: 1.35,
                marginBottom: 8,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#a8b3c1",
                  maxWidth: 480,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>{children}</div>

          {/* Nav */}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              type="button"
              className="nav-btn-text"
              onClick={onBack}
              disabled={!onBack}
            >
              &lt; back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
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
