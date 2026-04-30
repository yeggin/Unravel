// All option lists, copy, and quiz questions in one place.
// Edit copy here without touching component logic.

export type RelationshipContext =
  | "romantic partner"
  | "family member"
  | "friend"
  | "coworker or boss"
  | "myself"
  | "no specific person";

export type BodySensation =
  | "tight chest"
  | "heavy limbs"
  | "restless / can't sit still"
  | "numb or zoned out"
  | "jaw or shoulder tension"
  | "racing thoughts"
  | "stomach dropping"
  | "hard to breathe"
  | "feel like crying but can't"
  | "physically fine, just confused";

export type AttachmentStyle = "secure" | "anxious" | "avoidant" | "disorganized";
export type AttachmentSource = "self-reported" | "quiz-inferred" | "text-inferred";

export type FamilyPattern =
  | "emotionally distant parent"
  | "high-pressure / achievement-focused home"
  | "I was the peacekeeper"
  | "unpredictable or unstable home environment"
  | "love felt conditional on my behavior"
  | "I learned not to show weakness"
  | "a parent leaned on me emotionally"
  | "conflict was avoided at all costs"
  | "I felt invisible or unheard";

export const RELATIONSHIP_OPTIONS: { value: RelationshipContext; label: string }[] = [
  { value: "romantic partner", label: "Romantic partner" },
  { value: "family member", label: "Family member" },
  { value: "friend", label: "Friend" },
  { value: "coworker or boss", label: "Coworker or boss" },
  { value: "myself", label: "Myself" },
  { value: "no specific person", label: "No specific person" },
];

export const BODY_SENSATION_OPTIONS: BodySensation[] = [
  "tight chest",
  "heavy limbs",
  "restless / can't sit still",
  "numb or zoned out",
  "jaw or shoulder tension",
  "racing thoughts",
  "stomach dropping",
  "hard to breathe",
  "feel like crying but can't",
  "physically fine, just confused",
];

export const ATTACHMENT_OPTIONS: { value: AttachmentStyle; label: string; description: string }[] = [
  { value: "secure", label: "Secure", description: "Comfortable with closeness and space" },
  { value: "anxious", label: "Anxious", description: "Hyperaware of distance, seek reassurance" },
  { value: "avoidant", label: "Avoidant", description: "Pull back when things get intense" },
  { value: "disorganized", label: "Disorganized", description: "Want closeness but it also scares me" },
];

export const FAMILY_PATTERN_OPTIONS: FamilyPattern[] = [
  "emotionally distant parent",
  "high-pressure / achievement-focused home",
  "I was the peacekeeper",
  "unpredictable or unstable home environment",
  "love felt conditional on my behavior",
  "I learned not to show weakness",
  "a parent leaned on me emotionally",
  "conflict was avoided at all costs",
  "I felt invisible or unheard",
];

// --- Attachment quiz: behavioral, not self-concept ---
export const ATTACHMENT_QUIZ: {
  prompt: string;
  options: { label: string; style: AttachmentStyle }[];
}[] = [
  {
    prompt:
      "You send an important message to someone close to you. Hours pass with no reply. What happens inside you?",
    options: [
      {
        label:
          "I keep checking my phone. My mind starts filling in reasons — did I say something wrong? Are they upset with me?",
        style: "anxious",
      },
      {
        label:
          "I put my phone down and get on with my day. If it's important they'll respond eventually.",
        style: "avoidant",
      },
      {
        label: "I notice I'm waiting but I'm not spiraling. They're probably just busy.",
        style: "secure",
      },
      {
        label:
          "I swing between convincing myself it's fine and convincing myself something is wrong. I might send a follow-up then regret it.",
        style: "disorganized",
      },
    ],
  },
  {
    prompt:
      "Someone you're close to wants to spend more time with you or opens up emotionally. How does that land?",
    options: [
      {
        label:
          "It feels good but also makes me a little anxious — like now there's more to lose if something goes wrong.",
        style: "anxious",
      },
      {
        label: "It feels like a bit much. I appreciate it but I notice I want a little more space after.",
        style: "avoidant",
      },
      { label: "It feels natural and good. I can receive it without it feeling like pressure.", style: "secure" },
      {
        label:
          "I want it but it also makes me feel on edge — like it could be taken away, or like I'm not sure I can trust it.",
        style: "disorganized",
      },
    ],
  },
  {
    prompt:
      "After a conflict or a moment of tension with someone you care about, what do you usually do?",
    options: [
      {
        label:
          "I need to resolve it quickly. I can't rest until I know we're okay — the uncertainty is unbearable.",
        style: "anxious",
      },
      {
        label: "I pull back and need space. Talking about it while I'm still activated usually makes things worse.",
        style: "avoidant",
      },
      {
        label:
          "I can sit with some discomfort and come back to it when we've both settled. I trust it'll get worked out.",
        style: "secure",
      },
      {
        label:
          "I freeze or go into fight mode — sometimes I push hard to fix it, sometimes I go completely silent. It depends.",
        style: "disorganized",
      },
    ],
  },
];

// --- Family quiz: each option maps to family-pattern chips and (optionally) an attachment hint ---
export const FAMILY_QUIZ: {
  prompt: string;
  options: { label: string; patterns: FamilyPattern[]; attachmentHint?: AttachmentStyle }[];
}[] = [
  {
    prompt: "When you were upset or struggling as a kid, what usually happened in your house?",
    options: [
      { label: "I was comforted and taken seriously. My feelings were acknowledged.", patterns: [] },
      {
        label: "I was told to toughen up, stop overreacting, or that others had it worse.",
        patterns: ["I learned not to show weakness", "emotionally distant parent"],
        attachmentHint: "avoidant",
      },
      {
        label: "The mood of the house shifted around my feelings — I learned to hide them to keep the peace.",
        patterns: ["I was the peacekeeper", "conflict was avoided at all costs"],
        attachmentHint: "anxious",
      },
      {
        label: "It depended on the day — sometimes I was comforted, sometimes ignored or punished for it.",
        patterns: ["unpredictable or unstable home environment"],
        attachmentHint: "disorganized",
      },
      {
        label: "I mostly handled it alone — there wasn't really space to bring it to anyone.",
        patterns: ["I felt invisible or unheard", "emotionally distant parent"],
        attachmentHint: "avoidant",
      },
    ],
  },
  {
    prompt: "When you achieved something or did well, what was the typical response at home?",
    options: [
      { label: "It was celebrated genuinely — they were proud regardless of what I accomplished.", patterns: [] },
      {
        label: "It was acknowledged, but the bar always moved — there was always something more to do or do better.",
        patterns: ["love felt conditional on my behavior", "high-pressure / achievement-focused home"],
      },
      {
        label: "It wasn't really noticed or commented on either way.",
        patterns: ["I felt invisible or unheard"],
      },
      {
        label:
          "My achievements were more about the family's image than about me — it was used to show off rather than celebrate me.",
        patterns: ["love felt conditional on my behavior", "high-pressure / achievement-focused home"],
      },
    ],
  },
  {
    prompt: "What was your role when tension or conflict happened between people in your family?",
    options: [
      {
        label: "I tried to smooth things over, lighten the mood, or make everyone feel better.",
        patterns: ["I was the peacekeeper"],
        attachmentHint: "anxious",
      },
      {
        label: "I went to my room or disappeared — I stayed out of it and kept to myself.",
        patterns: ["I felt invisible or unheard"],
        attachmentHint: "avoidant",
      },
      {
        label:
          "I was often the one being fought about, or my behavior affected the mood of the whole house.",
        patterns: ["unpredictable or unstable home environment"],
      },
      {
        label: "One parent often came to me to vent or for emotional support about the other.",
        patterns: ["a parent leaned on me emotionally"],
      },
      { label: "Conflict was rare or handled calmly — I didn't have a particular role in it.", patterns: [] },
    ],
  },
];

// "Why we ask" copy lives next to fields so you can edit tone in one place.
export const WHY_WE_ASK = {
  reflection:
    "Write whatever you're feeling — what happened, why it's hitting you, what's going on underneath. Don't filter it.",
  relationship:
    "Different relationships activate different patterns. This shapes the entire analysis.",
  intensity: "Helps calibrate how loud the feeling is right now, not just what it is.",
  body: "Your body is already telling the story. This decides whether to settle the nervous system first.",
  attachment:
    "Adult reactions often echo how connection was learned. This adds depth — never a label.",
  family:
    "Most adult patterns trace back to what was modeled at home. Pick anything that quietly resonates.",
  mbti: "Optional. If you know it, it adds nuance to the analysis.",
};
