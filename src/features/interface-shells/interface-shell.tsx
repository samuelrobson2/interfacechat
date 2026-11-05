import { DocumentShell } from "./document/document-shell";
import type {
  SearchShellData,
  ShellDataByKind,
  ShellKind,
  ShellProps,
} from "./model/shell-types";
import { SearchShell } from "./search/search-shell";
import { CalendarShell } from "./more/calendar-shell";
import { TimelineShell } from "./more/timeline-shell";
import { FlowchartShell } from "./more/flowchart-shell";
import { MindmapShell } from "./more/mindmap-shell";
import { GuideShell } from "./more/guide-shell";
import { ChatShell } from "./more/chat-shell";
import { MapShell } from "./more/map-shell";
import { MoodboardShell } from "./more/moodboard-shell";
import { ReaderShell } from "./more/reader-shell";
import { ScheduleShell } from "./more/schedule-shell";
import { TrackerShell } from "./more/tracker-shell";
import { TableShell } from "./table/table-shell";

export type InterfaceShellProps<K extends ShellKind = ShellKind> = {
  [Kind in K]: ShellProps<ShellDataByKind[Kind]> & {
    kind: Kind;
    /** Search only: run or re-run the query (Enter, filter changes). */
    onSearch?: Kind extends "search" ? (data: SearchShellData) => void : never;
  };
}[K];

/** One entry point for every interface in the library, at any size. */
export function InterfaceShell(props: InterfaceShellProps) {
  switch (props.kind) {
    case "chat":
      return <ChatShell {...props} />;
    case "document":
      return <DocumentShell {...props} />;
    case "search":
      return <SearchShell {...props} />;
    case "table":
      return <TableShell {...props} />;
    case "schedule":
      return <ScheduleShell {...props} />;
    case "tracker":
      return <TrackerShell {...props} />;
    case "calendar":
      return <CalendarShell {...props} />;
    case "reader":
      return <ReaderShell {...props} />;
    case "map":
      return <MapShell {...props} />;
    case "moodboard":
      return <MoodboardShell {...props} />;
    case "timeline":
      return <TimelineShell {...props} />;
    case "flowchart":
      return <FlowchartShell {...props} />;
    case "mindmap":
      return <MindmapShell {...props} />;
    case "guide":
      return <GuideShell {...props} />;
  }
}
