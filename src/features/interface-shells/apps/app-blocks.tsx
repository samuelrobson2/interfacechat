import { Code2, EyeOff, Loader2, Play, TriangleAlert } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import type { TopLevelSpec } from "vega-lite";
import { VegaChart } from "@/services/plot";
import { cn } from "@/shared/lib/css";
import { numberedIndices, parseBlocks, parseInline } from "../model/markdown-blocks";
import { AutoTextarea, fieldEvents, stopFieldEvent } from "../ui/shell-surface";
import { ALL, aggregate, columnsOf, distinct, interpolate, missingFields, runQuery } from "./app-query";
import { CodeSandbox, type SandboxStatus } from "./app-sandbox";
import type { AppBlock, AppBlockOf, AppShellData, Row, Variable } from "./app-types";
import type { AppRuntime } from "./use-app-runtime";

type BlockProps<T extends AppBlock["type"]> = {
  data: AppShellData;
  runtime: AppRuntime;
  /** Absent when read-only. */
  onChange?: (block: AppBlockOf<T>) => void;
};

/** A quiet line where a block can't draw, naming what's wrong. */
function BlockNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-[10px] bg-gray-6 px-3 py-2 font-bureau text-[12px] text-typography-secondary">
      <TriangleAlert className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** A block's dataset and its rows under the block's query, or what stops it drawing. */
function useBlockRows(
  data: AppShellData,
  runtime: AppRuntime,
  datasetId: string,
  query: Parameters<typeof runQuery>[1],
  fields: (string | undefined)[],
) {
  const dataset = data.datasets.find((d) => d.id === datasetId);
  const all = runtime.rowsOf(datasetId);
  const rows = useMemo(() => runQuery(all, query, runtime.values), [all, query, runtime.values]);
  const missing = missingFields(dataset, all, fields);
  const problem = !dataset
    ? `No dataset called “${datasetId}”.`
    : missing.length
      ? `${dataset.label} has no ${missing.map((m) => `“${m}”`).join(" or ")} column. Pick another, or map the columns.`
      : all.length === 0
        ? dataset.source.type === "code"
          ? `Waiting for the code that makes ${dataset.label}.`
          : `${dataset.label} has no rows yet.`
        : null;
  return { dataset, rows, problem };
}

/* ── Text ─────────────────────────────────────────────────────────────── */

const MD_TEXT: Record<string, string> = {
  heading1: "text-[24px] leading-[1.3] tracking-[-0.2px] text-typography-primary",
  heading2: "text-[18px] leading-[1.4] text-typography-primary",
  paragraph: "text-[15px] leading-[1.6] text-typography-primary",
  bullet: "text-[15px] leading-[1.6] text-typography-primary",
  numbered: "text-[15px] leading-[1.6] text-typography-primary",
  quote: "border-l-2 border-gray-3/30 pl-4 text-[15px] leading-[1.6] text-typography-secondary",
};

export function MarkdownView({ markdown, className }: { markdown: string; className?: string }) {
  const blocks = parseBlocks(markdown);
  const numbers = numberedIndices(blocks);
  return (
    <div className={cn("flex flex-col gap-2.5 font-bureau font-light", className)}>
      {blocks.map((block) => {
        return (
          <div key={block.id} className={cn("flex gap-2", MD_TEXT[block.type])}>
            {block.type === "bullet" && <span aria-hidden>•</span>}
            {block.type === "numbered" && <span className="tabular-nums">{numbers.get(block.id)}.</span>}
            <span className="min-w-0">
              {parseInline(block.text).map((segment, index) => (
                <Fragment key={index}>
                  {segment.bold ? (
                    <strong className="font-normal">{segment.text}</strong>
                  ) : segment.italic ? (
                    <em>{segment.text}</em>
                  ) : segment.strike ? (
                    <s>{segment.text}</s>
                  ) : segment.code ? (
                    <code className="rounded-[4px] bg-gray-6 px-1 font-mono text-[0.9em]">{segment.text}</code>
                  ) : segment.href ? (
                    <a href={segment.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      {segment.text}
                    </a>
                  ) : (
                    segment.text
                  )}
                </Fragment>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Prose with live {{variables}}; click to edit the markdown underneath. */
export function TextBlock({ block, data, runtime, onChange }: BlockProps<"text"> & { block: AppBlockOf<"text"> }) {
  const [editing, setEditing] = useState(false);
  if (editing && onChange) {
    return (
      <AutoTextarea
        autoFocus
        value={block.markdown}
        aria-label="Text"
        {...fieldEvents}
        onChange={(event) => onChange({ ...block, markdown: event.target.value })}
        onBlur={() => setEditing(false)}
        onKeyDown={(event) => {
          stopFieldEvent(event);
          if (event.key === "Escape") setEditing(false);
        }}
        className="w-full rounded-[10px] bg-gray-6 px-3 py-2 font-mono text-[13px] leading-[1.55] text-typography-primary outline-none"
      />
    );
  }
  return (
    <div
      onClick={onChange ? () => setEditing(true) : undefined}
      className={cn(onChange && "-mx-2 cursor-text rounded-[10px] px-2 py-1 transition-colors hover:bg-gray-6/60")}
    >
      <MarkdownView markdown={interpolate(block.markdown, data.variables, runtime.values)} />
    </div>
  );
}

/* ── Stat ─────────────────────────────────────────────────────────────── */

function formatValue(value: number | null, format: AppBlockOf<"stat">["format"]) {
  if (value === null) return "—";
  if (format === "currency") {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", notation: Math.abs(value) >= 1e5 ? "compact" : "standard", maximumFractionDigits: Math.abs(value) >= 1e5 ? 1 : 2 }).format(value);
  }
  if (format === "percent") return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(value);
  return new Intl.NumberFormat(undefined, { notation: Math.abs(value) >= 1e5 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function StatBlock({ block, data, runtime }: BlockProps<"stat"> & { block: AppBlockOf<"stat"> }) {
  const { rows, problem } = useBlockRows(data, runtime, block.dataset, block.query, [block.op === "count" ? undefined : block.field]);
  const all = runtime.rowsOf(block.dataset);
  const value = aggregate(rows, block.field, block.op);
  const before = block.compare ? aggregate(runQuery(all, block.compare, runtime.values), block.field, block.op) : null;
  const change = value !== null && before ? (value - before) / Math.abs(before) : null;
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <span className="font-bureau text-[13px] text-typography-secondary">{block.label}</span>
      {problem ? (
        <BlockNotice>{problem}</BlockNotice>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="font-bureau text-[30px] leading-none tracking-[-0.4px] text-typography-primary tabular-nums">
            {formatValue(value, block.format)}
          </span>
          {change !== null && Number.isFinite(change) && (
            <span className={cn("font-bureau text-[13px] tabular-nums", change >= 0 ? "text-green-5" : "text-red-5")}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Chart ────────────────────────────────────────────────────────────── */

function vegaSpec(block: AppBlockOf<"chart">, rows: Row[]): TopLevelSpec {
  const types = Object.fromEntries(columnsOf(rows).map((column) => [column.name, column.type]));
  const xType = types[block.x] === "number" ? "quantitative" : types[block.x] === "date" ? "temporal" : "ordinal";
  const y = { field: block.y, type: "quantitative" as const, ...(block.aggregate ? { aggregate: block.aggregate } : {}) };
  const color = block.color ? { color: { field: block.color, type: "nominal" as const } } : {};
  const encoding =
    block.mark === "arc"
      ? { theta: y, color: { field: block.x, type: "nominal" as const } }
      : {
          // Strings keep the data's order (months, stages) rather than A–Z.
          x: { field: block.x, type: xType, ...(xType === "ordinal" ? { sort: null } : {}) },
          y,
          ...color,
        };
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    data: { name: "table" },
    mark: { type: block.mark, tooltip: true, ...(block.mark === "line" ? { point: true } : {}) },
    encoding,
    width: "container",
    height: block.height ?? 200,
    autosize: { type: "fit", contains: "padding" },
  } as TopLevelSpec;
}

export function ChartBlock({ block, data, runtime }: BlockProps<"chart"> & { block: AppBlockOf<"chart"> }) {
  const { rows, problem } = useBlockRows(data, runtime, block.dataset, block.query, [block.x, block.y, block.color]);
  const spec = useMemo(() => vegaSpec(block, rows), [block, rows]);
  const datasets = useMemo(() => ({ table: rows }), [rows]);
  return (
    <figure className="flex flex-col gap-2">
      {block.title && <figcaption className="font-bureau text-[14px] text-typography-primary">{block.title}</figcaption>}
      {problem ? <BlockNotice>{problem}</BlockNotice> : <VegaChart spec={spec} datasets={datasets} />}
      {block.caption && <p className="font-bureau text-[12px] text-typography-secondary">{block.caption}</p>}
    </figure>
  );
}

/* ── Table ────────────────────────────────────────────────────────────── */

const formatCell = (cell: Row[string] | undefined) =>
  typeof cell === "number" ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(cell) : String(cell ?? "");

export function TableBlock({ block, data, runtime }: BlockProps<"table"> & { block: AppBlockOf<"table"> }) {
  const { rows, problem } = useBlockRows(data, runtime, block.dataset, block.query, block.columns ?? []);
  const columns = block.columns ?? columnsOf(rows).map((column) => column.name);
  return (
    <div className="flex flex-col gap-2">
      {block.title && <span className="font-bureau text-[14px] text-typography-primary">{block.title}</span>}
      {problem ? (
        <BlockNotice>{problem}</BlockNotice>
      ) : (
        <div className="no-scrollbar max-h-72 overflow-auto rounded-[10px] border border-gray-3/15">
          <table className="w-full border-collapse font-bureau text-[13px]">
            <thead className="sticky top-0 bg-background-primary">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border-b border-gray-3/15 px-3 py-2 text-left font-normal text-typography-secondary">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((row, index) => (
                <tr key={index} className="border-b border-gray-3/10 last:border-0">
                  {columns.map((column) => (
                    <td
                      key={column}
                      className={cn("px-3 py-1.5 text-typography-primary", typeof row[column] === "number" && "text-right tabular-nums")}
                    >
                      {formatCell(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────────────────── */

/** One variable's control: a choice as a pill row, a slider with its value, a switch. */
export function VariableControl({ variable, runtime }: { variable: Variable; runtime: AppRuntime }) {
  const value = runtime.values[variable.id];
  const label = <span className="font-bureau text-[12px] text-typography-secondary">{variable.label}</span>;

  if (variable.kind === "choice") {
    const options = variable.options ?? (variable.fromField
      ? distinct(runtime.rowsOf(variable.fromField.dataset), variable.fromField.field).map((v) => ({ value: v, label: v }))
      : []);
    const all = variable.includeAll ? [{ value: ALL, label: "All" }, ...options] : options;
    return (
      <div className="flex items-center gap-2">
        {label}
        <div role="radiogroup" aria-label={variable.label} className="flex flex-wrap rounded-full bg-gray-6 p-0.5">
          {all.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={option.value === value}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                runtime.setValue(variable.id, option.value);
              }}
              className={cn(
                "cursor-pointer rounded-full px-2.5 py-1 font-bureau text-[12px] transition-colors",
                option.value === value
                  ? "bg-background-primary text-typography-primary shadow-[0_1px_2px_rgba(26,23,24,0.12)]"
                  : "text-typography-secondary hover:text-typography-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variable.kind === "slider") {
    const n = Number(value);
    const stepLabel = variable.labels?.[Math.round((n - variable.min) / variable.step)];
    return (
      <label className="flex items-center gap-2.5">
        {label}
        <input
          type="range"
          min={variable.min}
          max={variable.max}
          step={variable.step}
          value={n}
          {...fieldEvents}
          onChange={(event) => runtime.setValue(variable.id, Number(event.target.value))}
          className="w-36 cursor-pointer accent-gray-5"
        />
        <span className="min-w-[4ch] font-bureau text-[13px] text-typography-primary tabular-nums">
          {stepLabel ?? `${n}${variable.unit ?? ""}`}
        </span>
      </label>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(value)}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        runtime.setValue(variable.id, !value);
      }}
      className="flex cursor-pointer items-center gap-2"
    >
      {label}
      <span className={cn("flex h-4 w-7 items-center rounded-full p-0.5 transition-colors", value ? "bg-gray-5" : "bg-gray-3/30")}>
        <span className={cn("size-3 rounded-full bg-white transition-transform", Boolean(value) && "translate-x-3")} />
      </span>
    </button>
  );
}

/* ── Code ─────────────────────────────────────────────────────────────── */

/** A runnable cell: the code (shown or tucked away), a Run button, and its output, live. */
export function CodeBlock({ block, data, runtime, onChange }: BlockProps<"code"> & { block: AppBlockOf<"code"> }) {
  const [shown, setShown] = useState(block.showCode ?? false);
  const [status, setStatus] = useState<SandboxStatus>({ state: "running" });
  const [runKey, setRunKey] = useState(0);
  // Its own output never feeds back in.
  const inputIds = block.inputs.filter((id) => id !== block.output);
  const inputRows = inputIds.map((id) => runtime.rowsOf(id));
  const inputs = useMemo(
    () => Object.fromEntries(inputIds.map((id, index) => [id, inputRows[index] ?? []])),
    // Rows are compared by identity; the ids only change with the block.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputIds.join("|"), ...inputRows],
  );
  const missing = inputIds.filter((id) => !data.datasets.some((dataset) => dataset.id === id));

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-gray-3/20">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-gray-3/15 bg-gray-6/60 pr-1.5 pl-3">
        <Code2 className="size-3.5 text-typography-secondary" />
        <span className="min-w-0 flex-1 truncate font-bureau text-[13px] text-typography-primary">
          {block.title ?? "Code"}
          <span className="ml-2 text-typography-secondary">
            {inputIds.length ? `reads ${inputIds.join(", ")}` : "JavaScript"}
            {block.output ? ` · makes ${block.output}` : ""}
          </span>
        </span>
        {status.state === "running" && <Loader2 className="size-3.5 animate-spin text-typography-secondary" />}
        <button
          type="button"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            setShown((value) => !value);
          }}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-[8px] px-2 font-bureau text-[12px] text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
        >
          {shown ? <EyeOff className="size-3.5" /> : <Code2 className="size-3.5" />}
          {shown ? "Hide code" : "Show code"}
        </button>
        <button
          type="button"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            setRunKey((n) => n + 1);
          }}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-[8px] bg-gray-5 px-2.5 font-bureau text-[12px] text-typography-inverse"
        >
          <Play className="size-3" fill="currentColor" />
          Run
        </button>
      </div>
      {shown && (
        <AutoTextarea
          value={block.source}
          aria-label="Code"
          spellCheck={false}
          readOnly={!onChange}
          {...fieldEvents}
          onKeyDown={stopFieldEvent}
          onChange={(event) => onChange?.({ ...block, source: event.target.value })}
          className="w-full border-b border-gray-3/15 bg-[#fbfaf9] px-4 py-3 font-mono text-[12.5px] leading-[1.6] text-typography-primary outline-none"
        />
      )}
      <div className="px-4 py-3">
        {missing.length ? (
          <BlockNotice>{`It reads ${missing.join(", ")}, which isn't in the data.`}</BlockNotice>
        ) : (
          <CodeSandbox
            source={block.source}
            inputs={inputs}
            vars={runtime.values}
            runKey={runKey + runtime.refreshKey}
            onEmit={block.output ? (rows) => runtime.emit(block.output!, rows) : undefined}
            onStatus={setStatus}
          />
        )}
        {status.state === "error" && <BlockNotice>{status.message}</BlockNotice>}
      </div>
    </div>
  );
}

/* ── Any block ────────────────────────────────────────────────────────── */

export function AppBlockView({
  block,
  data,
  runtime,
  onChange,
}: {
  block: AppShellData["blocks"][number];
  data: AppShellData;
  runtime: AppRuntime;
  onChange?: (block: AppShellData["blocks"][number]) => void;
}) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} data={data} runtime={runtime} onChange={onChange} />;
    case "stat":
      return <StatBlock block={block} data={data} runtime={runtime} />;
    case "chart":
      return <ChartBlock block={block} data={data} runtime={runtime} />;
    case "table":
      return <TableBlock block={block} data={data} runtime={runtime} />;
    case "code":
      return <CodeBlock block={block} data={data} runtime={runtime} onChange={onChange} />;
    case "control": {
      const variable = data.variables.find((v) => v.id === block.variable);
      return variable ? (
        <VariableControl variable={variable} runtime={runtime} />
      ) : (
        <BlockNotice>{`No variable called “${block.variable}”.`}</BlockNotice>
      );
    }
  }
}
