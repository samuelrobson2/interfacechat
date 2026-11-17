import { BarChart3, Gauge, Table2, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { AppBlockView } from "../apps/app-blocks";
import { columnsOf } from "../apps/app-query";
import type { AppBlock, AppShellData } from "../apps/app-types";
import type { AppRuntime } from "../apps/use-app-runtime";
import { shellId, type DocumentShellData } from "../model/shell-types";
import { fieldEvents, stopFieldEvent } from "../ui/shell-surface";

/**
 * A document's live pieces: stats, charts, tables, controls and code between
 * the prose (what Article was). The document keeps them in `blocks`, the data
 * they read in `datasets` and the values controls set in `variables`; a
 * `::id` line in the body places each one. They're drawn by the same block
 * views a dashboard uses, so a chart in a document is a dashboard's chart.
 */

/** The document's data and blocks in the shape the block views read. */
const NONE: never[] = [];
export function documentApp(data: DocumentShellData): AppShellData {
  return { title: data.title, datasets: data.datasets ?? NONE, variables: data.variables ?? NONE, blocks: data.blocks ?? NONE };
}

export type InsertKind = "stat" | "chart" | "table";

export const INSERT_KINDS: { kind: InsertKind; label: string; icon: LucideIcon }[] = [
  { kind: "stat", label: "Stat", icon: Gauge },
  { kind: "chart", label: "Chart", icon: BarChart3 },
  { kind: "table", label: "Table", icon: Table2 },
];

/**
 * A new block over the document's first dataset, set up from its columns so it
 * draws at once: a stat sums the first number, a chart puts it against the
 * first other column, a table shows everything. The model, or the block's own
 * menu, refines it.
 */
export function newEmbed(kind: InsertKind, data: DocumentShellData, datasetId?: string): AppBlock | null {
  const dataset = data.datasets?.find((d) => d.id === datasetId) ?? data.datasets?.[0];
  if (!dataset) return null;
  const columns = columnsOf(dataset.rows);
  const number = columns.find((c) => c.type === "number")?.name;
  const category = columns.find((c) => c.name !== number)?.name;
  const id = shellId(kind).replace(/[^a-z0-9-]/gi, "").toLowerCase();
  if (kind === "table") return { type: "table", id, dataset: dataset.id, title: dataset.label };
  if (!number) return null;
  if (kind === "stat") return { type: "stat", id, label: number, dataset: dataset.id, field: number, op: "sum" };
  const time = columns.find((c) => c.type === "date")?.name;
  const x = time ?? category ?? number;
  return { type: "chart", id, dataset: dataset.id, mark: time ? "line" : "bar", x, y: number, aggregate: "sum", title: `${number} by ${x}` };
}

/** What a block reads as in plain markdown (copy, download, previews): its words, or a note of what it is. */
export function embedMarkdown(block: AppBlock | undefined, id: string): string {
  if (!block) return "";
  switch (block.type) {
    case "text":
      return block.markdown;
    case "chart":
      return `[Chart: ${block.title ?? `${block.y} by ${block.x}`}]`;
    case "stat":
      return `[${block.label}]`;
    case "table":
      return `[Table: ${block.title ?? block.dataset}]`;
    case "control":
      return `[Control: ${block.variable}]`;
    case "code":
      return `\`\`\`js\n${block.source}\n\`\`\``;
    default:
      return `[${id}]`;
  }
}

/** A short name for a block, for the medium preview and inline summaries. */
export function embedLabel(block: AppBlock | undefined): string {
  if (!block) return "Missing block";
  switch (block.type) {
    case "chart":
      return block.title ?? `${block.y} by ${block.x}`;
    case "stat":
      return block.label;
    case "table":
      return block.title ?? "Table";
    case "control":
      return "Control";
    case "code":
      return block.title ?? "Code";
    case "text":
      return "Text";
  }
}

/** One live piece in the document: the block itself, with a way to take it out. */
export function DocumentEmbed({
  id,
  data,
  runtime,
  compact,
  onChange,
  onRemove,
}: {
  id: string;
  data: DocumentShellData;
  runtime: AppRuntime;
  compact: boolean;
  onChange?: (block: AppBlock) => void;
  onRemove?: () => void;
}) {
  const block = data.blocks?.find((b) => b.id === id);
  return (
    <figure
      data-embed={block?.type ?? "missing"}
      className={cn(
        "group/embed relative m-0",
        compact ? "mt-2" : "mt-5",
        block?.type === "control" && "rounded-[14px] bg-shell-fill px-4 py-3",
      )}
      {...fieldEvents}
    >
      {block ? (
        <AppBlockView block={block} data={documentApp(data)} runtime={runtime} onChange={onChange} />
      ) : (
        <div className="rounded-[10px] bg-shell-fill px-3 py-2 font-bureau text-[12px] text-typography-secondary">
          {`No block called “${id}”.`}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${embedLabel(block).toLowerCase()}`}
          title="Remove from the document"
          onMouseDown={(event) => {
            event.preventDefault();
            stopFieldEvent(event);
          }}
          onClick={(event) => {
            stopFieldEvent(event);
            onRemove();
          }}
          className="absolute top-1 right-1 grid size-6 cursor-pointer place-items-center rounded-full bg-shell-panel text-typography-secondary opacity-0 shadow-[0_1px_3px_rgba(26,23,24,0.14)] transition-opacity group-hover/embed:opacity-100 hover:text-typography-primary focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </figure>
  );
}
