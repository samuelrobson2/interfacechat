// Locate a verbatim quote inside a rendered pdf.js text layer and return its
// bounding rects — the same technique a production agent would use to point a
// chat reply at a specific passage: quote the text, then find it on the page.
// Extracted from the archived paper-chat demo (chat/_compose/mock-paper-pdf.tsx)
// so any document (not just the seed paper) can support reference-highlighting.

export type Rect = { left: number; top: number; width: number; height: number };
export type Highlight = { quote: string; page: number; rects: Rect[] };

const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

// Try the full quote first, then progressively shorter leading prefixes, so a
// match still lands even if a word is hyphenated across a line break.
export function quoteCandidates(quote: string): string[] {
  const words = normalize(quote).split(" ");
  const lengths = [words.length, 12, 8, 5].filter((n) => n <= words.length);
  return Array.from(new Set(lengths)).map((n) => words.slice(0, n).join(" "));
}

// Find a quote within a rendered page's text layer and return its bounding
// rects (one per line), relative to the page element.
export function findQuoteRects(
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
