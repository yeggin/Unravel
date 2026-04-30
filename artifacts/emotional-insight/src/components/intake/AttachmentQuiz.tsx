import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ATTACHMENT_QUIZ, type AttachmentStyle } from "@/data/options";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface AttachmentQuizProps {
  onComplete: (style: AttachmentStyle) => void;
  onCancel: () => void;
}

export function AttachmentQuiz({ onComplete, onCancel }: AttachmentQuizProps) {
  const [answers, setAnswers] = useState<AttachmentStyle[]>([]);
  const idx = answers.length;
  const question = ATTACHMENT_QUIZ[idx];

  function pick(style: AttachmentStyle) {
    const next = [...answers, style];
    if (next.length === ATTACHMENT_QUIZ.length) {
      // Tally most-selected style
      const counts = next.reduce<Record<string, number>>((acc, s) => {
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {});
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as AttachmentStyle;
      onComplete(winner);
    } else {
      setAnswers(next);
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
          {idx + 1} / {ATTACHMENT_QUIZ.length}
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
                onClick={() => pick(opt.style)}
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
