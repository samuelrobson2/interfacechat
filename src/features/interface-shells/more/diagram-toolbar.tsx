import { Code, Copy, Download, Paintbrush } from "lucide-react";
import { createContext, useContext } from "react";
import { CHART_TYPE_META } from "../model/chart";
import { CHART_TYPES, type ChartShellData, type MindmapNode } from "../model/shell-types";
import { ChartTypeGlyph } from "../ui/shell-icons";
import {
  copyText,
  downloadText,
  fileNameOf,
  ShellToolbar,
  ShellToolButton,
  ShellToolDivider,
  ShellToolMenu,
} from "../ui/shell-toolbar";

/* ── Exports: the diagram as an outline or as Mermaid ─────────────────── */

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

function mindmapOutline(nodes: MindmapNode[], depth = 0): string[] {
  return nodes.flatMap((node) => [`${"  ".repeat(depth)}- ${clean(node.label)}`, ...mindmapOutline(node.children, depth + 1)]);
}

/** The diagram as Markdown: nested bullets, a dated list, or numbered steps with their paths. */
export function diagramOutline(data: ChartShellData): string {
  const title = data.title.trim() ? `# ${data.title.trim()}\n\n` : "";
  if (data.type === "mindmap") return title + mindmapOutline(data.branches).join("\n");
  if (data.type === "timeline")
    return (
      title +
      [...data.events]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((event) => `- **${event.date}** ${clean(event.title)}${event.detail ? `: ${clean(event.detail)}` : ""}`)
        .join("\n")
    );
  const name = new Map(data.nodes.map((node) => [node.id, clean(node.label)]));
  return (
    title +
    data.nodes
      .map((node, i) => {
        const out = data.edges
          .filter((edge) => edge.from === node.id)
          .map((edge) => `${edge.label ? `${edge.label}: ` : ""}${name.get(edge.to) ?? "?"}`);
        return `${i + 1}. ${clean(node.label)}${node.kind === "decision" ? "?" : ""}${out.length ? ` → ${out.join("; ")}` : ""}`;
      })
      .join("\n")
  );
}

/** The diagram as Mermaid, which GitHub, Notion and most docs tools draw. */
export function diagramMermaid(data: ChartShellData): string {
  const quote = (text: string) => clean(text).replace(/["()[\]{}]/g, "");
  if (data.type === "mindmap") {
    const walk = (nodes: MindmapNode[], depth: number): string[] =>
      nodes.flatMap((node) => [`${"  ".repeat(depth)}${quote(node.label)}`, ...walk(node.children, depth + 1)]);
    return ["mindmap", `  root((${quote(data.title || "Topic")}))`, ...walk(data.branches, 2)].join("\n");
  }
  if (data.type === "timeline") {
    return [
      "timeline",
      ...(data.title ? [`  title ${quote(data.title)}`] : []),
      ...[...data.events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => `  ${quote(event.date)} : ${quote(event.title)}`),
    ].join("\n");
  }
  const id = (raw: string) => raw.replace(/[^a-zA-Z0-9_]/g, "_");
  const shape = (node: ChartShellData["nodes"][number]) =>
    node.kind === "decision" ? `{"${quote(node.label)}"}` : node.kind === "step" ? `["${quote(node.label)}"]` : `(["${quote(node.label)}"])`;
  return [
    "flowchart TD",
    ...data.nodes.map((node) => `  ${id(node.id)}${shape(node)}`),
    ...data.edges.map((edge) => `  ${id(edge.from)} -->${edge.label ? `|${quote(edge.label)}|` : ""} ${id(edge.to)}`),
  ].join("\n");
}

/** Every item back on its default colour. */
function withoutColours(data: ChartShellData): ChartShellData {
  const strip = (nodes: MindmapNode[]): MindmapNode[] =>
    nodes.map((node) => ({ ...node, colour: undefined, children: strip(node.children) }));
  return {
    ...data,
    branches: strip(data.branches),
    events: data.events.map((event) => ({ ...event, colour: undefined })),
    nodes: data.nodes.map((node) => ({ ...node, colour: undefined })),
  };
}

const hasColours = (data: ChartShellData) => {
  const any = (nodes: MindmapNode[]): boolean => nodes.some((node) => node.colour || any(node.children));
  if (data.type === "mindmap") return any(data.branches);
  if (data.type === "timeline") return data.events.some((event) => event.colour);
  return data.nodes.some((node) => node.colour);
};

const isEmpty = (data: ChartShellData) =>
  data.type === "mindmap" ? data.branches.length === 0 : data.type === "timeline" ? data.events.length === 0 : data.nodes.length === 0;

/* ── The toolbar ──────────────────────────────────────────────────────── */

/**
 * Diagram's standard tools, provided by `ChartShell` and drawn by whichever
 * type is showing, under its title. The board's own bar (select, hand, add,
 * zoom) stays at the bottom, as in FigJam.
 */
export const DiagramToolsContext = createContext<React.ReactNode>(null);

export function DiagramTools({ data, onChange }: { data: ChartShellData; onChange?: (data: ChartShellData) => void }) {
  const empty = isEmpty(data);
  return (
    <>
      <ShellToolMenu
        label="Diagram type"
        icon={<ChartTypeGlyph type={data.type} className="size-4" />}
        text={CHART_TYPE_META[data.type].label}
        disabled={!onChange}
        items={CHART_TYPES.map((type) => ({
          id: type,
          label: CHART_TYPE_META[type].label,
          icon: <ChartTypeGlyph type={type} className="size-4" />,
          checked: type === data.type,
          onSelect: () => onChange?.({ ...data, type }),
        }))}
      />
      <ShellToolButton label="Reset colours" disabled={!onChange || !hasColours(data)} onPress={() => onChange?.(withoutColours(data))}>
        <Paintbrush />
      </ShellToolButton>
      <ShellToolDivider />
      <ShellToolButton label="Copy as an outline" disabled={empty} onPress={() => copyText(diagramOutline(data))}>
        <Copy />
      </ShellToolButton>
      <ShellToolButton label="Copy as Mermaid" disabled={empty} onPress={() => copyText(diagramMermaid(data))}>
        <Code />
      </ShellToolButton>
      <ShellToolButton
        label="Download (.md)"
        disabled={empty}
        onPress={() =>
          downloadText(
            `${fileNameOf(data.title, "diagram")}.md`,
            `${diagramOutline(data)}\n\n\`\`\`mermaid\n${diagramMermaid(data)}\n\`\`\`\n`,
            "text/markdown",
          )
        }
      >
        <Download />
      </ShellToolButton>
    </>
  );
}

/** The toolbar row each diagram type puts under its large title. */
export function DiagramToolbar({ tools, actions }: { tools?: React.ReactNode; actions?: React.ReactNode }) {
  const standard = useContext(DiagramToolsContext);
  return (
    <ShellToolbar tools={tools} actions={actions}>
      {standard}
    </ShellToolbar>
  );
}
