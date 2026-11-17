import { RefreshCw, TextCursorInput } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { shellId } from "../model/shell-types";
import { SHELL_TITLE_GLYPH, SHELL_TITLE_ROW, SHELL_BODY_PAD, SHELL_EDGE_X } from "../ui/shell-kit";
import { ShellGlyph } from "../ui/shell-icons";
import { useShellMark } from "../ui/shell-mark";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";
import { ShellToolbar, ShellToolButton } from "../ui/shell-toolbar";
import { AppBlockView, VariableControl } from "./app-blocks";
import { AppDataMenu, type LinkableData } from "./app-data-menu";
import type { AppBlock, AppKind, AppShellData, DashboardShellData } from "./app-types";
import { type AppRuntime, useAppRuntime } from "./use-app-runtime";

export type AppShellProps<D extends AppShellData> = {
  data: D;
  /** Omit to render read-only. */
  onChange?: (data: D) => void;
  /** Tools generated for what's in it now, after its standard ones. */
  tools?: React.ReactNode;
  actions?: React.ReactNode;
  /** Data other interfaces in the chat can lend. */
  linkable?: LinkableData[];
  surface?: boolean;
  className?: string;
};

/** The title, in the same type as every large interface. */
function AppTitle({
  title,
  placeholder,
  onTitle,
}: {
  title: string;
  placeholder: string;
  onTitle?: (title: string) => void;
}) {
  const mark = useShellMark("large");
  return (
    <div data-shell-part="title" className={cn("flex shrink-0 items-center", SHELL_TITLE_ROW)}>
      {mark && <ShellGlyph kind="dashboard" className={SHELL_TITLE_GLYPH} />}
      {onTitle ? (
        <input
          value={title}
          placeholder={placeholder}
          aria-label="Title"
          {...fieldEvents}
          onKeyDown={stopFieldEvent}
          onChange={(event) => onTitle(event.target.value)}
          className="shell-title-type w-full min-w-0 bg-transparent font-bureau text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary"
        />
      ) : (
        <div className={cn("shell-title-type", "truncate font-bureau", title ? "text-typography-primary" : "font-light text-typography-secondary")}>
          {title || placeholder}
        </div>
      )}
    </div>
  );
}

/** Setters every app shares: one block, or a new text block at the end. */
function useEdits<D extends AppShellData>(data: D, onChange?: (data: D) => void) {
  const setBlock = onChange
    ? (block: AppBlock) => onChange({ ...data, blocks: data.blocks.map((b) => (b.id === block.id ? block : b)) })
    : undefined;
  const addText = onChange
    ? () => onChange({ ...data, blocks: [...data.blocks, { type: "text", id: shellId("text"), markdown: "New note", span: 12 }] })
    : undefined;
  return { setBlock, addText };
}

/**
 * A Dashboard's standard tools, the same on the medium plus card and at
 * large: the Data menu, Refresh and Add text.
 */
export function AppStandardTools<D extends AppShellData>({
  data,
  onChange,
  runtime,
  linkable,
  large = true,
}: {
  /** Kept for callers; there's one kind now. */
  kind?: AppKind;
  data: D;
  onChange?: (data: D) => void;
  runtime: AppRuntime;
  linkable?: LinkableData[];
  /** Refresh re-reads links and reruns code blocks, which only the large layout runs and shows. */
  large?: boolean;
}) {
  const { addText } = useEdits(data, onChange);
  return (
    <>
      <AppDataMenu
        data={data}
        runtime={runtime}
        linkable={linkable}
        onChange={onChange as ((data: AppShellData) => void) | undefined}
      />
      {large && (
        <ShellToolButton label="Refresh links and run the code again" onPress={() => runtime.refresh()}>
          <RefreshCw />
        </ShellToolButton>
      )}
      <ShellToolButton label="Add text" disabled={!addText} onPress={() => addText?.()}>
        <TextCursorInput />
      </ShellToolButton>
    </>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────── */

const SPAN: Record<number, string> = {
  3: "col-span-12 md:col-span-3",
  4: "col-span-12 md:col-span-4",
  6: "col-span-12 md:col-span-6",
  8: "col-span-12 md:col-span-8",
  12: "col-span-12",
};
const DEFAULT_SPAN: Record<AppBlock["type"], number> = { stat: 3, chart: 6, table: 6, text: 12, code: 6, control: 12 };

/**
 * Figures at a glance. Every variable sits in the filter bar under the
 * toolbar; blocks sit on a 12-column grid, each in its own card.
 */
export function DashboardShell({
  data,
  onChange,
  tools,
  actions,
  linkable,
  surface = true,
  className,
}: AppShellProps<DashboardShellData>) {
  const runtime = useAppRuntime(data);
  const { setBlock } = useEdits(data, onChange);
  // Controls live in the filter bar, not the grid.
  const blocks = data.blocks.filter((block) => block.type !== "control");

  return (
    <ShellSurface size="large" surface={surface} className={className}>
      <AppTitle
        title={data.title}
        placeholder="Dashboard"
        onTitle={onChange && ((title) => onChange({ ...data, title }))}
      />
      <ShellToolbar tools={tools} actions={actions}>
        <AppStandardTools kind="dashboard" data={data} onChange={onChange} runtime={runtime} linkable={linkable} />
      </ShellToolbar>
      {data.variables.length > 0 && (
        <div className={cn("flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-shell-line py-2.5", SHELL_EDGE_X)}>
          {data.variables.map((variable) => (
            <VariableControl key={variable.id} variable={variable} runtime={runtime} />
          ))}
        </div>
      )}
      <div data-shell-part="body" tabIndex={0} className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto bg-shell-frame outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50", SHELL_BODY_PAD)}>
        {blocks.length === 0 ? (
          <div className="grid h-full place-items-center">
            <p className="max-w-[320px] text-center font-bureau text-[14px] font-light text-typography-secondary">
              Describe the dashboard in the chat, or bring data in from the Data menu to build from.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-3">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "min-w-0 rounded-[16px] bg-shell-panel p-4 shadow-[0_1px_2px_rgba(26,23,24,0.06)]",
                  SPAN[block.span ?? DEFAULT_SPAN[block.type]],
                  block.type === "code" && "p-0 shadow-none",
                )}
              >
                <AppBlockView block={block} data={data} runtime={runtime} onChange={setBlock} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ShellSurface>
  );
}
