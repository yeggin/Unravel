import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Bookmark, Share2 } from "lucide-react";
import type { AnalyzeReflectionResponseType } from "@/lib/api";

interface InsightViewProps {
  result: AnalyzeReflectionResponseType;
  onReset: () => void;
  onBuildPlan: () => void;
  onSaveShare: () => void;
}

const sectionTransition: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export function InsightView({ result, onReset, onBuildPlan, onSaveShare }: InsightViewProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      {/* 1. Headline + emotion */}
      <motion.section
        custom={0}
        initial="hidden"
        animate="show"
        variants={sectionTransition}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: result.emotion_color }}
          />
          <span className="text-sm uppercase tracking-widest text-muted-foreground">
            {result.primary_emotion}
            {result.secondary_emotion ? ` · ${result.secondary_emotion}` : ""}
          </span>
          <span
            className="w-3 h-3 rounded-full opacity-60"
            style={{ backgroundColor: result.emotion_color }}
          />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground mb-4">
          {result.headline}
        </h1>
        <p className="text-base italic text-muted-foreground">
          "{result.emotion_metaphor}"
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
          <span>nervous system: {result.nervous_system_state}</span>
        </div>
      </motion.section>

      {/* 2. WHY */}
      <motion.section
        custom={1}
        initial="hidden"
        animate="show"
        variants={sectionTransition}
        className="mb-12"
      >
        <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-px bg-border" />
          Why this is happening
        </h2>
        <div className="grid gap-5">
          <WhyLayer label="Surface" body={result.why.surface} />
          <WhyLayer label="Deeper" body={result.why.deeper} />
          <WhyLayer label="Root" body={result.why.root} accent />
        </div>
      </motion.section>

      {/* 3. REFRAME */}
      <motion.section
        custom={2}
        initial="hidden"
        animate="show"
        variants={sectionTransition}
        className="mb-12"
      >
        <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-px bg-border" />
          A different angle
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-base leading-relaxed text-foreground">{result.reframe}</p>
        </div>
      </motion.section>

      {/* 4. NEXT STEPS */}
      <motion.section
        custom={3}
        initial="hidden"
        animate="show"
        variants={sectionTransition}
        className="mb-12"
      >
        <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-px bg-border" />
          What you can do
        </h2>
        <div className="grid gap-3">
          {result.next_steps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-foreground">{step.action}</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                  {step.timeframe}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {step.framework}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 5. AFFIRMATION + CTAs */}
      <motion.section
        custom={4}
        initial="hidden"
        animate="show"
        variants={sectionTransition}
        className="mb-8"
      >
        <div className="text-center mb-8">
          <Sparkles className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
          <p className="font-serif text-lg md:text-xl text-foreground italic">
            {result.affirmation}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onBuildPlan} className="gap-2">
            <Sparkles className="w-4 h-4" /> Build an action plan
          </Button>
          <Button variant="outline" onClick={onSaveShare} className="gap-2">
            <Bookmark className="w-4 h-4" /> Save
          </Button>
          <Button variant="outline" onClick={onSaveShare} className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Reflect again
          </Button>
        </div>

        {result.therapy_nudge && result.therapy_nudge_reason && (
          <div className="mt-8 text-xs text-center text-muted-foreground italic">
            {result.therapy_nudge_reason}
          </div>
        )}
        {result.attachment_inferred_note && (
          <div className="mt-3 text-xs text-center text-muted-foreground italic">
            {result.attachment_inferred_note}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function WhyLayer({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <p className="text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
