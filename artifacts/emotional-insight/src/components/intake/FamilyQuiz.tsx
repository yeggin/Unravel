import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAMILY_QUIZ, type FamilyPattern, type AttachmentStyle } from "@/data/options";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface FamilyQuizProps {
  onComplete: (result: { patterns: FamilyPattern[]; attachmentHint: AttachmentStyle | null }) => void;
  onCancel: () => void;
}

export function FamilyQuiz({ onComplete, onCancel }: FamilyQuizProps) {
  const [picks, setPicks] = useState<number[]>([]);
  const idx = picks.length;
  const question = FAMILY_QUIZ[idx];

  function pick(optionIdx: number) {
    const next = [...picks, optionIdx];
    if (next.length === FAMILY_QUIZ.length) {
      // Aggregate patterns and attachment hints
      const allPatterns = new Set<FamilyPattern>();
      const hintCounts: Record<string, number> = {};
      next.forEach((choice, qIdx) => {
        const opt = FAMILY_QUIZ[qIdx].options[choice];
        opt.patterns.forEach((p) => allPatterns.add(p));
        if (opt.attachmentHint) {
          hintCounts[opt.attachmentHint] = (hintCounts[opt.attachmentHint] ?? 0) + 1;
        }
      });
      const sortedHints = Object.entries(hintCounts).sort((a, b) => b[1] - a[1]);
      const attachmentHint = sortedHints.length > 0 ? (sortedHints[0][0] as AttachmentStyle) : null;
      onComplete({ patterns: Array.from(allPatterns), attachmentHint });
    } else {
      setPicks(next);
    }
  }

  if (!question) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1 text-muted-foreground">
          <ChevronLeft className="w-4 h-4" /> Back to quick select
        </Button>
        <span className="text-xs text-muted-foreground">
          {idx + 1} / {FAMILY_QUIZ.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-serif text-lg text-foreground mb-5">{question.prompt}</p>
          <div className="grid gap-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className="text-left px-4 py-3 rounded-lg border border-border bg-card hover-elevate active-elevate-2 text-sm text-foreground"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
