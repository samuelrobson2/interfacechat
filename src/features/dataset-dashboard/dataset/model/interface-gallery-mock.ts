import type { InterfacePreviewKey } from "../ui/interface-preview-art";

export type GalleryInterface = {
  id: string;
  title: string;
  /** Shown under the title in the gallery header while the card is hovered. */
  subtitle: string;
  /** Which drawn interface mock renders as the tile. */
  preview: InterfacePreviewKey;
  /** width / height — matches the drawing's own viewBox so nothing crops. */
  ratio: number;
};

/**
 * Placeholder interfaces so the gallery has enough variety to read as a real
 * board. Real (mock) dataset interfaces are prepended to these in the demo.
 */
export const PLACEHOLDER_INTERFACES: GalleryInterface[] = [
  {
    id: "if-quality-dashboard",
    title: "Quality Dashboard",
    subtitle: "Row counts, drift and grader scores at a glance",
    preview: "metrics-dashboard",
    ratio: 8 / 5,
  },
  {
    id: "if-support-copilot",
    title: "Support Copilot",
    subtitle: "Drafts replies from the last 30 days of tickets",
    preview: "chat-console",
    ratio: 3 / 4,
  },
  {
    id: "if-triage-board",
    title: "Triage Board",
    subtitle: "Route flagged completions to the right reviewer",
    preview: "kanban",
    ratio: 7 / 5,
  },
  {
    id: "if-prompt-lab",
    title: "Prompt Lab",
    subtitle: "Side-by-side prompt editing with live output",
    preview: "prompt-lab",
    ratio: 16 / 9,
  },
  {
    id: "if-row-inspector",
    title: "Row Inspector",
    subtitle: "Filter, tag and bulk-edit dataset rows",
    preview: "data-table",
    ratio: 5 / 4,
  },
  {
    id: "if-concept-graph",
    title: "Concept Graph",
    subtitle: "How topics in the dataset relate to each other",
    preview: "graph-explorer",
    ratio: 22 / 13,
  },
  {
    id: "if-run-monitor",
    title: "Run Monitor",
    subtitle: "Live status for every generation and eval job",
    preview: "job-monitor",
    ratio: 7 / 5,
  },
  {
    id: "if-label-review",
    title: "Label Review",
    subtitle: "Accept or correct model-proposed annotations",
    preview: "annotation-review",
    ratio: 4 / 3,
  },
];

/** Look assigned, in order, to interfaces that come from dataset mock data. */
const DATASET_LOOK_ROTATION: Pick<GalleryInterface, "preview" | "ratio">[] = [
  { preview: "mermaid-flow", ratio: 4 / 3 },
  { preview: "sequence-diagram", ratio: 3 / 4 },
  { preview: "eval-heatmap", ratio: 1 },
];

export function lookForIndex(index: number) {
  return (
    DATASET_LOOK_ROTATION[index % DATASET_LOOK_ROTATION.length] ?? {
      preview: "mermaid-flow" as const,
      ratio: 4 / 3,
    }
  );
}
