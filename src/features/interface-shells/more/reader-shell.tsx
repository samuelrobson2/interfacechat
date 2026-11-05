import { X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { readFile } from "../model/reader-file";
import { shellId, type ReaderHighlight, type ReaderShellData, type ShellProps } from "../model/shell-types";
import {
  ChipList,
  PdfIcon,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellDetail,
  ShellTitle,
} from "../ui/shell-kit";
import { accentOf, ghostLabels } from "../ui/shell-accents";
import { ShellAppIcon } from "../ui/shell-icons";
import { Bar, barWidths, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

function accentFor(data: ReaderShellData, category: string) {
  return accentOf(Math.max(0, data.categories.indexOf(category)));
}

/**
 * The file itself, as a page thumbnail: lines of text with highlighted lines in
 * their category colour, and the PDF mark in the corner.
 */
function PageThumb({ data, className, lines = 14 }: { data: ReaderShellData; className?: string; lines?: number }) {
  const empty = data.passages.length === 0;
  const rows: { width: number; accent?: ReturnType<typeof accentOf> }[] = [];
  for (const passage of data.passages) {
    const hits = data.highlights.filter((h) => passage.includes(h.quote));
    const count = Math.min(4, Math.max(2, Math.ceil(passage.length / 90)));
    barWidths(passage, count).forEach((width, i) => {
      const hit = hits[i];
      rows.push({ width, accent: hit ? accentFor(data, hit.category) : undefined });
    });
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
              <Bar key={i} width={row.width} className={cn("h-[3px]", row.accent ? row.accent.bar : "bg-gray-3/25")} />
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
  /** Replacing a file clears what to look for; adding the first one keeps it. */
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
        ...(replacing ? { categories: [] } : {}),
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

/** One-click starters for the other reason to open a document: learning from it. */
const LEARN = ["Key ideas", "Explain simply", "Terms to know"];

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

/** A passage with every highlight inside it marked in its category's colour. */
function MarkedPassage({
  text,
  index,
  data,
  focused,
}: {
  text: string;
  index: number;
  data: ReaderShellData;
  focused: string | null;
}) {
  const marks = data.highlights
    .map((highlight) => ({ highlight, start: text.indexOf(highlight.quote) }))
    .filter((mark) => mark.start >= 0)
    .sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const { highlight, start } of marks) {
    if (start < cursor) continue;
    parts.push(text.slice(cursor, start));
    parts.push(
      <mark
        key={highlight.id}
        id={`hl-${highlight.id}`}
        title={highlight.note ?? highlight.category}
        className={cn(
          "rounded-[3px] px-0.5 text-typography-primary transition-shadow",
          accentFor(data, highlight.category).mark,
          focused === highlight.id && "ring-2 ring-gray-3/60",
        )}
      >
        {highlight.quote}
      </mark>,
    );
    cursor = start + highlight.quote.length;
  }
  parts.push(text.slice(cursor));
  return (
    <p data-passage={index} className="font-serif text-[13px] leading-[1.7] text-typography-primary">
      {parts}
    </p>
  );
}

export function ReaderShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<ReaderShellData>) {
  const article = useRef<HTMLElement>(null);
  const [selection, setSelection] = useState<{ quote: string; x: number; y: number } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  if (size === "small") return <ShellAppIcon kind="reader" className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="reader" title={data.title || data.source} />
        <PreviewBody className="items-center pt-0.5">
          <PageThumb data={data} className="aspect-[3/4] h-full max-h-full" lines={12} />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<ReaderShellData>) => onChange({ ...data, ...patch }) : undefined;
  const count = (category: string) => data.highlights.filter((h) => h.category === category).length;

  const suggestions = update ? LEARN.filter((s) => !data.categories.includes(s)).slice(0, 3) : [];
  const categories = (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
    <ChipList
      size={size}
      items={data.categories}
      addLabel="Add what to look for"
      onChange={update && ((categories) => update({ categories }))}
      render={(category) => (
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", accentFor(data, category).solid)} />
          {category}
          {count(category) > 0 && <span className="text-typography-secondary tabular-nums">{count(category)}</span>}
        </span>
      )}
    />
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          title="Add this to what to look for"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            update?.({ categories: [...data.categories, suggestion] });
          }}
          className={cn(
            "inline-flex shrink-0 items-center rounded-full font-bureau text-typography-secondary transition-colors hover:bg-gray-6 hover:text-typography-primary",
            size === "large" ? "h-7 px-2.5 text-[13px]" : "h-6 px-2 text-[11px]",
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle
          kind="reader"
          size={size}
          value={data.title}
          onChange={update && ((title) => update({ title }))}
          onSubmit={onSubmit}
        />
        <ShellBody size={size}>
          <div className="flex min-w-0 gap-3">
            <FileDrop onFile={update} replacing={Boolean(data.source)} label={data.source ? "Replace the file" : "Add a PDF"} className="w-[84px] shrink-0">
              <PageThumb data={data} className="aspect-[3/4] w-full" lines={14} />
            </FileDrop>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <FileLabel data={data} large={false} />
              {data.categories.length === 0 && !update ? (
                <ul className="flex flex-col gap-1">
                  {ghostLabels("Look for").map((label) => (
                    <li key={label} className="font-bureau text-[11px] font-light text-typography-secondary">
                      {label}
                    </li>
                  ))}
                </ul>
              ) : (
                categories
              )}
            </div>
          </div>
        </ShellBody>
        <ShellDetail>
          {data.highlights.length ? `${data.highlights.length} highlights` : null}
        </ShellDetail>
      </ShellSurface>
    );
  }

  // Select text in the document, then pick a category to highlight it under.
  const captureSelection = () => {
    if (!update || data.categories.length === 0) return;
    const sel = window.getSelection();
    const quote = sel?.toString().trim() ?? "";
    if (!sel || !quote || !article.current || !article.current.contains(sel.anchorNode)) {
      setSelection(null);
      return;
    }
    if (!data.passages.some((passage) => passage.includes(quote))) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const box = article.current.getBoundingClientRect();
    setSelection({ quote, x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + article.current.scrollTop });
  };

  const addHighlight = (category: string) => {
    if (!selection || !update) return;
    update({ highlights: [...data.highlights, { id: shellId("hl"), category, quote: selection.quote }] });
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const removeHighlight = (id: string) => update?.({ highlights: data.highlights.filter((h) => h.id !== id) });
  const setHighlight = (next: ReaderHighlight) =>
    update?.({ highlights: data.highlights.map((h) => (h.id === next.id ? next : h)) });

  const focus = (id: string) => {
    setFocused(id);
    document.getElementById(`hl-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

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
      <div className="px-6 pt-3">{categories}</div>
      <div className="flex min-h-0 flex-1 gap-5 px-6 pt-4 pb-6">
        <div className="flex min-w-0 flex-[3] flex-col rounded-[12px] bg-gray-6 p-3">
          <article
            ref={article}
            onMouseUp={captureSelection}
            onKeyUp={captureSelection}
            {...fieldEvents}
            className="no-scrollbar relative mx-auto flex w-full max-w-[520px] min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-white px-8 py-7 shadow-[0_1px_4px_rgba(26,23,24,0.12)]"
          >
            {data.passages.length === 0 ? (
              <FileDrop
                onFile={update}
                label="Add a PDF"
                className="m-auto flex w-64 flex-col items-center gap-2 rounded-[12px] border border-dashed border-gray-3/40 px-6 py-8"
              >
                <PdfIcon className="h-10 w-8 opacity-60" />
                <span className="font-bureau text-[13px] text-typography-primary">Add a PDF</span>
                <span className="font-bureau text-[11px] font-light text-typography-secondary">Drop it here, or click to choose</span>
              </FileDrop>
            ) : (
              data.passages.map((passage, i) => (
                <MarkedPassage key={i} text={passage} index={i} data={data} focused={focused} />
              ))
            )}
            {selection && (
              <div
                className="absolute z-10 flex -translate-x-1/2 -translate-y-full gap-1 rounded-full bg-background-primary-inverse p-1 shadow-elevated"
                style={{ left: selection.x, top: selection.y - 6 }}
              >
                {data.categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      addHighlight(category);
                    }}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 font-bureau text-[11px] whitespace-nowrap text-typography-inverse hover:bg-white/15"
                  >
                    <span className={cn("size-2 rounded-full", accentFor(data, category).solid)} />
                    {category}
                  </button>
                ))}
              </div>
            )}
          </article>
        </div>
        <aside className="no-scrollbar flex min-w-0 flex-[2] flex-col gap-4 overflow-y-auto">
          {update && data.passages.length > 0 && (
            <p className="font-bureau text-[11px] text-typography-secondary">Select text in the page to highlight it.</p>
          )}
          {(data.categories.length ? data.categories : ghostLabels("Look for")).map((category) => {
            const items = data.highlights.filter((h) => h.category === category);
            const ghost = !data.categories.includes(category);
            return (
              <section key={category} className="flex flex-col gap-1.5">
                <h3 className={cn("flex items-center gap-1.5 font-bureau text-[12px]", ghost ? "font-light text-typography-secondary" : "text-typography-secondary")}>
                  {!ghost && <span className={cn("size-2 rounded-full", accentFor(data, category).solid)} />}
                  {category}
                </h3>
                {!ghost && items.length === 0 && (
                  <p className="font-bureau text-[12px] font-light text-typography-secondary">Nothing highlighted yet</p>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      focus(item.id);
                    }}
                    onKeyDown={(event) => event.key === "Enter" && focus(item.id)}
                    className={cn(
                      "group flex flex-col gap-0.5 rounded-[10px] bg-gray-6 px-3 py-2 text-left",
                      focused === item.id && "ring-1 ring-gray-3/50",
                    )}
                  >
                    <span className="flex items-start gap-2">
                      <span className="flex-1 font-bureau text-[12px] leading-[1.4] text-typography-primary">“{item.quote}”</span>
                      {update && (
                        <button
                          type="button"
                          aria-label="Remove highlight"
                          {...fieldEvents}
                          onClick={(event) => {
                            stopFieldEvent(event);
                            removeHighlight(item.id);
                          }}
                          className="grid size-5 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:text-typography-primary focus-visible:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </span>
                    <input
                      value={item.note ?? ""}
                      placeholder="Add a note"
                      aria-label="Note"
                      readOnly={!update}
                      {...fieldEvents}
                      onKeyDown={stopFieldEvent}
                      onChange={(event) => setHighlight({ ...item, note: event.target.value || undefined })}
                      className="bg-transparent font-bureau text-[11px] text-typography-secondary outline-none placeholder:font-light"
                    />
                  </div>
                ))}
              </section>
            );
          })}
        </aside>
      </div>
    </ShellSurface>
  );
}
