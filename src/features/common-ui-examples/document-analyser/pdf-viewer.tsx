import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { findQuoteRects, type Highlight } from "./lib/pdf-quote-highlight";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PAGE_WIDTH = 700;

// Generic pdf viewer with quote-based reference highlighting. Any document
// works as a plain viewer; passing `quotes` (verbatim strings expected to
// appear in the PDF's text) additionally boxes and auto-scrolls to them —
// this is how the pinned chat "points at" a passage it's discussing.
export function PdfHighlightViewer({
  file,
  quotes = [],
  activeQuote,
}: {
  file: string;
  quotes?: string[];
  activeQuote?: string;
}) {
  const [numPages, setNumPages] = useState(0);
  const [pagesReady, setPagesReady] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());
  const textLayerRefs = useRef(new Map<number, HTMLElement>());
  const readyPages = useRef(new Set<number>());
  const scrolledQuoteRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!activeQuote || scrolledQuoteRef.current === activeQuote) return;
    const target = highlights.find((h) => h.quote === activeQuote);
    if (!target) return;
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

  // Reset once the viewer is pointed at a different file.
  useEffect(() => {
    setNumPages(0);
    setPagesReady(0);
    setHighlights([]);
    pageRefs.current.clear();
    textLayerRefs.current.clear();
    readyPages.current.clear();
    scrolledQuoteRef.current = null;
  }, [file]);

  // Memoized on file + numPages only, so highlight-state changes never
  // re-render (and re-paint) the pages.
  const pdfPages = useMemo(
    () => (
      <Document
        file={file}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="grid h-40 place-items-center">
            <Text variant="caption" color="secondary">
              Loading document…
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
    [file, numPages],
  );

  return (
    <div
      ref={scrollRef}
      className="relative h-full min-h-0 flex-1 overflow-y-auto bg-gray-1 px-4 py-4"
    >
      {pdfPages}
      {/* Highlight overlay — a separate layer over the pages, so updating it
          never re-renders (and re-paints) the PDF. */}
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
  );
}
