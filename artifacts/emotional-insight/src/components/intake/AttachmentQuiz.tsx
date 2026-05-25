import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ATTACHMENT_QUIZ, type AttachmentStyle } from "@/data/options";

interface AttachmentQuizProps {
  onComplete: (style: AttachmentStyle) => void;
  onCancel: () => void;
  questionTitle: string;
  questionSubtitle: string;
}

export function AttachmentQuiz({ onComplete, onCancel, questionTitle, questionSubtitle }: AttachmentQuizProps) {
  const [answers, setAnswers] = useState<AttachmentStyle[]>([]);
  const idx = answers.length;
  const question = ATTACHMENT_QUIZ[idx];

  function pick(style: AttachmentStyle) {
    const next = [...answers, style];
    if (next.length === ATTACHMENT_QUIZ.length) {
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
        <span>{idx + 1}/{ATTACHMENT_QUIZ.length}</span>
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
                onClick={() => pick(opt.style)}
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
