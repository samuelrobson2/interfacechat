import {
  Bold,
  Heading,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Plus,
} from "lucide-react";
import { useLayoutEffect, useReducer, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  applyShortcut,
  countWords,
  newBlock,
  numberedIndices,
  parseBlocks,
  parseInline,
  plainText,
  renderedToRawOffset,
  serializeBlocks,
  type BlockType,
  type DocBlock,
} from "../model/markdown-blocks";
import type { DocumentShellData, ShellStatus, ShellSuggestions, Suggestion } from "../model/shell-types";
import { CONTENT_PANEL, SHELL_BODY_BOX, SHELL_TITLE_ROW } from "../ui/shell-kit";
import { DocBlankSlot } from "./doc-blank";
import { placedSuggestions, SuggestedText, suggestionsAfter, type PlacedSuggestion } from "../ui/suggested-chip";
import { DocumentEmbed, documentApp, INSERT_KINDS, newEmbed, type InsertKind } from "./document-embeds";
import { useAppRuntime } from "../apps/use-app-runtime";
import { displayValue } from "../apps/app-query";
import type { AppBlock } from "../apps/app-types";
import {
  ShellToolbar,
  ShellToolButton,
  ShellToolDivider,
  ShellToolField,
  ShellToolMenu,
  ShellToolPopover,
} from "../ui/shell-toolbar";
import { ShellFooter } from "../ui/shell-meta";
import {
  AutoTextarea,
  fieldEvents,
  isSubmitShortcut,
  stopFieldEvent,
} from "../ui/shell-surface";

export type EditorDensity = "compact" | "comfortable";

const BLOCK_TEXT: Record<EditorDensity, Record<BlockType, string>> = {
  comfortable: {
    paragraph: "text-[15px] leading-[1.65]",
    heading1: "text-[24px] leading-[1.3] tracking-[-0.2px]",
    heading2: "text-[18px] leading-[1.4]",
    bullet: "text-[15px] leading-[1.65]",
    numbered: "text-[15px] leading-[1.65]",
    quote: "text-[15px] leading-[1.65] text-typography-secondary",
    embed: "",
  },
  compact: {
    paragraph: "text-[12px] leading-[1.5]",
    heading1: "text-[14px] leading-[1.35] font-semibold",
    heading2: "text-[12px] leading-[1.4] font-semibold",
    bullet: "text-[12px] leading-[1.5]",
    numbered: "text-[12px] leading-[1.5]",
    quote: "text-[12px] leading-[1.5] text-typography-secondary",
    embed: "",
  },
};

const BLOCK_GAP: Record<EditorDensity, Record<BlockType, string>> = {
  comfortable: {
    paragraph: "mt-3",
    heading1: "mt-7",
    heading2: "mt-6",
    bullet: "mt-1",
    numbered: "mt-1",
    quote: "mt-4",
    embed: "mt-5",
  },
  compact: {
    paragraph: "mt-1.5",
    heading1: "mt-2.5",
    heading2: "mt-2",
    bullet: "mt-0.5",
    numbered: "mt-0.5",
    quote: "mt-1.5",
    embed: "mt-2",
  },
};

const BLOCK_PLACEHOLDER: Record<BlockType, string> = {
  paragraph: "Write, or type # for a heading, - for a list",
  heading1: "Heading",
  heading2: "Subheading",
  bullet: "List item",
  numbered: "List item",
  quote: "Quote",
  embed: "",
};

const isList = (type: BlockType) => type === "bullet" || type === "numbered";

function InlineText({
  text,
  blanks,
  onFill,
  live,
}: {
  text: string;
  blanks?: DocumentShellData["blanks"];
  /** Given when the document is editable: fills a blank by key. */
  onFill?: (key: string, value: string) => void;
  /** A control's current value, for a `{{id}}` that names one of the document's variables: the sentence moves with it. */
  live?: (key: string) => string | undefined;
}) {
  return (
    <>
      {parseInline(text).map((segment, i) => {
        if (segment.blank !== undefined) {
          const key = segment.blank;
          const value = blanks?.[key] ? undefined : live?.(key);
          if (value !== undefined) {
            return (
              <span key={i} className="font-normal text-blue-5 tabular-nums">
                {value}
              </span>
            );
          }
          return (
            <DocBlankSlot
              key={i}
              blank={blanks?.[key]}
              editable={Boolean(onFill)}
              onFill={onFill ? (value) => onFill(key, value) : undefined}
            />
          );
        }
        if (segment.bold) {
          return (
            <strong key={i} className="font-semibold">
              {segment.text}
            </strong>
          );
        }
        if (segment.italic) return <em key={i}>{segment.text}</em>;
        if (segment.strike) return <s key={i}>{segment.text}</s>;
        if (segment.code) {
          return (
            <code key={i} className="rounded-[4px] bg-shell-fill px-1 font-bureau text-[0.95em] font-normal">
              {segment.text}
            </code>
          );
        }
        if (segment.href) {
          return (
            <a
              key={i}
              href={segment.href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-5 underline decoration-blue-5/30 underline-offset-2"
            >
              {segment.text}
            </a>
          );
        }
        return <span key={i}>{segment.text}</span>;
      })}
    </>
  );
}

/** Character offset inside `container` under the pointer. */
function caretOffsetAt(container: HTMLElement, x: number, y: number) {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => {
      offsetNode: Node;
      offset: number;
    } | null;
  };
  let node: Node | null = null;
  let offset = 0;
  if (doc.caretPositionFromPoint) {
    const position = doc.caretPositionFromPoint(x, y);
    node = position?.offsetNode ?? null;
    offset = position?.offset ?? 0;
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    node = range?.startContainer ?? null;
    offset = range?.startOffset ?? 0;
  }
  if (!node || !container.contains(node)) {
    return container.textContent?.length ?? 0;
  }
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Kept for callers; the size now comes from the toolbar tokens for the size it's drawn at. */
  density?: EditorDensity;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => {
        // Keep focus (and the selection) in the block being edited.
        event.preventDefault();
        stopFieldEvent(event);
      }}
      onPointerDown={stopFieldEvent}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn(
        "flex shrink-0 items-center justify-center text-typography-secondary transition-colors",
        "hover:bg-shell-fill hover:text-typography-primary active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-40",
        // Sized by the toolbar tokens, like every standard tool.
        "size-[calc(var(--shell-tools-icon,16px)+16px)] rounded-[8px] [&_svg]:size-[var(--shell-tools-icon,16px)]",
        active && "bg-shell-fill text-typography-primary",
      )}
    >
      {children}
    </button>
  );
}

const Divider = ({ density }: { density: EditorDensity }) => (
  <span
    aria-hidden
    className={cn("mx-1 w-px shrink-0 bg-shell-ink-faint", density === "compact" ? "h-3" : "h-4")}
  />
);

function LengthField({
  value,
  guess,
  editable,
  onChange,
}: {
  value?: string;
  /** The model's guess for this document, shown in the field in the AI colours until they set their own. */
  guess?: string;
  editable: boolean;
  onChange: (length: string | undefined) => void;
}) {
  if (!editable) return value ? <span>{value}</span> : null;
  const placeholder = guess || "~1,500 words";
  const shown = value || placeholder;
  return (
    <input
      value={value ?? ""}
      placeholder={placeholder}
      aria-label="Target length"
      title="Change the target length"
      size={Math.max(shown.length, 12)}
      {...fieldEvents}
      onChange={(event) => onChange(event.target.value || undefined)}
      className={cn(
        "w-auto max-w-[9rem] cursor-text bg-transparent text-right font-bureau text-[11px] text-typography-secondary underline decoration-dotted decoration-typography-secondary/35 underline-offset-[3px] outline-none hover:decoration-typography-secondary/70 focus:decoration-typography-secondary",
        guess && !value ? "placeholder:text-[#6b86ad]" : "placeholder:text-typography-secondary/55",
      )}
    />
  );
}

export function DocumentEditor({
  data,
  onChange,
  onSubmit,
  density,
  status = "idle",
  titlePlaceholder = "Document",
  /** Sits on the title's line, marking which interface this is. */
  titleMark,
  actions,
  tools,
  suggestions,
  suggestedText,
  lengthGuess,
  className,
}: {
  /** Sentences the model offers to add, drawn in the suggestion colour after the writing; a click adds one. */
  suggestedText?: Suggestion[];
  /** Medium plus: the model's guess for the length, shown in the length field. */
  lengthGuess?: string;
  data: DocumentShellData;
  onChange?: (data: DocumentShellData) => void;
  onSubmit?: () => void;
  density: EditorDensity;
  status?: ShellStatus;
  titlePlaceholder?: string;
  titleMark?: React.ReactNode;
  actions?: React.ReactNode;
  /** Large only: tools generated for this document, after the formatting ones. */
  tools?: React.ReactNode;
  /** Large: suggestions by the word count (`footer`). Medium plus: the request's open choices (`brief`). */
  suggestions?: ShellSuggestions;
  className?: string;
}) {
  const editable = Boolean(onChange);
  const compact = density === "compact";

  // Blocks keep their ids while editing; a body written from outside
  // (the model, a reset) re-parses them.
  const [blocks, setBlocks] = useState(() => parseBlocks(data.body));
  const [syncedBody, setSyncedBody] = useState(data.body);
  if (data.body !== syncedBody) {
    setSyncedBody(data.body);
    setBlocks(parseBlocks(data.body));
  }

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lastFocusedId, setLastFocusedId] = useState<string | null>(null);
  const pendingCaret = useRef<{ id: string; start: number; end?: number } | null>(null);
  const areas = useRef(new Map<string, HTMLTextAreaElement>());
  const titleRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [focusTick, bumpFocus] = useReducer((tick: number) => tick + 1, 0);

  useLayoutEffect(() => {
    const pending = pendingCaret.current;
    if (!pending) return;
    const node = areas.current.get(pending.id);
    if (!node) return;
    pendingCaret.current = null;
    node.focus();
    node.setSelectionRange(pending.start, pending.end ?? pending.start);
  }, [focusTick, focusedId, blocks]);

  const focusBlock = (id: string, start: number, end?: number) => {
    pendingCaret.current = { id, start, end };
    setLastFocusedId(id);
    setFocusedId(id);
    bumpFocus();
  };

  const commit = (next: DocBlock[], patch?: Partial<DocumentShellData>) => {
    const body = serializeBlocks(next);
    setSyncedBody(body);
    setBlocks(next);
    onChange?.({ ...data, ...patch, body });
  };

  // The live pieces: their data, the values controls set, and the rows code emits.
  const app = documentApp(data);
  const runtime = useAppRuntime(app);
  const liveValue = (key: string) => {
    const variable = data.variables?.find((v) => v.id === key);
    return variable ? displayValue(variable, runtime.values[key]) : undefined;
  };
  const setEmbed = (next: AppBlock) =>
    onChange?.({ ...data, blocks: (data.blocks ?? []).map((block) => (block.id === next.id ? next : block)) });
  /** Insert a stat, chart or table after the block being edited (or at the end), over the first dataset. */
  const insertEmbed = (kind: InsertKind) => {
    const block = newEmbed(kind, data);
    if (!block) return;
    const at = blocks.findIndex((entry) => entry.id === targetId());
    const index = at === -1 ? blocks.length : at + 1;
    const line = newBlock("embed", block.id);
    commit([...blocks.slice(0, index), line, ...blocks.slice(index)], { blocks: [...(data.blocks ?? []), block] });
  };
  /** Take a piece out: its line goes, and the block with it unless it's placed elsewhere too. */
  const removeEmbed = (index: number) => {
    const line = blocks[index];
    if (!line) return;
    const rest = blocks.filter((_, i) => i !== index);
    const stillUsed = rest.some((entry) => entry.type === "embed" && entry.text === line.text);
    commit(rest.length ? rest : [newBlock()], stillUsed ? undefined : { blocks: (data.blocks ?? []).filter((block) => block.id !== line.text) });
  };

  const replaceBlock = (id: string, block: DocBlock) =>
    commit(blocks.map((entry) => (entry.id === id ? block : entry)));

  const targetId = () =>
    focusedId ?? lastFocusedId ?? blocks[blocks.length - 1]?.id ?? null;

  const setType = (type: BlockType) => {
    const id = targetId();
    const block = blocks.find((entry) => entry.id === id);
    if (!block) return;
    const node = areas.current.get(block.id);
    const caret = node?.selectionStart ?? block.text.length;
    replaceBlock(block.id, {
      ...block,
      type: block.type === type && type !== "paragraph" ? "paragraph" : type,
    });
    focusBlock(block.id, caret);
  };

  const wrapSelection = (marker: string) => {
    const id = targetId();
    const block = blocks.find((entry) => entry.id === id);
    if (!block) return;
    const node = areas.current.get(block.id);
    const start = node?.selectionStart ?? block.text.length;
    const end = node?.selectionEnd ?? block.text.length;
    const value = block.text;
    const wrapped =
      value.slice(start - marker.length, start) === marker &&
      value.slice(end, end + marker.length) === marker;
    if (wrapped) {
      const next =
        value.slice(0, start - marker.length) +
        value.slice(start, end) +
        value.slice(end + marker.length);
      replaceBlock(block.id, { ...block, text: next });
      focusBlock(block.id, start - marker.length, end - marker.length);
      return;
    }
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + marker + selected + marker + value.slice(end);
    replaceBlock(block.id, { ...block, text: next });
    focusBlock(block.id, start + marker.length, start + marker.length + selected.length);
  };

  /** The block the toolbar acts on, and the selection inside it. */
  const target = () => {
    const block = blocks.find((entry) => entry.id === targetId());
    if (!block) return null;
    const node = areas.current.get(block.id);
    return { block, start: node?.selectionStart ?? block.text.length, end: node?.selectionEnd ?? block.text.length };
  };

  /** Docs' Insert link: the selection becomes the link's words. */
  const insertLink = (href: string) => {
    const at = target();
    if (!at) return;
    const { block, start, end } = at;
    const url = /^[a-z]+:\/\//i.test(href) ? href : `https://${href}`;
    const words = block.text.slice(start, end) || href;
    replaceBlock(block.id, { ...block, text: `${block.text.slice(0, start)}[${words}](${url})${block.text.slice(end)}` });
    focusBlock(block.id, start + 1, start + 1 + words.length);
  };


  const fillBlank = (key: string, value: string) => {
    const blank = data.blanks?.[key];
    if (!blank || !onChange) return;
    onChange({ ...data, blanks: { ...data.blanks, [key]: { ...blank, value } } });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    block: DocBlock,
    index: number,
  ) => {
    stopFieldEvent(event);
    const node = event.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = node;
    const mod = event.metaKey || event.ctrlKey;

    if (isSubmitShortcut(event)) {
      event.preventDefault();
      onSubmit?.();
      return;
    }
    if (mod && event.key.toLowerCase() === "b") {
      event.preventDefault();
      wrapSelection("**");
      return;
    }
    if (mod && event.key.toLowerCase() === "i") {
      event.preventDefault();
      wrapSelection("*");
      return;
    }
    if (mod && event.shiftKey && event.key.toLowerCase() === "x") {
      event.preventDefault();
      wrapSelection("~~");
      return;
    }
    if (event.key === "Escape") {
      node.blur();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (isList(block.type) && !value) {
        replaceBlock(block.id, { ...block, type: "paragraph" });
        focusBlock(block.id, 0);
        return;
      }
      const nextType = isList(block.type) ? block.type : "paragraph";
      if (start === 0 && end === 0 && value) {
        const inserted = newBlock(nextType);
        commit([...blocks.slice(0, index), inserted, ...blocks.slice(index)]);
        focusBlock(block.id, 0);
        return;
      }
      const after = newBlock(nextType, value.slice(end));
      commit([
        ...blocks.slice(0, index),
        { ...block, text: value.slice(0, start) },
        after,
        ...blocks.slice(index + 1),
      ]);
      focusBlock(after.id, 0);
      return;
    }

    if (event.key === "Backspace" && start === 0 && end === 0) {
      if (block.type !== "paragraph") {
        event.preventDefault();
        replaceBlock(block.id, { ...block, type: "paragraph" });
        focusBlock(block.id, 0);
        return;
      }
      const previous = blocks[index - 1];
      if (previous?.type === "embed") {
        // Text never merges into a live piece: an empty line just goes.
        event.preventDefault();
        if (!value) {
          commit(blocks.filter((_, i) => i !== index));
          const before = [...blocks.slice(0, index - 1)].reverse().find((entry) => entry.type !== "embed");
          if (before) focusBlock(before.id, before.text.length);
        }
        return;
      }
      if (previous) {
        event.preventDefault();
        commit([
          ...blocks.slice(0, index - 1),
          { ...previous, text: previous.text + value },
          ...blocks.slice(index + 1),
        ]);
        focusBlock(previous.id, previous.text.length);
      }
      return;
    }

    if (event.key === "ArrowUp" && start === 0 && end === 0) {
      const previous = [...blocks.slice(0, index)].reverse().find((entry) => entry.type !== "embed");
      if (previous) {
        event.preventDefault();
        focusBlock(previous.id, previous.text.length);
      } else if (titleRef.current) {
        event.preventDefault();
        titleRef.current.focus();
      }
      return;
    }
    if (event.key === "ArrowDown" && start === value.length && end === value.length) {
      const next = blocks.slice(index + 1).find((entry) => entry.type !== "embed");
      if (next) {
        event.preventDefault();
        focusBlock(next.id, 0);
      }
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
    block: DocBlock,
    index: number,
  ) => {
    const text = event.clipboardData.getData("text/plain");
    if (!text.includes("\n")) return;
    event.preventDefault();
    const { selectionStart: start, selectionEnd: end, value } = event.currentTarget;
    const pasted = parseBlocks(text);
    const before = value.slice(0, start);
    const after = value.slice(end);
    const [head, ...rest] = pasted;
    if (!head) return;
    const first: DocBlock = {
      ...block,
      type: before ? block.type : head.type,
      text: before + head.text,
    };
    const tail = rest.at(-1) ?? first;
    const caret = tail.text.length;
    const closed = { ...tail, text: tail.text + after };
    const inserted = rest.length > 0 ? [first, ...rest.slice(0, -1), closed] : [closed];
    commit([...blocks.slice(0, index), ...inserted, ...blocks.slice(index + 1)]);
    focusBlock(tail.id, caret);
  };

  const numbers = numberedIndices(blocks);
  const focusedBlock = blocks.find((block) => block.id === (focusedId ?? lastFocusedId));
  const isEmpty = blocks.length === 1 && !blocks[0]?.text && !data.title;
  const editingEmpty = isEmpty && focusedId !== null;

  const words = countWords(blocks);

  // The formatting buttons are the document's standard tools.
  const formatButtons = (
    <>
      {!compact && (
        <>
          <ToolbarButton
            label="Text"
            density={density}
            disabled={!editable}
            active={focusedBlock?.type === "paragraph"}
            onPress={() => setType("paragraph")}
          >
            <Pilcrow />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            density={density}
            disabled={!editable}
            active={focusedBlock?.type === "heading1"}
            onPress={() => setType("heading1")}
          >
            <Heading1 />
          </ToolbarButton>
        </>
      )}
      {compact ? (
        // One plain "Heading" toggle: a lone H2 with no H1 beside it reads as a mistake.
        <ToolbarButton
          label="Heading"
          density={density}
          disabled={!editable}
          active={focusedBlock?.type === "heading1" || focusedBlock?.type === "heading2"}
          onPress={() =>
            setType(focusedBlock?.type === "heading2" ? "heading2" : "heading1")
          }
        >
          <Heading />
        </ToolbarButton>
      ) : (
        <ToolbarButton
          label="Subheading"
          density={density}
          disabled={!editable}
          active={focusedBlock?.type === "heading2"}
          onPress={() => setType("heading2")}
        >
          <Heading2 />
        </ToolbarButton>
      )}
      <Divider density={density} />
      <ToolbarButton label="Bold (⌘B)" density={density} disabled={!editable} onPress={() => wrapSelection("**")}>
        <Bold />
      </ToolbarButton>
      <ToolbarButton label="Italic (⌘I)" density={density} disabled={!editable} onPress={() => wrapSelection("*")}>
        <Italic />
      </ToolbarButton>
      <Divider density={density} />
      <ToolbarButton
        label="Bulleted list"
        density={density}
        disabled={!editable}
        active={focusedBlock?.type === "bullet"}
        onPress={() => setType("bullet")}
      >
        <List />
      </ToolbarButton>
      {!compact && (
        <>
          <ToolbarButton
            label="Numbered list"
            density={density}
            disabled={!editable}
            active={focusedBlock?.type === "numbered"}
            onPress={() => setType("numbered")}
          >
            <ListOrdered />
          </ToolbarButton>
        </>
      )}
    </>
  );
  // Live pieces (what Article was): put a stat, chart or table where you're writing, from the document's data.
  const hasData = (data.datasets?.length ?? 0) > 0;
  const pieceTools = (
    <>
      <ShellToolMenu
        label="Insert a stat, chart or table"
        icon={<Plus />}
        disabled={!editable}
        items={[
          // Data comes in through the chat (ask for a chart of something); the toolbar only places it.
          ...(hasData ? [] : [{ heading: "Ask in the chat for the data first", id: "hint" }]),
          ...INSERT_KINDS.map(({ kind, label, icon: Icon }) => ({
            id: kind,
            label,
            icon: <Icon />,
            disabled: !hasData,
            onSelect: () => insertEmbed(kind),
          })),
        ]}
      />
    </>
  );

  // Large follows Google Docs: style, inline formatting, link, lists, then copy and download.
  const STYLE_LABEL: Record<BlockType, string> = {
    paragraph: "Normal text",
    heading1: "Heading 1",
    heading2: "Heading 2",
    bullet: "Normal text",
    numbered: "Normal text",
    quote: "Normal text",
    embed: "Normal text",
  };
  const style = focusedBlock ? STYLE_LABEL[focusedBlock.type] : "Normal text";
  const largeTools = (
    <>
      <ShellToolMenu
        label="Text style"
        text={style}
        disabled={!editable}
        items={[
          { id: "p", label: "Normal text", icon: <Pilcrow />, checked: style === "Normal text", onSelect: () => setType("paragraph") },
          { id: "h1", label: "Heading 1", icon: <Heading1 />, checked: style === "Heading 1", onSelect: () => setType("heading1") },
          { id: "h2", label: "Heading 2", icon: <Heading2 />, checked: style === "Heading 2", onSelect: () => setType("heading2") },
        ]}
      />
      <ShellToolDivider />
      <ShellToolButton label="Bold (⌘B)" disabled={!editable} onPress={() => wrapSelection("**")}>
        <Bold />
      </ShellToolButton>
      <ShellToolButton label="Italic (⌘I)" disabled={!editable} onPress={() => wrapSelection("*")}>
        <Italic />
      </ShellToolButton>
      <ShellToolPopover label="Insert link" icon={<Link2 />} disabled={!editable}>
        {(close) => (
          <ShellToolField
            label="Link"
            placeholder="Paste or type a link"
            onApply={(url) => {
              insertLink(url);
              close();
            }}
          />
        )}
      </ShellToolPopover>
      <ShellToolDivider />
      <ShellToolButton label="Bulleted list" disabled={!editable} active={focusedBlock?.type === "bullet"} onPress={() => setType("bullet")}>
        <List />
      </ShellToolButton>
      <ShellToolButton label="Numbered list" disabled={!editable} active={focusedBlock?.type === "numbered"} onPress={() => setType("numbered")}>
        <ListOrdered />
      </ShellToolButton>
      <ShellToolDivider />
      {pieceTools}
    </>
  );

  // The same toolbar at every editable size, sized by the tokens: formatting on the card, everything at large.
  const toolbar = (
    <ShellToolbar tools={tools} actions={actions}>
      {compact ? (
        <>
          {formatButtons}
          <ShellToolDivider />
          {pieceTools}
        </>
      ) : (
        largeTools
      )}
    </ShellToolbar>
  );

  const renderBlock = (block: DocBlock, index: number) => {
    if (block.type === "embed") {
      return (
        <DocumentEmbed
          key={block.id}
          id={block.text}
          data={data}
          runtime={runtime}
          compact={compact}
          onChange={editable ? setEmbed : undefined}
          onRemove={editable ? () => removeEmbed(index) : undefined}
        />
      );
    }
    const focused = editable && block.id === focusedId;
    const textClass = cn(
      "font-bureau font-light text-typography-primary break-words",
      BLOCK_TEXT[density][block.type],
    );
    const showPlaceholder = !block.text && (focused || (isEmpty && index === 0));
    const placeholder =
      BLOCK_PLACEHOLDER[block.type];
    const marker =
      block.type === "bullet" ? "•" : block.type === "numbered" ? `${numbers.get(block.id)}.` : null;

    return (
      <div
        key={block.id}
        // Prose keeps the document's own type scale; the type ramp leaves it alone.
        data-prose
        className={cn(
          "flex first:mt-0",
          BLOCK_GAP[density][block.type],
          block.type === "quote" && (compact ? "border-l-2 border-shell-line-strong pl-2" : "border-l-2 border-shell-line-strong pl-4"),
        )}
      >
        {marker && (
          <span
            aria-hidden
            className={cn(
              textClass,
              "shrink-0 select-none text-typography-secondary tabular-nums",
              compact ? "w-3.5" : "w-6",
            )}
          >
            {marker}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {focused ? (
            <AutoTextarea
              value={block.text}
              textareaRef={(node) => {
                if (node) areas.current.set(block.id, node);
                else areas.current.delete(block.id);
              }}
              placeholder={placeholder}
              aria-label={`${block.type} block`}
              className={cn(textClass, "placeholder:text-typography-secondary/70")}
              {...fieldEvents}
              onChange={(event) => {
                const raw = { ...block, text: event.target.value };
                const converted = applyShortcut(raw);
                replaceBlock(block.id, converted);
                if (converted.type !== raw.type) {
                  const consumed = raw.text.length - converted.text.length;
                  focusBlock(block.id, Math.max(0, event.target.selectionStart - consumed));
                }
              }}
              onKeyDown={(event) => handleKeyDown(event, block, index)}
              onPaste={(event) => handlePaste(event, block, index)}
              onBlur={() => setFocusedId((current) => (current === block.id ? null : current))}
            />
          ) : (
            <div
              className={cn(
                textClass,
                "whitespace-pre-wrap",
                editable && "cursor-text",
                showPlaceholder && "text-typography-secondary",
              )}
              onPointerDown={editable ? stopFieldEvent : undefined}
              onClick={editable ? stopFieldEvent : undefined}
              onMouseDown={
                editable
                  ? (event) => {
                      if ((event.metaKey || event.ctrlKey) && (event.target as HTMLElement).closest("a")) return;
                      event.preventDefault();
                      stopFieldEvent(event);
                      const rendered = showPlaceholder
                        ? 0
                        : caretOffsetAt(event.currentTarget, event.clientX, event.clientY);
                      focusBlock(block.id, renderedToRawOffset(block.text, rendered));
                    }
                  : undefined
              }
            >
              {showPlaceholder ? (
                placeholder
              ) : block.text ? (
                <InlineText text={block.text} blanks={data.blanks} onFill={editable ? fillBlank : undefined} live={liveValue} />
              ) : (
                "\u200b"
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Suggested writing sits where it would go: after the paragraph it names (by its opening words), or
  // where the writing stops. In the paragraph's type and the suggestion colour; accepted, it's written there.
  const suggestedPlaced = placedSuggestions(suggestedText, []).filter((s) => !data.body.includes(s.value.trim())).slice(0, 2);
  const proseWhere = suggestionsAfter(suggestedPlaced, blocks.map((block) => plainText(block.text)));
  const prose = (suggestion: PlacedSuggestion, at: number) => (
    <div key={suggestion.value} data-prose className={cn("flex", BLOCK_GAP[density].paragraph)}>
      <SuggestedText
        text={suggestion.value}
        onAccept={
          editable
            ? () => commit([...blocks.slice(0, at), newBlock("paragraph", suggestion.value), ...blocks.slice(at)].filter((block) => block.text || block.type === "embed"))
            : undefined
        }
        className={cn("font-bureau font-light break-words", BLOCK_TEXT[density].paragraph)}
      />
    </div>
  );
  /** The writing, with each suggestion after the paragraph it names. */
  const withSuggestions = () =>
    blocks.flatMap((block, index) => [renderBlock(block, index), ...proseWhere.after(index).map((suggestion) => prose(suggestion, index + 1))]);
  const suggestedProse = proseWhere.atEnd.map((suggestion) => prose(suggestion, blocks.length));

  const titleKeys = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    stopFieldEvent(event);
    if (isSubmitShortcut(event)) {
      event.preventDefault();
      onSubmit?.();
      return;
    }
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      const first = blocks[0];
      if (first) focusBlock(first.id, 0);
    }
  };
  // Medium plus: the title may take two lines before it's cut, so a longer topic still reads.
  const titleText = editable ? (
    compact ? (
      <AutoTextarea
        textareaRef={(node) => {
          titleRef.current = node;
        }}
        value={data.title}
        rows={1}
        placeholder={titlePlaceholder}
        aria-label="Document title"
        {...fieldEvents}
        onChange={(event) => onChange?.({ ...data, title: event.target.value.replace(/\s*\n\s*/g, " ") })}
        onKeyDown={titleKeys}
        // Two lines of the title's type, then cut.
        className="shell-title-type block max-h-[calc(2*var(--shell-title-font-size)*var(--shell-title-line-height))] w-full shrink-0 resize-none overflow-hidden bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary"
      />
    ) : (
      <input
        ref={(node) => {
          titleRef.current = node;
        }}
        value={data.title}
        placeholder={titlePlaceholder}
        aria-label="Document title"
        {...fieldEvents}
        onChange={(event) => onChange?.({ ...data, title: event.target.value })}
        onKeyDown={titleKeys}
        className="shell-title-type w-full shrink-0 truncate bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary"
      />
    )
  ) : (
    <div
      className={cn("shell-title-type", 
        "shrink-0 font-bureau",
        compact ? "line-clamp-2" : "truncate",
        data.title ? "text-typography-primary" : "text-typography-secondary",
      )}
    >
      {data.title || titlePlaceholder}
    </div>
  );
  const title = (
    // Starts at the top, so a two-line title keeps its glyph on the first line.
    <div className={cn("flex min-w-0 gap-[var(--shell-title-gap)]", compact ? "items-start [&>svg]:mt-px" : "items-center")}>
      {titleMark}
      <div className="min-w-0 flex-1">{titleText}</div>
    </div>
  );

  if (compact) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <div data-shell-part="title" className={cn("shrink-0", SHELL_TITLE_ROW)}>{title}</div>
        {toolbar}
        <div
          data-shell-part="body"
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            SHELL_BODY_BOX,
            CONTENT_PANEL,
          )}
        >
          <div tabIndex={0} className="no-scrollbar min-h-0 flex-1 overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50">
            {/* With choices showing and nothing written yet, the empty first line would only leave a gap above them. */}
            {(isEmpty && !editingEmpty) || (suggestions?.brief && blocks.length === 1 && !blocks[0]?.text && !focusedId)
              ? null
              : withSuggestions()}
            {suggestedProse}
            {/* On the chat home: what the request leaves open, as choices, instead of asking them to think of context. */}
            {suggestions?.brief}
          </div>
        </div>
        <ShellFooter
         
          detail={
            <LengthField
              value={data.length}
              guess={lengthGuess}
              editable={editable}
              onChange={(length) => onChange?.({ ...data, length })}
            />
          }
          className="mx-[var(--shell-meta-padding-x)] mb-[var(--shell-meta-padding-bottom)]"
        />
      </div>
    );
  }

  // Large: everything starts on the same 24px edge as the window's icon,
  // and the text keeps a readable width without being centred away from it.
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div data-shell-part="title" className={cn("w-full max-w-[728px] shrink-0", SHELL_TITLE_ROW)}>{title}</div>
      {toolbar}
      <div tabIndex={0} className="min-h-0 flex-1 overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50">
        <div data-shell-part="body" className="mx-[var(--shell-body-inset-x)] flex w-full max-w-[728px] flex-col gap-[var(--shell-body-gap)] rounded-[var(--shell-body-radius)] px-[var(--shell-body-padding-x)] pt-[var(--shell-body-padding-top)] pb-16">
          {isEmpty && !editingEmpty ? null : withSuggestions()}
          {suggestedProse}
        </div>
      </div>
      <div
        data-shell-part="meta"
        className={cn(
          "flex shrink-0 items-center justify-between gap-3 border-t border-shell-line px-[var(--shell-meta-padding-x)] font-bureau text-[length:var(--shell-meta-font-size)] text-typography-secondary",
          "h-9",
        )}
      >
        <span className="flex items-center gap-3">
          <span className="shrink-0 tabular-nums">
            {words} {words === 1 ? "word" : "words"}
          </span>
        </span>
        {status === "loading" && <span className="animate-pulse">Writing…</span>}
      </div>
    </div>
  );
}
