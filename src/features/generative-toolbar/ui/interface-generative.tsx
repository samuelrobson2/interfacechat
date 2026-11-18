import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SHELL_META, type ShellKind, type ShellSuggestions, type SuggestedGroup, type SuggestedValues } from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { TOOLBAR_KINDS, type GeneratedTool, type ToolbarDataByKind, type ToolbarKind } from "../model/generate-tools";
import { GENERATIVE_SOURCES, useGenerativeSource, type GenerativeSource } from "../model/generative-source";
import { suggestValues } from "../model/suggest-values";
import { useContextSuggestions } from "../model/context-suggestions";
import { blankFollowUp, blanksStillOpen, rewriteDocument, runTool } from "../model/toolbar-api";
import { describeUse, type ToolSpec, type ToolValue } from "../model/tool-spec";
import { useGeneratedTools } from "../model/use-generated-tools";
import { GenerativeToolbar } from "./generative-toolbar";
import { useSelectionIn } from "./use-selection-in";

/**
 * Generated tools and suggestions for any interface, wherever it's drawn (a
 * chat's window, the chat home's card, the Design System page): the same
 * engine the toolbar lab tries out, as props for `InterfaceShell`.
 *
 * - Tools come from the model (`/api/toolbar-tools`), or the rules when it
 *   can't be reached or the source is set to Rules; off draws none.
 * - Each sits where the system puts it (`placeOf`): the toolbar after the
 *   standard tools, or beside the part it acts on.
 * - Running one applies it in place when the client can; otherwise the model
 *   carries it out (`/api/toolbar-run`, a Document's `/api/toolbar-rewrite`),
 *   streaming its edits through `onChange`, with a note and Undo.
 * - Medium plus and large only: medium has no toolbar.
 */

type Note = { id: number; text: string; undo?: boolean; reply?: string; working?: boolean };
type Size = "medium" | "medium-plus" | "large" | "inline";

/** What filling a blank asks the rewrite for: not a toolbar tool, but the same route. */
const FILL_TOOL: ToolSpec = { type: "action", id: "fill-blank", label: "Fill a blank", detail: "Rewrite what depends on the answer", icon: "sparkles" };

/** Generated tools the toolbar holds at each size; past its room, the row scrolls. */
const COUNT: Record<"medium-plus" | "large", number> = { "medium-plus": 3, large: 5 };

export const isToolbarKind = (kind: ShellKind | string): kind is ToolbarKind => (TOOLBAR_KINDS as readonly string[]).includes(kind);

export function useInterfaceGenerative<D>({
  kind,
  size,
  data,
  onChange,
  root,
  enabled = true,
  settleMs,
  context,
  suggest,
}: {
  kind: ShellKind;
  size: Size;
  data: D;
  /** Where edits go: a tool's result, each streamed edit, an Undo. */
  onChange: (data: D) => void;
  /** The element around the interface: text selected inside it steers the tools. */
  root: React.RefObject<HTMLElement | null>;
  /** The host can turn it off (an interface the person can't edit). */
  enabled?: boolean;
  /** Wait this long after the last change before asking the model (the chat home, where it changes with every keystroke). */
  settleMs?: number;
  /** The thread around the interface (its Notes, the latest messages), so suggestions fit what's been said. */
  context?: string;
  /** Suggestions in place, apart from generated tools; on wherever tools are, unless set (a tracked interface: suggestions, no tools). */
  suggest?: boolean;
}) {
  const source = useGenerativeSource((state) => state.source);
  const fits = size === "medium-plus" || size === "large";
  const on = enabled && fits && source !== "off" && isToolbarKind(kind);
  const toolbarKind = (isToolbarKind(kind) ? kind : "document") as ToolbarKind;
  type Data = ToolbarDataByKind[ToolbarKind];

  // Text selected inside the interface steers the tools.
  const selection = useSelectionIn(root);

  const generated = useGeneratedTools(
    toolbarKind,
    data as unknown as Data,
    { selection },
    COUNT[size === "large" ? "large" : "medium-plus"],
    source === "rules" ? "rules" : "model",
    on,
    settleMs,
  );
  const { tools, placed, status, from, error, regenerate, markUsed, restore, dismiss: dismissTool } = generated;

  const [dismissed, setDismissed] = useState<Partial<Record<SuggestedGroup, string[]>>>({});
  // Suggestions in place, from the model, read off the interface and the thread: for every interface with something to offer.
  const suggestOn = (suggest ?? enabled) && fits && source === "model";
  const fromThread = useContextSuggestions({ kind, label: SHELL_META[kind].label, data, context, on: suggestOn, dismissed });
  const dismissSuggestion = (group: SuggestedGroup, value: string) => setDismissed((d) => ({ ...d, [group]: [...(d[group] ?? []), value] }));
  const [note, setNote] = useState<Note | null>(null);
  const [previous, setPrevious] = useState<D | null>(null);
  // The action the last run used up, so Undo can bring it back.
  const spent = useRef<string | null>(null);

  // Read at the moment a tool runs, so a long run lands on the latest data.
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);
  const change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);

  // Notes clear themselves (not while working, or while showing a reply).
  useEffect(() => {
    if (!note || note.working || note.reply) return;
    const timer = window.setTimeout(() => setNote(null), 5000);
    return () => window.clearTimeout(timer);
  }, [note]);

  type Outcome = { data: D | null; reply: string | null; summary: string };
  const carryOut = useCallback((before: D, label: string, use: string, work: Promise<Outcome>) => {
    const id = Date.now();
    setNote({ id, text: `Working · ${use}`, working: true });
    work
      .then((result) => {
        const changed = result.data && JSON.stringify(result.data) !== JSON.stringify(before);
        // A streamed rewrite may have shown part of a change it then took back.
        change.current(changed ? result.data! : before);
        if (changed) setPrevious(before);
        setNote((current) =>
          current?.id === id
            ? { id, text: changed ? result.summary || use : result.reply ? use : `No change · ${use}`, undo: !!changed, reply: result.reply ?? undefined }
            : current,
        );
      })
      .catch((reason: unknown) => {
        change.current(before);
        setNote((current) => (current?.id === id ? { id, text: `Couldn't ${label.toLowerCase()} · ${reason instanceof Error ? reason.message : reason}` } : current));
      });
  }, []);

  /** A Document's body, rewritten in place and streamed. */
  const rewrite = useCallback(
    (before: D, tool: GeneratedTool<unknown> | ToolSpec, value: ToolValue, request?: string): Promise<Outcome> => {
      const doc = before as unknown as ToolbarDataByKind["document"];
      const withBody = (body: string, blanks: ToolbarDataByKind["document"]["blanks"]) => ({ ...doc, body, blanks: { ...doc.blanks, ...blanks } }) as unknown as D;
      return rewriteDocument(doc, tool, value, selection, (body, blanks) => change.current(withBody(body, blanks)), undefined, request).then((result) => ({
        ...result,
        data: result.text === null ? null : withBody(result.text, result.blanks),
      }));
    },
    [selection],
  );

  const run = useCallback(
    (tool: GeneratedTool<Data>, value: ToolValue) => {
      const before = latest.current;
      const apply = tool.apply as ((data: D, value: ToolValue) => D) | undefined;
      const next = apply?.(before, value);
      const use = describeUse(tool, value);
      // Used: an action is done, so it goes; a setting stays, at this value, and the model leaves it alone.
      markUsed(tool, value);
      spent.current = tool.type === "action" ? tool.id : null;
      if (next && JSON.stringify(next) !== JSON.stringify(before)) {
        setPrevious(before);
        change.current(next);
        setNote({ id: Date.now(), text: `Applied · ${use}`, undo: true });
        return;
      }
      // Anything the client can't do by itself, the model carries out, streaming its edits in.
      const work: Promise<Outcome> =
        toolbarKind === "document"
          ? rewrite(before, tool as GeneratedTool<unknown>, value)
          : runTool(toolbarKind, before as unknown as Data, tool, value, selection, (streamed) => change.current(streamed as unknown as D)).then((result) => ({
              data: result.data as unknown as D | null,
              reply: result.reply,
              summary: result.skipped ? `${result.summary} (${result.skipped} edit${result.skipped === 1 ? "" : "s"} didn't fit)` : result.summary,
            }));
      carryOut(before, tool.label, use, work);
    },
    [toolbarKind, selection, markUsed, rewrite, carryOut],
  );

  /** Edits from the interface; on a Document, a blank just filled is followed up by the model. */
  const onEdit = useCallback(
    (next: D) => {
      const before = (latest.current as unknown as ToolbarDataByKind["document"]).blanks ?? {};
      const blanks = (next as unknown as ToolbarDataByKind["document"]).blanks ?? {};
      const filled = on && toolbarKind === "document" ? Object.keys(blanks).find((key) => blanks[key]?.value && blanks[key]?.value !== before[key]?.value) : undefined;
      change.current(next);
      if (!filled) return;
      const open = blanksStillOpen(blanks, filled);
      if (open.length) {
        setNote({ id: Date.now(), text: `${open.length} more to answer: ${open.map((other) => blanks[other]!.ask).join(", ")}` });
        return;
      }
      const blank = blanks[filled]!;
      const keys = Object.keys(blanks).filter((other) => other === filled || (blanks[other]!.request === blank.request && blanks[other]!.value));
      const body = (next as unknown as ToolbarDataByKind["document"]).body;
      carryOut(next, "fill that in", keys.map((other) => blanks[other]!.value).join(", "), rewrite(next, FILL_TOOL, undefined, blankFollowUp(blanks, keys, body)));
    },
    [on, toolbarKind, rewrite, carryOut],
  );

  const undo = useCallback(() => {
    if (previous === null) return;
    change.current(previous);
    setPrevious(null);
    setNote(null);
    // Undone, the action that did it is offered again.
    if (spent.current) restore(spent.current);
    spent.current = null;
  }, [previous, restore]);

  // No tools here (not a toolbar interface, or tools off for it): suggestions alone, when there are any.
  if (!on)
    return {
      props: fromThread ? { onChange, suggested: fromThread, onDismissSuggestion: dismissSuggestion } : { onChange },
      note: null,
      status: null,
      from: null,
      error: null,
      regenerate: null,
    };

  const onRun = run as unknown as (tool: GeneratedTool<unknown>, value: ToolValue) => void;
  const toolbar = (
    <GenerativeToolbar
      tools={tools as GeneratedTool<unknown>[]}
      status={status}
      style="chip"
      direction="row"
      size="sm"
      count={tools.length || COUNT[size === "large" ? "large" : "medium-plus"]}
      popoverSide="bottom"
      onRun={onRun}
      onRegenerate={regenerate}
      onDismiss={(tool) => dismissTool(tool.id)}
      className="flex-nowrap"
    />
  );
  const suggestions = Object.fromEntries(
    Object.entries(placed).flatMap(([place, set]) =>
      set?.length
        ? [[
            place,
            <GenerativeToolbar
              key={place}
              ariaLabel={`Suggested for ${place}`}
              tools={set as GeneratedTool<unknown>[]}
              status={status}
              style="chip"
              direction={place === "controls" ? "column" : "row"}
              size="sm"
              count={set.length}
              popoverSide="bottom"
              onRun={onRun}
              onDismiss={(tool) => dismissTool(tool.id)}
              wrap
            />,
          ]]
        : [],
    ),
  ) as ShellSuggestions;
  // From the thread when the model has answered; the hand-written rules only when tools come from the rules.
  const suggested: SuggestedValues | undefined = fromThread ?? (source === "rules" && status === "ready" ? suggestValues(toolbarKind, data as unknown as Data, dismissed) : undefined);

  return {
    props: {
      tools: toolbar,
      suggestions,
      suggested,
      onDismissSuggestion: dismissSuggestion,
      onChange: onEdit,
    },
    /** What a run is doing or did, with Undo: the host draws it over the interface's foot. */
    note: <GenerativeNote note={note} canUndo={previous !== null} onUndo={undo} onClose={() => setNote(null)} />,
    status,
    from,
    error,
    regenerate,
  };
}

/** A run's progress and outcome, floating over the bottom of the interface. */
function GenerativeNote({ note, canUndo, onUndo, onClose }: { note: Note | null; canUndo: boolean; onUndo: () => void; onClose: () => void }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-4">
      <AnimatePresence>
        {note && (
          <motion.div
            key={note.id}
            initial={reduce ? false : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "pointer-events-auto flex max-w-full gap-3 bg-gray-5 py-1.5 pr-1.5 pl-3.5 font-bureau text-[12px] text-white shadow-[0_6px_20px_rgba(26,23,24,0.18)]",
              note.reply ? "flex-col items-start rounded-[16px] pr-3.5 pb-3" : "items-center rounded-full",
            )}
          >
            <div className="flex w-full min-w-0 items-center gap-3">
              <span className={cn("truncate", note.working && "animate-pulse")}>{note.text}</span>
              {canUndo && note.undo && (
                <button type="button" onClick={onUndo} className="cursor-pointer rounded-full bg-white/15 px-2.5 py-1 hover:bg-white/25">
                  Undo
                </button>
              )}
              {note.reply && (
                <button type="button" onClick={onClose} className="ml-auto cursor-pointer text-white/80 hover:text-white">
                  Close
                </button>
              )}
            </div>
            {note.reply && <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[12px] leading-[1.5] text-white/85">{note.reply}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SOURCE_LABEL: Record<GenerativeSource, string> = { model: "Model", rules: "Rules", off: "Off" };

/** Where every interface's generated tools come from: one switch for the whole app. */
export function GenerativeSourceSwitch({ className }: { className?: string }) {
  const { source, setSource } = useGenerativeSource();
  return (
    <div role="radiogroup" aria-label="Generated tools" className={cn("flex w-fit items-center gap-1 rounded-full bg-gray-6 p-0.5", className)}>
      <span className="pr-1 pl-2.5 font-bureau text-[12px] text-typography-secondary">Tools</span>
      {GENERATIVE_SOURCES.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === source}
          onClick={() => setSource(option)}
          className={cn(
            "cursor-pointer rounded-full px-2.5 py-1 font-bureau text-[12px] transition-colors",
            option === source ? "bg-background-primary text-typography-primary shadow-[0_1px_3px_rgba(26,23,24,0.12)]" : "text-typography-secondary hover:text-typography-primary",
          )}
        >
          {SOURCE_LABEL[option]}
        </button>
      ))}
    </div>
  );
}
