import type { ShellKind, ShellSize, ShellState } from "./shell-types";

export const SHELL_META: Record<ShellKind, { label: string; description: string }> = {
  chat: {
    label: "Chat",
    description: "A plain conversation: questions, ideas and quick answers.",
  },
  notes: {
    label: "Notes",
    description: "A scratchpad for working something out: the goal, what's known and what's still open, a line at a time. The other interfaces are made from it.",
  },
  document: {
    label: "Document",
    description: "Create and edit writing: papers, reports, memos, emails, with live stats, charts and tables between the paragraphs when it needs them.",
  },
  search: {
    label: "Search",
    description: "The search itself: queries, sources and filters as it runs.",
  },
  table: {
    label: "Table",
    description:
      "Create or compare structured rows and columns.",
  },
  schedule: {
    label: "Schedule",
    description: "Plan tasks across hours and days, as a Gantt.",
  },
  tracker: {
    label: "Tracker",
    description: "Steps to get something done, with owners and status.",
  },
  calendar: {
    label: "Calendar",
    description: "Events on dates across a month.",
  },
  reader: {
    label: "Reader",
    description: "Understand or find things in a document you have.",
  },
  map: {
    label: "Map",
    description: "Places, distances and a shortlist around a location.",
  },
  chart: {
    label: "Diagram",
    description: "A mind map, timeline or flowchart: ideas around a topic, events in order, or steps and decisions.",
  },
  guide: {
    label: "Guide",
    description: "A recipe or how-to to follow, step by step.",
  },
  generator: {
    label: "Generator",
    description: "Generate text or images from a prompt and references, in three variations.",
  },
  dashboard: {
    label: "Dashboard",
    description: "Figures, charts and tables over data, with filters and code that runs.",
  },
  moodboard: {
    label: "Canvas",
    description: "A freeform canvas: put images, notes and colours anywhere, and generate more.",
  },
};

export const SIZE_META: Record<ShellSize, { label: string; description: string }> = {
  small: {
    label: "Small",
    description: "The app icon, used in chat header badges and docks.",
  },
  medium: {
    label: "Medium",
    description: "An idle shell on the chat home, before anything is typed. Click it to begin.",
  },
  "medium-plus": {
    label: "Medium plus",
    description: "The matched shell while you type. Its fields are editable and ⌘↵ starts the chat.",
  },
  large: {
    label: "Large",
    description: "Docked beside the conversation once it starts, with the full editor.",
  },
};

export const STATE_META: Record<ShellState, { label: string }> = {
  empty: { label: "Empty" },
  suggestion: { label: "Suggestion" },
  history: { label: "History" },
};

/** Only medium plus shows the empty / suggestion / history states; medium is always the blank interface. */
export const STATEFUL_SIZES: ShellSize[] = ["medium-plus"];

/** Sizes an interface doesn't come in. Chat has no large: sent, it opens the chat itself. */
const MISSING_SIZES: Partial<Record<ShellKind, ShellSize[]>> = { chat: ["large"] };

export const hasSize = (kind: ShellKind, size: ShellSize) => !MISSING_SIZES[kind]?.includes(size);

/** Which content a size shows: small and medium are blank, large is the docked chat. */
export function contentFor(size: ShellSize, state: ShellState): ShellState {
  if (STATEFUL_SIZES.includes(size)) return state;
  return size === "large" ? "history" : "empty";
}

/**
 * Each interface's colour, matched to its artwork: `solid` for fills and
 * outlines, `text` a darker shade that reads at 4.5:1 or better on white (the
 * accessibility test checks every one). Used where something belongs to an
 * interface, such as a question's choices: orange for Notes, coral for Guide.
 */
export const SHELL_ACCENT: Record<ShellKind, { solid: string; text: string }> = {
  notes: { solid: "#fc8723", text: "#b45309" },
  document: { solid: "#3b8fe0", text: "#1d5fae" },
  search: { solid: "#6b6b6b", text: "#4a4a4a" },
  table: { solid: "#3fa36b", text: "#15803d" },
  schedule: { solid: "#2bb3a3", text: "#0f766e" },
  tracker: { solid: "#f0525c", text: "#be123c" },
  calendar: { solid: "#8b5cf6", text: "#6d28d9" },
  reader: { solid: "#64748b", text: "#475569" },
  map: { solid: "#e0a800", text: "#92400e" },
  moodboard: { solid: "#ec6fa8", text: "#a3215c" },
  chart: { solid: "#3b8fe0", text: "#1d5fae" },
  guide: { solid: "#e8664f", text: "#b4321f" },
  generator: { solid: "#8b5cf6", text: "#6d28d9" },
  dashboard: { solid: "#8b5cf6", text: "#6d28d9" },
  chat: { solid: "#6b6b6b", text: "#4a4a4a" },
};
