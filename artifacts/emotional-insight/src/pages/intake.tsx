import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  useAnalyzeReflection,
  type AnalyzeRequestType,
  type AnalyzeReflectionResponseType,
} from "@/lib/api";
import {
  RELATIONSHIP_OPTIONS,
  BODY_SENSATION_OPTIONS,
  ATTACHMENT_OPTIONS,
  FAMILY_PATTERN_OPTIONS,
  WHY_WE_ASK,
  type RelationshipContext,
  type BodySensation,
  type AttachmentStyle,
  type AttachmentSource,
  type FamilyPattern,
} from "@/data/options";

import { Slider } from "@/components/ui/slider";
import { AppFrame } from "@/components/AppFrame";
import { DiamondList } from "@/components/intake/ChipSelect";
import { AttachmentQuiz } from "@/components/intake/AttachmentQuiz";
import { FamilyQuiz } from "@/components/intake/FamilyQuiz";
import { InsightView } from "@/components/result/InsightView";

const INTENSITY_LABELS = ["barely there", "a hum", "noticeable", "loud", "overwhelming"];

interface IntakeState {
  reflection: string;
  relationship_context: RelationshipContext | null;
  intensity: number | null;
  body_sensations: BodySensation[];
  attachment_style: AttachmentStyle | null;
  attachment_source: AttachmentSource | null;
  family_patterns: FamilyPattern[];
  mbti: string | null;
}

const initial: IntakeState = {
  reflection: "",
  relationship_context: null,
  intensity: null,
  body_sensations: [],
  attachment_style: null,
  attachment_source: null,
  family_patterns: [],
  mbti: null,
};

type Phase = "landing" | "structured" | "loading" | "result";
const TOTAL_STEPS = 6;

export function IntakePage() {
  const { toast } = useToast();
  const [state, setState] = useState<IntakeState>(initial);
  const [phase, setPhase] = useState<Phase>("landing");
  const [step, setStep] = useState(1);
  const [showStructured, setShowStructured] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<"select" | "quiz">("select");
  const [familyMode, setFamilyMode] = useState<"select" | "quiz">("select");
  const [result, setResult] = useState<AnalyzeReflectionResponseType | null>(null);

  const analyzeMutation = useAnalyzeReflection({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        setPhase("result");
      },
      onError: () => {
        toast({
          title: "Couldn't get your insight",
          description: "Something went wrong. Try again in a moment.",
          variant: "destructive",
        });
        setPhase(showStructured ? "structured" : "landing");
      },
    },
  });

  function update<K extends keyof IntakeState>(key: K, value: IntakeState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function buildPayload(): AnalyzeRequestType {
    const source: AttachmentSource | null = state.attachment_style
      ? (state.attachment_source ?? "self-reported")
      : null;
    return {
      reflection: state.reflection.trim(),
      intensity: state.intensity ?? null,
      relationship_context: state.relationship_context ?? null,
      body_sensations: state.body_sensations.length ? state.body_sensations : null,
      attachment_style: state.attachment_style ?? null,
      attachment_source: source,
      family_patterns: state.family_patterns.length ? state.family_patterns : null,
      mbti: state.mbti?.trim().toUpperCase() || null,
    };
  }

  function submit() {
    if (state.reflection.trim().length < 1) {
      toast({ title: "Write a few words first", description: "Even a sentence is enough." });
      return;
    }
    setPhase("loading");
    analyzeMutation.mutate({ data: buildPayload() });
  }

  function reset() {
    setState(initial);
    setShowStructured(false);
    setStep(1);
    setAttachmentMode("select");
    setFamilyMode("select");
    setResult(null);
    setPhase("landing");
  }

  function nextStep() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else submit();
  }
  function prevStep() {
    if (step > 1) setStep(step - 1);
    else setPhase("landing");
  }

  /* ── LOADING ──────────────────────────────────────────────────────────── */
  if (phase === "loading") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-3xl flex justify-end mb-4">
          <span className="font-heading text-sm text-foreground/80">unravel</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="font-heading text-lg text-foreground mb-2">
            Sitting with what you wrote
          </p>
          <p className="text-sm text-muted-foreground">A moment to find what's underneath…</p>
        </motion.div>
      </div>
    );
  }

  /* ── RESULT ───────────────────────────────────────────────────────────── */
  if (phase === "result" && result) {
    return (
      <InsightView
        result={result}
        onReset={reset}
        onBuildPlan={() =>
          toast({
            title: "Action plan coming soon",
            description: "We'll turn these next steps into a daily check-in.",
          })
        }
        onSaveShare={() =>
          toast({ title: "Save & share", description: "Coming soon with accounts." })
        }
      />
    );
  }

  /* ── LANDING (Path A) ─────────────────────────────────────────────────── */
  if (phase === "landing") {
    return (
      <AppFrame currentBead={0}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col flex-1 h-full"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-xl md:text-2xl text-foreground leading-snug">
              Tell us what you're feeling.
              <br />
              We'll help unravel what's underneath.
            </h1>
          </div>

          {/* Reflection textarea */}
          <textarea
            value={state.reflection}
            onChange={(e) => update("reflection", e.target.value)}
            placeholder="Write whatever you're feeling, what happened, why it's hitting you, what's going on underneath. Don't filter it."
            className="reflection-textarea w-full min-h-[180px] resize-y p-4 text-sm leading-relaxed bg-white border rounded-md focus:outline-none placeholder:text-muted-foreground/60"
            style={{ fontFamily: "var(--app-font-body)" }}
            data-testid="input-reflection"
          />

          {/* "+ add more context" toggle */}
          <div className="mt-5 mb-8">
            <button
              type="button"
              onClick={() => setShowStructured((v) => !v)}
              className="flex items-center gap-2 text-sm nav-btn-text"
              style={{ color: showStructured ? "hsl(var(--primary))" : undefined, opacity: 1 }}
              data-testid="toggle-structured"
            >
              <span
                className="inline-flex items-center justify-center w-4 h-4 border rounded-sm text-xs transition-colors"
                style={{
                  borderColor: showStructured ? "hsl(var(--primary))" : "hsl(var(--border))",
                  color: showStructured ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
              >
                {showStructured ? "−" : "+"}
              </span>
              Want to add more context for a deeper analysis?
            </button>
          </div>

          {/* Spacer + submit row */}
          <div className="flex-1" />
          <div className="flex justify-end">
            {showStructured ? (
              <button
                type="button"
                className="nav-btn-continue"
                onClick={() => {
                  if (!state.reflection.trim()) {
                    toast({ title: "Write a few words first", description: "Even a sentence is enough." });
                    return;
                  }
                  setStep(1);
                  setPhase("structured");
                }}
                data-testid="button-continue-structured"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="nav-btn-continue primary-fill"
                onClick={submit}
                disabled={analyzeMutation.isPending}
                data-testid="button-submit-quick"
              >
                Unravel
              </button>
            )}
          </div>
        </motion.div>
      </AppFrame>
    );
  }

  /* ── STRUCTURED FLOW (Path B) ─────────────────────────────────────────── */
  const stepContent: Record<number, React.ReactNode> = {
    1: (
      /* Step 1: Who is this about? — diamond list, 2 col */
      <StepWrapper
        step={1}
        title="Who is this about?"
        subtitle={WHY_WE_ASK.relationship}
        onBack={prevStep}
        onNext={nextStep}
        onSkip={nextStep}
        nextDisabled={!state.relationship_context}
      >
        <div className="flex justify-center mt-2">
          <DiamondList
            options={RELATIONSHIP_OPTIONS}
            value={state.relationship_context}
            onChange={(v) => update("relationship_context", v)}
            columns={2}
          />
        </div>
      </StepWrapper>
    ),

    2: (
      /* Step 2: Intensity — large number + minimal slider */
      <StepWrapper
        step={2}
        title="How loud is the feeling right now?"
        subtitle={WHY_WE_ASK.intensity}
        onBack={prevStep}
        onNext={nextStep}
        onSkip={nextStep}
        nextDisabled={state.intensity === null}
      >
        <div className="flex flex-col items-center gap-8 mt-4">
          {/* Big number display */}
          <div className="text-center">
            <div
              className="font-heading text-6xl leading-none mb-2"
              style={{ color: state.intensity ? "hsl(var(--primary))" : "hsl(var(--border))" }}
            >
              {state.intensity ?? "—"}
            </div>
            <div
              className="text-sm"
              style={{ color: "hsl(var(--primary))", minHeight: "1.25rem" }}
            >
              {state.intensity ? INTENSITY_LABELS[state.intensity - 1] : ""}
            </div>
          </div>

          {/* Slider */}
          <div className="w-full max-w-sm">
            <Slider
              min={1}
              max={5}
              step={1}
              value={[state.intensity ?? 3]}
              onValueChange={(v) => update("intensity", v[0])}
              className="intensity-slider"
              data-testid="slider-intensity"
            />
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>mild</span>
              <span>overwhelming</span>
            </div>
          </div>
        </div>
      </StepWrapper>
    ),

    3: (
      /* Step 3: Body sensations — diamond list, 2 col */
      <StepWrapper
        step={3}
        title="Where do you feel it in your body?"
        subtitle={WHY_WE_ASK.body}
        onBack={prevStep}
        onNext={nextStep}
        onSkip={nextStep}
      >
        <div className="flex justify-center mt-2">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-md">
            {BODY_SENSATION_OPTIONS.map((s) => {
              const selected = state.body_sensations.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? state.body_sensations.filter((x) => x !== s)
                      : [...state.body_sensations, s];
                    update("body_sensations", next);
                  }}
                  className="flex items-center gap-3 text-left group"
                  data-testid={`chip-body-${s}`}
                >
                  <span
                    className="diamond-icon shrink-0"
                    style={{
                      color: selected ? "hsl(var(--primary))" : "hsl(var(--border))",
                      ...(selected
                        ? {
                            background: "hsl(var(--primary))",
                            borderColor: "hsl(var(--primary))",
                          }
                        : {}),
                    }}
                  />
                  <span
                    className="text-sm leading-tight transition-colors"
                    style={{
                      color: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                    }}
                  >
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </StepWrapper>
    ),

    4: (
      /* Step 4: Attachment — 2×2 card grid OR quiz */
      attachmentMode === "select" ? (
        <StepWrapper
          step={4}
          title="How does closeness usually feel for you?"
          subtitle={WHY_WE_ASK.attachment}
          onBack={prevStep}
          onNext={nextStep}
          onSkip={nextStep}
        >
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {ATTACHMENT_OPTIONS.map((opt) => {
                const selected = state.attachment_style === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      update("attachment_style", opt.value);
                      update("attachment_source", "self-reported");
                    }}
                    className={`attachment-card${selected ? " selected" : ""}`}
                  >
                    <div className="text-sm font-medium text-foreground mb-1">{opt.label}</div>
                    <div className="text-xs text-muted-foreground leading-snug">
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-5">
              <button
                type="button"
                className="nav-btn-text text-sm"
                style={{ color: "hsl(var(--primary))", opacity: 1 }}
                onClick={() => setAttachmentMode("quiz")}
              >
                Not sure → Help me figure this out.
              </button>
            </div>
          </div>
        </StepWrapper>
      ) : (
        /* Attachment quiz — quiz handles its own full-frame layout */
        <AppFrame currentBead={4}>
          <AttachmentQuiz
            questionTitle="How does closeness usually feel for you?"
            questionSubtitle={WHY_WE_ASK.attachment}
            onComplete={(style) => {
              update("attachment_style", style);
              update("attachment_source", "quiz-inferred");
              setAttachmentMode("select");
            }}
            onCancel={() => setAttachmentMode("select")}
          />
          <div className="mt-8 flex items-center justify-between">
            <button type="button" className="nav-btn-text" onClick={prevStep}>
              &lt; back
            </button>
            <button type="button" className="nav-btn-text" onClick={nextStep}>
              skip
            </button>
          </div>
        </AppFrame>
      )
    ),

    5: (
      /* Step 5: Family patterns — full-width list OR quiz */
      familyMode === "select" ? (
        <StepWrapper
          step={5}
          title="Anything quietly familiar from how you grew up?"
          subtitle={WHY_WE_ASK.family}
          onBack={prevStep}
          onNext={nextStep}
          onSkip={nextStep}
        >
          <div className="mt-2 grid gap-2 max-w-lg mx-auto">
            {FAMILY_PATTERN_OPTIONS.map((p) => {
              const selected = state.family_patterns.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? state.family_patterns.filter((x) => x !== p)
                      : [...state.family_patterns, p];
                    update("family_patterns", next);
                  }}
                  className={`answer-row${selected ? " selected" : ""}`}
                  data-testid={`chip-family-${p}`}
                >
                  {p}
                </button>
              );
            })}
            <div className="text-center mt-2">
              <button
                type="button"
                className="nav-btn-text text-sm"
                style={{ color: "hsl(var(--primary))", opacity: 1 }}
                onClick={() => setFamilyMode("quiz")}
              >
                Not sure → Help me figure this out.
              </button>
            </div>
          </div>
        </StepWrapper>
      ) : (
        <AppFrame currentBead={5}>
          <FamilyQuiz
            questionTitle="Anything quietly familiar from how you grew up?"
            questionSubtitle={WHY_WE_ASK.family}
            onComplete={({ patterns, attachmentHint }) => {
              update("family_patterns", patterns);
              if (!state.attachment_style && attachmentHint) {
                update("attachment_style", attachmentHint);
                update("attachment_source", "quiz-inferred");
              }
              setFamilyMode("select");
            }}
            onCancel={() => setFamilyMode("select")}
          />
          <div className="mt-8 flex items-center justify-between">
            <button type="button" className="nav-btn-text" onClick={prevStep}>
              &lt; back
            </button>
            <button type="button" className="nav-btn-text" onClick={nextStep}>
              skip
            </button>
          </div>
        </AppFrame>
      )
    ),

    6: (
      /* Step 6: MBTI — simple small input */
      <StepWrapper
        step={6}
        title="MBTI? (optional)"
        subtitle={WHY_WE_ASK.mbti}
        onBack={prevStep}
        onNext={submit}
        onSkip={submit}
        nextLabel="Unravel"
        nextPrimary
      >
        <div className="flex justify-start mt-4 max-w-lg mx-auto">
          <input
            type="text"
            value={state.mbti ?? ""}
            onChange={(e) => update("mbti", e.target.value)}
            placeholder="e.g. INFJ"
            maxLength={4}
            className="uppercase text-sm tracking-widest border border-border rounded px-4 py-2 w-40 focus:outline-none focus:border-primary bg-white"
            style={{ fontFamily: "var(--app-font-body)" }}
            data-testid="input-mbti"
          />
        </div>
      </StepWrapper>
    ),
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${step}-${attachmentMode}-${familyMode}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="w-full"
      >
        {stepContent[step]}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Shared step wrapper (uses StepShell layout inline for simplicity) ─────── */
interface StepWrapperProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextPrimary?: boolean;
}

function StepWrapper({
  step,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  nextDisabled,
  nextPrimary,
}: StepWrapperProps) {
  return (
    <AppFrame currentBead={step}>
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-xl md:text-2xl text-foreground leading-snug mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* Nav */}
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
      </div>
    </AppFrame>
  );
}
