import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/AppFrame";
import { ChainArt } from "./ChainArt";
import type { AnalyzeReflectionResponseType } from "@/lib/api";

interface InsightViewProps {
  result: AnalyzeReflectionResponseType;
  onReset: () => void;
  onBuildPlan: () => void;
  onSaveShare: () => void;
}

const BLUE = "#0088ff";

/**
 * Output flow — 5 chain stages with an intermission animation between
 * Shift (stage 2) and "What you can do" (stage 3).
 *
 *   0  Emotion              — chain reveal animation
 *   1  Why is this happening — collapsible boxes (CBT/IFS/NVC sources)
 *   2  A different angle    — pattern vs. truth
 *      [intermission]       — diamond burst transition
 *   3  What you can do      — DBT-flavored action card
 *   4  Take it with you     — affirmation + CTAs
 */

const TOTAL_STAGES = 5;

export function InsightView({ result, onReset, onBuildPlan, onSaveShare }: InsightViewProps) {
  const [stage, setStage] = useState(0);
  const [showIntermission, setShowIntermission] = useState(false);

  // The Emotion stage uses a one-time cascade reveal animation.
  // After the user navigates away once, subsequent visits don't replay it.
  const [emotionAnimated, setEmotionAnimated] = useState(false);
  useEffect(() => {
    if (emotionAnimated) return;
    // Mark "animated" as soon as the user leaves stage 0 OR after the cascade
    // has had time to play — whichever comes first. Prevents replay on return.
    if (stage !== 0) {
      setEmotionAnimated(true);
      return;
    }
    const t = setTimeout(() => setEmotionAnimated(true), 2200);
    return () => clearTimeout(t);
  }, [stage, emotionAnimated]);

  function goToStage(next: number) {
    if (next < 0 || next >= TOTAL_STAGES) return;
    // Transition: shift (2) → what you can do (3) plays the intermission first.
    if (stage === 2 && next === 3) {
      setShowIntermission(true);
      window.setTimeout(() => {
        setShowIntermission(false);
        setStage(3);
      }, 2600);
      return;
    }
    setStage(next);
  }

  function advance() { goToStage(stage + 1); }

  if (showIntermission) {
    return <Intermission />;
  }

  const animateInitial = stage === 0 && !emotionAnimated;

  return (
    // Output flow runs after the 6-step input flow is complete — pass a value
    // past TOTAL_BEADS so AppFrame's input progressbar reads "all done"
    // instead of falsely reporting "step 0".
    <AppFrame currentBead={7}>
      <div style={{ display: "flex", flex: 1, gap: 32, minHeight: 540 }}>
        {/* Chain on the left */}
        <div style={{ flexShrink: 0, paddingTop: 12 }}>
          <ChainArt
            currentStage={stage}
            animateInitial={animateInitial}
            onBeadClick={(s) => goToStage(s)}
          />
        </div>

        {/* Content on the right */}
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
              {stage === 2 && <ShiftStep result={result} />}
              {stage === 3 && <WhatYouCanDoStep result={result} />}
              {stage === 4 && (
                <TakeItWithYouStep
                  result={result}
                  onBuildPlan={onBuildPlan}
                  onSaveShare={onSaveShare}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Continue / Start over — bottom right of the right column */}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 90 }}>
      <h1
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.5rem",
          color: BLUE,
          margin: 0,
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
    name: "CBT — Cognitive Behavioral Therapy",
    summary:
      "CBT looks at how thoughts, feelings, and behavior reinforce each other. Changing the thought pattern changes the loop.",
    link: "https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral",
  },
  IFS: {
    name: "IFS — Internal Family Systems",
    summary:
      "IFS sees the mind as a family of 'parts.' Exiles carry old wounds. Managers protect. The Self — your calm core — can witness all of them with compassion.",
    link: "https://ifs-institute.com",
  },
  DBT: {
    name: "DBT — Dialectical Behavior Therapy",
    summary:
      "DBT pairs acceptance with change. Practical skills for distress tolerance and emotion regulation when the wave is too big.",
    link: "https://www.psychologytoday.com/us/therapy-types/dialectical-behavior-therapy",
  },
  NVC: {
    name: "NVC — Nonviolent Communication",
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
    {
      key: "surface",
      title: "Surface",
      body: result.why.surface,
      theories: ["CBT"],
    },
    {
      key: "deeper",
      title: "Deeper",
      body: result.why.deeper,
      theories: ["IFS", "Attachment"],
    },
    {
      key: "root",
      title: "Root",
      body: result.why.root,
      theories: ["NVC"],
    },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <h2
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.25rem",
          color: "#1d2e48",
          margin: 0,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Why is this happening?
      </h2>

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
      {/* Real button so keyboard users can :focus-within and open the tooltip. */}
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
        {primary.summary}
        <a href={primary.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          Learn more →
        </a>
      </span>
    </span>
  );
}

/* ─── Stage 2: A different angle ────────────────────────────────────────── */
function ShiftStep({ result }: { result: AnalyzeReflectionResponseType }) {
  return (
    <div style={{ paddingTop: 40 }}>
      <h2
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.25rem",
          color: "#1d2e48",
          margin: 0,
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        A different angle.
      </h2>

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

/* ─── Intermission ──────────────────────────────────────────────────────── */
function Intermission() {
  return (
    <AppFrame currentBead={7}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
        }}
      >
        <p style={{ fontFamily: "var(--app-font-heading)", fontSize: "1.25rem", color: "#1d2e48", margin: 0 }}>
          That was a lot. Take a breath..
        </p>
        <div className="diamond-burst" aria-hidden>
          <div className="db-blue" />
          <div className="db-white" />
        </div>
      </div>
    </AppFrame>
  );
}

/* ─── Stage 3: What you can do ──────────────────────────────────────────── */
function WhatYouCanDoStep({ result }: { result: AnalyzeReflectionResponseType }) {
  const first = result.next_steps[0];
  if (!first) {
    return <p style={{ padding: 40 }}>No next steps yet.</p>;
  }
  return (
    <div style={{ paddingTop: 40 }}>
      <h2
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.25rem",
          color: "#1d2e48",
          margin: 0,
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        What you can do
      </h2>
      <div className="out-card selected" style={{ cursor: "default" }}>
        <p className="out-card-title">{first.action}</p>
        <p className="out-card-body">{first.description}</p>
        {first.framework && <TheorySourceLine theories={[normaliseTheory(first.framework)]} />}
      </div>

      {result.next_steps.length > 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {result.next_steps.slice(1).map((s, i) => (
            <div key={i} className="out-card collapsed" style={{ cursor: "default" }}>
              <p className="out-card-title">{s.action}</p>
            </div>
          ))}
        </div>
      )}
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

/* ─── Stage 4: Take it with you ─────────────────────────────────────────── */
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
      <h2
        style={{
          fontFamily: "var(--app-font-heading)",
          fontSize: "1.25rem",
          color: "#1d2e48",
          margin: 0,
          marginBottom: 36,
          textAlign: "center",
        }}
      >
        Take it with you.
      </h2>

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
