import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  whyWeAsk?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLast?: boolean;
}

export function StepShell({
  step,
  totalSteps,
  title,
  whyWeAsk,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  nextDisabled,
  isLast,
}: StepShellProps) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">{title}</h2>
      {whyWeAsk && (
        <p className="text-sm text-muted-foreground mb-8 italic">{whyWeAsk}</p>
      )}

      <div className="mb-10">{children}</div>

      <div className="flex items-center justify-between gap-3">
        <div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Skip
            </Button>
          )}
          <Button onClick={onNext} disabled={nextDisabled} className="gap-1">
            {nextLabel ?? (isLast ? "Get insight" : "Continue")}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
