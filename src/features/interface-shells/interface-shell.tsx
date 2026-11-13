import { AppShellBySize } from "./apps/app-sizes";
import type { AppShellData } from "./apps/app-types";
import { DocumentShell } from "./document/document-shell";
import type {
  SearchShellData,
  ShellDataByKind,
  ShellKind,
  ShellProps,
} from "./model/shell-types";
import { SearchShell } from "./search/search-shell";
import { CalendarShell } from "./more/calendar-shell";
import { ChartShell } from "./more/chart-shell";
import { GeneratorShell } from "./more/generator-shell";
import { GuideShell } from "./more/guide-shell";
import { ChatShell } from "./more/chat-shell";
import { MapShell } from "./more/map-shell";
import { MoodboardShell } from "./more/moodboard-shell";
import { ReaderShell } from "./more/reader-shell";
import { ScheduleShell } from "./more/schedule-shell";
import { TrackerShell } from "./more/tracker-shell";
import { TableShell } from "./table/table-shell";
import { useShellHistory } from "./ui/shell-history";
import { ShellMarkContext } from "./ui/shell-mark";
import { ShellHistoryContext } from "./ui/shell-toolbar";

export type InterfaceShellProps<K extends ShellKind = ShellKind> = {
  [Kind in K]: ShellProps<ShellDataByKind[Kind]> & {
    kind: Kind;
    /** Search only: run or re-run the query (Enter, filter changes). */
    onSearch?: Kind extends "search" ? (data: SearchShellData) => void : never;
  };
}[K];

/** One entry point for every interface in the library, at any size. */
export function InterfaceShell(props: InterfaceShellProps) {
  // Large is where work happens, so it keeps an undo history; its toolbar leads with Undo and Redo.
  const large = props.size === "large";
  const { onChange, history } = useShellHistory<unknown>(props.data, large ? (props.onChange as ((data: unknown) => void) | undefined) : undefined);
  const shellProps = (large && onChange ? { ...props, onChange } : props) as InterfaceShellProps;
  return (
    <ShellMarkContext.Provider value={props.mark}>
      <ShellHistoryContext.Provider value={history}>
        <ShellBySize {...shellProps} />
      </ShellHistoryContext.Provider>
    </ShellMarkContext.Provider>
  );
}

function ShellBySize(props: InterfaceShellProps) {
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
    case "chart":
      return <ChartShell {...props} />;
    case "guide":
      return <GuideShell {...props} />;
    case "dashboard":
    case "article":
      return <AppShellBySize {...(props as unknown as ShellProps<AppShellData>)} kind={props.kind} />;
    case "generator":
      return <GeneratorShell {...props} />;
  }
}
