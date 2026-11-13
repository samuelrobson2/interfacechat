import type { ShellKind, ShellSize, ShellState } from "./shell-types";

export const SHELL_META: Record<ShellKind, { label: string; description: string }> = {
  chat: {
    label: "Chat",
    description: "A plain conversation: questions, ideas and quick answers.",
  },
  document: {
    label: "Document",
    description: "Create and edit writing: papers, reports, memos, emails.",
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
  article: {
    label: "Article",
    description: "A piece to read with live charts, controls and code between the prose.",
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
