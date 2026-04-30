import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAnalyzeReflection, type AnalyzeRequestType, type AnalyzeReflectionResponseType } from "@/lib/api";
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

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronRight, Sparkles } from "lucide-react";

import { StepShell } from "@/components/StepShell";
import { ChipSelect } from "@/components/intake/ChipSelect";
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

export function IntakePage() {
  const { toast } = useToast();
  const [state, setState] = useState<IntakeState>(initial);
  const [phase, setPhase] = useState<Phase>("landing");
  const [step, setStep] = useState(1); // structured step index
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
      onError: (err) => {
        console.error(err);
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
    // Treat empty strings/arrays as null per spec.
    const source: AttachmentSource | null = state.attachment_style
      ? state.attachment_source ?? "self-reported"
      : null;
    return {
      reflection: state.reflection.trim(),
      intensity: state.intensity ?? null,
      relationship_context: state.relationship_context ?? null,
      body_sensations: state.body_sensations.length ? state.body_sensations : null,
      attachment_style: state.attachment_style ?? null,
      attachment_source: source,
      family_patterns: state.family_patterns.length ? state.family_patterns : null,
      mbti: state.mbti && state.mbti.trim().length > 0 ? state.mbti.trim().toUpperCase() : null,
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

  // ---- LOADING ----
  if (phase === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Sparkles className="w-8 h-8 text-muted-foreground animate-pulse" />
        </motion.div>
        <p className="font-serif text-xl text-foreground mb-2">Sitting with what you wrote</p>
        <p className="text-sm text-muted-foreground italic">A moment to find what's underneath…</p>
      </div>
    );
  }

  // ---- RESULT ----
  if (phase === "result" && result) {
    return (
      <InsightView
        result={result}
        onReset={reset}
        onBuildPlan={() =>
          toast({ title: "Action plan coming soon", description: "We'll turn these next steps into a daily check-in." })
        }
        onSaveShare={() =>
          toast({ title: "Saved (locally)", description: "Hookup with accounts and sharing is wired-in next." })
        }
      />
    );
  }

  // ---- LANDING (Path A) ----
  if (phase === "landing") {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            What's going on inside?
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Write whatever you're feeling. We'll help you see what's underneath.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Textarea
            value={state.reflection}
            onChange={(e) => update("reflection", e.target.value)}
            placeholder={WHY_WE_ASK.reflection}
            className="min-h-[200px] text-base font-serif leading-relaxed bg-card resize-y"
            data-testid="input-reflection"
          />

          <div className="mt-6 flex items-center justify-between gap-4 px-1">
            <label className="flex items-center gap-3 cursor-pointer text-sm text-muted-foreground">
              <Switch
                checked={showStructured}
                onCheckedChange={setShowStructured}
                data-testid="toggle-structured"
              />
              <span>Want to add more context for a deeper analysis?</span>
            </label>
          </div>

          <div className="mt-8 flex justify-center">
            {showStructured ? (
              <Button
                size="lg"
                onClick={() => {
                  if (state.reflection.trim().length < 1) {
                    toast({ title: "Write a few words first", description: "Even a sentence is enough." });
                    return;
                  }
                  setStep(1);
                  setPhase("structured");
                }}
                className="gap-2"
                data-testid="button-continue-structured"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={submit}
                disabled={analyzeMutation.isPending}
                className="gap-2"
                data-testid="button-submit-quick"
              >
                <Sparkles className="w-4 h-4" /> Get insight
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- STRUCTURED FLOW (Path B) ----
  const TOTAL_STEPS = 6;

  function nextStep() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else submit();
  }
  function prevStep() {
    if (step > 1) setStep(step - 1);
    else setPhase("landing");
  }

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepShell
            step={1}
            totalSteps={TOTAL_STEPS}
            title="Who is this about?"
            whyWeAsk={WHY_WE_ASK.relationship}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
            nextDisabled={!state.relationship_context}
          >
            <ChipSelect
              options={RELATIONSHIP_OPTIONS}
              value={state.relationship_context}
              onChange={(v) => update("relationship_context", v)}
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            step={2}
            totalSteps={TOTAL_STEPS}
            title="How loud is the feeling right now?"
            whyWeAsk={WHY_WE_ASK.intensity}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
            nextDisabled={state.intensity === null}
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-serif text-foreground mb-2">
                  {state.intensity ?? "—"}
                </div>
                <div className="text-sm text-muted-foreground italic">
                  {state.intensity ? INTENSITY_LABELS[state.intensity - 1] : "Drag to set"}
                </div>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[state.intensity ?? 3]}
                onValueChange={(v) => update("intensity", v[0])}
                data-testid="slider-intensity"
              />
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                <span>mild</span>
                <span>overwhelming</span>
              </div>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            step={3}
            totalSteps={TOTAL_STEPS}
            title="Where do you feel it in your body?"
            whyWeAsk={WHY_WE_ASK.body}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all hover-elevate active-elevate-2 ${
                      selected ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                    data-testid={`chip-body-${s}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            step={4}
            totalSteps={TOTAL_STEPS}
            title="How does closeness usually feel for you?"
            whyWeAsk={WHY_WE_ASK.attachment}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            {attachmentMode === "select" ? (
              <div>
                <ChipSelect
                  options={ATTACHMENT_OPTIONS}
                  value={state.attachment_style}
                  onChange={(v) => {
                    update("attachment_style", v);
                    update("attachment_source", "self-reported");
                  }}
                />
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachmentMode("quiz")}
                    className="text-muted-foreground"
                  >
                    Not sure → Help me figure this out
                  </Button>
                </div>
              </div>
            ) : (
              <AttachmentQuiz
                onComplete={(style) => {
                  update("attachment_style", style);
                  update("attachment_source", "quiz-inferred");
                  setAttachmentMode("select");
                }}
                onCancel={() => setAttachmentMode("select")}
              />
            )}
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            step={5}
            totalSteps={TOTAL_STEPS}
            title="Anything quietly familiar from how you grew up?"
            whyWeAsk={WHY_WE_ASK.family}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            {familyMode === "select" ? (
              <div>
                <div className="grid gap-2">
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
                        className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all hover-elevate active-elevate-2 ${
                          selected ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                        data-testid={`chip-family-${p}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFamilyMode("quiz")}
                    className="text-muted-foreground"
                  >
                    Not sure → Help me figure this out
                  </Button>
                </div>
              </div>
            ) : (
              <FamilyQuiz
                onComplete={({ patterns, attachmentHint }) => {
                  update("family_patterns", patterns);
                  // If we don't already have attachment info, promote the hint.
                  if (!state.attachment_style && attachmentHint) {
                    update("attachment_style", attachmentHint);
                    update("attachment_source", "quiz-inferred");
                  }
                  setFamilyMode("select");
                }}
                onCancel={() => setFamilyMode("select")}
              />
            )}
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            step={6}
            totalSteps={TOTAL_STEPS}
            title="MBTI? (optional)"
            whyWeAsk={WHY_WE_ASK.mbti}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={() => submit()}
            nextLabel="Get insight"
            isLast
          >
            <Input
              value={state.mbti ?? ""}
              onChange={(e) => update("mbti", e.target.value)}
              placeholder="e.g. INFJ"
              maxLength={4}
              className="uppercase text-center text-lg font-mono tracking-widest bg-card"
              data-testid="input-mbti"
            />
          </StepShell>
        )}
      </AnimatePresence>
    </div>
  );
}
