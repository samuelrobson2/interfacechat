import type { ToolbarKind } from "./generate-tools";
import type { GeneratedTool } from "./tool-spec";

/**
 * What a generated tool can do that an interface's own toolbar may already
 * do. A suggestion that covers a job the standard tools already cover is a
 * duplicate (a "When" choice beside Search's own Time filter), so it's left out.
 */
export const TOOL_JOBS = [
  "time-filter",
  "type-filter",
  "site-filter",
  "sort",
  "add-row",
  "add-column",
  "add-item",
  "completed",
  "cleanup",
  "day-count",
  "day-length",
  "shift-times",
  "diagram-type",
  "palette-order",
  "copy",
  "download",
  "open-elsewhere",
] as const;
export type ToolJob = (typeof TOOL_JOBS)[number];

export type StandardTool = { label: string; jobs: ToolJob[] };

/** Each large interface's own toolbar (after Undo and Redo), as `shell-toolbar` draws it. */
export const STANDARD_TOOLS: Record<ToolbarKind, StandardTool[]> = {
  document: [
    { label: "Text style, bold, italic, lists, quote, link", jobs: [] },
    { label: "Copy as Markdown", jobs: ["copy"] },
    { label: "Download .md", jobs: ["download"] },
  ],
  table: [
    { label: "Sort from each column's header", jobs: ["sort"] },
    { label: "Add a row", jobs: ["add-row"] },
    { label: "Add a column", jobs: ["add-column"] },
    { label: "Data cleanup", jobs: ["cleanup"] },
    { label: "Copy as CSV, Download .csv", jobs: ["copy", "download"] },
  ],
  tracker: [
    { label: "New item, New list", jobs: ["add-item"] },
    { label: "Sort by due date, owner, title or not done first", jobs: ["sort"] },
    { label: "Show or hide completed, Mark all as done, Clear completed", jobs: ["completed"] },
    { label: "Copy as a checklist", jobs: ["copy"] },
  ],
  chart: [
    { label: "Diagram type", jobs: ["diagram-type"] },
    { label: "Reset colours", jobs: [] },
    { label: "Copy as an outline or Mermaid, Download .md", jobs: ["copy", "download"] },
  ],
  moodboard: [
    { label: "Upload images, image from a link, add a colour", jobs: [] },
    { label: "Sort the palette light to dark", jobs: ["palette-order"] },
    { label: "Copy the palette", jobs: ["copy"] },
  ],
  search: [
    { label: "Type: All, News, Images, Videos, Papers, Datasets", jobs: ["type-filter"] },
    { label: "Time: Any time to Past year", jobs: ["time-filter"] },
    { label: "Search within a site", jobs: ["site-filter"] },
    { label: "Copy the links", jobs: ["copy"] },
    { label: "Open the top result, Open in Google", jobs: ["open-elsewhere"] },
  ],
  schedule: [
    { label: "New task", jobs: ["add-item"] },
    { label: "Add a day, Remove the last day", jobs: ["day-count"] },
    { label: "Longer or shorter days", jobs: ["day-length"] },
    { label: "Move everything 30 minutes earlier or later", jobs: ["shift-times"] },
    { label: "Sort by start time", jobs: ["sort"] },
    { label: "Copy as text, Download .csv", jobs: ["copy", "download"] },
  ],
  generator: [
    { label: "Text or Image", jobs: [] },
    { label: "Tone, Length, Style, Aspect and Creativity controls, with Presets", jobs: [] },
    { label: "Add or clear reference images", jobs: [] },
    { label: "Download all or Copy all", jobs: ["copy", "download"] },
  ],
  dashboard: [],
  article: [],
};

const jobsOf = (kind: ToolbarKind) => new Set(STANDARD_TOOLS[kind].flatMap((tool) => tool.jobs));

/** Drops suggestions that do what the interface's own toolbar already does. */
export function withoutStandard<D>(kind: ToolbarKind, tools: GeneratedTool<D>[]): GeneratedTool<D>[] {
  const taken = jobsOf(kind);
  return tools.filter((tool) => !tool.jobs?.some((job) => taken.has(job)));
}

/** The lines the model reads before suggesting tools, so it doesn't repeat what's there. */
export function standardToolsPrompt(kind: ToolbarKind): string {
  const tools = STANDARD_TOOLS[kind];
  if (!tools.length) return "This interface has no toolbar of its own beyond Undo and Redo.";
  return [
    "The toolbar already has these, after Undo and Redo. Don't suggest anything that does the same job:",
    ...tools.map((tool) => `- ${tool.label}`),
  ].join("\n");
}

/** Rows an interface already has where a suggestion can sit, beside what it acts on. */
export const SUGGESTION_ROWS: Partial<Record<ToolbarKind, { place: "footer" | "days" | "prompt" | "board"; where: string }[]>> = {
  document: [{ place: "footer", where: "the footer, by the word count: for length and reading level" }],
  schedule: [{ place: "days", where: "the day settings: for start times, pace, buffers and number of days" }],
  generator: [{ place: "prompt", where: "the prompt box: for improving or describing the prompt" }],
  chart: [{ place: "board", where: "the board: for growing or reshaping the diagram" }],
  moodboard: [{ place: "board", where: "the board: for adding to the canvas" }],
};
