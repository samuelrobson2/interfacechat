import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// Render the actual paper PDF (exact text + figures) and highlight a passage by
// matching the assistant's quote against pdf.js's text layer — the same
// technique a production agent would use: it quotes a passage, we locate that
// text on the page and box it. No hand-placed coordinates.

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// NB: this project's BASE_URL is "/app" with no trailing slash, so join carefully.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PDF_URL = `${BASE}/attention-is-all-you-need.pdf`;
const PAGE_WIDTH = 700;

type Rect = { left: number; top: number; width: number; height: number };
type Highlight = { quote: string; page: number; rects: Rect[] };

const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

// Try the full quote first, then progressively shorter leading prefixes, so a
// match still lands even if a word is hyphenated across a line break.
function quoteCandidates(quote: string): string[] {
  const words = normalize(quote).split(" ");
  const lengths = [words.length, 12, 8, 5].filter((n) => n <= words.length);
  return Array.from(new Set(lengths)).map((n) => words.slice(0, n).join(" "));
}

// Find a quote within a rendered page's text layer and return its bounding
// rects (one per line), relative to the page element.
function findQuoteRects(
  textLayer: HTMLElement,
  pageEl: HTMLElement,
  quote: string,
): Rect[] {
  const spans = Array.from(
    textLayer.querySelectorAll<HTMLElement>("span"),
  ).filter((span) => span.childElementCount === 0 && span.textContent);

  let haystack = "";
  const map: { span: HTMLElement; start: number; end: number }[] = [];
  for (const span of spans) {
    const piece = (span.textContent ?? "").replace(/\s+/g, " ").toLowerCase();
    if (!piece.trim()) continue;
    const start = haystack.length;
    haystack += piece;
    map.push({ span, start, end: haystack.length });
    haystack += " ";
  }

  let idx = -1;
  let endIdx = -1;
  for (const candidate of quoteCandidates(quote)) {
    idx = haystack.indexOf(candidate);
    if (idx !== -1) {
      endIdx = idx + candidate.length;
      break;
    }
  }
  if (idx === -1) return [];

  const hitSpans = map
    .filter((m) => m.end > idx && m.start < endIdx)
    .map((m) => m.span);
  if (!hitSpans.length) return [];

  const pageRect = pageEl.getBoundingClientRect();

  // Merge the per-span rects into one rect per text line.
  const lines = new Map<number, Rect>();
  for (const span of hitSpans) {
    const r = span.getBoundingClientRect();
    const rel: Rect = {
      left: r.left - pageRect.left,
      top: r.top - pageRect.top,
      width: r.width,
      height: r.height,
    };
    const key = Math.round(rel.top / 4) * 4;
    const existing = lines.get(key);
    if (!existing) {
      lines.set(key, rel);
    } else {
      const left = Math.min(existing.left, rel.left);
      const right = Math.max(existing.left + existing.width, rel.left + rel.width);
      existing.left = left;
      existing.width = right - left;
      existing.top = Math.min(existing.top, rel.top);
      existing.height = Math.max(existing.height, rel.height);
    }
  }
  return Array.from(lines.values());
}

export function PaperPdfPanel({
  quotes,
  activeQuote,
  title,
  authors,
  url,
}: {
  quotes: string[];
  activeQuote: string;
  title: string;
  authors: string;
  url: string;
}) {
  const [numPages, setNumPages] = useState(0);
  const [pagesReady, setPagesReady] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());
  const textLayerRefs = useRef(new Map<number, HTMLElement>());
  // Pages whose text layer has rendered — so we bump `pagesReady` once per page,
  // never re-triggering as the tree re-renders (which caused the flashing loop).
  const readyPages = useRef(new Set<number>());
  // The quote we last auto-scrolled to — so we jump once when a quote is
  // clicked, and never again (e.g. as more pages render) while the reader
  // scrolls the PDF freely.
  const scrolledQuoteRef = useRef<string | null>(null);

  // Locate every quote across the rendered pages and highlight them all at once.
  // Re-runs as pages finish rendering, so passages on later pages resolve once
  // they land.
  useEffect(() => {
    const found: Highlight[] = [];
    for (const quote of quotes) {
      for (let page = 1; page <= numPages; page++) {
        const textLayer = textLayerRefs.current.get(page);
        const pageEl = pageRefs.current.get(page);
        if (!textLayer || !pageEl) continue;
        const rects = findQuoteRects(textLayer, pageEl, quote);
        if (rects.length) {
          found.push({ quote, page, rects });
          break;
        }
      }
    }
    setHighlights(found);
  }, [quotes, pagesReady, numPages]);

  // Scroll the clicked passage into the upper third — once per click. The reader
  // can scroll the PDF freely afterwards; the highlights stay put.
  useEffect(() => {
    if (!activeQuote || scrolledQuoteRef.current === activeQuote) return;
    const target = highlights.find((h) => h.quote === activeQuote);
    if (!target) return; // not located yet — retried when highlights update
    const container = scrollRef.current;
    const pageEl = pageRefs.current.get(target.page);
    if (!container || !pageEl) return;
    scrolledQuoteRef.current = activeQuote;
    const top =
      pageEl.offsetTop +
      (target.rects[0]?.top ?? 0) -
      container.clientHeight * 0.3;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeQuote, highlights]);

  // Render the PDF pages once. Memoizing on numPages means highlight-state
  // changes never re-render (and re-paint) the pages — that re-paint loop was
  // the flashing.
  const pdfPages = useMemo(
    () => (
      <Document
        file={PDF_URL}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="grid h-40 place-items-center">
            <Text variant="caption" color="secondary">
              Loading paper…
            </Text>
          </div>
        }
        error={
          <div className="grid h-40 place-items-center">
            <Text variant="caption" color="error">
              Couldn't load the PDF.
            </Text>
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
          <div
            key={page}
            ref={(el) => {
              if (el) pageRefs.current.set(page, el);
            }}
            className="mx-auto mb-3 w-fit overflow-hidden rounded-[6px] shadow-sm"
          >
            <Page
              pageNumber={page}
              width={PAGE_WIDTH}
              renderAnnotationLayer={false}
              onRenderTextLayerSuccess={() => {
                const el = pageRefs.current
                  .get(page)
                  ?.querySelector<HTMLElement>(".react-pdf__Page__textContent");
                if (el) textLayerRefs.current.set(page, el);
                if (!readyPages.current.has(page)) {
                  readyPages.current.add(page);
                  setPagesReady((n) => n + 1);
                }
              }}
            />
          </div>
        ))}
      </Document>
    ),
    [numPages],
  );

  return (
    <aside
      className={cn(
        "my-6 flex w-[760px] shrink-0 flex-col overflow-hidden rounded-[16px] bg-white",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.25]",
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-2 px-6 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text variant="label">{title}</Text>
          <Text variant="caption" color="secondary" className="truncate">
            {authors}
          </Text>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 text-typography-secondary hover:text-typography-primary"
        >
          <Text variant="caption" color="none">
            arXiv ↗
          </Text>
        </a>
      </div>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto bg-gray-1 px-4 py-4"
      >
        {pdfPages}
        {/* Highlight overlay — a separate layer over the pages, so updating it
            never re-renders the PDF (which caused the flashing). Each rect is
            positioned by its page's offset within the scroll container. */}
        {highlights.flatMap((h) => {
          const pageEl = pageRefs.current.get(h.page);
          if (!pageEl) return [];
          return h.rects.map((rect, idx) => (
            <div
              key={`${h.quote}-${idx}`}
              className={cn(
                "pointer-events-none absolute rounded-[2px] bg-[#ffe14d] mix-blend-multiply transition-opacity duration-200",
                h.quote === activeQuote ? "opacity-70" : "opacity-40",
              )}
              style={{
                left: pageEl.offsetLeft + rect.left - 1,
                top: pageEl.offsetTop + rect.top - 1,
                width: rect.width + 2,
                height: rect.height + 2,
              }}
            />
          ));
        })}
      </div>
    </aside>
  );
}
