import {
  Bold,
  Code,
  Copy,
  Download,
  Heading,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  RemoveFormatting,
  Strikethrough,
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
  resolveBlanks,
  plainInline,
  renderedToRawOffset,
  serializeBlocks,
  type BlockType,
  type DocBlock,
} from "../model/markdown-blocks";
import type { DocumentShellData, ShellStatus, ShellSuggestions } from "../model/shell-types";
import { SHELL_TITLE_LARGE } from "../ui/shell-kit";
import { DocBlankSlot } from "./doc-blank";
import {
  copyText,
  downloadText,
  fileNameOf,
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
  },
  compact: {
    paragraph: "text-[12px] leading-[1.5]",
    heading1: "text-[14px] leading-[1.35] font-semibold",
    heading2: "text-[12px] leading-[1.4] font-semibold",
    bullet: "text-[12px] leading-[1.5]",
    numbered: "text-[12px] leading-[1.5]",
    quote: "text-[12px] leading-[1.5] text-typography-secondary",
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
  },
  compact: {
    paragraph: "mt-1.5",
    heading1: "mt-2.5",
    heading2: "mt-2",
    bullet: "mt-0.5",
    numbered: "mt-0.5",
    quote: "mt-1.5",
  },
};

const BLOCK_PLACEHOLDER: Record<BlockType, string> = {
  paragraph: "Write, or type # for a heading, - for a list",
  heading1: "Heading",
  heading2: "Subheading",
  bullet: "List item",
  numbered: "List item",
  quote: "Quote",
};

const isList = (type: BlockType) => type === "bullet" || type === "numbered";

function InlineText({
  text,
  blanks,
  onFill,
}: {
  text: string;
  blanks?: DocumentShellData["blanks"];
  /** Given when the document is editable: fills a blank by key. */
  onFill?: (key: string, value: string) => void;
}) {
  return (
    <>
      {parseInline(text).map((segment, i) => {
        if (segment.blank !== undefined) {
          const key = segment.blank;
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
            <code key={i} className="rounded-[4px] bg-gray-6 px-1 font-bureau text-[0.95em] font-normal">
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
  density,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  density: EditorDensity;
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
        "hover:bg-gray-6 hover:text-typography-primary active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-40",
        density === "compact" ? "size-6 rounded-[6px] [&_svg]:size-3.5" : "size-8 rounded-[8px] [&_svg]:size-4",
        active && "bg-gray-6 text-typography-primary",
      )}
    >
      {children}
    </button>
  );
}

const Divider = ({ density }: { density: EditorDensity }) => (
  <span
    aria-hidden
    className={cn("mx-1 w-px shrink-0 bg-gray-3/25", density === "compact" ? "h-3" : "h-4")}
  />
);

function LengthField({
  value,
  editable,
  onChange,
}: {
  value?: string;
  editable: boolean;
  onChange: (length: string | undefined) => void;
}) {
  if (!editable) return value ? <span>{value}</span> : null;
  const shown = value || "~1,500 words";
  return (
    <input
      value={value ?? ""}
      placeholder="~1,500 words"
      aria-label="Target length"
      title="Change the target length"
      size={Math.max(shown.length, 12)}
      {...fieldEvents}
      onChange={(event) => onChange(event.target.value || undefined)}
      className="w-auto max-w-[9rem] cursor-text bg-transparent text-right font-bureau text-[11px] text-typography-secondary underline decoration-dotted decoration-typography-secondary/35 underline-offset-[3px] outline-none placeholder:text-typography-secondary/55 hover:decoration-typography-secondary/70 focus:decoration-typography-secondary"
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
  className,
}: {
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
  const titleRef = useRef<HTMLInputElement>(null);
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

  const commit = (next: DocBlock[]) => {
    const body = serializeBlocks(next);
    setSyncedBody(body);
    setBlocks(next);
    onChange?.({ ...data, body });
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

  /** Docs' Clear formatting: the block keeps its style, its words lose bold, links and the rest. */
  const clearFormatting = () => {
    const at = target();
    if (!at) return;
    replaceBlock(at.block.id, { ...at.block, text: plainInline(at.block.text) });
    focusBlock(at.block.id, 0);
  };

  const asMarkdown = () =>
    [data.title.trim() && `# ${data.title.trim()}`, resolveBlanks(serializeBlocks(blocks), data.blanks)].filter(Boolean).join("\n\n");
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
      const previous = blocks[index - 1];
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
      const next = blocks[index + 1];
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
          <ToolbarButton
            label="Quote"
            density={density}
            disabled={!editable}
            active={focusedBlock?.type === "quote"}
            onPress={() => setType("quote")}
          >
            <Quote />
          </ToolbarButton>
        </>
      )}
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
      <ShellToolButton label="Strikethrough (⌘⇧X)" disabled={!editable} onPress={() => wrapSelection("~~")}>
        <Strikethrough />
      </ShellToolButton>
      <ShellToolButton label="Inline code" disabled={!editable} onPress={() => wrapSelection("`")}>
        <Code />
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
      <ShellToolButton label="Clear formatting" disabled={!editable} onPress={clearFormatting}>
        <RemoveFormatting />
      </ShellToolButton>
      <ShellToolDivider />
      <ShellToolButton label="Bulleted list" disabled={!editable} active={focusedBlock?.type === "bullet"} onPress={() => setType("bullet")}>
        <List />
      </ShellToolButton>
      <ShellToolButton label="Numbered list" disabled={!editable} active={focusedBlock?.type === "numbered"} onPress={() => setType("numbered")}>
        <ListOrdered />
      </ShellToolButton>
      <ShellToolButton label="Quote" disabled={!editable} active={focusedBlock?.type === "quote"} onPress={() => setType("quote")}>
        <Quote />
      </ShellToolButton>
      <ShellToolDivider />
      <ShellToolButton label="Copy as Markdown" disabled={!words && !data.title} onPress={() => copyText(asMarkdown())}>
        <Copy />
      </ShellToolButton>
      <ShellToolButton
        label="Download (.md)"
        disabled={!words && !data.title}
        onPress={() => downloadText(`${fileNameOf(data.title, "document")}.md`, asMarkdown(), "text/markdown")}
      >
        <Download />
      </ShellToolButton>
    </>
  );

  const toolbar = compact ? (
    <div className="flex h-8 shrink-0 items-center gap-0.5 border-b border-gray-3/15 bg-white/80 px-2">
      {formatButtons}
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  ) : (
    <ShellToolbar tools={tools} actions={actions}>
      {largeTools}
    </ShellToolbar>
  );

  const renderBlock = (block: DocBlock, index: number) => {
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
        className={cn(
          "flex first:mt-0",
          BLOCK_GAP[density][block.type],
          block.type === "quote" && (compact ? "border-l-2 border-gray-3/30 pl-2" : "border-l-2 border-gray-3/30 pl-4"),
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
                showPlaceholder && "text-typography-secondary/70",
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
                <InlineText text={block.text} blanks={data.blanks} onFill={editable ? fillBlank : undefined} />
              ) : (
                "\u200b"
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const titleText = editable ? (
    <input
      ref={titleRef}
      value={data.title}
      placeholder={titlePlaceholder}
      aria-label="Document title"
      {...fieldEvents}
      onChange={(event) => onChange?.({ ...data, title: event.target.value })}
      onKeyDown={(event) => {
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
      }}
      className={cn(
        "w-full shrink-0 truncate bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary",
        compact ? "text-[13px] font-normal leading-[1.3]" : SHELL_TITLE_LARGE,
      )}
    />
  ) : (
    <div
      className={cn(
        "shrink-0 truncate font-bureau",
        compact ? "text-[13px] font-normal leading-[1.3]" : SHELL_TITLE_LARGE,
        data.title ? "text-typography-primary" : "text-typography-secondary",
      )}
    >
      {data.title || titlePlaceholder}
    </div>
  );
  const title = (
    <div className="flex min-w-0 items-center gap-2">
      {titleMark}
      <div className="min-w-0 flex-1">{titleText}</div>
    </div>
  );

  if (compact) {
    const hasFooter = Boolean(data.length || editable);
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <div className="shrink-0 px-3 pt-2.5 pb-1.5">{title}</div>
        {toolbar}
        <div
          className={cn(
            "mx-2.5 mt-2.5 flex min-h-0 flex-1 flex-col rounded-[10px] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(26,23,24,0.06)]",
            hasFooter ? "mb-2" : "mb-2.5",
          )}
        >
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            {/* With choices showing and nothing written yet, the empty first line would only leave a gap above them. */}
            {(isEmpty && !editingEmpty) || (suggestions?.brief && blocks.length === 1 && !blocks[0]?.text && !focusedId)
              ? null
              : blocks.map(renderBlock)}
            {/* On the chat home: what the request leaves open, as choices, instead of asking them to think of context. */}
            {suggestions?.brief}
          </div>
        </div>
        <ShellFooter
         
          detail={
            <LengthField
              value={data.length}
              editable={editable}
              onChange={(length) => onChange?.({ ...data, length })}
            />
          }
          className="mx-3 mb-2.5"
        />
      </div>
    );
  }

  // Large: everything starts on the same 24px edge as the window's icon,
  // and the text keeps a readable width without being centred away from it.
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="w-full max-w-[728px] shrink-0 px-6 pt-3 pb-3">{title}</div>
      {toolbar}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="w-full max-w-[728px] px-6 pt-5 pb-16">
          {isEmpty && !editingEmpty ? null : blocks.map(renderBlock)}
        </div>
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-3 border-t border-gray-3/15 px-6 font-bureau text-[12px] text-typography-secondary",
          suggestions?.footer ? "min-h-11 py-1.5" : "h-9",
        )}
      >
        <span className="flex items-center gap-3">
          <span className="shrink-0 tabular-nums">
            {words} {words === 1 ? "word" : "words"}
          </span>
          {suggestions?.footer}
        </span>
        {status === "loading" && <span className="animate-pulse">Writing…</span>}
      </div>
    </div>
  );
}
