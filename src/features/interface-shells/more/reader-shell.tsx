import { ChevronDown, ChevronUp, ClipboardCopy, Copy, Eraser, FileUp, Highlighter, MessageCircle, MessageCircleQuestion, ScanText, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { readFile } from "../model/reader-file";
import { shellId, type ReaderShellData, type ShellProps } from "../model/shell-types";
import { PdfIcon, PreviewBody, PreviewHead, ShellBody, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { Bar, barWidths, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";
import { copyText, ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolFile } from "../ui/shell-toolbar";

/** Preview's zoom steps, as a share of the page's normal text size. */
const ZOOMS = [0.8, 0.9, 1, 1.15, 1.3, 1.5];

/**
 * Reader is a smart document reader: search the file, ask it a question, find
 * something in it. Answers go in the chat; the document marks what was found.
 */

/** What Reader does, shown on an empty card so it's clear what a file is for. */
const READER_JOBS = [
  { icon: Search, label: "Search it" },
  { icon: MessageCircleQuestion, label: "Ask it a question" },
  { icon: ScanText, label: "Find a clause, date or figure" },
];

/** One-tap questions for a file that's open but not yet searched. */
const STARTERS = ["Summarise it", "What are the key dates?", "What do we have to pay?"];

/** A draft reads as a question for the chat, not words to find in the page. */
const isQuestion = (text: string) =>
  /\?\s*$/.test(text) ||
  /^(what|how|why|when|who|where|which|does|do|is|are|can|could|should|will|would|explain|summari[sz]e|tell|list|compare)\b/i.test(text.trim());

type Match = { passage: number; start: number; end: number };

/** Every case-insensitive occurrence of the search in the passages. */
function findMatches(passages: string[], query: string): Match[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2 || isQuestion(query)) return [];
  const matches: Match[] = [];
  passages.forEach((text, passage) => {
    const hay = text.toLowerCase();
    for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + needle.length)) {
      matches.push({ passage, start: at, end: at + needle.length });
    }
  });
  return matches;
}

/** Spans of found passages (from the chat) inside one passage. */
function foundSpans(text: string, data: ReaderShellData) {
  return data.highlights
    .map((highlight) => ({ id: highlight.id, note: highlight.note, start: text.indexOf(highlight.quote), length: highlight.quote.length }))
    .filter((span) => span.start >= 0)
    .map((span) => ({ ...span, end: span.start + span.length }));
}

/**
 * The file itself, as a page thumbnail: lines of text, with lines the chat found
 * marked, and the PDF mark in the corner.
 */
function PageThumb({ data, className, lines = 14 }: { data: ReaderShellData; className?: string; lines?: number }) {
  const empty = data.passages.length === 0;
  const needle = (data.query ?? "").trim().toLowerCase();
  const searching = needle.length >= 2 && !isQuestion(needle);
  const rows: { width: number; found?: boolean; match?: boolean }[] = [];
  for (const passage of data.passages) {
    const hits = data.highlights.filter((h) => passage.includes(h.quote)).length;
    const match = searching && passage.toLowerCase().includes(needle);
    const count = Math.min(4, Math.max(2, Math.ceil(passage.length / 90)));
    barWidths(passage, count).forEach((width, i) => rows.push({ width, found: i < hits, match: match && i === 0 }));
    rows.push({ width: 0 });
    if (rows.length >= lines) break;
  }
  return (
    <div
      className={cn(
        "relative flex flex-col gap-[3px] overflow-hidden rounded-[4px] bg-white px-[10%] py-[9%] shadow-[0_1px_4px_rgba(26,23,24,0.14)]",
        empty && "items-center justify-center border border-dashed border-gray-3/40 shadow-none",
        className,
      )}
    >
      {empty ? (
        <>
          <PdfIcon className="h-7 w-6 opacity-60" />
          <span className="mt-1 font-bureau text-[10px] font-light text-typography-secondary">Add a PDF</span>
        </>
      ) : (
        <>
          <Bar width="55%" className="mb-1 h-1.5 bg-gray-3/45" />
          {rows.slice(0, lines).map((row, i) =>
            row.width === 0 ? (
              <span key={i} className="h-[3px]" />
            ) : (
              <Bar key={i} width={row.width} className={cn("h-[3px]", row.match ? "bg-orange-5/70" : row.found ? "bg-blue-4/60" : "bg-gray-3/25")} />
            ),
          )}
          <PdfIcon className="absolute right-1 bottom-1 h-4 w-3.5" />
        </>
      )}
    </div>
  );
}

/**
 * Wraps whatever shows the file so it can be opened by click or drop: a PDF,
 * or a text or Markdown file. Reading replaces the passages and clears highlights.
 */
function FileDrop({
  onFile,
  replacing = false,
  label,
  className,
  children,
}: {
  onFile?: (patch: Partial<ReaderShellData>) => void;
  /** Replacing a file clears the search; adding the first one keeps it. */
  replacing?: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "over" | "reading" | "error">("idle");
  if (!onFile) return <div className={className}>{children}</div>;
  const open = async (file: File | undefined) => {
    if (!file) return;
    setState("reading");
    try {
      const read = await readFile(file);
      if (read.passages.length === 0) throw new Error("No text found");
      onFile({
        source: read.source,
        title: read.title,
        pages: read.pages,
        passages: read.passages,
        highlights: [],
        ...(replacing ? { query: "" } : {}),
      });
      setState("idle");
    } catch {
      setState("error");
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        input.current?.click();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setState("over");
      }}
      onDragLeave={() => setState("idle")}
      onDrop={(event) => {
        event.preventDefault();
        void open(event.dataTransfer.files[0]);
      }}
      className={cn(
        "relative cursor-pointer rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-blue-4/40",
        state === "over" && "ring-2 ring-[#607089]/50",
        className,
      )}
    >
      {children}
      {(state === "reading" || state === "error") && (
        <span className="absolute inset-0 grid place-items-center rounded-[inherit] bg-white/85 px-2 text-center font-bureau text-[11px] text-typography-secondary">
          {state === "reading" ? "Reading…" : "Couldn't read that file. Try a PDF or text file."}
        </span>
      )}
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf,.txt,.md,text/plain,text/markdown"
        className="sr-only"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          void open(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function FileLabel({ data, large }: { data: ReaderShellData; large: boolean }) {
  if (!data.source) {
    // Nothing to name yet; on large the label is the way to add one.
    return large ? (
      <span className="flex items-center gap-1.5 font-bureau text-[13px] text-typography-secondary">
        <PdfIcon className="h-5 w-4" />
        Add a PDF
      </span>
    ) : null;
  }
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5 font-bureau", large ? "text-[13px]" : "text-[11px]")}>
      <PdfIcon className={large ? "h-5 w-4" : "h-4 w-3"} />
      <span className={cn("truncate", data.source ? "text-typography-primary" : "font-light text-typography-secondary")}>
        {data.source}
      </span>
      {data.pages && <span className="shrink-0 text-typography-secondary">· {data.pages} pages</span>}
    </span>
  );
}

/** A passage with search matches and the chat's found passages marked. */
function MarkedPassage({
  text,
  index,
  data,
  matches,
  current,
  zoom = 1,
}: {
  text: string;
  index: number;
  data: ReaderShellData;
  matches: Match[];
  current: Match | undefined;
  zoom?: number;
}) {
  // Search matches win where they overlap a found passage: they're what the person is looking at now.
  const marks = [
    ...matches.filter((m) => m.passage === index).map((m) => ({ ...m, kind: "match" as const, key: `m${m.start}` })),
    ...foundSpans(text, data).map((f) => ({ start: f.start, end: f.end, kind: "found" as const, key: f.id, note: f.note })),
  ].sort((a, b) => a.start - b.start || (a.kind === "match" ? -1 : 1));
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.start < cursor) continue;
    parts.push(text.slice(cursor, mark.start));
    const isCurrent = mark.kind === "match" && current?.passage === index && current.start === mark.start;
    parts.push(
      <mark
        key={mark.key}
        data-current={isCurrent || undefined}
        title={mark.kind === "found" ? (mark as { note?: string }).note ?? "From the chat's answer" : undefined}
        className={cn(
          "rounded-[3px] px-0.5 text-typography-primary",
          mark.kind === "found" ? "bg-blue-1 shadow-[inset_0_-2px_0_var(--color-blue-4)]" : "bg-yellow-1",
          isCurrent && "bg-orange-5/35 ring-2 ring-orange-5/50",
        )}
      >
        {text.slice(mark.start, mark.end)}
      </mark>,
    );
    cursor = mark.end;
  }
  parts.push(text.slice(cursor));
  return (
    <p data-passage={index} className="font-serif text-[13px] leading-[1.7] text-typography-primary" style={zoom === 1 ? undefined : { fontSize: 13 * zoom }}>
      {parts}
    </p>
  );
}

/** The one bar for searching, asking and finding. */
function AskBar({
  value,
  onChange,
  onAsk,
  count,
  at,
  onStep,
  compact,
  readOnly,
}: {
  value: string;
  onChange?: (value: string) => void;
  onAsk?: (question: string) => void;
  count: number;
  at: number;
  onStep: (delta: number) => void;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const question = isQuestion(value);
  const searching = value.trim().length >= 2 && !question;
  const iconButton = "grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary hover:bg-gray-0 hover:text-typography-primary disabled:opacity-30";
  return (
    <div className={cn("flex min-w-0 items-center gap-1.5 rounded-full bg-gray-6", compact ? "h-8 pr-1 pl-2.5" : "h-10 pr-1.5 pl-3.5")}>
      {question ? <MessageCircleQuestion className="size-4 shrink-0 text-typography-secondary" /> : <Search className="size-4 shrink-0 text-typography-secondary" />}
      <input
        value={value}
        readOnly={readOnly || !onChange}
        placeholder={compact ? "Search or ask" : "Search, ask a question, or find something"}
        aria-label="Search or ask about the document"
        {...fieldEvents}
        onKeyDown={(event) => {
          stopFieldEvent(event);
          if (event.key === "Enter") {
            event.preventDefault();
            if (question) onAsk?.(value.trim());
            else onStep(event.shiftKey ? -1 : 1);
          }
          if (event.key === "Escape") onChange?.("");
        }}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn("min-w-0 flex-1 bg-transparent font-bureau text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary", compact ? "text-[12px]" : "text-[14px]")}
      />
      {searching && (
        <span className="flex shrink-0 items-center gap-0.5 font-bureau text-[11px] text-typography-secondary tabular-nums">
          {count ? `${at + 1} of ${count}` : "No matches"}
          {!compact && count > 1 && (
            <>
              <button type="button" aria-label="Previous match" {...fieldEvents} onClick={(e) => { stopFieldEvent(e); onStep(-1); }} className={iconButton}>
                <ChevronUp className="size-3.5" />
              </button>
              <button type="button" aria-label="Next match" {...fieldEvents} onClick={(e) => { stopFieldEvent(e); onStep(1); }} className={iconButton}>
                <ChevronDown className="size-3.5" />
              </button>
            </>
          )}
        </span>
      )}
      {value && onChange && !compact && (
        <button type="button" aria-label="Clear" {...fieldEvents} onClick={(e) => { stopFieldEvent(e); onChange(""); }} className={iconButton}>
          <X className="size-3" />
        </button>
      )}
      {question && (
        <button
          type="button"
          disabled={!onAsk}
          title={onAsk ? "Ask in the chat" : "Ask once this is open in a chat"}
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            onAsk?.(value.trim());
          }}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full bg-gray-5 font-bureau text-gray-0 transition-opacity active:scale-[0.97] disabled:opacity-40",
            compact ? "h-6 px-2 text-[11px]" : "h-7 px-3 text-[12px]",
          )}
        >
          <MessageCircle className="size-3" />
          Ask
        </button>
      )}
    </div>
  );
}

export function ReaderShell({
  size,
  data,
  onChange,
  onSubmit,
  onAsk,
  surface = true,
  tools,
  actions,
  className,
}: ShellProps<ReaderShellData>) {
  const article = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [zoom, setZoom] = useState(2);
  const [opening, setOpening] = useState<"idle" | "reading" | "error">("idle");
  const matches = findMatches(data.passages, data.query ?? "");
  // While asking, the arrows walk the passages the chat found instead.
  const found = data.highlights.filter((h) => data.passages.some((p) => p.includes(h.quote)));
  const walkingFound = matches.length === 0 && found.length > 0 && isQuestion(data.query ?? "");
  const total = walkingFound ? found.length : matches.length;
  const at = total ? ((step % total) + total) % total : 0;

  // Keep the current match or found passage in view as it changes.
  useEffect(() => {
    const root = article.current;
    if (!root || !total) return;
    const target = walkingFound
      ? root.querySelectorAll("mark:not([data-current])")[at]
      : root.querySelector("mark[data-current]");
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [at, total, walkingFound, data.query]);

  if (size === "small") return <ShellAppIcon kind="reader" className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="reader" title={data.title || data.source} />
        <PreviewBody className="items-center pt-0.5">
          {/* Medium shows shapes, not words: the page, a search bar over it, lines of text. */}
          <div className="flex w-full min-h-0 flex-1 flex-col gap-1.5">
            <span className="flex h-3.5 shrink-0 items-center gap-1 rounded-full bg-gray-6 px-1.5">
              <Search className="size-2 text-gray-3" />
              <Bar width="40%" className="h-1" />
            </span>
            <PageThumb
              data={data.passages.length ? data : { ...data, passages: ["x".repeat(180), "y".repeat(140), "z".repeat(200)] }}
              className="aspect-[3/4] min-h-0 flex-1 self-center"
              lines={9}
            />
          </div>
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<ReaderShellData>) => onChange({ ...data, ...patch }) : undefined;
  const setQuery = update && ((query: string) => {
    setStep(0);
    update({ query });
  });
  const ask = onAsk && ((question: string) => {
    setQuery?.(question);
    onAsk(question);
  });

  if (!large) {
    // Minimal: the search bar, the page beneath it, and the file in the corner.
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle
          kind="reader"
          size={size}
          value={data.title}
          onChange={update && ((title) => update({ title }))}
          onSubmit={onSubmit}
        />
        <ShellBody size={size} className="gap-2.5">
          <AskBar
            compact
            value={data.query ?? ""}
            onChange={data.source ? setQuery : undefined}
            onAsk={ask}
            count={matches.length}
            at={at}
            onStep={(delta) => setStep((s) => s + delta)}
          />
          <FileDrop
            onFile={update}
            replacing={Boolean(data.source)}
            label={data.source ? "Replace the file" : "Add a PDF"}
            className="flex min-h-0 flex-1 justify-center"
          >
            <PageThumb data={data} className="aspect-[3/4] h-full" lines={14} />
          </FileDrop>
        </ShellBody>
        <ShellDetail>{data.source ? <FileLabel data={data} large={false} /> : null}</ShellDetail>
      </ShellSurface>
    );
  }

  const hasFile = data.passages.length > 0;

  /** What's selected in the page, if anything: the words a highlight or a question is about. */
  const selectedText = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!text || !article.current || !selection?.anchorNode || !article.current.contains(selection.anchorNode)) return "";
    return text;
  };
  const openFile = async (file: File) => {
    if (!update) return;
    setOpening("reading");
    try {
      const read = await readFile(file);
      if (read.passages.length === 0) throw new Error("No text found");
      update({ source: read.source, title: read.title, pages: read.pages, passages: read.passages, highlights: [], query: "" });
      setOpening("idle");
    } catch {
      setOpening("error");
    }
  };
  const ownHighlights = data.highlights.filter((h) => data.passages.some((p) => p.includes(h.quote)));

  // Preview's and Acrobat's essentials: open, zoom, highlight, ask, copy.
  const toolbar = (
    <ShellToolbar tools={tools} actions={actions}>
      <ShellToolFile label={opening === "reading" ? "Opening…" : opening === "error" ? "Couldn't read that file. Open another" : "Open a file"} accept="application/pdf,.pdf,.txt,.md,text/plain,text/markdown" disabled={!update || opening === "reading"} onFiles={([file]) => file && void openFile(file)}>
        <FileUp />
      </ShellToolFile>
      <ShellToolDivider />
      <ShellToolButton label="Zoom out" disabled={!hasFile || zoom === 0} onPress={() => setZoom((z) => Math.max(0, z - 1))}>
        <ZoomOut />
      </ShellToolButton>
      <span className="w-11 shrink-0 text-center font-bureau text-[12px] text-typography-secondary tabular-nums">{Math.round(ZOOMS[zoom]! * 100)}%</span>
      <ShellToolButton label="Zoom in" disabled={!hasFile || zoom === ZOOMS.length - 1} onPress={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}>
        <ZoomIn />
      </ShellToolButton>
      <ShellToolDivider />
      <ShellToolButton
        label="Highlight the selection"
        disabled={!update || !hasFile}
        onPress={() => {
          const quote = selectedText();
          if (quote && !data.highlights.some((h) => h.quote === quote))
            update?.({ highlights: [...data.highlights, { id: shellId("hl"), quote, note: "Your highlight" }] });
          window.getSelection()?.removeAllRanges();
        }}
      >
        <Highlighter />
      </ShellToolButton>
      <ShellToolButton
        label="Ask the chat about the selection"
        disabled={!ask || !hasFile}
        onPress={() => {
          const quote = selectedText();
          if (quote) ask?.(`What does this mean: "${quote.length > 400 ? `${quote.slice(0, 400)}…` : quote}"`);
        }}
      >
        <MessageCircleQuestion />
      </ShellToolButton>
      <ShellToolButton
        label="Copy the highlights"
        disabled={ownHighlights.length === 0}
        onPress={() => copyText(ownHighlights.map((h) => `“${h.quote}”${h.note && h.note !== "Your highlight" ? ` (${h.note})` : ""}`).join("\n\n"))}
      >
        <ClipboardCopy />
      </ShellToolButton>
      <ShellToolButton label="Clear the highlights" disabled={!update || data.highlights.length === 0} onPress={() => update?.({ highlights: [] })}>
        <Eraser />
      </ShellToolButton>
      <ShellToolDivider />
      <ShellToolButton label="Copy the text" disabled={!hasFile} onPress={() => copyText(data.passages.join("\n\n"))}>
        <Copy />
      </ShellToolButton>
    </ShellToolbar>
  );

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="reader"
        size={size}
        value={data.title}
        onChange={update && ((title) => update({ title }))}
        onSubmit={onSubmit}
        aside={
          <FileDrop onFile={update} replacing={Boolean(data.source)} label={data.source ? "Replace the file" : "Add a PDF"} className="px-1.5 py-1 hover:bg-gray-6">
            <FileLabel data={data} large />
          </FileDrop>
        }
      />
      {toolbar}
      {hasFile && (
        <div className="flex flex-col gap-2 px-6 pt-3">
          <AskBar
            value={data.query ?? ""}
            onChange={setQuery}
            onAsk={ask}
            count={total}
            at={at}
            onStep={(delta) => setStep((s) => s + delta)}
          />
          {!data.query && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  disabled={!ask}
                  title={ask ? "Ask in the chat" : "Ask once this is open in a chat"}
                  {...fieldEvents}
                  onClick={(event) => {
                    stopFieldEvent(event);
                    ask?.(starter);
                  }}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-gray-3/40 px-2.5 font-bureau text-[12px] text-typography-secondary transition-colors hover:border-gray-3 hover:text-typography-primary disabled:pointer-events-none"
                >
                  <MessageCircleQuestion className="size-3" />
                  {starter}
                </button>
              ))}
            </div>
          )}
          {walkingFound && (
            <p className="flex items-center gap-1.5 px-1 font-bureau text-[12px] text-typography-secondary">
              <span className="size-2 rounded-full bg-blue-4" />
              The answer is in the chat. Marked below: {found.length === 1 ? "the passage it uses" : `the ${found.length} passages it uses`}.
            </p>
          )}
        </div>
      )}
      <div className="flex min-h-0 flex-1 px-6 pt-3 pb-6">
        <div className="flex min-w-0 flex-1 flex-col rounded-[12px] bg-gray-6 p-3">
          <article
            ref={article}
            {...fieldEvents}
            className="no-scrollbar relative mx-auto flex w-full max-w-[620px] min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-white px-8 py-7 shadow-[0_1px_4px_rgba(26,23,24,0.12)]"
          >
            {hasFile ? (
              data.passages.map((passage, i) => (
                <MarkedPassage
                  key={i}
                  text={passage}
                  index={i}
                  data={data}
                  matches={matches}
                  current={walkingFound ? undefined : matches[at]}
                  zoom={ZOOMS[zoom]}
                />
              ))
            ) : (
              <FileDrop
                onFile={update}
                label="Add a PDF"
                className="m-auto flex w-72 flex-col items-center gap-3 rounded-[12px] border border-dashed border-gray-3/40 px-6 py-8"
              >
                <PdfIcon className="h-10 w-8 opacity-60" />
                <span className="font-bureau text-[13px] text-typography-primary">Add a PDF to</span>
                <ul className="flex flex-col gap-1.5">
                  {READER_JOBS.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 font-bureau text-[12px] font-light text-typography-secondary">
                      <Icon className="size-3.5 shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
                <span className="font-bureau text-[11px] font-light text-typography-secondary">Drop it here, or click to choose</span>
              </FileDrop>
            )}
          </article>
        </div>
      </div>
    </ShellSurface>
  );
}
