import { shellId, type ChartShellData, type FlowNode, type MindmapNode } from "@/features/interface-shells";
import { clip, mix, plural } from "./tool-helpers";
import type { GeneratedTool } from "./tool-spec";

/*
 * Diagram's generated tools, by type. Tools about the content itself (expand a
 * branch, fill a gap, close a decision) sit on the board, next to the work;
 * tools that reshape the whole diagram sit in the toolbar.
 */

type Tool = GeneratedTool<ChartShellData>;

const countIdeas = (nodes: MindmapNode[]): number => nodes.reduce((sum, node) => sum + 1 + countIdeas(node.children), 0);

function mindmapTools(data: ChartShellData): Tool[] {
  const topic = data.title.trim() || "the topic";
  if (data.branches.length === 0) {
    return [
      { type: "action", id: "start-map", label: "Start the map", detail: `Five branches around ${clip(topic, 40)}`, icon: "sparkles", place: "board" },
      {
        type: "choice",
        id: "angle",
        label: "Angle",
        detail: "Which way to branch out first",
        icon: "grid",
        options: [
          { id: "why", label: "Why" },
          { id: "how", label: "How" },
          { id: "who", label: "Who" },
        ],
        value: "why",
      },
    ];
  }

  const thinnest = [...data.branches].sort((a, b) => a.children.length - b.children.length)[0]!;
  const perBranch = Math.round(countIdeas(data.branches.flatMap((branch) => branch.children)) / data.branches.length);
  const steps = ["2", "3", "4", "5", "6"];

  const controls: Tool[] = [
    {
      type: "slider",
      id: "ideas",
      label: "Ideas per branch",
      detail: `About ${perBranch} now`,
      icon: "sliders",
      min: { label: "Fewer" },
      max: { label: "More" },
      steps,
      value: Math.min(steps.length - 1, Math.max(0, perBranch - 2)),
    },
    {
      type: "grid",
      id: "spread",
      label: "Spread",
      detail: "Where the next ideas should come from",
      icon: "grid",
      x: { low: "Practical", high: "Imaginative" },
      y: { low: "Focused", high: "Wide" },
      quadrants: ["Broad plan", "Blue sky", "Next steps", "Deep dive"],
      value: { x: 0.4, y: 0.6 },
    },
  ];

  const actions: Tool[] = [
    {
      type: "action",
      id: "expand",
      label: `Expand ${clip(thinnest.label, 14)}`,
      detail: `${plural(thinnest.children.length, "idea")} there; add a few more`,
      icon: "plus",
      place: "board",
    },
    {
      type: "action",
      id: "new-branch",
      label: "Suggest a branch",
      detail: `An angle on ${clip(topic, 32)} not covered yet`,
      icon: "sparkles",
      place: "board",
      // A blank branch lands at once; the model names it.
      apply: (d) => ({ ...d, branches: [...d.branches, { id: shellId("branch"), label: "New branch", children: [] }] }),
    },
    { type: "action", id: "themes", label: "Group into themes", detail: "Merge branches that say the same thing", icon: "list" },
    { type: "action", id: "outline", label: "Turn into a document", detail: "An outline with a section per branch", icon: "text" },
    { type: "toggle", id: "examples", label: "Add examples", detail: "Give each idea a concrete case", icon: "sparkles", value: false },
  ];
  return mix(controls, actions);
}

/** Events in date order; dates sort as text (a year, YYYY-MM or YYYY-MM-DD). */
const ordered = (data: ChartShellData) => [...data.events].sort((a, b) => a.date.localeCompare(b.date));
const yearOf = (date: string) => Number(date.slice(0, 4));

function timelineTools(data: ChartShellData): Tool[] {
  const topic = data.title.trim() || "this";
  const events = ordered(data);
  if (events.length === 0) {
    return [
      { type: "action", id: "draft", label: "Draft the timeline", detail: `The key moments in ${clip(topic, 40)}`, icon: "sparkles", place: "board" },
      { type: "action", id: "sources", label: "Research first", detail: "Find dated sources to build from", icon: "search" },
    ];
  }

  // The longest stretch with nothing in it.
  let gap = { from: events[0]!, to: events[0]!, years: 0 };
  for (let i = 1; i < events.length; i++) {
    const years = yearOf(events[i]!.date) - yearOf(events[i - 1]!.date);
    if (years > gap.years) gap = { from: events[i - 1]!, to: events[i]!, years };
  }
  const last = events.at(-1)!;
  const steps = ["Key moments", "Main events", "Everything"];

  const controls: Tool[] = [
    {
      type: "slider",
      id: "detail",
      label: "Detail",
      detail: `${plural(events.length, "event")} now`,
      icon: "sliders",
      min: { label: "Fewer" },
      max: { label: "More" },
      steps,
      value: events.length <= 4 ? 0 : events.length <= 9 ? 1 : 2,
    },
    {
      type: "choice",
      id: "focus",
      label: "Focus",
      detail: "What the events are about",
      icon: "grid",
      options: [
        { id: "events", label: "Events" },
        { id: "people", label: "People" },
        { id: "places", label: "Places" },
      ],
      value: "events",
    },
  ];

  const actions: Tool[] = [
    ...(gap.years > 1
      ? [
          {
            type: "action" as const,
            id: "gap",
            label: "Fill the gap",
            detail: `${gap.years} years between ${clip(gap.from.title, 20)} and ${clip(gap.to.title, 20)}`,
            icon: "calendar" as const,
            place: "board" as const,
          },
        ]
      : []),
    {
      type: "action",
      id: "next",
      label: "What came next",
      detail: `After ${clip(last.title, 40)}`,
      icon: "plus",
      place: "board",
    },
    { type: "action", id: "dates", label: "Check the dates", detail: `Confirm all ${events.length} against sources`, icon: "search" },
    { type: "toggle", id: "milestones", label: "Mark milestones", detail: "Pick out the turning points", icon: "check", value: false },
    { type: "action", id: "story", label: "Write it up", detail: "The timeline as a short history", icon: "text" },
  ];
  return mix(controls, actions);
}

function flowchartTools(data: ChartShellData): Tool[] {
  const topic = data.title.trim() || "this process";
  if (data.nodes.length === 0) {
    return [
      { type: "action", id: "draft", label: "Draft the flow", detail: `Steps and decisions for ${clip(topic, 40)}`, icon: "sparkles", place: "board" },
      { type: "action", id: "from-doc", label: "From a document", detail: "Map the steps in a process you paste in", icon: "text" },
    ];
  }

  const out = (node: FlowNode) => data.edges.filter((edge) => edge.from === node.id);
  // A decision needs two ways out; a step with none leads nowhere.
  const openDecision = data.nodes.find((node) => node.kind === "decision" && out(node).length < 2);
  const deadEnds = data.nodes.filter((node) => (node.kind === "step" || node.kind === "start") && out(node).length === 0);
  const steps = data.nodes.filter((node) => node.kind === "step" || node.kind === "decision").length;
  const detailSteps = ["Bigger steps", "As it is", "Smaller steps"];

  const controls: Tool[] = [
    {
      type: "slider",
      id: "granularity",
      label: "Detail",
      detail: `${plural(steps, "step")} and decisions now`,
      icon: "sliders",
      min: { label: "Fewer" },
      max: { label: "More" },
      steps: detailSteps,
      value: 1,
    },
    { type: "toggle", id: "owners", label: "Who does each", detail: "Name an owner on every step", icon: "users", value: false },
  ];

  const missing = openDecision ? (out(openDecision).some((edge) => /^yes$/i.test(edge.label ?? "")) ? "No" : "Yes") : null;
  const actions: Tool[] = [
    ...(openDecision && missing
      ? [
          {
            type: "action" as const,
            id: "close-decision",
            label: `Add the ${missing} path`,
            detail: `“${clip(openDecision.label, 40)}” has one way out`,
            icon: "plus" as const,
            place: "board" as const,
            apply: (d: ChartShellData) => {
              const end: FlowNode = { id: shellId("node"), kind: "end", label: missing === "No" ? "Stop" : "Continue" };
              return { ...d, nodes: [...d.nodes, end], edges: [...d.edges, { from: openDecision.id, to: end.id, label: missing }] };
            },
          },
        ]
      : []),
    ...(deadEnds.length
      ? [
          {
            type: "action" as const,
            id: "dead-ends",
            label: "Connect dead ends",
            detail: `${plural(deadEnds.length, "step")} lead nowhere: ${clip(deadEnds[0]!.label, 30)}`,
            icon: "check" as const,
            place: "board" as const,
          },
        ]
      : []),
    { type: "action", id: "approval", label: "Add an approval", detail: "A sign-off before the last step", icon: "user", place: "board" },
    { type: "action", id: "simplify", label: "Simplify", detail: "Merge steps that always follow each other", icon: "scissors" },
    { type: "action", id: "checklist", label: "Make a checklist", detail: "The main path as steps to tick off", icon: "list" },
  ];
  return mix(controls, actions);
}

export function diagramTools(data: ChartShellData): Tool[] {
  return data.type === "mindmap" ? mindmapTools(data) : data.type === "timeline" ? timelineTools(data) : flowchartTools(data);
}
