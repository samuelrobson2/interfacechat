import { CirclePlus, GitBranchPlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type MindmapNode, type MindmapShellData, type ShellColour, type ShellProps } from "../model/shell-types";
import { CanvasBoard, canvasColour, SelectionBar, tint } from "../ui/canvas-board";
import { ghostLabels } from "../ui/shell-accents";
import { AddChip } from "../ui/shell-fields";
import { CONTENT_PANEL, FitBox, PreviewBody, PreviewHead, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const PURPLE = "#a45cf0";
/** One colour per branch, so its ideas read as a group, until the person picks one. */
const BRANCH = ["#a45cf0", "#17a9cf", "#e956a1", "#6fa63a", "#f0a23a", "#4565e6"];

const W = 760;
const H = 440;
const CX = W / 2;
const CY = H / 2;

/** Half the height of each level's pill, for placing the selection bar above it. */
const HALF_HEIGHT = { 0: 28, 1: 18, 2: 14 } as const;

type Spot = {
  id: string;
  label: string;
  x: number;
  y: number;
  colour: string;
  token?: ShellColour;
  level: 0 | 1 | 2;
  branch?: string;
};

function layout(data: MindmapShellData, ghost: boolean): { spots: Spot[]; lines: [Spot, Spot][] } {
  const branches: MindmapNode[] = ghost
    ? ghostLabels("Idea", 4).map((label, i) => ({ id: `g${i}`, label, children: [] }))
    : data.branches;
  const centre: Spot = { id: "centre", label: data.title || "Topic", x: CX, y: CY, colour: PURPLE, level: 0 };
  const spots: Spot[] = [centre];
  const lines: [Spot, Spot][] = [];
  branches.forEach((branch, i) => {
    const angle = (i / Math.max(1, branches.length)) * Math.PI * 2 - Math.PI / 2 + (branches.length % 2 ? 0 : Math.PI / branches.length);
    const colour = branch.colour ? canvasColour(branch.colour) : BRANCH[i % BRANCH.length]!;
    const b: Spot = {
      id: branch.id,
      label: branch.label,
      x: CX + Math.cos(angle) * 195,
      y: CY + Math.sin(angle) * 118,
      colour,
      token: branch.colour,
      level: 1,
    };
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
        colour: child.colour ? canvasColour(child.colour) : colour,
        token: child.colour,
        level: 2,
        branch: branch.id,
      };
      spots.push(c);
      lines.push([b, c]);
    });
  });
  return { spots, lines };
}

/** The map at its own size; medium sizes fit it into the card, large puts it on a board. */
function MindScene({
  data,
  ghost,
  labels,
  selected,
  onSelect,
  onRename,
  onTab,
}: {
  data: MindmapShellData;
  ghost: boolean;
  labels: boolean;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onRename?: (id: string, label: string) => void;
  /** Tab in a label adds a child, as in FigJam. */
  onTab?: (id: string) => void;
}) {
  const { spots, lines } = layout(data, ghost);
  return (
    <>
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
              onKeyDown={(event) => {
                stopFieldEvent(event);
                if (event.key === "Tab" && onTab && spot.level < 2) {
                  event.preventDefault();
                  onTab(spot.id);
                }
                if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
              }}
              onChange={(event) => onRename(spot.id, event.target.value)}
              className="bg-transparent text-center outline-none placeholder:text-current/50"
            />
          ) : (
            labels && <span>{spot.label}</span>
          );
        return (
          <div
            key={spot.id}
            data-canvas-item
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
              onSelect && "cursor-pointer",
              isSel && spot.level !== 1 && "ring-2 ring-offset-2",
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
                    ? { backgroundColor: tint(spot.colour, 13), color: spot.colour, boxShadow: isSel ? `0 0 0 2px ${spot.colour}` : undefined }
                    : { backgroundColor: "#fff", ["--tw-ring-color" as string]: isSel ? spot.colour : tint(spot.colour, 33) }),
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
}

/**
 * Medium: a mind map drawn for the tile's size, in grey, with no words. A
 * filled map tints its branches; an empty one is all grey.
 */
function MindPreview({ data }: { data: MindmapShellData }) {
  const grey = "var(--color-gray-3)";
  const branches = data.branches.length
    ? data.branches.slice(0, 4).map((b, i) => ({ colour: b.colour ? canvasColour(b.colour) : BRANCH[i % BRANCH.length]!, leaves: Math.min(2, b.children.length) }))
    : [0, 1, 2, 3].map(() => ({ colour: grey, leaves: 2 }));
  // Pills are drawn on white first, so lines never show through them.
  const pill = (key: string, x: number, y: number, w: number, h: number, colour: string, opacity: number) => (
    <g key={key}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="#fff" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={colour} fillOpacity={opacity} />
    </g>
  );
  const spots = [
    { x: 46, y: 28, dx: -1 },
    { x: 114, y: 28, dx: 1 },
    { x: 46, y: 82, dx: -1 },
    { x: 114, y: 82, dx: 1 },
  ];
  const leavesOf = (at: (typeof spots)[number], count: number) =>
    [-9, 9].slice(0, count).map((offset) => ({ x: at.x + at.dx * 30, y: at.y + offset }));
  return (
    <svg viewBox="0 0 160 110" className="size-full" aria-hidden>
      {/* Lines first, then every pill over them. */}
      {branches.map((branch, i) => {
        const at = spots[i]!;
        return (
          <g key={i} stroke={branch.colour} fill="none" strokeLinecap="round">
            <path d={`M80 55 Q ${(80 + at.x) / 2} ${at.y} ${at.x} ${at.y}`} strokeOpacity={0.45} strokeWidth={2.5} />
            {leavesOf(at, branch.leaves).map((leaf, j) => (
              <path key={j} d={`M${at.x} ${at.y} Q ${(at.x + leaf.x) / 2} ${leaf.y} ${leaf.x} ${leaf.y}`} strokeOpacity={0.35} strokeWidth={1.2} />
            ))}
          </g>
        );
      })}
      {branches.map((branch, i) => {
        const at = spots[i]!;
        return (
          <g key={i}>
            {leavesOf(at, branch.leaves).map((leaf, j) => pill(`l${j}`, leaf.x, leaf.y, 20, 7, branch.colour, 0.18))}
            {pill("b", at.x, at.y, 28, 11, branch.colour, 0.32)}
          </g>
        );
      })}
      {pill("c", 80, 55, 42, 17, data.branches.length ? PURPLE : grey, data.branches.length ? 0.85 : 0.5)}
    </svg>
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
        <PreviewBody className="items-center justify-center">
          <MindPreview data={data} />
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
  const ownerOf = (id: string | null) => data.branches.find((b) => b.id === id || b.children.some((c) => c.id === id));
  const owner = ownerOf(selected);
  const addIdea = (branchId = owner?.id) => {
    if (!branchId) return;
    const idea = { id: shellId("idea"), label: "New idea", children: [] };
    update?.({ branches: data.branches.map((b) => (b.id === branchId ? { ...b, children: [...b.children, idea] } : b)) });
    setSelected(idea.id);
  };
  const remove = () => {
    if (!selected || selected === "centre") return;
    update?.({ branches: mapTree(data.branches, selected, () => null) });
    setSelected(null);
  };
  const recolour = (colour: ShellColour) =>
    selected && selected !== "centre" && update?.({ branches: mapTree(data.branches, selected, (n) => ({ ...n, colour })) });

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle kind="mindmap" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
        {update && (
          <div className="px-4 pt-2">
            <AddChip size="sm" placeholder="Branch name" onSubmitValue={(label) => addBranch(label)}>
              Add a branch
            </AddChip>
          </div>
        )}
        <div className={cn("mx-2.5 mt-2 mb-2.5 min-h-0 flex-1 p-1", CONTENT_PANEL)}>
          <FitBox width={W} height={H} className="size-full">
            <MindScene data={data} ghost={ghost} labels />
          </FitBox>
        </div>
      </ShellSurface>
    );
  }

  const spot = selected ? layout(data, ghost).spots.find((s) => s.id === selected) : undefined;
  const bar = spot && (
    <SelectionBar>
      {spot.level > 0 && (
        <>
          <SelectionBar.Colours value={spot.token} onChange={recolour} />
          <SelectionBar.Divider />
        </>
      )}
      {spot.level === 0 && <SelectionBar.Button icon={GitBranchPlus} label="Add a branch (Tab)" onClick={() => addBranch()} />}
      {spot.level === 1 && <SelectionBar.Button icon={CirclePlus} label="Add an idea (Tab)" onClick={() => addIdea(spot.id)} />}
      {spot.level > 0 && <SelectionBar.Delete onClick={remove} />}
    </SelectionBar>
  );

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="mindmap" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
      <CanvasBoard
        width={W}
        height={H}
        editable={Boolean(update)}
        className="mx-4 mb-4 mt-2 rounded-[14px]"
        tools={[
          { id: "branch", icon: GitBranchPlus, label: "Add a branch", onClick: () => addBranch() },
          { id: "idea", icon: CirclePlus, label: "Add an idea to the selected branch", onClick: () => addIdea(), disabled: !owner },
        ]}
        selection={spot && !ghost ? { x: spot.x, y: spot.y - HALF_HEIGHT[spot.level], bar } : null}
        onClearSelection={() => setSelected(null)}
        onDelete={remove}
      >
        <MindScene
          data={data}
          ghost={ghost}
          labels
          selected={selected}
          onSelect={update && !ghost ? setSelected : undefined}
          onRename={update ? rename : undefined}
          onTab={update && ((id) => (id === "centre" ? addBranch() : addIdea(id)))}
        />
      </CanvasBoard>
    </ShellSurface>
  );
}
