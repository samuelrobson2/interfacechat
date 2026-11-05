const HIGHLIGHT_NAME = "chat-selection";

type HighlightRegistry = {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => void;
};

const getHighlightRegistry = (): HighlightRegistry | null => {
  if (typeof CSS === "undefined") return null;
  const registry = (CSS as unknown as { highlights?: HighlightRegistry })
    .highlights;
  if (!registry) return null;
  if (typeof (globalThis as { Highlight?: unknown }).Highlight !== "function") {
    return null;
  }
  return registry;
};

// Returns true if the CSS Highlight Registry was available and the highlight
// was registered. Callers use this to decide whether to drop the native DOM
// selection (registry handles the visual) or keep it as a degraded fallback.
export const paintCustomHighlight = (range: Range): boolean => {
  const registry = getHighlightRegistry();
  if (!registry) return false;
  const HighlightCtor = (globalThis as { Highlight: new (r: Range) => unknown })
    .Highlight;
  registry.set(HIGHLIGHT_NAME, new HighlightCtor(range));
  return true;
};

export const clearCustomHighlight = () => {
  const registry = getHighlightRegistry();
  if (!registry) return;
  registry.delete(HIGHLIGHT_NAME);
};

// Class toggled on <body> while a committed highlight is shown. The native DOM
// selection is kept alive (so Ctrl/Cmd+C and the browser context-menu "Copy"
// keep working), but its paint is hidden via CSS so only the custom highlight
// layer is visible — avoiding a double-highlight artifact.
const NATIVE_SELECTION_HIDDEN_CLASS = "chat-native-selection-hidden";

export const setNativeSelectionHidden = (hidden: boolean) => {
  document.body.classList.toggle(NATIVE_SELECTION_HIDDEN_CLASS, hidden);
};

// Unicode-aware word patterns: letters, digits and underscore in any script.
// WORD_TAIL matches a run of word chars ending at the substring end (used to
// extend the range start backward). WORD_HEAD matches a run starting at the
// beginning (used to extend the range end forward).
const WORD_TAIL = /[\p{L}\p{N}_]+$/u;
const WORD_HEAD = /^[\p{L}\p{N}_]+/u;

// Expand a Range so that its start/end never split a word. Mutates the
// passed range in place and returns whether anything changed.
export const expandRangeToWordBoundaries = (range: Range): boolean => {
  let changed = false;

  const { startContainer, endContainer, startOffset, endOffset } = range;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = (startContainer as Text).data;
    const tail = text.slice(0, startOffset).match(WORD_TAIL);
    if (tail) {
      range.setStart(startContainer, startOffset - tail[0].length);
      changed = true;
    }
  }

  if (endContainer.nodeType === Node.TEXT_NODE) {
    const text = (endContainer as Text).data;
    const head = text.slice(endOffset).match(WORD_HEAD);
    if (head) {
      range.setEnd(endContainer, endOffset + head[0].length);
      changed = true;
    }
  }

  return changed;
};

// Walk up from a DOM node to the nearest ancestor that carries the given
// data attribute injected by the rehype-md-positions plugin.
const findAncestorWithAttr = (
  node: Node | null,
  attr: string,
  root: Element,
): Element | null => {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as Element;
      if (el.hasAttribute(attr)) return el;
    }
    current = current.parentNode;
  }
  return null;
};

// Resolve a DOM Range to markdown source offsets using the data-md-start /
// data-md-end attributes set by rehype-md-positions. Text nodes are wrapped in
// <span> with these attrs, so we can compute per-character precision:
//   start = dataMdStart(startAnchor) + range.startOffset  // inside text node
//   end   = dataMdStart(endAnchor)   + range.endOffset
// For element containers (e.g. whole-block selections) we fall back to the
// anchor's own start/end offsets.
export const resolveHighlightOffsetsFromRange = (
  range: Range,
  answerEl: Element,
): { start: number; end: number } | undefined => {
  if (!answerEl.contains(range.commonAncestorContainer)) return undefined;

  const startAnchor = findAncestorWithAttr(
    range.startContainer,
    "data-md-start",
    answerEl,
  );
  const endAnchor = findAncestorWithAttr(
    range.endContainer,
    "data-md-start",
    answerEl,
  );
  if (!startAnchor || !endAnchor) return undefined;

  const startBase = Number(startAnchor.getAttribute("data-md-start"));
  const endBase = Number(endAnchor.getAttribute("data-md-start"));
  const endAttrEnd = Number(endAnchor.getAttribute("data-md-end"));
  if (Number.isNaN(startBase) || Number.isNaN(endBase)) return undefined;

  // range.*Offset is a char offset inside a text node; for element containers
  // it refers to a child index which we can't translate precisely — fall back
  // to the anchor start in that case.
  const startDelta =
    range.startContainer.nodeType === Node.TEXT_NODE ? range.startOffset : 0;
  const endDelta =
    range.endContainer.nodeType === Node.TEXT_NODE ? range.endOffset : 0;

  const start = startBase + startDelta;
  let end = endBase + endDelta;

  if (!Number.isNaN(endAttrEnd) && end > endAttrEnd) end = endAttrEnd;
  if (start >= end) return undefined;

  return { start, end };
};
