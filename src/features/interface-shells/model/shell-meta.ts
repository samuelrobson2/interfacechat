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
    description: "Dates, availability and clashes across a month.",
  },
  reader: {
    label: "Reader",
    description: "Understand or find things in a document you have.",
  },
  map: {
    label: "Map",
    description: "Places, distances and a shortlist around a location.",
  },
  timeline: {
    label: "Timeline",
    description: "Events in order, to see what happened when.",
  },
  flowchart: {
    label: "Flowchart",
    description: "Steps, decisions and the paths between them.",
  },
  mindmap: {
    label: "Mind map",
    description: "Ideas branching out from a central topic.",
  },
  guide: {
    label: "Guide",
    description: "A recipe or how-to to follow, step by step.",
  },
  moodboard: {
    label: "Moodboard",
    description: "Collect images, colours and words for a look.",
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
