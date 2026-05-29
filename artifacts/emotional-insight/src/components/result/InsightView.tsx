import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/AppFrame";
import { ChainArtTransition } from "./ChainArt";
import { BreathBloom } from "./BreathBloom";
import type { AnalyzeReflectionResponseType } from "@/lib/api";

interface InsightViewProps {
  result: AnalyzeReflectionResponseType;
  onReset: () => void;
  onBuildPlan: () => void;
  onSaveShare: () => void;
}

const BLUE = "#0088ff";

/**
 * Output flow — 6 chain stages, in order:
 *   0  Emotion            — chain reveal animation
 *   1  Why is this happening — collapsible boxes (CBT/IFS/NVC sources)
 *   2  Take a breath      — intermission breathing quatrefoil animation
 *   3  A different angle  — current pattern vs. actual truth
 *   4  What you can do    — three timeframe pills (right now / today / this week)
 *   5  Take it with you   — affirmation + CTAs
 *
 * The output frame hides the input progress bar (`hideProgress`) — the chain
 * on the left now is the progress indicator.
 */

const TOTAL_STAGES = 6;

export function InsightView({ result, onReset, onBuildPlan, onSaveShare }: InsightViewProps) {
  const [stage, setStage] = useState(0);

  // The Emotion stage uses a one-time cascade reveal.
  const [emotionAnimated, setEmotionAnimated] = useState(false);
  useEffect(() => {
    if (emotionAnimated) return;
    if (stage !== 0) {
      setEmotionAnimated(true);
      return;
    }
    const t = setTimeout(() => setEmotionAnimated(true), 2200);
    return () => clearTimeout(t);
  }, [stage, emotionAnimated]);

  function goToStage(next: number) {
    if (next < 0 || next >= TOTAL_STAGES) return;
    setStage(next);
  }
  function advance() { goToStage(stage + 1); }

  const animateInitial = stage === 0 && !emotionAnimated;

  // Stage 2 (Take a breath) is presented full-width with the chain hidden —
  // it returns on the next stage.
  const hideChain = stage === 2;

  return (
    <AppFrame currentBead={7} hideProgress>
      <div style={{ display: "flex", flex: 1, gap: 32, minHeight: 540 }}>
        <ChainArtTransition
          show={!hideChain}
          currentStage={stage}
          animateInitial={animateInitial}
          onBeadClick={goToStage}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {stage === 0 && <EmotionStep result={result} />}
              {stage === 1 && <WhyStep result={result} />}
              {stage === 2 && <BreathStep />}
              {stage === 3 && <ShiftStep result={result} />}
              {stage === 4 && <WhatYouCanDoStep result={result} />}
              {stage === 5 && (
                <TakeItWithYouStep
                  result={result}
                  onBuildPlan={onBuildPlan}
                  onSaveShare={onSaveShare}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              type="button"
              className="nav-btn-text nav-btn-back"
              onClick={() => goToStage(stage - 1)}
              disabled={stage === 0}
              data-testid="button-output-back"
            >
              &lt; back
            </button>
            {stage < TOTAL_STAGES - 1 ? (
              <button
                type="button"
                className="nav-btn-continue"
                onClick={advance}
                data-testid="button-output-continue"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="nav-btn-continue"
                onClick={onReset}
                data-testid="button-output-restart"
              >
                Start over
              </button>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

/* ─── Stage 0: Emotion ──────────────────────────────────────────────────── */
function EmotionStep({ result }: { result: AnalyzeReflectionResponseType }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 40 }}>
      <h2 style={sectionHeading}>You may be feeling…</h2>
      <h1
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.5rem",
          color: BLUE,
          margin: 0,
          marginTop: 44,
          marginBottom: 8,
          textTransform: "capitalize",
        }}
        data-testid="text-primary-emotion"
      >
        {result.primary_emotion}
      </h1>
      {result.secondary_emotion && (
        <p style={{ fontSize: "0.9375rem", color: "#a8b3c1", margin: 0, marginBottom: 28 }}>
          with {result.secondary_emotion} underneath
        </p>
      )}
      <p style={{ fontSize: "0.875rem", color: "#1d2e48", lineHeight: 1.6, maxWidth: 360, margin: 0 }}>
        {result.headline}
      </p>
    </div>
  );
}

/* ─── Stage 1: Why is this happening ────────────────────────────────────── */
interface TheorySource {
  name: string;
  summary: string;
  link: string;
}
const THEORY_LIBRARY: Record<string, TheorySource> = {
  CBT: {
    name: "CBT Theory",
    summary:
      "CBT looks at how thoughts, feelings, and behavior reinforce each other. Changing the thought pattern changes the loop.",
    link: "https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral",
  },
  IFS: {
    name: "IFS Theory",
    summary:
      "IFS sees the mind as a family of 'parts.' Exiles carry old wounds. Managers protect. The Self — your calm core — can witness all of them with compassion.",
    link: "https://ifs-institute.com",
  },
  DBT: {
    name: "DBT Theory",
    summary:
      "DBT pairs acceptance with change. Practical skills for distress tolerance and emotion regulation when the wave is too big.",
    link: "https://www.psychologytoday.com/us/therapy-types/dialectical-behavior-therapy",
  },
  NVC: {
    name: "NVC Theory",
    summary:
      "NVC traces hard feelings back to unmet universal needs (safety, belonging, respect). Naming the need underneath softens it.",
    link: "https://www.cnvc.org",
  },
  Attachment: {
    name: "Attachment Theory",
    summary:
      "Adult relational reactions often echo how connection was learned in childhood. Insecure patterns can be healed in safe relationships.",
    link: "https://www.psychologytoday.com/us/basics/attachment",
  },
  Polyvagal: {
    name: "Polyvagal Theory",
    summary:
      "Your nervous system runs on three settings: safe & connected, fight/flight, and shutdown. Settling the body comes before insight.",
    link: "https://www.stephenporges.com",
  },
};

function WhyStep({ result }: { result: AnalyzeReflectionResponseType }) {
  const [openKey, setOpenKey] = useState<string>("surface");

  const boxes = [
    { key: "surface", title: "Surface", body: result.why.surface, theories: ["CBT"] },
    { key: "deeper",  title: "Deeper",  body: result.why.deeper,  theories: ["IFS", "Attachment"] },
    { key: "root",    title: "Root",    body: result.why.root,    theories: ["NVC"] },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <h2 style={sectionHeading}>Why is this happening?</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {boxes.map((b) => {
          const isOpen = openKey === b.key;
          const bodyId = `why-body-${b.key}`;
          return (
            <button
              key={b.key}
              type="button"
              className={`out-card${isOpen ? " selected" : " collapsed"}`}
              onClick={() => setOpenKey(b.key)}
              aria-expanded={isOpen}
              aria-controls={bodyId}
              data-testid={`why-card-${b.key}`}
            >
              <p className="out-card-title">{b.title}</p>
              {isOpen && (
                <div id={bodyId}>
                  <p className="out-card-body">{b.body}</p>
                  <TheorySourceLine theories={b.theories} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TheorySourceLine({ theories }: { theories: string[] }) {
  const primary = THEORY_LIBRARY[theories[0]];
  if (!primary) return null;
  const tipId = `theory-tip-${theories.join("-")}`;
  return (
    <span className="out-card-source">
      <button
        type="button"
        className="theory-tip-trigger"
        aria-describedby={tipId}
        onClick={(e) => e.stopPropagation()}
      >
        Drawn from{" "}
        <a href={primary.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          {theories.join(" + ")} Theory.
        </a>
      </button>
      <span className="theory-tip" role="tooltip" id={tipId}>
        <span className="theory-tip-title">{primary.name}</span>
        <span className="theory-tip-body">{primary.summary}</span>
        <a href={primary.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          Learn more →
        </a>
      </span>
    </span>
  );
}

/* ─── Stage 2: Take a breath ────────────────────────────────────────────── */
/* Rendered full-width (chain hidden) so it sits centered inside the frame. */
function BreathStep() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 56,
        minHeight: 480,
      }}
    >
      <p style={{ fontFamily: "var(--app-font-heading)", fontSize: "1.375rem", color: "#1d2e48", margin: 0, textAlign: "center" }}>
        That was a lot. Take a breath.
      </p>
      <BreathBloom />
    </div>
  );
}

/* ─── Stage 3: A different angle ────────────────────────────────────────── */
function ShiftStep({ result }: { result: AnalyzeReflectionResponseType }) {
  return (
    <div style={{ paddingTop: 40 }}>
      <h2 style={sectionHeading}>A different angle.</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="out-card" style={{ cursor: "default" }}>
          <p className="out-card-title" style={{ color: "#1d2e48" }}>The current pattern</p>
          <p className="out-card-body" style={{ color: "#a8b3c1", fontStyle: "italic" }}>
            "{result.headline}"
          </p>
        </div>
        <div className="out-card selected" style={{ cursor: "default" }}>
          <p className="out-card-title">The actual truth</p>
          <p className="out-card-body">{result.reframe}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Stage 4: What you can do ──────────────────────────────────────────── */
/**
 * Three timeframe pills: Right now / Today / This week.
 * The backend returns `next_steps[]` each with a `timeframe` field; we bucket
 * them and render the selected bucket below the pills.
 */
const TIMEFRAMES = [
  { key: "now",   label: "Right now",  match: /(right now|moment|second|minute|breath|now)/i },
  { key: "today", label: "Today",      match: /(today|day|hour|tonight|afternoon|evening|morning)/i },
  { key: "week",  label: "This week",  match: /(week|days|coming|over the next|month)/i },
] as const;

type TFKey = typeof TIMEFRAMES[number]["key"];

function bucketSteps(steps: AnalyzeReflectionResponseType["next_steps"]) {
  const buckets: Record<TFKey, AnalyzeReflectionResponseType["next_steps"]> = { now: [], today: [], week: [] };
  for (const s of steps) {
    const found = TIMEFRAMES.find((t) => t.match.test(s.timeframe));
    const key: TFKey = found ? found.key : "today";
    buckets[key].push(s);
  }
  return buckets;
}

function WhatYouCanDoStep({ result }: { result: AnalyzeReflectionResponseType }) {
  const buckets = bucketSteps(result.next_steps);
  // Default-select the first bucket that has something in it.
  const firstFilled = TIMEFRAMES.find((t) => buckets[t.key].length > 0)?.key ?? "now";
  const [selected, setSelected] = useState<TFKey>(firstFilled);

  return (
    <div style={{ paddingTop: 40 }}>
      <h2 style={sectionHeading}>What you can do</h2>

      {/* Diamond chip selector — same visual language as the input stage. */}
      <div className="timeframe-row" role="tablist">
        {TIMEFRAMES.map((t) => {
          const isSelected = selected === t.key;
          const hasContent = buckets[t.key].length > 0;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelected(t.key)}
              className={`timeframe-chip${isSelected ? " selected" : ""}`}
              disabled={!hasContent}
              data-testid={`timeframe-${t.key}`}
            >
              <span className={`diamond-icon${isSelected ? " filled" : ""}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Selected bucket directions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {buckets[selected].length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#a8b3c1", margin: 0 }}>
            Nothing specific here — try another timeframe.
          </p>
        ) : (
          buckets[selected].map((s, i) => (
            <div key={i} className="out-card selected" style={{ cursor: "default" }}>
              <p className="out-card-title">{s.action}</p>
              <p className="out-card-body">{s.description}</p>
              {s.framework && <TheorySourceLine theories={[normaliseTheory(s.framework)]} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function normaliseTheory(s: string): string {
  const upper = s.toUpperCase();
  for (const k of Object.keys(THEORY_LIBRARY)) {
    if (upper.includes(k.toUpperCase())) return k;
  }
  return "DBT";
}

/* ─── Stage 5: Take it with you ─────────────────────────────────────────── */
function TakeItWithYouStep({
  result,
  onBuildPlan,
  onSaveShare,
}: {
  result: AnalyzeReflectionResponseType;
  onBuildPlan: () => void;
  onSaveShare: () => void;
}) {
  return (
    <div style={{ paddingTop: 40 }}>
      <h2 style={sectionHeading}>Take it with you.</h2>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#1d2e48",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 460,
          margin: "0 auto 28px",
        }}
      >
        {result.affirmation}
      </p>

      <button
        type="button"
        onClick={onBuildPlan}
        className="out-card selected"
        style={{ background: BLUE, borderColor: BLUE, marginBottom: 14 }}
        data-testid="button-build-plan"
      >
        <p className="out-card-title" style={{ color: "white", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, background: "white", transform: "rotate(45deg)", display: "inline-block" }} />
          Build an action plan
        </p>
        <p className="out-card-body" style={{ color: "rgba(255,255,255,0.9)" }}>
          Turn these next steps into a daily check-in you can actually follow.
        </p>
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button type="button" onClick={onSaveShare} className="out-card" data-testid="button-save-charm">
          <p className="out-card-title" style={{ color: BLUE, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, background: BLUE, transform: "rotate(45deg)", display: "inline-block" }} />
            Save charm
          </p>
        </button>
        <button type="button" onClick={onSaveShare} className="out-card" data-testid="button-export">
          <p className="out-card-title" style={{ color: BLUE, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, background: BLUE, transform: "rotate(45deg)", display: "inline-block" }} />
            Export
          </p>
        </button>
      </div>

      {result.therapy_nudge && result.therapy_nudge_reason && (
        <p style={{ marginTop: 20, fontSize: "0.75rem", color: "#a8b3c1", textAlign: "center", fontStyle: "italic" }}>
          {result.therapy_nudge_reason}
        </p>
      )}
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--app-font-heading)",
  fontSize: "1.25rem",
  color: "#1d2e48",
  margin: 0,
  marginBottom: 28,
  textAlign: "center",
};
