import type {
  ChartShellData,
  ChartType,
  FlowchartShellData,
  MindmapShellData,
  TimelineShellData,
} from "./shell-types";

/** Each chart type's name and what it's for, for the person and the model. */
export const CHART_TYPE_META: Record<ChartType, { label: string; description: string }> = {
  mindmap: { label: "Mind map", description: "Ideas branching out from a central topic." },
  timeline: { label: "Timeline", description: "Events in order, to see what happened when." },
  flowchart: { label: "Flowchart", description: "Steps, decisions and the paths between them." },
};

/** What each type draws, as the design that draws it expects. */
export const chartAsMindmap = (data: ChartShellData): MindmapShellData => ({
  project: data.project,
  title: data.title,
  branches: data.branches,
});
export const chartAsTimeline = (data: ChartShellData): TimelineShellData => ({
  project: data.project,
  title: data.title,
  events: data.events,
});
export const chartAsFlowchart = (data: ChartShellData): FlowchartShellData => ({
  project: data.project,
  title: data.title,
  nodes: data.nodes,
  edges: data.edges,
});

/** Words that point at one type of chart, strongest first. */
const TYPE_WORDS: [ChartType, RegExp][] = [
  ["flowchart", /\b(flow ?chart|decision tree|workflow|process|what happens if|steps? to)\b/i],
  ["timeline", /\b(timeline|chronolog\w*|history of|what happened|over the years|sequence of events)\b/i],
  ["mindmap", /\b(mind ?map|brainstorm|spider diagram|branch(es)? out|ideas for|angles)\b/i],
];

/** The chart type a request asks for; a mind map when it doesn't say. */
export function chartTypeFor(text: string): ChartType {
  return TYPE_WORDS.find(([, words]) => words.test(text))?.[0] ?? "mindmap";
}
