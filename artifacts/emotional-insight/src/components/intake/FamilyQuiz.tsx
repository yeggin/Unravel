import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAMILY_QUIZ, type FamilyPattern, type AttachmentStyle } from "@/data/options";

interface FamilyQuizProps {
  onComplete: (result: { patterns: FamilyPattern[]; attachmentHint: AttachmentStyle | null }) => void;
  onCancel: () => void;
  questionTitle: string;
  questionSubtitle: string;
}

export function FamilyQuiz({ onComplete, onCancel, questionTitle, questionSubtitle }: FamilyQuizProps) {
  const [picks, setPicks] = useState<number[]>([]);
  const idx = picks.length;
  const question = FAMILY_QUIZ[idx];

  function pick(optionIdx: number) {
    const next = [...picks, optionIdx];
    if (next.length === FAMILY_QUIZ.length) {
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
    <div className="flex flex-col h-full">
      {/* Persistent question header */}
      <div className="mb-6 text-center">
        <h2 className="font-heading text-xl md:text-2xl text-foreground leading-snug mb-2">
          {questionTitle}
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {questionSubtitle}
        </p>
      </div>

      {/* Quiz sub-header */}
      <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
        <button type="button" onClick={onCancel} className="nav-btn-text" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {"\u2039"} Back to quick select
        </button>
        <span>{idx + 1}/{FAMILY_QUIZ.length}</span>
      </div>

      {/* Question + answers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-sm text-foreground mb-5 leading-relaxed max-w-xl">
            {question.prompt}
          </p>
          <div className="grid gap-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className="answer-row"
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
