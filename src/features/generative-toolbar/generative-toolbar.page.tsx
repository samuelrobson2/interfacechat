import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  InterfaceShell,
  isP0Kind,
  LinkableDataContext,
  SHELL_FIXTURES,
  SHELL_META,
  ShellAppIcon,
  type InterfaceShellProps,
  type LinkableData,
  type ShellSuggestions,
  type SuggestedGroup,
} from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import {
  TOOLBAR_KINDS,
  type GeneratedTool,
  type ToolbarDataByKind,
  type ToolbarKind,
} from "./model/generate-tools";
import { describeUse, type ToolSpec, type ToolValue } from "./model/tool-spec";
import { suggestValues } from "./model/suggest-values";
import { blankFollowUp, blanksStillOpen, rewriteDocument, runTool } from "./model/toolbar-api";
import { toolbarFixture } from "./model/toolbar-fixtures";
import { useGeneratedTools, type ToolSource } from "./model/use-generated-tools";
import { GenerativeToolbar, TOOLS_ATTRIBUTE } from "./ui/generative-toolbar";

/**
 * A test bed for the toolbar every large interface has: its standard tools,
 * then tools generated for what's in it now. The generated ones are read off
 * the interface as it stands (and off any text selected in it), so editing
 * changes what's offered. Every choice lives in the URL.
 *
 * With Model on, the tools come from `/api/toolbar-tools`, and any tool the
 * client can't apply by itself is carried out by `/api/toolbar-run`: edits to
 * the interface's data (with Undo) and/or a reply. Only P0 interfaces show.
 */

/** P0 only: Diagram and Canvas come later. */
const KINDS = TOOLBAR_KINDS.filter(isP0Kind);
const SOURCES = ["model", "rules"] as const satisfies readonly ToolSource[];

/** What filling a blank asks the rewrite for: not a toolbar tool, but the same route. */
const FILL_TOOL: ToolSpec = {
  type: "action",
  id: "fill-blank",
  label: "Fill a blank",
  detail: "Rewrite what depends on the answer",
  icon: "sparkles",
};

/** Tracker reads as Checklist here; the rest keep their library names (Chart is Diagram). */
const kindLabel = (kind: ToolbarKind) => (kind === "tracker" ? "Checklist" : SHELL_META[kind].label);

/** Other interfaces' data an app can borrow: here, the sample Table's rows. */
const LINKABLE: LinkableData[] = (() => {
  const table = SHELL_FIXTURES.table.states.history;
  return [
    {
      id: "table",
      label: table.title,
      kind: "table",
      rows: table.rows.map((row) =>
        Object.fromEntries(
          table.columns.filter((column) => column.type !== "image").map((column) => [column.label, row.cells[column.id] ?? null]),
        ),
      ),
    },
  ];
})();

const CONTENTS = ["filled", "empty"] as const;
type Content = (typeof CONTENTS)[number];

/** How many generated tools the toolbar holds; past the room it has, the row scrolls. */
const TOOL_COUNT = 5;
const SHELL_WIDTH = 1040;
const SHELL_HEIGHT = 640;

/** A single line that scrolls sideways; the padding keeps the outlines unclipped, the mask fades the cut edge. */
const SCROLL_ROW =
  "min-w-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -my-1 py-1 pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]";

const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,23,24,0.07) 1px, transparent 0)",
  backgroundSize: "20px 20px",
};

function pick<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

const startingData = <K extends ToolbarKind>(kind: K, content: Content) =>
  toolbarFixture(kind, content === "empty" ? "empty" : "history");

/** Text selected inside `root`, in a field or in rendered content. */
function useSelectionIn(root: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const container = root.current;
      if (!container) return;
      const active = document.activeElement;
      // Using a tool (a slider, the 2×2) isn't leaving the selection.
      if (active?.closest(`[${TOOLS_ATTRIBUTE}]`)) return;
      let text = "";
      if (
        (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
        container.contains(active)
      ) {
        const { selectionStart: start, selectionEnd: end } = active;
        if (start != null && end != null && end > start) text = active.value.slice(start, end);
      } else {
        const range = window.getSelection();
        if (range && !range.isCollapsed && range.anchorNode && container.contains(range.anchorNode)) {
          text = range.toString();
        }
      }
      const next = text.trim().length > 1 ? text.trim() : null;
      setSelection((current) => (current === next ? current : next));
    };
    document.addEventListener("selectionchange", read);
    // Field selections don't fire selectionchange everywhere; these catch the rest.
    document.addEventListener("mouseup", read);
    document.addEventListener("keyup", read);
    return () => {
      document.removeEventListener("selectionchange", read);
      document.removeEventListener("mouseup", read);
      document.removeEventListener("keyup", read);
    };
  }, [root]);

  return selection;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  format: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-bureau text-[12px] text-typography-secondary">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex w-fit rounded-full bg-gray-6 p-0.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 font-bureau text-[13px] transition-colors",
              option === value
                ? "bg-background-primary text-typography-primary shadow-[0_1px_3px_rgba(26,23,24,0.12)]"
                : "text-typography-secondary hover:text-typography-primary",
            )}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

type Note = { id: number; text: string; undo?: boolean; reply?: string; working?: boolean };

function ToolbarLab<K extends ToolbarKind>({ kind, content, source }: { kind: K; content: Content; source: ToolSource }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [data, setData] = useState(() => startingData(kind, content));
  const [previous, setPrevious] = useState<ToolbarDataByKind[K] | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const selection = useSelectionIn(stage);
  const { tools, placed, status, from, error, timing, regenerate, pin, dismiss: dismissTool } = useGeneratedTools(
    kind,
    data,
    { selection },
    TOOL_COUNT,
    source,
  );
  // Suggested values (a filter, a tone, a column) sit among the real ones, outlined, until added or dismissed.
  const [dismissed, setDismissed] = useState<Partial<Record<SuggestedGroup, string[]>>>({});
  const suggested = status === "ready" ? suggestValues(kind, data, dismissed) : undefined;
  const dismiss = (group: SuggestedGroup, value: string) =>
    setDismissed((current) => ({ ...current, [group]: [...(current[group] ?? []), value] }));

  // Notes clear themselves (not while working, or while showing a reply); a newer one replaces the timer.
  useEffect(() => {
    if (!note || note.working || note.reply) return;
    const timer = window.setTimeout(() => setNote(null), 4000);
    return () => window.clearTimeout(timer);
  }, [note]);

  type Data = ToolbarDataByKind[K];
  type Outcome = { data: Data | null; reply: string | null; summary: string };

  /** Show the model's work as it lands, with a note that becomes its summary (and Undo) once it's done. */
  const carryOut = useCallback((before: Data, label: string, use: string, work: Promise<Outcome>) => {
    const id = Date.now();
    setNote({ id, text: `Working · ${use}`, working: true });
    work
      .then((result) => {
        const changed = result.data && JSON.stringify(result.data) !== JSON.stringify(before);
        // A streamed rewrite may have shown part of a change it then took back.
        setData(changed ? result.data! : before);
        if (changed) setPrevious(before);
        setNote((current) =>
          current?.id === id
            ? {
                id,
                text: changed ? result.summary || use : result.reply ? use : `No change · ${use}`,
                undo: !!changed,
                reply: result.reply ?? undefined,
              }
            : current,
        );
      })
      .catch((reason: unknown) => {
        setData(before);
        setNote((current) =>
          current?.id === id
            ? { id, text: `Couldn't ${label.toLowerCase()} · ${reason instanceof Error ? reason.message : reason}` }
            : current,
        );
      });
  }, []);

  /**
   * A Document's body, rewritten in place and streamed: edits to the paragraphs
   * the tool changes, and any blanks it leaves, which join the document's own.
   */
  const rewrite = useCallback(
    (before: Data, tool: GeneratedTool<unknown> | ToolSpec, value: ToolValue, request?: string): Promise<Outcome> => {
      const doc = before as ToolbarDataByKind["document"];
      const withBody = (body: string, blanks: ToolbarDataByKind["document"]["blanks"]) =>
        ({ ...doc, body, blanks: { ...doc.blanks, ...blanks } }) as Data;
      return rewriteDocument(doc, tool, value, selection, (body, blanks) => setData(withBody(body, blanks)), undefined, request).then(
        (result) => ({ ...result, data: result.text === null ? null : withBody(result.text, result.blanks) }),
      );
    },
    [selection],
  );

  const run = useCallback(
    (tool: GeneratedTool<Data>, value: ToolValue) => {
      // Each tool's apply takes its own type's value; the toolbar hands back the matching one.
      const apply = tool.apply as ((data: Data, value: ToolValue) => Data) | undefined;
      const next = apply?.(data, value);
      const use = describeUse(tool, value);
      // Used, it's the person's: it stays, at this value, and the model leaves it alone.
      pin(tool.id, value);
      if (next && JSON.stringify(next) !== JSON.stringify(data)) {
        setPrevious(data);
        setData(next);
        setNote({ id: Date.now(), text: `Applied · ${use}`, undo: true });
        return;
      }
      // Anything the client can't do by itself, the model carries out.
      // Either way the edits stream in and land as they arrive.
      const work =
        kind === "document"
          ? rewrite(data, tool as GeneratedTool<unknown>, value)
          : runTool(kind, data, tool, value, selection, (next) => setData(next)).then((result) => ({
              ...result,
              summary: result.skipped ? `${result.summary} (${result.skipped} edit${result.skipped === 1 ? "" : "s"} didn't fit)` : result.summary,
            }));
      carryOut(data, tool.label, use, work);
    },
    [data, kind, selection, pin, rewrite, carryOut],
  );

  /**
   * A blank just filled: rewrite what depends on it. One the writing stopped
   * at carries on with what was being done when it was left.
   */
  const followBlank = useCallback(
    (next: Data, key: string) => {
      const doc = next as ToolbarDataByKind["document"];
      const blanks = doc.blanks ?? {};
      const blank = blanks[key];
      if (!blank?.value) return;
      // Asked together, answered together: carry on once the last of them is in.
      const open = blanksStillOpen(blanks, key);
      if (open.length) {
        setNote({ id: Date.now(), text: `${open.length} more to answer: ${open.map((other) => blanks[other]!.ask).join(", ")}` });
        return;
      }
      const keys = Object.keys(blanks).filter((other) => other === key || (blanks[other]!.request === blank.request && blanks[other]!.value));
      carryOut(next, "fill that in", keys.map((other) => blanks[other]!.value).join(", "), rewrite(next, FILL_TOOL, undefined, blankFollowUp(blanks, keys, doc.body)));
    },
    [rewrite, carryOut],
  );

  /** Edits from the interface; on a Document, a blank filled or changed is followed up. */
  const change = (next: Data) => {
    const before = (data as ToolbarDataByKind["document"]).blanks ?? {};
    const after = (next as ToolbarDataByKind["document"]).blanks ?? {};
    const filled = kind === "document" ? Object.keys(after).find((key) => after[key]?.value && after[key]?.value !== before[key]?.value) : undefined;
    setData(next);
    if (filled) followBlank(next, filled);
  };

  const undo = () => {
    if (!previous) return;
    setData(previous);
    setPrevious(null);
    setNote(null);
  };

  // The generated tools' share of the toolbar: chips after the standard tools, nothing behind them.
  const generated = (
    <GenerativeToolbar
      tools={tools}
      status={status}
      style="chip"
      direction="row"
      size="sm"
      count={TOOL_COUNT}
      popoverSide="bottom"
      onRun={run}
      onRegenerate={regenerate}
      onDismiss={(tool) => dismissTool(tool.id)}
      className={SCROLL_ROW}
    />
  );

  // The rest sit beside what they act on: Search's filters, a Table's rows, Generator's prompt.
  const suggestions: ShellSuggestions = Object.fromEntries(
    Object.entries(placed).flatMap(([place, set]) =>
      set?.length
        ? [
            [
              place,
              <GenerativeToolbar
                key={place}
                ariaLabel={`Suggested for ${place}`}
                tools={set}
                status={status}
                style="chip"
                // A side panel (Generator's controls) stacks its suggestions; everywhere else they run in a row.
                direction={place === "controls" ? "column" : "row"}
                size="sm"
                count={set.length}
                popoverSide="bottom"
                onRun={run}
                onDismiss={(tool) => dismissTool(tool.id)}
                wrap
              />,
            ],
          ]
        : [],
    ),
  );

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex w-full justify-center rounded-[28px] bg-gray-6 px-6 py-12 md:px-12" style={DOTS}>
        <div ref={stage} className="w-full" style={{ maxWidth: SHELL_WIDTH, height: SHELL_HEIGHT }}>
          {/* Dashboard and Article can borrow the sample Table's rows from their Data menu. */}
          <LinkableDataContext.Provider value={LINKABLE}>
            <InterfaceShell
              {...({
                kind,
                size: "large",
                data,
                status: "idle",
                tools: generated,
                suggestions,
                suggested,
                onDismissSuggestion: dismiss,
                onChange: change,
              } as InterfaceShellProps)}
            />
          </LinkableDataContext.Provider>
        </div>
      </div>

      <div className="flex min-h-9 items-center justify-center">
        <AnimatePresence mode="wait">
          {note ? (
            <motion.div
              key={note.id}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className={cn(
                "flex max-w-[720px] gap-3 bg-gray-6 py-2 pr-2 pl-4 font-bureau text-[13px] text-typography-primary",
                note.reply ? "flex-col items-start rounded-[20px] pr-4 pb-3" : "items-center rounded-full",
              )}
            >
              <div className="flex w-full min-w-0 items-center gap-3">
                <span className={cn("truncate", note.working && "animate-pulse")}>{note.text}</span>
                {note.reply && (
                  <button
                    type="button"
                    onClick={() => setNote(null)}
                    className="ml-auto cursor-pointer text-[12px] text-typography-secondary hover:text-typography-primary"
                  >
                    Close
                  </button>
                )}
              </div>
              {note.reply && <p className="whitespace-pre-wrap text-[13px] leading-[1.5] text-typography-secondary">{note.reply}</p>}
              {note.undo && previous && (
                <button
                  type="button"
                  onClick={undo}
                  className="cursor-pointer rounded-full bg-background-primary px-3 py-1 text-[12px] hover:bg-gray-5/10"
                >
                  Undo
                </button>
              )}
            </motion.div>
          ) : (
            <motion.span
              key="hint"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bureau text-[13px] text-typography-secondary"
            >
              {error && source === "model"
                ? `The model couldn't make tools, so these are from the rules · ${error.slice(0, 120)}`
                : selection
                  ? `${from === "model" ? "Model" : "Rules"} · tools for “${selection.length > 40 ? `${selection.slice(0, 39)}…` : selection}”`
                  : `${from === "model" ? "Model" : "Rules"}${
                      from === "model" && timing?.firstMs != null
                        ? ` · first tool in ${(timing.firstMs / 1000).toFixed(1)}s, all in ${(timing.ms / 1000).toFixed(1)}s`
                        : ""
                    } · edit the interface or select text in it, and the tools change to fit.`}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GenerativeToolbarPage() {
  const [params, setParams] = useSearchParams();
  const kind = pick(params.get("kind"), KINDS, "document");
  const content = pick(params.get("content"), CONTENTS, "filled");
  const source = pick(params.get("tools"), SOURCES, "model");

  const set = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );

  return (
    <div className="h-dvh w-full overflow-auto bg-background-primary font-bureau md:h-screen">
      <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-8 px-6 pt-10 pb-16 md:pr-10 md:pl-24 md:pt-14">
        <header className="flex flex-col gap-2">
          <Text variant="h1" as="h1" className="max-md:text-[32px]">
            Generative Tools
          </Text>
          <Text color="secondary" className="max-w-[680px]">
            Every large interface has a toolbar under its title: its own standard tools, then tools generated
            for what's in it now (chips, sliders, 2×2s, choices and toggles). A suggestion about one part of an
            interface sits beside it: Search's in its filters, a Table's by its rows and columns, Generator's in its
            prompt. With Model on, the model makes the tools and carries them out. P0 interfaces only.
          </Text>
        </header>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-bureau text-[12px] text-typography-secondary">Interface</span>
            <div role="radiogroup" aria-label="Interface" className="flex flex-wrap gap-1.5">
              {KINDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={option === kind}
                  onClick={() => set("kind", option)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full py-1 pr-3.5 pl-1 font-bureau text-[13px] transition-colors",
                    option === kind
                      ? "bg-gray-6 text-typography-primary"
                      : "text-typography-secondary hover:bg-gray-6/60",
                  )}
                >
                  <span className="size-7 shrink-0">
                    <ShellAppIcon kind={option} />
                  </span>
                  {kindLabel(option)}
                </button>
              ))}
            </div>
          </div>
          <Segmented
            label="Content"
            value={content}
            options={CONTENTS}
            format={(option) => (option === "filled" ? "Filled" : "Empty")}
            onChange={(option) => set("content", option)}
          />
          <Segmented
            label="Tools from"
            value={source}
            options={SOURCES}
            format={(option) => (option === "model" ? "Model" : "Rules")}
            onChange={(option) => set("tools", option)}
          />
        </div>

        {/* A new kind or starting content is a fresh interface, so its edits don't carry over. */}
        <ToolbarLab key={`${kind}-${content}-${source}`} kind={kind} content={content} source={source} />
      </div>
    </div>
  );
}

export const Component = GenerativeToolbarPage;
