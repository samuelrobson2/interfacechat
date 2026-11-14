import { ChartColumn, Code2, Database, SlidersHorizontal, Table2, Type } from "lucide-react";
import { cn } from "@/shared/lib/css";
import type { ShellProps } from "../model/shell-types";
import { PreviewBody, PreviewHead, ShellBody, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { Bar, ShellSurface } from "../ui/shell-surface";
import { ChartBlock, StatBlock, MarkdownView } from "./app-blocks";
import type { LinkableData } from "./app-data-menu";
import { appDetail, blockLabel } from "./app-detail";
import { interpolate } from "./app-query";
import { ArticleShell, DashboardShell } from "./app-shells";
import type { AppBlock, AppKind, AppShellData, ArticleShellData, DashboardShellData } from "./app-types";
import { useAppRuntime } from "./use-app-runtime";

const BLOCK_ICON: Record<AppBlock["type"], typeof Type> = {
  text: Type,
  stat: ChartColumn,
  chart: ChartColumn,
  table: Table2,
  control: SlidersHorizontal,
  code: Code2,
};

/** Medium: shapes, not words — stat tiles and bars for a dashboard, lines and a chart for an article. */
function AppPreview({ kind, data }: { kind: AppKind; data: AppShellData }) {
  const empty = data.blocks.length === 0;
  const bars = [46, 70, 38, 82, 60, 74];
  return (
    <>
      <PreviewHead kind={kind} title={data.title} />
      <PreviewBody className="gap-1.5 pt-2">
        {kind === "dashboard" ? (
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((index) => (
              <span key={index} className="flex flex-col gap-1 rounded-[4px] bg-gray-6 p-1">
                <Bar width="60%" className="h-0.5 bg-gray-3/25" />
                <Bar width="80%" className={cn("h-1.5", empty ? "bg-gray-3/15" : "bg-gray-3/40")} />
              </span>
            ))}
          </div>
        ) : (
          <>
            <Bar width="92%" className="bg-gray-3/25" />
            <Bar width="78%" className="bg-gray-3/25" />
          </>
        )}
        <div className="mt-auto flex h-8 items-end gap-1">
          {bars.map((height, index) => (
            <span
              key={index}
              className={cn("flex-1 rounded-t-[2px]", empty ? "bg-gray-3/15" : index === 3 ? "bg-[#7a6ff0]/70" : "bg-gray-3/35")}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </PreviewBody>
    </>
  );
}

/** Medium plus: the title, then each block and dataset as a line, filling in as the model writes. */
function AppOutline({
  kind,
  data,
  onChange,
  onSubmit,
  brief,
}: {
  kind: AppKind;
  data: AppShellData;
  onChange?: (data: AppShellData) => void;
  onSubmit?: () => void;
  /** On the chat home: what the request leaves open. */
  brief?: React.ReactNode;
}) {
  return (
    <>
      <ShellTitle
        kind={kind}
        size="medium-plus"
        value={data.title}
        onChange={onChange && ((title) => onChange({ ...data, title }))}
        onSubmit={onSubmit}
      />
      <ShellBody size="medium-plus" className="gap-1.5">
        {data.datasets.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.datasets.map((dataset) => (
              <span
                key={dataset.id}
                className={cn(
                  "flex items-center gap-1 rounded-full px-1.5 py-px font-bureau text-[10px]",
                  dataset.source.type === "generated" ? "bg-[#fff1d6] text-[#8a5a00]" : "bg-gray-6 text-typography-secondary",
                )}
              >
                <Database className="size-2.5" />
                {dataset.label}
              </span>
            ))}
          </div>
        )}
        {brief}
        {data.blocks.length === 0 && brief ? null : data.blocks.length === 0 ? (
          [70, 52, 64].map((width, index) => <Bar key={index} width={`${width}%`} className="my-1" />)
        ) : (
          <ul className="flex flex-col gap-1">
            {data.blocks.slice(0, 8).map((block) => {
              const Icon = BLOCK_ICON[block.type];
              return (
                <li key={block.id} className="flex min-w-0 items-center gap-1.5 font-bureau text-[11px] text-typography-primary">
                  <Icon className="size-3 shrink-0 text-typography-secondary" />
                  <span className="truncate">{blockLabel(block)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </ShellBody>
      <ShellDetail>{appDetail(data)}</ShellDetail>
    </>
  );
}

/**
 * Inline medium: the part worth glancing at in a reply. A dashboard's first
 * figures and main chart; an article's opening and first chart. Live, so a
 * chart in the reply is the real one.
 */
export function AppInline({ kind, data }: { kind: AppKind; data: AppShellData }) {
  const runtime = useAppRuntime(data);
  const stats = data.blocks.filter((block) => block.type === "stat").slice(0, 3);
  const chart = data.blocks.find((block) => block.type === "chart" && block.dataset && !data.datasets.find((d) => d.id === block.dataset && d.source.type === "code"));
  const opening = kind === "article" ? data.blocks.find((block) => block.type === "text") : undefined;
  return (
    <div className="flex flex-col gap-3">
      {opening?.type === "text" && (
        <MarkdownView markdown={interpolate(opening.markdown, data.variables, runtime.values)} className="line-clamp-4 [&>div]:text-[14px]" />
      )}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((block) =>
            block.type === "stat" ? (
              <div key={block.id} className="rounded-[12px] bg-gray-6 p-3">
                <StatBlock block={{ ...block, label: block.label }} data={data} runtime={runtime} />
              </div>
            ) : null,
          )}
        </div>
      )}
      {chart?.type === "chart" && <ChartBlock block={{ ...chart, height: 160 }} data={data} runtime={runtime} />}
    </div>
  );
}

/** Dashboard and Article at any size, the way InterfaceShell draws every interface. */
export function AppShellBySize({
  kind,
  linkable,
  ...props
}: ShellProps<AppShellData> & { kind: AppKind; linkable?: LinkableData[] }) {
  const { size, data, onChange, onSubmit, surface = true, className } = props;
  if (size === "small") return <ShellAppIcon kind={kind} className={className} />;
  if (size === "medium" || size === "medium-plus") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        {size === "medium" ? (
          <AppPreview kind={kind} data={data} />
        ) : (
          <AppOutline kind={kind} data={data} onChange={onChange} onSubmit={onSubmit} brief={props.suggestions?.brief} />
        )}
      </ShellSurface>
    );
  }
  return kind === "dashboard" ? (
    <DashboardShell
      data={data as DashboardShellData}
      onChange={onChange as ((data: DashboardShellData) => void) | undefined}
      tools={props.tools}
      actions={props.actions}
      linkable={linkable}
      surface={surface}
      className={className}
    />
  ) : (
    <ArticleShell
      data={data as ArticleShellData}
      onChange={onChange as ((data: ArticleShellData) => void) | undefined}
      tools={props.tools}
      actions={props.actions}
      linkable={linkable}
      surface={surface}
      className={className}
    />
  );
}
