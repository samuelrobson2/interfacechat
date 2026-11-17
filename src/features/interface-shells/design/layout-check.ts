/**
 * A deterministic layout check for interfaces, run on the Design System page
 * (the Check button) and by audits. It measures what the guides draw and
 * reports every place an interface breaks them:
 *
 * - keyline: a row's content doesn't start on the size's left edge
 *   (title glyph, first tool, the body's content box and its rows).
 * - margin: something runs past the right keyline (content edge), outside
 *   anything that scrolls or clips it.
 * - spill: something hangs out of its part (below the panel, out of the
 *   title row) where nothing clips it, so it lies over the next part.
 * - overlap: two in-flow siblings cover each other.
 *
 * Only what's drawn counts: hidden parts, absolutely positioned overlays
 * (rings, badges, popovers) and anything inside a scroller (which is meant to
 * run on) are left out. Icons count: they're drawn.
 */

export type LayoutIssue = {
  kind: "keyline" | "margin" | "spill" | "overlap";
  part: string;
  detail: string;
  element: Element;
};

const SLACK = 1.5;
const PARTS = ["title", "tools", "body", "meta"] as const;

const shown = (element: Element) => {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
};
const name = (element: Element) => {
  const text = (element as HTMLElement).innerText?.trim() || (element as HTMLInputElement).value || element.getAttribute("aria-label") || "";
  return `${element.tagName.toLowerCase()}${text ? ` “${text.split("\n")[0]!.slice(0, 24)}”` : ""}`;
};
const scrolls = (style: CSSStyleDeclaration, axis: "x" | "y") =>
  /(auto|scroll|hidden|clip)/.test(axis === "x" ? style.overflowX : style.overflowY);

/** Whether something between `element` and `stop` clips or scrolls it on that axis. */
function clipped(element: Element, stop: Element, axis: "x" | "y") {
  for (let node = element.parentElement; node && node !== stop; node = node.parentElement) {
    if (scrolls(getComputedStyle(node), axis)) return true;
  }
  return false;
}
/** An overlay (a ring, a badge, a floating button): not part of the layout. */
function outOfFlow(element: Element, stop: Element) {
  for (let node: Element | null = element; node && node !== stop; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "absolute" || position === "fixed") return true;
  }
  return false;
}
const px = (value: string) => Number.parseFloat(value) || 0;

export function checkLayout(surface: HTMLElement): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  const size = surface.dataset.shellSize ?? "";
  const style = getComputedStyle(surface);
  const edge = px(style.getPropertyValue("--shell-layout-edge"));
  const box = surface.getBoundingClientRect();
  const left = box.left + edge;
  const right = box.right - edge;
  const part = (name: string) => [...surface.querySelectorAll<HTMLElement>(`[data-shell-part="${name}"]`)].find(shown) ?? null;

  // Keylines: where each row starts, measured from what's drawn first (an icon, a word), not the box around it.
  const startOf = (row: HTMLElement) => {
    const leaves = [...row.querySelectorAll("svg, img, input, textarea, span, button, div, a")].filter(
      (el) => shown(el) && !outOfFlow(el, row) && el.getBoundingClientRect().left >= row.getBoundingClientRect().left - SLACK && (el.tagName === "svg" || el.tagName === "IMG" || /^(INPUT|TEXTAREA)$/.test(el.tagName) || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())),
    );
    let at = Infinity;
    let first: Element | null = null;
    for (const el of leaves) {
      // Words start where their text does, not at the edge of the box (a button's padding) around them.
      const text = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent?.trim());
      let x = el.getBoundingClientRect().left;
      if (/^(INPUT|TEXTAREA)$/.test(el.tagName)) x += px(getComputedStyle(el).paddingLeft);
      else if (text) {
        const range = document.createRange();
        range.selectNodeContents(text);
        x = range.getBoundingClientRect().left;
      }
      if (x < at) [at, first] = [x, el];
    }
    return first ? { at, first } : null;
  };
  const title = part("title");
  const titleStart = title && startOf(title);
  if (titleStart && Math.abs(titleStart.at - left) > SLACK) {
    issues.push({ kind: "keyline", part: "title", detail: `starts at ${Math.round(titleStart.at - box.left)}, edge is ${edge}`, element: titleStart.first });
  }
  const tools = part("tools");
  const toolsStart = tools && startOf(tools);
  // An icon's drawing sits a pixel or two inside its box.
  if (toolsStart && (toolsStart.at - left > 3 || left - toolsStart.at > SLACK)) {
    issues.push({ kind: "keyline", part: "tools", detail: `first tool at ${Math.round(toolsStart.at - box.left)}, edge is ${edge}`, element: toolsStart.first });
  }
  const body = part("body");
  if (body && (size === "medium-plus" || size === "large")) {
    const b = body.getBoundingClientRect();
    const content = b.left + px(getComputedStyle(body).paddingLeft);
    // A full-width row inside the body (a table, a scroller) may start at the panel's edge; text rows start on the keyline.
    if (Math.abs(content - left) > SLACK) issues.push({ kind: "keyline", part: "body", detail: `content starts at ${Math.round(content - box.left)}, edge is ${edge}`, element: body });
  }

  // Margin and spill: nothing in flow runs past the content edge or out of its part.
  for (const partName of PARTS) {
    const element = part(partName);
    if (!element) continue;
    const p = element.getBoundingClientRect();
    for (const el of element.querySelectorAll("*")) {
      if (!shown(el) || outOfFlow(el, element)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > Math.max(right, p.right - px(getComputedStyle(element).paddingRight)) + SLACK && !clipped(el, element, "x") && !scrolls(getComputedStyle(element), "x")) {
        issues.push({ kind: "margin", part: partName, detail: `${name(el)} runs ${Math.round(r.right - right)}px past the right keyline`, element: el });
      }
      if (r.bottom > p.bottom + SLACK && !clipped(el, element, "y") && !scrolls(getComputedStyle(element), "y")) {
        issues.push({ kind: "spill", part: partName, detail: `${name(el)} hangs ${Math.round(r.bottom - p.bottom)}px below the ${partName}`, element: el });
      }
    }
  }

  // Anything drawn outside the parts (a button row, a footer) keeps to the keylines too.
  for (const el of surface.querySelectorAll("button, input, textarea, svg, img, span, div, p")) {
    if (!shown(el) || el.closest("[data-shell-part]") || outOfFlow(el, surface) || clipped(el, surface, "x")) continue;
    const drawsText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
    if (!drawsText && !/^(BUTTON|INPUT|TEXTAREA|svg|IMG)$/.test(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > right + SLACK || r.left < left - SLACK) {
      issues.push({ kind: "margin", part: "frame", detail: `${name(el)} sits outside the keylines (${Math.round(r.left - box.left)}–${Math.round(r.right - box.left)}, edges at ${edge} and ${Math.round(box.width - edge)}) and in no part`, element: el });
    }
  }

  // Overlap: in-flow siblings that cover each other.
  for (const parent of surface.querySelectorAll("*")) {
    // Table column groups describe columns; they aren't boxes of their own.
    const kids = [...parent.children].filter((el) => shown(el) && !outOfFlow(el, parent) && !/^(BR|COLGROUP|COL)$/.test(el.tagName));
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i]!.getBoundingClientRect();
        const c = kids[j]!.getBoundingClientRect();
        const w = Math.min(a.right, c.right) - Math.max(a.left, c.left);
        const h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        // Inline text wraps across lines and shares them; only boxes count.
        const inline = [kids[i]!, kids[j]!].some((el) => getComputedStyle(el).display === "inline");
        if (w > 2 && h > 2 && !inline) {
          const where = PARTS.find((n) => parent.closest(`[data-shell-part="${n}"]`)) ?? "frame";
          issues.push({ kind: "overlap", part: where, detail: `${name(kids[i]!)} overlaps ${name(kids[j]!)} by ${Math.round(w)}×${Math.round(h)}`, element: kids[j]! });
        }
      }
    }
  }

  // One finding per element and kind.
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.kind}|${issue.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Every interface inside `root`, with what it breaks. */
export function checkAll(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("[data-shell-size]")].filter(shown).map((surface) => ({
    surface,
    title:
      (surface.querySelector('[data-shell-part="title"]') as HTMLElement | null)?.innerText.trim().split("\n")[0] ||
      (surface.querySelector('[data-shell-part="title"] input, [data-shell-part="title"] textarea') as HTMLInputElement | null)?.value ||
      "Untitled",
    issues: checkLayout(surface),
  }));
}
