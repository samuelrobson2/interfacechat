import type { ChatFormat, ChatPersona } from "./shell-types";

/**
 * Chat has two modes. The format is how the reply's text is laid out; the
 * persona is who is replying. Both are plain instructions to the model, not
 * designs: the reply is ordinary text in the thread.
 */
export const CHAT_FORMATS: ChatFormat[] = ["plain", "explainer", "proscons", "ranked"];
export const CHAT_PERSONAS: ChatPersona[] = ["assistant", "tutor", "critic", "brainstormer"];

/** Offered while typing a format. Anything else can be typed as free text. */
export const FORMAT_SUGGESTIONS = [
  "Explainer",
  "Pros & cons",
  "Ranked list",
  "Step by step",
  "Bullet points",
  "Short answer",
  "Summary",
  "Comparison",
];

/** Offered while typing who replies: personas, and common tools it can use. */
export const ASSISTANT_SUGGESTIONS = [
  "Tutor",
  "Critic",
  "Brainstormer",
  "Editor",
  "Coach",
  "Web search",
  "Calculator",
  "Code",
];

/** The model's instruction for a known persona; free text is passed on as written. */
export function assistantInstruction(text: string): string {
  const known = Object.values(CHAT_PERSONA_META).find((meta) => meta.label.toLowerCase() === text.trim().toLowerCase());
  return known ? known.instruction : `Reply as: ${text.trim()}.`;
}

/** The model's instruction for a reply format: a known one's example, or the person's own words. */
export function formatInstruction(text: string): string {
  const known = Object.values(CHAT_FORMAT_META).find((meta) => meta.label.toLowerCase() === text.trim().toLowerCase());
  return known
    ? `Lay the reply's text out as ${known.label}, like this example:\n${known.example}`
    : `Lay the reply's text out as: ${text.trim()}.`;
}

export const CHAT_FORMAT_META: Record<ChatFormat, { label: string; example: string }> = {
  plain: {
    label: "Chat",
    example: "Hold on the empty dock long enough that the audience settles into your pace. Eight to twelve seconds is usually right for a static wide.",
  },
  explainer: {
    label: "Explainer",
    example: "How a ferry docks\n\n1. Why it's hard\nA ferry is heavy and slow to stop, and wind pushes it sideways.\n\n2. Coming in\nIt slows early and lines up into the current.\n\n3. Making fast\nCrew throw lines ashore and loop them over bollards.",
  },
  proscons: {
    label: "Pros & cons",
    example: "Shoot on 16mm?\n\nPros\n- The grain suits the muted look (matters most)\n- Handles the bright sea well\n\nCons\n- Stock and processing add about £4,000 (matters most)\n- No instant playback\n\nVerdict: film for scenes 1 and 2, pickups on digital.",
  },
  ranked: {
    label: "Ranked list",
    example: "Cafés for scene 2, by fit for the look and schedule\n\n1. Tide Café (top pick): big window onto the water, quiet before 9am.\n2. Saltworks Coffee: lovely light, but filming Mondays only.\n3. The Ticket Office: right period, small for the dolly.",
  },
};

export const CHAT_PERSONA_META: Record<ChatPersona, { label: string; example: string; instruction: string }> = {
  assistant: {
    label: "Assistant",
    example: "Eight to twelve seconds is usually right for a static wide. Want me to check it against your edit?",
    instruction: "Be a capable, friendly assistant: direct, clear and brief.",
  },
  tutor: {
    label: "Tutor",
    example: "Before I answer: what do you think the audience is feeling in that first shot? Let's work out the length from there.",
    instruction:
      "Be a patient tutor: explain step by step in plain words, check understanding with a short question, and build on what the person already knows.",
  },
  critic: {
    label: "Critic",
    example: "Honestly, the opening runs long. Nothing in the frame changes after six seconds, so the audience will start waiting rather than watching.",
    instruction:
      "Be a candid critic: say what isn't working and why, plainly and specifically, then what would fix it. Don't soften the point.",
  },
  brainstormer: {
    label: "Brainstormer",
    example: "Three ways in: start on the horn with a black screen; start mid-crossing on Mara's hands; or hold the empty dock and let the ferry arrive into frame.",
    instruction:
      "Be a generous brainstorming partner: offer several distinct options, build on the person's ideas, and keep judgement light until they choose.",
  },
};
