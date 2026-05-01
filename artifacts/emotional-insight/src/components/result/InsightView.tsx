import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Bookmark, Share2, ChevronRight, ChevronLeft } from "lucide-react";
import type { AnalyzeReflectionResponseType } from "@/lib/api";

interface InsightViewProps {
  result: AnalyzeReflectionResponseType;
  onReset: () => void;
  onBuildPlan: () => void;
  onSaveShare: () => void;
}

const STEPS = ["Emotion", "Why", "Reframe", "What to do", "Closing"] as const;
type Step = (typeof STEPS)[number];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

export function InsightView({ result, onReset, onBuildPlan, onSaveShare }: InsightViewProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  function go(idx: number) {
    setDirection(idx > stepIdx ? 1 : -1);
    setStepIdx(idx);
  }
  function next() { if (stepIdx < STEPS.length - 1) go(stepIdx + 1); }
  function back() { if (stepIdx > 0) go(stepIdx - 1); }

  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4 flex flex-col min-h-screen">

      {/* Chapter progress dots */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => go(i)}
            aria-label={label}
            className="group flex flex-col items-center gap-1"
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === stepIdx
                  ? "w-8 bg-primary"
                  : i < stepIdx
                  ? "w-4 bg-primary/40"
                  : "w-4 bg-border"
              }`}
            />
            <span
              className={`text-[9px] uppercase tracking-widest transition-colors ${
                i === stepIdx ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Step content — grows to fill */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={stepIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="w-full"
          >
            {stepIdx === 0 && <StepEmotion result={result} />}
            {stepIdx === 1 && <StepWhy result={result} />}
            {stepIdx === 2 && <StepReframe result={result} />}
            {stepIdx === 3 && <StepNextSteps result={result} />}
            {stepIdx === 4 && (
              <StepClosing
                result={result}
                onBuildPlan={onBuildPlan}
                onSaveShare={onSaveShare}
                onReset={onReset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={back}
          disabled={isFirst}
          className="gap-1 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {!isLast && (
          <Button onClick={next} className="gap-1">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {isLast && (
          <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Start over
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── STEP 1: Emotion ──────────────────────────────────────────────────────── */
function StepEmotion({ result }: { result: AnalyzeReflectionResponseType }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-6">
      {/* Emotion pulse */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-32 h-32 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: result.emotion_color }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${result.emotion_color}30`, border: `2px solid ${result.emotion_color}60` }}
        >
          <span
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: result.emotion_color }}
          />
        </div>
      </div>

      {/* Emotion name */}
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {result.nervous_system_state} · {result.nervous_system_state === "sympathetic"
            ? "fight or flight"
            : result.nervous_system_state === "dorsal"
            ? "shutdown / freeze"
            : "regulated"}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2 capitalize">
          {result.primary_emotion}
        </h1>
        {result.secondary_emotion && (
          <p className="text-base text-muted-foreground italic">
            with {result.secondary_emotion} underneath
          </p>
        )}
      </div>

      {/* Headline */}
      <div className="max-w-lg">
        <p className="font-serif text-xl md:text-2xl text-foreground leading-snug">
          {result.headline}
        </p>
      </div>

      {/* Metaphor */}
      <div className="max-w-md">
        <p className="text-sm text-muted-foreground italic">
          "{result.emotion_metaphor}"
        </p>
      </div>
    </div>
  );
}

/* ─── STEP 2: Why ──────────────────────────────────────────────────────────── */
function StepWhy({ result }: { result: AnalyzeReflectionResponseType }) {
  const layers: {
    key: string;
    label: string;
    sublabel: string;
    framework: string;
    body: string;
    accent?: boolean;
  }[] = [
    {
      key: "surface",
      label: "Surface",
      sublabel: "Thought pattern",
      framework: "CBT",
      body: result.why.surface,
    },
    {
      key: "deeper",
      label: "Deeper",
      sublabel: "Parts at play",
      framework: "IFS + Attachment",
      body: result.why.deeper,
    },
    {
      key: "root",
      label: "Root",
      sublabel: "The unmet need",
      framework: "NVC",
      body: result.why.root,
      accent: true,
    },
  ];

  return (
    <div className="py-4">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Step 2 of 5
        </div>
        <h2 className="font-serif text-3xl text-foreground">Why this is happening</h2>
      </div>

      <div className="grid gap-4">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className={`rounded-xl border p-5 ${
              layer.accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-foreground text-sm">{layer.label}</div>
                <div className="text-xs text-muted-foreground">{layer.sublabel}</div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                {layer.framework}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{layer.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── STEP 3: Reframe ──────────────────────────────────────────────────────── */
function StepReframe({ result }: { result: AnalyzeReflectionResponseType }) {
  return (
    <div className="py-4">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Step 3 of 5
        </div>
        <h2 className="font-serif text-3xl text-foreground">A different angle</h2>
        <p className="text-sm text-muted-foreground mt-1 italic">
          From the calm part of you, looking at the activated part with compassion.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-border bg-card p-7"
      >
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
          IFS Self-energy
        </div>
        <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
          {result.reframe}
        </p>
      </motion.div>

      {result.attachment_inferred_note && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-5 text-xs text-muted-foreground italic text-center"
        >
          {result.attachment_inferred_note}
        </motion.p>
      )}
    </div>
  );
}

/* ─── STEP 4: Next steps ───────────────────────────────────────────────────── */
function StepNextSteps({ result }: { result: AnalyzeReflectionResponseType }) {
  const timeframeOrder: Record<string, number> = {
    "right now": 0,
    today: 1,
    "this week": 2,
  };

  const sorted = [...result.next_steps].sort(
    (a, b) => (timeframeOrder[a.timeframe] ?? 3) - (timeframeOrder[b.timeframe] ?? 3),
  );

  return (
    <div className="py-4">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Step 4 of 5
        </div>
        <h2 className="font-serif text-3xl text-foreground">What you can do</h2>
        <p className="text-sm text-muted-foreground mt-1 italic">
          Ordered by urgency — nervous system first, insight second.
        </p>
      </div>

      <div className="grid gap-3">
        {sorted.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-medium text-foreground leading-tight">{step.action}</h3>
              <span
                className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                  step.timeframe === "right now"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.timeframe}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground/70">
              {step.framework}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── STEP 5: Closing ──────────────────────────────────────────────────────── */
function StepClosing({
  result,
  onBuildPlan,
  onSaveShare,
  onReset,
}: {
  result: AnalyzeReflectionResponseType;
  onBuildPlan: () => void;
  onSaveShare: () => void;
  onReset: () => void;
}) {
  return (
    <div className="py-4">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Step 5 of 5
        </div>
        <h2 className="font-serif text-3xl text-foreground">Take it with you</h2>
      </div>

      {/* Affirmation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 px-4"
      >
        <Sparkles className="w-5 h-5 text-muted-foreground mx-auto mb-4" />
        <p className="font-serif text-xl md:text-2xl text-foreground leading-snug italic">
          {result.affirmation}
        </p>
      </motion.div>

      {/* CTA cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid gap-3 mb-6"
      >
        <button
          onClick={onBuildPlan}
          className="w-full text-left rounded-xl border border-primary/30 bg-primary/5 hover-elevate active-elevate-2 p-5 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <div>
              <div className="font-medium text-foreground">Build an action plan</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Turn these next steps into a daily check-in you can actually follow.
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSaveShare}
            className="text-left rounded-xl border border-border bg-card hover-elevate active-elevate-2 p-4 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <div className="font-medium text-sm text-foreground">Save</div>
            </div>
            <div className="text-xs text-muted-foreground">Keep this insight for later.</div>
          </button>
          <button
            onClick={onSaveShare}
            className="text-left rounded-xl border border-border bg-card hover-elevate active-elevate-2 p-4 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <div className="font-medium text-sm text-foreground">Share</div>
            </div>
            <div className="text-xs text-muted-foreground">Send it to someone you trust.</div>
          </button>
        </div>
      </motion.div>

      {/* Therapy nudge */}
      {result.therapy_nudge && result.therapy_nudge_reason && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground italic text-center px-4"
        >
          {result.therapy_nudge_reason}
        </motion.p>
      )}
    </div>
  );
}
