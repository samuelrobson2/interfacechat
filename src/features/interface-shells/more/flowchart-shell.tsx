import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type FlowEdge, type FlowNode, type FlowchartShellData, type ShellProps } from "../model/shell-types";
import { FitBox, PreviewBody, PreviewHead, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const CYAN = "#17a9cf";
const NODE_W = 150;
const NODE_H = 46;
const DIAMOND = 96;
const COL = 190;
const ROW = 96;
const PAD = 24;

type Placed = FlowNode & { x: number; y: number; w: number; h: number };

/**
 * Lay the chart out top to bottom: each node one row below the deepest node
 * that leads to it; within a row, nodes sit under the parents they come from.
 */
function layout(nodes: FlowNode[], edges: FlowEdge[]) {
  const incoming = new Map<string, string[]>();
  for (const edge of edges) incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge.from]);
  const depth = new Map<string, number>();
  const depthOf = (id: string, seen = new Set<string>()): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const parents = incoming.get(id) ?? [];
    const d = parents.length ? Math.max(...parents.map((p) => depthOf(p, seen))) + 1 : 0;
    depth.set(id, d);
    return d;
  };
  nodes.forEach((n) => depthOf(n.id));
  const rows: FlowNode[][] = [];
  nodes.forEach((n) => (rows[depth.get(n.id)!] ??= []).push(n));
  const x = new Map<string, number>();
  rows.forEach((row) => {
    // Each node wants to sit under its parents; a decision's "Yes" leans left, "No" right.
    const wants = row.map((n, i) => {
      const parents = (incoming.get(n.id) ?? []).map((p) => x.get(p)).filter((v): v is number => v !== undefined);
      if (!parents.length) return { n, key: i - (row.length - 1) / 2 };
      const label = edges.find((e) => e.to === n.id)?.label;
      const nudge = label === "No" ? 0.5 : label === "Yes" ? -0.5 : 0;
      return { n, key: parents.reduce((a, b) => a + b, 0) / parents.length + nudge };
    });
    wants.sort((a, b) => a.key - b.key);
    // Push apart anything closer than one column, then re-centre on where they wanted to be.
    const at = wants.map((w) => w.key);
    for (let i = 1; i < at.length; i++) at[i] = Math.max(at[i]!, at[i - 1]! + 1);
    const shift = wants.reduce((sum, w) => sum + w.key, 0) / wants.length - at.reduce((a, b) => a + b, 0) / at.length;
    wants.forEach((w, i) => x.set(w.n.id, at[i]! + shift));
  });
  const xs = [...x.values()];
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;
  const placed: Placed[] = nodes.map((n) => {
    const w = n.kind === "decision" ? DIAMOND + 40 : NODE_W;
    const h = n.kind === "decision" ? DIAMOND * 0.72 : NODE_H;
    return { ...n, w, h, x: PAD + (x.get(n.id)! - minX) * COL + NODE_W / 2, y: PAD + depth.get(n.id)! * ROW + NODE_H / 2 };
  });
  return {
    placed,
    width: PAD * 2 + (maxX - minX) * COL + NODE_W,
    height: PAD * 2 + (rows.length - 1) * ROW + NODE_H + 10,
  };
}

const GHOST: FlowchartShellData = {
  title: "",
  nodes: [
    { id: "g1", kind: "start", label: "Start" },
    { id: "g2", kind: "step", label: "Step 1" },
    { id: "g3", kind: "decision", label: "Decision?" },
    { id: "g4", kind: "end", label: "Outcome 1" },
    { id: "g5", kind: "end", label: "Outcome 2" },
  ],
  edges: [
    { from: "g1", to: "g2" },
    { from: "g2", to: "g3" },
    { from: "g3", to: "g4", label: "Yes" },
    { from: "g3", to: "g5", label: "No" },
  ],
};

function Chart({
  data,
  ghost,
  labels,
  fit = "both",
  selected,
  onSelect,
  onRename,
}: {
  data: FlowchartShellData;
  ghost: boolean;
  labels: boolean;
  fit?: "both" | "width";
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onRename?: (id: string, label: string) => void;
}) {
  const { placed, width, height } = layout(data.nodes, data.edges);
  const byId = new Map(placed.map((p) => [p.id, p]));
  return (
    <FitBox width={width} height={height} fit={fit} className="size-full">
      <svg width={width} height={height} className="absolute inset-0" aria-hidden>
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10Z" fill={ghost ? "#c9c5c0" : "#9aa7b4"} />
          </marker>
        </defs>
        {data.edges.map((edge) => {
          const a = byId.get(edge.from);
          const b = byId.get(edge.to);
          if (!a || !b) return null;
          const y1 = a.y + a.h / 2;
          const y2 = b.y - b.h / 2 - 2;
          const mid = (y1 + y2) / 2;
          const d = a.x === b.x ? `M${a.x} ${y1} V${y2}` : `M${a.x} ${y1} V${mid} H${b.x} V${y2}`;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path d={d} fill="none" stroke={ghost ? "#d6d2cd" : "#b7c1cb"} strokeWidth={2} strokeDasharray={ghost ? "5 5" : undefined} markerEnd="url(#flow-arrow)" />
              {edge.label && labels && (
                <text x={(a.x + b.x) / 2 + (a.x === b.x ? 10 : 0)} y={mid - 5} textAnchor="middle" className="fill-[#6b7785] font-bureau text-[11px]">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {placed.map((node) => {
        const isSel = selected === node.id;
        const base = "absolute flex items-center justify-center text-center font-bureau text-[12px] leading-tight";
        const style = { left: node.x - node.w / 2, top: node.y - node.h / 2, width: node.w, height: node.h };
        const label = onRename ? (
          <input
            value={node.label}
            aria-label="Step"
            placeholder="Step"
            {...fieldEvents}
            onFocus={() => onSelect?.(node.id)}
            onKeyDown={stopFieldEvent}
            onChange={(event) => onRename(node.id, event.target.value)}
            className={cn("relative w-[84%] bg-transparent text-center outline-none", node.kind === "start" || node.kind === "end" ? "text-white placeholder:text-white/60" : "text-typography-primary")}
          />
        ) : (
          labels && <span className={cn("relative px-2", ghost && "font-light text-typography-secondary", !ghost && (node.kind === "start" || node.kind === "end") && "text-white")}>{node.label}</span>
        );
        const ring = isSel ? "ring-2 ring-offset-2 ring-[#17a9cf]" : "";
        if (node.kind === "decision") {
          return (
            <div key={node.id} className={base} style={style} onClick={(e) => { stopFieldEvent(e); onSelect?.(node.id); }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
                <polygon
                  points="50,2 98,50 50,98 2,50"
                  fill={ghost ? "#fff" : "#e6f6fb"}
                  stroke={isSel ? CYAN : ghost ? "#d6d2cd" : "#8fd3e6"}
                  strokeWidth={isSel ? 3 : 2}
                  strokeDasharray={ghost ? "5 5" : undefined}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              </svg>
              {label}
            </div>
          );
        }
        const terminal = node.kind === "start" || node.kind === "end";
        return (
          <div
            key={node.id}
            className={cn(
              base,
              terminal ? "rounded-full" : "rounded-[10px]",
              ghost ? "border-2 border-dashed border-gray-3/50 bg-white" : terminal ? "text-white" : "bg-white shadow-[0_1px_3px_rgba(26,23,24,0.12)] ring-1 ring-gray-3/20",
              ring,
            )}
            style={{ ...style, backgroundColor: !ghost && terminal ? CYAN : undefined }}
            onClick={(e) => { stopFieldEvent(e); onSelect?.(node.id); }}
          >
            {label}
          </div>
        );
      })}
    </FitBox>
  );
}

export function FlowchartShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<FlowchartShellData>) {
  const [selected, setSelected] = useState<string | null>(null);

  if (size === "small") return <ShellAppIcon kind="flowchart" className={className} />;

  const ghost = data.nodes.length === 0;
  const shown = ghost ? GHOST : data;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="flowchart" title={data.title} />
        <PreviewBody>
          <Chart data={shown} ghost={ghost} labels={ghost} />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<FlowchartShellData>) => onChange({ ...data, ...patch }) : undefined;
  const rename = update && ((id: string, label: string) => update({ nodes: data.nodes.map((n) => (n.id === id ? { ...n, label } : n)) }));

  // Insert after the selected node, taking over its outgoing paths.
  const addAfter = (kind: "step" | "decision") => {
    if (!update) return;
    if (data.nodes.length === 0) {
      const start = { id: shellId("n"), kind: "start" as const, label: "Start" };
      update({ nodes: [start], edges: [] });
      setSelected(start.id);
      return;
    }
    const from = selected ?? data.nodes.at(-1)!.id;
    const node: FlowNode = { id: shellId("n"), kind, label: kind === "decision" ? "Decision?" : "New step" };
    const outgoing = data.edges.filter((e) => e.from === from);
    const kept = data.edges.filter((e) => e.from !== from);
    const nodes = [...data.nodes, node];
    const edges = [...kept, { from, to: node.id }, ...outgoing.map((e) => ({ ...e, from: node.id, label: kind === "decision" ? "Yes" : e.label }))];
    if (kind === "decision") {
      const no: FlowNode = { id: shellId("n"), kind: "end", label: "Otherwise" };
      nodes.push(no);
      edges.push({ from: node.id, to: no.id, label: "No" });
      if (outgoing.length === 0) {
        const yes: FlowNode = { id: shellId("n"), kind: "end", label: "Done" };
        nodes.push(yes);
        edges.push({ from: node.id, to: yes.id, label: "Yes" });
      }
    }
    update({ nodes, edges });
    setSelected(node.id);
  };
  const remove = () => {
    if (!update || !selected) return;
    const into = data.edges.filter((e) => e.to === selected);
    const out = data.edges.filter((e) => e.from === selected);
    // Reconnect around a removed step so the chart stays joined.
    const bridged = into.flatMap((i) => out.slice(0, 1).map((o) => ({ from: i.from, to: o.to, label: i.label })));
    update({
      nodes: data.nodes.filter((n) => n.id !== selected),
      edges: [...data.edges.filter((e) => e.from !== selected && e.to !== selected), ...bridged],
    });
    setSelected(null);
  };

  const action = (label: string, onPress: () => void, disabled = false) => (
    <button
      type="button"
      disabled={disabled}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn("rounded-full bg-gray-6 font-bureau text-typography-primary transition-colors hover:bg-gray-5/60 disabled:opacity-40", large ? "px-3 py-1 text-[12px]" : "px-2 py-0.5 text-[10px]")}
    >
      {label}
    </button>
  );

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="flowchart" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
      {update && (
        <div className={cn("flex flex-wrap items-center gap-1.5", large ? "px-6 pt-3" : "px-4 pt-2")}>
          {action(ghost ? "Start" : "Add a step", () => addAfter("step"))}
          {!ghost && action("Add a decision", () => addAfter("decision"))}
          {!ghost && action("Remove", remove, !selected)}
          {large && !ghost && (
            <span className="font-bureau text-[11px] text-typography-secondary">
              {selected ? "Adds after the selected step." : "Click a step to select it."}
            </span>
          )}
        </div>
      )}
      <div
        className={cn("min-h-0 flex-1", large ? "px-6 pt-2 pb-6" : "px-3 pt-1 pb-1")}
        onClick={() => setSelected(null)}
      >
        <Chart data={shown} ghost={ghost} labels fit={large ? "width" : "both"} selected={selected} onSelect={setSelected} onRename={!ghost ? rename : undefined} />
      </div>
      {!large && <ShellDetail>{data.nodes.length ? `${data.nodes.length} steps` : null}</ShellDetail>}
    </ShellSurface>
  );
}
