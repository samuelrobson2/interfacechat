import { ClipboardCopy, RefreshCw, TextCursorInput } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { shellId } from "../model/shell-types";
import { SHELL_TITLE_LARGE } from "../ui/shell-kit";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";
import { ShellToolbar, ShellToolButton } from "../ui/shell-toolbar";
import { AppBlockView, VariableControl } from "./app-blocks";
import { AppDataMenu, type LinkableData } from "./app-data-menu";
import type { AppBlock, AppShellData, ArticleShellData, DashboardShellData } from "./app-types";
import { useAppRuntime } from "./use-app-runtime";

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
  return (
    <div className="flex shrink-0 px-6 pt-3 pb-3">
      {onTitle ? (
        <input
          value={title}
          placeholder={placeholder}
          aria-label="Title"
          {...fieldEvents}
          onKeyDown={stopFieldEvent}
          onChange={(event) => onTitle(event.target.value)}
          className={cn("w-full min-w-0 bg-transparent font-bureau outline-none placeholder:text-typography-secondary", SHELL_TITLE_LARGE, "text-typography-primary placeholder:font-light")}
        />
      ) : (
        <div className={cn("truncate font-bureau", SHELL_TITLE_LARGE, title ? "text-typography-primary" : "font-light text-typography-secondary")}>
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

function StandardTools<D extends AppShellData>({
  data,
  onChange,
  runtime,
  linkable,
  addText,
  children,
}: {
  data: D;
  onChange?: (data: D) => void;
  runtime: ReturnType<typeof useAppRuntime>;
  linkable?: LinkableData[];
  addText?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <AppDataMenu
        data={data}
        runtime={runtime}
        linkable={linkable}
        onChange={onChange as ((data: AppShellData) => void) | undefined}
      />
      <ShellToolButton label="Refresh links and run the code again" onPress={() => runtime.refresh()}>
        <RefreshCw />
      </ShellToolButton>
      <ShellToolButton label="Add text" disabled={!addText} onPress={() => addText?.()}>
        <TextCursorInput />
      </ShellToolButton>
      {children}
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
  const { setBlock, addText } = useEdits(data, onChange);
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
        <StandardTools data={data} onChange={onChange} runtime={runtime} linkable={linkable} addText={addText} />
      </ShellToolbar>
      {data.variables.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-3/15 px-6 py-2.5">
          {data.variables.map((variable) => (
            <VariableControl key={variable.id} variable={variable} runtime={runtime} />
          ))}
        </div>
      )}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f6f5] p-4">
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
                  "min-w-0 rounded-[16px] bg-white p-4 shadow-[0_1px_2px_rgba(26,23,24,0.06)]",
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

/* ── Article ──────────────────────────────────────────────────────────── */

/** The prose of an article, for pasting elsewhere; charts and code become placeholders. */
function articleMarkdown(data: ArticleShellData) {
  const parts = data.blocks.map((block) =>
    block.type === "text"
      ? block.markdown
      : block.type === "chart"
        ? `[Chart: ${block.title ?? `${block.y} by ${block.x}`}]`
        : block.type === "code"
          ? `\`\`\`js\n${block.source}\n\`\`\``
          : "",
  );
  return [`# ${data.title}`, data.subtitle ?? "", ...parts].filter(Boolean).join("\n\n");
}

/**
 * A piece to read top to bottom, with live charts, controls and code between
 * the prose. Moving a control changes every chart, number and code cell that
 * reads it, wherever it sits.
 */
export function ArticleShell({
  data,
  onChange,
  tools,
  actions,
  linkable,
  surface = true,
  className,
}: AppShellProps<ArticleShellData>) {
  const runtime = useAppRuntime(data);
  const { setBlock, addText } = useEdits(data, onChange);

  return (
    <ShellSurface size="large" surface={surface} className={className}>
      <AppTitle
        title={data.title}
        placeholder="Article"
        onTitle={onChange && ((title) => onChange({ ...data, title }))}
      />
      <ShellToolbar tools={tools} actions={actions}>
        <StandardTools data={data} onChange={onChange} runtime={runtime} linkable={linkable} addText={addText}>
          <ShellToolButton
            label="Copy as markdown"
            onPress={() => void navigator.clipboard?.writeText(articleMarkdown(data))}
          >
            <ClipboardCopy />
          </ShellToolButton>
        </StandardTools>
      </ShellToolbar>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {data.blocks.length === 0 ? (
          <p className="px-6 pt-6 font-bureau text-[15px] font-light text-typography-secondary">
            Describe the piece in the chat, or bring data in from the Data menu and ask for a story in it.
          </p>
        ) : (
          <article className="flex w-full max-w-[728px] flex-col gap-6 px-6 pt-6 pb-16">
            {data.blocks.map((block) => (
              <div
                key={block.id}
                className={cn(block.type === "control" && "rounded-[14px] bg-gray-6/70 px-4 py-3")}
              >
                <AppBlockView block={block} data={data} runtime={runtime} onChange={setBlock} />
              </div>
            ))}
          </article>
        )}
      </div>
    </ShellSurface>
  );
}
