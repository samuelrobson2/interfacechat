import {
  Bold,
  CaseSensitive,
  Check,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  inlineRuns,
  isList,
  MAX_INDENT,
  numberAt,
  parseLine,
  parseNotes,
  toggleInline,
  withStyle,
  writeNotes,
  type InlineStyle,
  type NoteLine,
  type NoteStyle,
} from "../model/notes-lines";
import type { NotesShellData, ShellProps } from "../model/shell-types";
import { PreviewBody, PreviewHead, ShellBody, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { DismissSuggestion, SuggestedText, placedSuggestions } from "../ui/suggested-chip";
import { ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolMenu } from "../ui/shell-toolbar";
import { Bar, fieldEvents, isSubmitShortcut, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const STYLE_LABEL: Record<NoteStyle, string> = {
  title: "Title",
  heading: "Heading",
  subheading: "Subheading",
  body: "Body",
  mono: "Monostyled",
  bullet: "Bulleted list",
  dash: "Dashed list",
  number: "Numbered list",
  check: "Checklist",
};

/** Each style's type, at medium plus and at large. Body sizes snap to the size's ramp. */
function typeOf(style: NoteStyle, large: boolean) {
  switch (style) {
    case "title":
      return large ? "text-[22px] leading-[1.3] font-semibold" : "text-[17px] leading-[1.35] font-semibold";
    case "heading":
      return large ? "text-[18px] leading-[1.35] font-semibold" : "text-[16px] leading-[1.35] font-semibold";
    case "subheading":
      return cn(large ? "text-[15px] leading-[1.6]" : "text-[13px] leading-[1.5]", "font-semibold");
    case "mono":
      return cn(large ? "text-[14px] leading-[1.6]" : "text-[12px] leading-[1.5]", "font-mono");
    default:
      return large ? "text-[15px] leading-[1.6]" : "text-[13px] leading-[1.5]";
  }
}

/** A line's words as drawn: bold, italic, underline and strikethrough, and a body line's "Label:" set apart. */
function Words({ line }: { line: NoteLine }) {
  const label = line.style === "body" ? line.text.match(/^([^:*_~`]{1,24}):(?=\s)/) : null;
  const rest = label ? line.text.slice(label[0].length) : line.text;
  return (
    <>
      {label && <span className="text-typography-secondary">{label[0]}</span>}
      {inlineRuns(rest).map((run, i) => (
        <span
          key={i}
          className={cn(run.bold && "font-semibold", run.italic && "italic", run.underline && "underline underline-offset-2", run.strike && "line-through")}
        >
          {run.text}
        </span>
      ))}
    </>
  );
}

/** What goes before a list line: a bullet, a dash, its number, or a checkbox. */
function Marker({ lines, index, large, onToggle }: { lines: NoteLine[]; index: number; large: boolean; onToggle?: () => void }) {
  const line = lines[index]!;
  const box = large ? "w-6" : "w-5";
  if (line.style === "bullet") return <span aria-hidden className={cn(box, "shrink-0 text-center text-typography-secondary")}>•</span>;
  if (line.style === "dash") return <span aria-hidden className={cn(box, "shrink-0 text-center text-typography-secondary")}>–</span>;
  if (line.style === "number") return <span aria-hidden className={cn(box, "shrink-0 pr-1 text-right text-typography-secondary tabular-nums")}>{numberAt(lines, index)}.</span>;
  if (line.style !== "check") return null;
  const tick = (
    <span
      className={cn(
        "grid size-[18px] place-items-center rounded-full border transition-colors",
        line.checked ? "border-transparent bg-orange-5 text-white" : "border-shell-control bg-shell-panel",
      )}
    >
      {line.checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
  return (
    <span className={cn(box, "grid shrink-0 place-items-center self-start", large ? "h-[24px]" : "h-[19.5px]")}>
      {onToggle ? (
        <button type="button" aria-label={line.checked ? "Mark not done" : "Mark done"} aria-pressed={line.checked} {...fieldEvents} onClick={(event) => { stopFieldEvent(event); onToggle(); }} className="cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-blue-4/50 focus-visible:outline-none">
          {tick}
        </button>
      ) : (
        tick
      )}
    </span>
  );
}

type Caret = { index: number; start: number; end: number };

/**
 * Notes: a scratchpad for working something out. Plain text, a line at a
 * time, with the styles Apple Notes has (title, headings, monostyled, bulleted,
 * dashed and numbered lists, checklists; bold, italic, underline,
 * strikethrough; indents), each marked in the text itself (notes-lines.ts) so
 * the model writes notes as text. The person types into it and the model adds
 * to it as it works; the guide, schedule or checklist it leads to are made from it.
 */
export function NotesShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  tools,
  actions,
  suggested,
  onDismissSuggestion,
  suggestions,
  className,
}: ShellProps<NotesShellData>) {
  // The line being typed in, and where its caret was last (the toolbar acts there, even after focus moves to a menu).
  const [editing, setEditing] = useState<number | null>(null);
  const caret = useRef<Caret | null>(null);
  // The line the toolbar shows the style of: the one being typed in, or the one last typed in.
  const [lastLine, setLastLine] = useState<number | null>(null);
  // Where the caret goes after the next render (a new line, a merged line, a style change).
  const pending = useRef<Caret | null>(null);
  const [, rerender] = useState(0);
  const setPending = (at: Caret) => {
    pending.current = at;
    rerender((n) => n + 1);
  };
  const inputs = useRef(new Map<number, HTMLInputElement>());

  useLayoutEffect(() => {
    const at = pending.current;
    if (!at) return;
    const node = inputs.current.get(at.index);
    if (!node) return;
    node.focus();
    node.setSelectionRange(at.start, at.end);
    caret.current = at;
    pending.current = null;
  });

  if (size === "small") return <ShellAppIcon kind="notes" className={className} />;

  const lines = parseNotes(data.body);
  const filled = lines.filter((line) => line.text.trim());

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="notes" title={data.title} />
        {/* Shapes, not words: a few lines of notes, a list's markers drawn as dots. */}
        <PreviewBody className="gap-1.5">
          {(filled.length ? filled : parseNotes("\n\n\n")).slice(0, 5).map((line, i) => (
            <span key={i} className="flex items-center gap-1">
              {isList(line.style) && <span className="size-1 shrink-0 rounded-full bg-shell-ink-soft" />}
              <Bar width={`${[22, 18, 26, 20, 16][i % 5]}%`} className={cn("h-1", line.style === "title" || line.style === "heading" ? "bg-shell-ink-soft" : "bg-shell-ink-faint")} />
              <Bar width={`${[48, 56, 40, 52, 44][i % 5]}%`} className={cn("h-1", line.text ? "bg-shell-ink-soft" : "bg-shell-ink-faint")} />
            </span>
          ))}
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<NotesShellData>) => onChange({ ...data, ...patch }) : undefined;
  const setLines = (next: NoteLine[], focus?: Caret) => {
    update?.({ body: writeNotes(next) });
    if (focus) {
      setEditing(focus.index);
      setPending(focus);
    }
  };
  const edit = (index: number, change: (line: NoteLine) => NoteLine, focus?: Caret) =>
    setLines(lines.map((line, i) => (i === index ? change(line) : line)), focus);
  // The toolbar acts on the line the caret is in, or was last; with none, the last line.
  const target = (): Caret => caret.current && caret.current.index < lines.length ? caret.current : { index: lines.length - 1, start: lines.at(-1)!.text.length, end: lines.at(-1)!.text.length };
  const current = lines[editing ?? lastLine ?? -1];

  const styleLine = (style: NoteStyle) => {
    const at = target();
    edit(at.index, (line) => withStyle(line, style), at);
  };
  const inline = (style: InlineStyle, at = target()) => {
    const line = lines[at.index]!;
    const next = toggleInline(line.text, at.start, at.end, style);
    edit(at.index, (l) => ({ ...l, text: next.text }), { index: at.index, start: next.start, end: next.end });
  };
  const indent = (by: 1 | -1, at = target()) => {
    if (!isList(lines[at.index]!.style)) return;
    edit(at.index, (line) => ({ ...line, indent: Math.max(0, Math.min(MAX_INDENT, line.indent + by)) }), at);
  };

  const onKey = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    stopFieldEvent(event);
    if (isSubmitShortcut(event)) return onSubmit?.();
    const node = event.currentTarget;
    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? start;
    const line = lines[index]!;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.shiftKey && ["b", "i", "u"].includes(event.key.toLowerCase())) {
      event.preventDefault();
      return inline(({ b: "bold", i: "italic", u: "underline" } as const)[event.key.toLowerCase() as "b" | "i" | "u"], { index, start, end });
    }
    if (mod && event.shiftKey && event.key.toLowerCase() === "x") {
      event.preventDefault();
      return inline("strike", { index, start, end });
    }
    if (event.key === "Enter") {
      event.preventDefault();
      // An empty list line ends the list, as in Notes.
      if (isList(line.style) && !line.text) return edit(index, (l) => withStyle(l, "body"), { index, start: 0, end: 0 });
      const before = { ...line, text: line.text.slice(0, start) };
      const after: NoteLine = isList(line.style) ? { ...line, checked: false, text: line.text.slice(end) } : { style: "body", indent: 0, checked: false, text: line.text.slice(end) };
      return setLines([...lines.slice(0, index), before, after, ...lines.slice(index + 1)], { index: index + 1, start: 0, end: 0 });
    }
    if (event.key === "Backspace" && start === 0 && end === 0) {
      if (line.style !== "body") {
        event.preventDefault();
        return isList(line.style) && line.indent > 0 ? indent(-1, { index, start, end }) : edit(index, (l) => withStyle(l, "body"), { index, start: 0, end: 0 });
      }
      if (index > 0) {
        event.preventDefault();
        const previous = lines[index - 1]!;
        const join = previous.text.length;
        return setLines(
          [...lines.slice(0, index - 1), { ...previous, text: previous.text + line.text }, ...lines.slice(index + 1)],
          { index: index - 1, start: join, end: join },
        );
      }
    }
    if (event.key === "Tab" && isList(line.style)) {
      event.preventDefault();
      return indent(event.shiftKey ? -1 : 1, { index, start, end });
    }
    if ((event.key === "ArrowUp" && index > 0) || (event.key === "ArrowDown" && index < lines.length - 1)) {
      event.preventDefault();
      const to = index + (event.key === "ArrowUp" ? -1 : 1);
      const at = Math.min(start, lines[to]!.text.length);
      setEditing(to);
      setPending({ index: to, start: at, end: at });
    }
  };

  const onType = (index: number, value: string, node: HTMLInputElement) => {
    const line = lines[index]!;
    // Markdown shortcuts at the start of a body line: "- ", "1. ", "[] ", "# " become the style.
    if (line.style === "body") {
      const shortcut = value.replace(/^\[\] /, "[ ] ");
      const parsed = parseLine(shortcut);
      if (parsed.style !== "body" && parsed.style !== "mono") {
        const shift = shortcut.length - parsed.text.length;
        const at = Math.max(0, (node.selectionStart ?? value.length) - shift);
        return edit(index, () => parsed, { index, start: at, end: at });
      }
    }
    edit(index, (l) => ({ ...l, text: value }));
  };

  const remember = (index: number, node: HTMLInputElement) => {
    caret.current = { index, start: node.selectionStart ?? 0, end: node.selectionEnd ?? 0 };
    setLastLine(index);
  };

  // Suggested lines (an open question, a fact the model would add) sit after the notes, in the suggestion gradient.
  const addLine = (text: string) => setLines([...lines.filter((line, i) => line.text || i < lines.length - 1), parseLine(text)]);
  const offered = update ? placedSuggestions(suggested?.text, lines.map((line) => line.text)).slice(0, 4) : [];
  const empty = lines.length === 1 && !lines[0]!.text && lines[0]!.style === "body";
  const listStyle = current && ["bullet", "dash", "number"].includes(current.style) ? current.style : null;

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="notes" size={size} value={data.title} placeholder="What are you working out?" onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
      {/* Apple Notes' tools: the style of a line, its words, lists and checklists, indents. */}
      <ShellToolbar tools={tools} actions={actions}>
        <ShellToolMenu
          label="Text style"
          icon={<CaseSensitive />}
          disabled={!update}
          items={(["title", "heading", "subheading", "body", "mono"] as const).map((style) => ({
            id: style,
            label: STYLE_LABEL[style],
            checked: (current?.style ?? "body") === style,
            onSelect: () => styleLine(style),
          }))}
        />
        <ShellToolDivider />
        <ShellToolButton label="Bold (⌘B)" disabled={!update} onPress={() => inline("bold")}>
          <Bold />
        </ShellToolButton>
        <ShellToolButton label="Italic (⌘I)" disabled={!update} onPress={() => inline("italic")}>
          <Italic />
        </ShellToolButton>
        <ShellToolButton label="Underline (⌘U)" disabled={!update} onPress={() => inline("underline")}>
          <Underline />
        </ShellToolButton>
        <ShellToolButton label="Strikethrough (⌘⇧X)" disabled={!update} onPress={() => inline("strike")}>
          <Strikethrough />
        </ShellToolButton>
        <ShellToolDivider />
        <ShellToolMenu
          label="List"
          icon={listStyle === "number" ? <ListOrdered /> : listStyle === "dash" ? <Minus /> : <List />}
          active={Boolean(listStyle)}
          disabled={!update}
          items={(["bullet", "dash", "number"] as const).map((style) => ({
            id: style,
            label: STYLE_LABEL[style],
            icon: style === "number" ? <ListOrdered /> : style === "dash" ? <Minus /> : <List />,
            checked: current?.style === style,
            onSelect: () => styleLine(style),
          }))}
        />
        <ShellToolButton label="Checklist" active={current?.style === "check"} disabled={!update} onPress={() => styleLine("check")}>
          <ListChecks />
        </ShellToolButton>
        <ShellToolButton label="Decrease indent" disabled={!update || !current || !isList(current.style) || current.indent === 0} onPress={() => indent(-1)}>
          <IndentDecrease />
        </ShellToolButton>
        <ShellToolButton label="Increase indent" disabled={!update || !current || !isList(current.style) || current.indent >= MAX_INDENT} onPress={() => indent(1)}>
          <IndentIncrease />
        </ShellToolButton>
        {/* Only between its own tools and generated ones. */}
        {tools && <ShellToolDivider />}
      </ShellToolbar>
      <ShellBody size={size} className="gap-0.5">
        {lines.map((line, index) => {
          const type = typeOf(line.style, large);
          const done = line.style === "check" && line.checked;
          const gap = line.style === "title" || line.style === "heading" ? (index > 0 ? "mt-2" : "") : "";
          return (
            <div key={index} className={cn("flex min-w-0 items-start", gap)} style={{ paddingLeft: line.indent * (large ? 22 : 18) }}>
              <Marker lines={lines} index={index} large={large} onToggle={update && (() => edit(index, (l) => ({ ...l, checked: !l.checked })))} />
              {update && editing === index ? (
                <input
                  ref={(node) => {
                    if (node) inputs.current.set(index, node);
                    else inputs.current.delete(index);
                  }}
                  value={line.text}
                  aria-label={`Line ${index + 1}: ${STYLE_LABEL[line.style]}`}
                  placeholder={empty ? "What you're trying to do, and what you know so far" : undefined}
                  {...fieldEvents}
                  onChange={(event) => onType(index, event.target.value, event.target)}
                  onKeyDown={(event) => onKey(index, event)}
                  onSelect={(event) => remember(index, event.currentTarget)}
                  onBlur={() => setEditing((at) => (at === index ? null : at))}
                  className={cn(type, "min-w-0 flex-1 bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary", line.style === "mono" && "font-mono", done && "text-typography-secondary line-through")}
                />
              ) : (
                <div
                  // Each line takes focus, so Tab and a click both start typing in it.
                  role={update ? "textbox" : undefined}
                  aria-label={update ? `Line ${index + 1}: ${STYLE_LABEL[line.style]}` : undefined}
                  tabIndex={update ? 0 : undefined}
                  {...(update ? fieldEvents : {})}
                  onFocus={
                    update
                      ? () => {
                          const at = caret.current?.index === index ? caret.current : { index, start: line.text.length, end: line.text.length };
                          setEditing(index);
                          setPending(at);
                        }
                      : undefined
                  }
                  className={cn(
                    type,
                    "min-h-[1lh] min-w-0 flex-1 font-bureau break-words whitespace-pre-wrap text-typography-primary outline-none",
                    update && "cursor-text",
                    line.style === "mono" && "rounded-[4px] bg-shell-fill px-1",
                    done && "text-typography-secondary line-through",
                  )}
                >
                  {empty && !update ? <span className="text-typography-secondary">Nothing noted yet</span> : empty ? <span className="text-typography-secondary">What you're trying to do, and what you know so far</span> : <Words line={line} />}
                </div>
              )}
            </div>
          );
        })}
        {offered.map((placed) => (
          <div key={placed.value} className="group/suggested flex items-start gap-1">
            <SuggestedText text={placed.value} onAccept={() => addLine(placed.value)} className={cn(typeOf("body", large), "min-w-0 flex-1 font-bureau")} />
            {onDismissSuggestion && <DismissSuggestion label={placed.value} onDismiss={() => onDismissSuggestion("text", placed.value)} />}
          </div>
        ))}
        {/* On the chat home: what the goal leaves open, as choices with a guess. */}
        {!large && suggestions?.brief}
      </ShellBody>
      {!large && filled.length > 0 && <ShellDetail>{filled.length} {filled.length === 1 ? "note" : "notes"}</ShellDetail>}
    </ShellSurface>
  );
}
