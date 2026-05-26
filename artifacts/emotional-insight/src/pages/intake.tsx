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

const BLUE = "#0088ff";
const INTENSITY_LABELS = ["barely there", "a hum", "noticeable", "loud", "overwhelming"];
const TOTAL_STEPS = 6;

/* ── State ─────────────────────────────────────────────────────────────────── */
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

/* ── Page ──────────────────────────────────────────────────────────────────── */
export function IntakePage() {
  const { toast } = useToast();
  const [state, setState] = useState<IntakeState>(initial);
  const [phase, setPhase] = useState<Phase>("landing");
  const [step, setStep] = useState(1);
  const [showStructured, setShowStructured] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<"select" | "quiz">("select");
  const [familyMode, setFamilyMode] = useState<"select" | "quiz">("select");
  const [familyQuizTaken, setFamilyQuizTaken] = useState(false);
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

  /* ── LOADING ── */
  if (phase === "loading") {
    return (
      <AppFrame currentBead={0}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
        >
          <p style={{ fontFamily: "var(--app-font-heading)", fontSize: "1.25rem", color: "#1d2e48", marginBottom: 8 }}>
            Sitting with what you wrote
          </p>
          <p style={{ fontSize: "0.875rem", color: "#a8b3c1" }}>A moment to find what's underneath…</p>
        </motion.div>
      </AppFrame>
    );
  }

  /* ── RESULT ── */
  if (phase === "result" && result) {
    return (
      <InsightView
        result={result}
        onReset={reset}
        onBuildPlan={() =>
          toast({ title: "Action plan coming soon", description: "We'll turn these next steps into a daily check-in." })
        }
        onSaveShare={() =>
          toast({ title: "Save & share", description: "Coming soon with accounts." })
        }
      />
    );
  }

  /* ── LANDING ── */
  if (phase === "landing") {
    return (
      <AppFrame currentBead={0}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          {/*
           * Heading — Figma: Atkinson Hyperlegible Mono, 20px, centered
           * top offset from panel: ~65px (handled by AppFrame content panel padding-top)
           */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1
              style={{
                fontFamily: "var(--app-font-heading)",
                fontSize: "1.25rem",
                color: "#1d2e48",
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              Tell us what you're feeling.
              <br />
              We'll help unravel what's underneath.
            </h1>
          </div>

          {/*
           * Central column — Figma: textarea 633px wide in 977px panel = 64.8%.
           * Centered with auto margins. "+ context" row is left-aligned within it.
           */}
          <div
            style={{
              width: "100%",
              maxWidth: 648,
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Textarea — border-radius 6px */}
            <textarea
              value={state.reflection}
              onChange={(e) => update("reflection", e.target.value)}
              placeholder="Write whatever you're feeling, what happened, why it's hitting you, what's going on underneath. Don't filter it."
              data-testid="input-reflection"
              style={{
                background: "rgba(255,255,255,0.52)",
                border: `1px solid ${BLUE}`,
                borderRadius: 6,
                padding: "22px 24px",
                minHeight: 220,
                width: "100%",
                resize: "vertical",
                fontSize: "0.875rem",
                color: "#a8b3c1",
                fontFamily: "var(--app-font-body)",
                lineHeight: 1.6,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* "More context" — centered on the full page, not inside narrow column */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                if (!state.reflection.trim()) {
                  toast({ title: "Write a few words first", description: "Even a sentence is enough." });
                  return;
                }
                setStep(1);
                setPhase("structured");
              }}
              data-testid="toggle-structured"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.125rem",
                  color: BLUE,
                  lineHeight: 1,
                  userSelect: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "1.125rem",
                }}
              >
                +
              </span>
              <span
                style={{
                  fontFamily: "var(--app-font-body)",
                  fontSize: "1.125rem",
                  color: BLUE,
                  lineHeight: 1,
                }}
              >
                Want to add more context for a deeper analysis?
              </span>
            </button>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Unravel — smaller, right-aligned */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={submit}
              disabled={analyzeMutation.isPending}
              data-testid="button-submit-quick"
              className="nav-btn-continue primary-fill"
            >
              Unravel
            </button>
          </div>
        </motion.div>
      </AppFrame>
    );
  }

  /* ── STRUCTURED FLOW ── */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${step}-${attachmentMode}-${familyMode}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        style={{ width: "100%" }}
      >
        {step === 1 && (
          <StepFrame
            step={1}
            title="Who is this about?"
            subtitle={WHY_WE_ASK.relationship}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
            nextDisabled={!state.relationship_context}
          >
            <CenteredContent>
              <DiamondList
                options={RELATIONSHIP_OPTIONS}
                value={state.relationship_context}
                onChange={(v) => update("relationship_context", v)}
                columns={2}
              />
            </CenteredContent>
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame
            step={2}
            title="How loud is the feeling right now?"
            subtitle={WHY_WE_ASK.intensity}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
            nextDisabled={state.intensity === null}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--app-font-heading)",
                    fontSize: "3.875rem",
                    lineHeight: 1,
                    color: state.intensity ? BLUE : "#d1dce8",
                    marginBottom: 6,
                  }}
                >
                  {state.intensity ?? "—"}
                </div>
                <div style={{ fontSize: "1.25rem", color: BLUE, minHeight: "1.5rem", fontFamily: "var(--app-font-body)" }}>
                  {state.intensity ? INTENSITY_LABELS[state.intensity - 1] : ""}
                </div>
              </div>
              <div style={{ width: "100%", maxWidth: 400 }}>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[state.intensity ?? 3]}
                  onValueChange={(v) => update("intensity", v[0])}
                  className="intensity-slider"
                  data-testid="slider-intensity"
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "0.875rem", color: "#a8b3c1" }}>
                  <span>mild</span>
                  <span>overwhelming</span>
                </div>
              </div>
            </div>
          </StepFrame>
        )}

        {step === 3 && (
          <StepFrame
            step={3}
            title="Where do you feel it in your body?"
            subtitle={WHY_WE_ASK.body}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            <CenteredContent>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 40px", maxWidth: 400 }}>
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                      }}
                      data-testid={`chip-body-${s}`}
                    >
                      <span
                        className="diamond-icon"
                        style={{
                          color: selected ? BLUE : "#d1dce8",
                          ...(selected ? { background: BLUE, borderColor: BLUE } : {}),
                        }}
                      />
                      <span style={{ fontSize: "0.875rem", color: selected ? BLUE : "#1d2e48", transition: "color 0.15s" }}>
                        {s}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CenteredContent>
          </StepFrame>
        )}

        {step === 4 && attachmentMode === "select" && (
          <StepFrame
            step={4}
            title="How does closeness usually feel for you?"
            subtitle={WHY_WE_ASK.attachment}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560, margin: "0 auto" }}>
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
                      <div style={{ fontSize: "0.875rem", fontWeight: 400, color: "#1d2e48", marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#a8b3c1", lineHeight: 1.4 }}>{opt.description}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  type="button"
                  className={`nav-btn-text${state.attachment_source === "quiz-inferred" ? " nav-btn-retake" : ""}`}
                  onClick={() => setAttachmentMode("quiz")}
                  style={state.attachment_source !== "quiz-inferred" ? { color: BLUE, opacity: 1 } : undefined}
                >
                  {state.attachment_source === "quiz-inferred"
                    ? "Take it again →"
                    : "Not sure. Help me figure it out →"}
                </button>
              </div>
            </div>
          </StepFrame>
        )}

        {step === 4 && attachmentMode === "quiz" && (
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
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="nav-btn-text" onClick={nextStep}>Skip</button>
            </div>
          </AppFrame>
        )}

        {step === 5 && familyMode === "select" && (
          <StepFrame
            step={5}
            title="Anything quietly familiar from how you grew up?"
            subtitle={WHY_WE_ASK.family}
            onBack={prevStep}
            onNext={nextStep}
            onSkip={nextStep}
          >
            {/* Diamond-icon style, matching body reactions page (user request #5) */}
            <CenteredContent>
              <div style={{ display: "grid", gap: "12px 40px", maxWidth: 480 }}>
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                      }}
                      data-testid={`chip-family-${p}`}
                    >
                      <span
                        className="diamond-icon"
                        style={{
                          color: selected ? BLUE : "#d1dce8",
                          flexShrink: 0,
                          ...(selected ? { background: BLUE, borderColor: BLUE } : {}),
                        }}
                      />
                      <span style={{ fontSize: "0.875rem", color: selected ? BLUE : "#1d2e48", transition: "color 0.15s" }}>
                        {p}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CenteredContent>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                type="button"
                className={`nav-btn-text${familyQuizTaken ? " nav-btn-retake" : ""}`}
                onClick={() => setFamilyMode("quiz")}
                style={!familyQuizTaken ? { color: BLUE, opacity: 1 } : undefined}
              >
                {familyQuizTaken
                  ? "Take it again →"
                  : "Not sure. Help me figure it out →"}
              </button>
            </div>
          </StepFrame>
        )}

        {step === 5 && familyMode === "quiz" && (
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
                setFamilyQuizTaken(true);
                setFamilyMode("select");
              }}
              onCancel={() => setFamilyMode("select")}
            />
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="nav-btn-text" onClick={nextStep}>Skip</button>
            </div>
          </AppFrame>
        )}

        {step === 6 && (
          <StepFrame
            step={6}
            title="MBTI? (optional)"
            subtitle={WHY_WE_ASK.mbti}
            onBack={prevStep}
            onNext={submit}
            onSkip={submit}
            nextLabel="Unravel"
            nextPrimary
          >
            {/* Centered input — user request #6 */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <input
                type="text"
                value={state.mbti ?? ""}
                onChange={(e) => {
                  // Validate MBTI as user types: only allow valid letter per position
                  // Pos 0: E/I, Pos 1: N/S, Pos 2: T/F, Pos 3: J/P
                  const ALLOWED = ["EI", "NS", "TF", "JP"];
                  const raw = e.target.value.toUpperCase();
                  let filtered = "";
                  for (let i = 0; i < raw.length && i < 4; i++) {
                    if (ALLOWED[i].includes(raw[i])) {
                      filtered += raw[i];
                    }
                  }
                  update("mbti", filtered);
                }}
                placeholder="e.g. INFJ"
                maxLength={4}
                data-testid="input-mbti"
                style={{
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  letterSpacing: "0.15em",
                  border: `1px solid ${state.mbti && state.mbti.length === 4 ? BLUE : "#d1dce8"}`,
                  borderRadius: 6,
                  padding: "8px 16px",
                  width: 160,
                  outline: "none",
                  fontFamily: "var(--app-font-body)",
                  background: "white",
                  textAlign: "center",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
          </StepFrame>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Shared step wrapper ──────────────────────────────────────────────────── */
interface StepFrameProps {
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

function StepFrame({ step, title, subtitle, children, onBack, onNext, onSkip, nextLabel, nextDisabled, nextPrimary }: StepFrameProps) {
  return (
    <AppFrame currentBead={step}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "var(--app-font-heading)", fontSize: "1.25rem", color: "#1d2e48", lineHeight: 1.35, margin: 0, marginBottom: 16 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: "0.875rem", color: "#a8b3c1", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button type="button" className="nav-btn-text nav-btn-back" onClick={onBack} disabled={!onBack}>
            {"\u2039"} Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {onSkip && (
              <button type="button" className="nav-btn-text" onClick={onSkip}>Skip</button>
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

/* Helper: centres children horizontally */
function CenteredContent({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      {children}
    </div>
  );
}
