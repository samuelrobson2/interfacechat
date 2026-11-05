import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type MindmapNode, type MindmapShellData, type ShellProps } from "../model/shell-types";
import { ghostLabels } from "../ui/shell-accents";
import { AddChip } from "../ui/shell-fields";
import { FitBox, PreviewBody, PreviewHead, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const PURPLE = "#a45cf0";
/** One colour per branch, so its ideas read as a group. */
const BRANCH = ["#a45cf0", "#17a9cf", "#e956a1", "#6fa63a", "#f0a23a", "#4565e6"];

const W = 760;
const H = 440;
const CX = W / 2;
const CY = H / 2;

type Spot = { id: string; label: string; x: number; y: number; colour: string; level: 0 | 1 | 2; branch?: string };

function layout(data: MindmapShellData, ghost: boolean): { spots: Spot[]; lines: [Spot, Spot][] } {
  const branches: MindmapNode[] = ghost
    ? ghostLabels("Idea", 4).map((label, i) => ({ id: `g${i}`, label, children: [] }))
    : data.branches;
  const centre: Spot = { id: "centre", label: data.title || "Topic", x: CX, y: CY, colour: PURPLE, level: 0 };
  const spots: Spot[] = [centre];
  const lines: [Spot, Spot][] = [];
  branches.forEach((branch, i) => {
    const angle = (i / Math.max(1, branches.length)) * Math.PI * 2 - Math.PI / 2 + (branches.length % 2 ? 0 : Math.PI / branches.length);
    const colour = BRANCH[i % BRANCH.length]!;
    const b: Spot = { id: branch.id, label: branch.label, x: CX + Math.cos(angle) * 195, y: CY + Math.sin(angle) * 118, colour, level: 1 };
    spots.push(b);
    lines.push([centre, b]);
    const n = branch.children.length;
    branch.children.forEach((child, j) => {
      const spread = n > 1 ? (j / (n - 1) - 0.5) * 0.9 : 0;
      const a = angle + spread;
      const c: Spot = {
        id: child.id,
        label: child.label,
        x: Math.max(70, Math.min(W - 70, CX + Math.cos(a) * 320)),
        y: Math.max(24, Math.min(H - 24, CY + Math.sin(a) * 190)),
        colour,
        level: 2,
        branch: branch.id,
      };
      spots.push(c);
      lines.push([b, c]);
    });
  });
  return { spots, lines };
}

function MindTree({
  data,
  ghost,
  labels,
  selected,
  onSelect,
  onRename,
}: {
  data: MindmapShellData;
  ghost: boolean;
  labels: boolean;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onRename?: (id: string, label: string) => void;
}) {
  const { spots, lines } = layout(data, ghost);
  return (
    <FitBox width={W} height={H} className="size-full">
      <svg width={W} height={H} className="absolute inset-0" aria-hidden>
        {lines.map(([a, b]) => {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - (b.level === 1 ? 14 : 0);
          return (
            <path
              key={`${a.id}-${b.id}`}
              d={`M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              fill="none"
              stroke={ghost ? "#d6d2cd" : b.colour}
              strokeOpacity={ghost ? 1 : b.level === 1 ? 0.55 : 0.35}
              strokeWidth={b.level === 1 ? 4 : 2}
              strokeDasharray={ghost ? "6 6" : undefined}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {spots.map((spot) => {
        const isSel = selected === spot.id;
        const text =
          onRename && !ghost ? (
            <input
              value={spot.label}
              aria-label={spot.level === 0 ? "Centre" : spot.level === 1 ? "Branch" : "Idea"}
              placeholder={spot.level === 1 ? "Branch" : "Idea"}
              size={Math.max(4, spot.label.length)}
              {...fieldEvents}
              onFocus={() => onSelect?.(spot.id)}
              onKeyDown={stopFieldEvent}
              onChange={(event) => onRename(spot.id, event.target.value)}
              className="bg-transparent text-center outline-none placeholder:text-current/50"
            />
          ) : (
            labels && <span>{spot.label}</span>
          );
        return (
          <div
            key={spot.id}
            onClick={(event) => {
              stopFieldEvent(event);
              onSelect?.(spot.id);
            }}
            className={cn(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bureau whitespace-nowrap",
              spot.level === 0 && "min-h-14 min-w-28 px-5 text-[16px] text-white shadow-[0_4px_14px_rgba(164,92,240,0.35)]",
              spot.level === 1 && "min-h-9 min-w-16 px-3.5 text-[13px]",
              spot.level === 2 && "min-h-7 px-2.5 text-[11px] text-typography-primary ring-1",
              ghost && "border-2 border-dashed border-gray-3/50 bg-white font-light text-typography-secondary shadow-none ring-0",
              isSel && "ring-2 ring-offset-2",
            )}
            style={{
              left: spot.x,
              top: spot.y,
              ...(ghost
                ? spot.level === 0
                  ? { backgroundColor: "#fff", color: "#8a8580" }
                  : undefined
                : spot.level === 0
                  ? { backgroundColor: PURPLE }
                  : spot.level === 1
                    ? { backgroundColor: `${spot.colour}22`, color: spot.colour, boxShadow: isSel ? `0 0 0 2px ${spot.colour}` : undefined }
                    : { backgroundColor: "#fff", ["--tw-ring-color" as string]: `${spot.colour}55` }),
            }}
          >
            {text}
          </div>
        );
      })}
    </FitBox>
  );
}

/** Find a node anywhere in the tree and change it. */
function mapTree(branches: MindmapNode[], id: string, change: (node: MindmapNode) => MindmapNode | null): MindmapNode[] {
  return branches.flatMap((branch) => {
    if (branch.id === id) {
      const next = change(branch);
      return next ? [next] : [];
    }
    return [{ ...branch, children: mapTree(branch.children, id, change) }];
  });
}

export function MindmapShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<MindmapShellData>) {
  const [selected, setSelected] = useState<string | null>(null);

  if (size === "small") return <ShellAppIcon kind="mindmap" className={className} />;

  const ghost = data.branches.length === 0;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="mindmap" title={data.title} />
        <PreviewBody>
          <MindTree data={data} ghost={ghost} labels={ghost} />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<MindmapShellData>) => onChange({ ...data, ...patch }) : undefined;
  const rename =
    update &&
    ((id: string, label: string) =>
      id === "centre" ? update({ title: label }) : update({ branches: mapTree(data.branches, id, (n) => ({ ...n, label })) }));
  const addBranch = (label = "New branch") => {
    const node = { id: shellId("br"), label, children: [] };
    update?.({ branches: [...data.branches, node] });
    setSelected(node.id);
  };
  // An idea goes on the selected branch, or on the branch of the selected idea.
  const owner = data.branches.find((b) => b.id === selected || b.children.some((c) => c.id === selected));
  const addIdea = () => {
    if (!owner) return;
    const idea = { id: shellId("idea"), label: "New idea", children: [] };
    update?.({ branches: data.branches.map((b) => (b.id === owner.id ? { ...b, children: [...b.children, idea] } : b)) });
    setSelected(idea.id);
  };
  const remove = () => {
    if (!selected || selected === "centre") return;
    update?.({ branches: mapTree(data.branches, selected, () => null) });
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
      className="rounded-full bg-gray-6 px-3 py-1 font-bureau text-[12px] text-typography-primary hover:bg-gray-5/60 disabled:opacity-40"
    >
      {label}
    </button>
  );

  const ideas = data.branches.reduce((sum, b) => sum + b.children.length, 0);

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="mindmap" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
      {update && large && (
        <div className="flex flex-wrap items-center gap-1.5 px-6 pt-3">
          {action("Add a branch", () => addBranch())}
          {action("Add an idea", addIdea, !owner)}
          {action("Remove", remove, !selected || selected === "centre")}
          <span className="font-bureau text-[11px] text-typography-secondary">
            {owner ? `Ideas go on “${owner.label}”.` : "Select a branch to add ideas to it."}
          </span>
        </div>
      )}
      {update && !large && (
        <div className="px-4 pt-2">
          <AddChip size="sm" placeholder="Branch name" onSubmitValue={(label) => addBranch(label)}>
            Add a branch
          </AddChip>
        </div>
      )}
      <div className={cn("min-h-0 flex-1", large ? "px-6 pt-2 pb-6" : "px-2 pb-1")} onClick={() => setSelected(null)}>
        <MindTree data={data} ghost={ghost} labels selected={selected} onSelect={setSelected} onRename={large ? rename : undefined} />
      </div>
      {!large && (
        <ShellDetail>
          {data.branches.length ? `${data.branches.length} branches · ${ideas} ideas` : null}
        </ShellDetail>
      )}
    </ShellSurface>
  );
}
