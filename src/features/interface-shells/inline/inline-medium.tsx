import { cn } from "@/shared/lib/css";
import { SHELL_META } from "../model/shell-meta";
import { chartAsFlowchart, chartAsMindmap, chartAsTimeline } from "../model/chart";
import type { ChartShellData, ShellData, ShellDataByKind, ShellKind } from "../model/shell-types";
import { InlineHead } from "./inline-kit";
import {
  CalendarInline,
  DocumentInline,
  GuideInline,
  ReaderInline,
  SearchInline,
  TableInline,
  TrackerInline,
} from "./inline-medium-lists";
import {
  FlowchartInline,
  MapInline,
  MindmapInline,
  MoodboardInline,
  ScheduleInline,
  TimelineInline,
} from "./inline-medium-visual";
import { hasInline, inlineDetail, inlineTitle } from "./inline-summary";

/** Chart draws its type's design, editing that type's part of the chart. */
function ChartInline({ data, onChange }: { data: ChartShellData; onChange?: (data: ChartShellData) => void }) {
  switch (data.type) {
    case "mindmap":
      return (
        <MindmapInline
          data={chartAsMindmap(data)}
          onChange={onChange && ((next) => onChange({ ...data, title: next.title, branches: next.branches }))}
        />
      );
    case "timeline":
      return (
        <TimelineInline
          data={chartAsTimeline(data)}
          onChange={onChange && ((next) => onChange({ ...data, title: next.title, events: next.events }))}
        />
      );
    case "flowchart":
      return (
        <FlowchartInline
          data={chartAsFlowchart(data)}
          onChange={onChange && ((next) => onChange({ ...data, title: next.title, nodes: next.nodes, edges: next.edges }))}
        />
      );
  }
}

type BodyProps = { kind: ShellKind; data: ShellData; onChange?: (data: ShellData) => void; selected?: boolean };

function Body({ kind, data, onChange, selected }: BodyProps) {
  // Each design takes its own kind's data; the kind decides which.
  const edit = onChange as never;
  switch (kind) {
    case "document":
      return <DocumentInline data={data as ShellDataByKind["document"]} onChange={edit} />;
    case "search":
      return <SearchInline data={data as ShellDataByKind["search"]} onChange={edit} selected={selected} />;
    case "table":
      return <TableInline data={data as ShellDataByKind["table"]} onChange={edit} />;
    case "schedule":
      return <ScheduleInline data={data as ShellDataByKind["schedule"]} onChange={edit} />;
    case "tracker":
      return <TrackerInline data={data as ShellDataByKind["tracker"]} onChange={edit} />;
    case "calendar":
      return <CalendarInline data={data as ShellDataByKind["calendar"]} onChange={edit} />;
    case "reader":
      return <ReaderInline data={data as ShellDataByKind["reader"]} onChange={edit} />;
    case "map":
      return <MapInline data={data as ShellDataByKind["map"]} onChange={edit} />;
    case "moodboard":
      return <MoodboardInline data={data as ShellDataByKind["moodboard"]} onChange={edit} selected={selected} />;
    case "chart":
      return <ChartInline data={data as ShellDataByKind["chart"]} onChange={onChange as never} />;
    case "guide":
      return <GuideInline data={data as ShellDataByKind["guide"]} onChange={edit} />;
    case "chat":
      return null;
  }
}

/**
 * Inline medium: an interface as part of a reply. No background or box: it
 * opens with its glyph, title and key detail, then a short preview designed
 * for what the interface is for. It reads, it doesn't edit; large is always
 * its own window.
 */
export function InlineMedium({
  kind,
  data,
  aside,
  onChange,
  selected = false,
  className,
}: {
  kind: ShellKind;
  data: ShellData;
  /** At the end of the head line (Pin, on hover). */
  aside?: React.ReactNode;
  /** Edit what's shown where it stands. Omit for a read-only preview. */
  onChange?: (data: ShellData) => void;
  /** Selected in a reply: removable chips show their ×. */
  selected?: boolean;
  className?: string;
}) {
  if (!hasInline(kind)) return null;
  // Search and Map are named by their query; everything else by its title.
  const titleKey = "title" in data ? "title" : "query";
  const rawTitle = (data as Record<string, unknown>)[titleKey];
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <InlineHead
        kind={kind}
        title={typeof rawTitle === "string" && onChange ? rawTitle : inlineTitle(kind, data)}
        titlePlaceholder={SHELL_META[kind].label}
        onTitleChange={onChange && ((title) => onChange({ ...data, [titleKey]: title } as ShellData))}
        detail={inlineDetail(kind, data)}
        aside={aside}
      />
      <Body kind={kind} data={data} onChange={onChange} selected={selected} />
    </div>
  );
}
