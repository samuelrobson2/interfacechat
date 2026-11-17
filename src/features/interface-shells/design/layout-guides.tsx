import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Layout guides over every interface on the Design System page, drawn the way
 * design tools draw them (Figma's layout grids, Apple's layout margins and
 * readable width, Material's keylines and 4dp baseline):
 *
 * - Margins: both edges the content keeps to, a red band with a solid line on
 *   the keyline where the title's glyph, the first tool and the content start.
 * - Panel: at medium and medium plus, the white panel's own edge, dashed, so
 *   the inset (panel edge) reads apart from the keyline (content).
 * - Rows: dashed blue lines at the top and bottom of each part, with its
 *   height in the right margin beside it, to check rhythm across interfaces.
 *
 * Every value sits in the margin it belongs to, so a guide never covers what
 * it's measuring: the left edge in the left margin, the panel inset and the
 * row heights in the right one.
 * - Readable: at large, where body text should stop (680px of text).
 * - Baseline: a 4px grid, off by default; it overwhelms a small card.
 *
 * Solid means "aligns here"; dashed means "a boundary or a limit".
 */

export type GuideKind = "margins" | "panel" | "rows" | "readable" | "baseline";
export const GUIDE_KINDS: { id: GuideKind; label: string; title: string }[] = [
  { id: "margins", label: "Margins", title: "The left and right keylines everything starts and ends on" },
  { id: "panel", label: "Panel", title: "The panel's edge (dashed) against the content keyline" },
  { id: "rows", label: "Rows", title: "Each part's top and bottom, with its height" },
  { id: "readable", label: "Readable", title: "Large: where a line of body text should stop" },
  { id: "baseline", label: "4px", title: "The 4px grid spacing and type sit on" },
];

const READABLE = 680;
const RED = "rgb(247 102 102)";
const BLUE = "rgb(70 165 216)";
const PARTS = ["title", "tools", "body", "meta"] as const;

type Rect = { left: number; top: number; width: number; height: number };
type Surface = {
  key: string;
  size: string;
  box: Rect;
  edge: number;
  panel: Rect | null;
  rows: { part: string; box: Rect }[];
};

const rectOf = (element: Element): Rect => {
  const r = element.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};
const visible = (element: Element) => {
  const r = element.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(element).display !== "none";
};

function measure(root: HTMLElement): Surface[] {
  return [...root.querySelectorAll<HTMLElement>("[data-shell-size]")].filter(visible).map((surface, index) => {
    const size = surface.dataset.shellSize ?? "";
    const style = getComputedStyle(surface);
    const edge = Number.parseFloat(style.getPropertyValue("--shell-layout-edge")) || 0;
    const part = (name: string) => [...surface.querySelectorAll(`[data-shell-part="${name}"]`)].find(visible) ?? null;
    // The panel is the body's box, and at medium sizes the tools row sitting at its top.
    let panel: Rect | null = null;
    const body = part("body");
    if (body && (size === "medium" || size === "medium-plus")) {
      const b = rectOf(body);
      const tools = part("tools");
      const t = tools ? rectOf(tools) : null;
      const top = t && t.top < b.top && Math.abs(t.left - b.left) < 2 ? t.top : b.top;
      panel = { left: b.left, top, width: b.width, height: b.top + b.height - top };
    }
    const rows = PARTS.flatMap((name) => {
      const element = part(name);
      return element ? [{ part: name, box: rectOf(element) }] : [];
    });
    return { key: `${size}-${index}`, size, box: rectOf(surface), edge, panel, rows };
  });
}

export function LayoutGuides({ container, on }: { container: React.RefObject<HTMLElement | null>; on: Set<GuideKind> }) {
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const active = on.size > 0;

  // Follow the interfaces as tokens change, the page scrolls or the window resizes.
  useEffect(() => {
    const root = container.current;
    if (!active || !root) return;
    let frame = 0;
    let last = "";
    const tick = () => {
      const next = measure(root);
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setSurfaces(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [container, active]);

  if (!active) return null;
  const view = container.current?.getBoundingClientRect();

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed z-[55] overflow-hidden"
      style={view ? { left: view.left, top: view.top, width: view.width, height: view.height } : undefined}
    >
      <div className="absolute" style={{ left: -(view?.left ?? 0), top: -(view?.top ?? 0) }}>
        {surfaces.map(({ key, size, box, edge, panel, rows }) => (
          <div key={key}>
            {on.has("baseline") && (
              <div
                className="absolute"
                style={{
                  ...box,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 3px, rgb(70 165 216 / 0.14) 3px 4px)`,
                }}
              />
            )}
            {on.has("margins") && edge > 0 && (
              <>
                {/* A band over each margin, with a solid line on the keyline. */}
                <div className="absolute" style={{ left: box.left, top: box.top, width: edge, height: box.height, background: "rgb(247 102 102 / 0.08)", borderRight: `1px solid ${RED}` }} />
                <div className="absolute" style={{ left: box.left + box.width - edge, top: box.top, width: edge, height: box.height, background: "rgb(247 102 102 / 0.08)", borderLeft: `1px solid ${RED}` }} />
                {/* The value sits in the margin it measures, so it never covers content. */}
                <Label left={box.left + edge / 2} top={box.top + 3} color={RED} center>
                  {`${Math.round(edge)}`}
                </Label>
              </>
            )}
            {on.has("panel") && panel && (
              <>
                <div className="absolute rounded-[6px]" style={{ ...panel, outline: `1px dashed ${RED}`, outlineOffset: 0, opacity: 0.8 }} />
                {/* At the foot of the right margin, clear of the row heights. */}
                <Label left={box.left + box.width - edge / 2} top={box.top + box.height - 16} color={RED} center title="panel inset">
                  {`${Math.round(panel.left - box.left)}`}
                </Label>
              </>
            )}
            {on.has("readable") && size === "large" && edge + READABLE < box.width && (
              <>
                <div className="absolute" style={{ left: box.left + edge + READABLE, top: box.top, height: box.height, borderLeft: `1px dashed ${BLUE}` }} />
                <Label left={box.left + edge + READABLE + 4} top={box.top + 4} color={BLUE}>
                  readable {READABLE}
                </Label>
              </>
            )}
            {on.has("rows") &&
              rows.map(({ part, box: row }) => (
                <div key={part}>
                  <div className="absolute" style={{ left: box.left, top: row.top, width: box.width, borderTop: `1px dashed ${BLUE}`, opacity: 0.7 }} />
                  <div className="absolute" style={{ left: box.left, top: row.top + row.height - 1, width: box.width, borderTop: `1px dashed ${BLUE}`, opacity: 0.7 }} />
                  {/* Each row's height, in the right margin beside it, where nothing is drawn. */}
                  <Label left={box.left + box.width - edge / 2} top={row.top + Math.max(0, row.height / 2 - 7)} color={BLUE} center title={part}>
                    {`${Math.round(row.height)}`}
                  </Label>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

function Label({
  left,
  top,
  color,
  end,
  center,
  title,
  children,
}: {
  left: number;
  top: number;
  color: string;
  end?: boolean;
  /** Centred on `left`: for a value inside the margin it measures. */
  center?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className="absolute rounded-[3px] px-0.5 font-mono text-[9px] leading-[13px] whitespace-nowrap text-white"
      // `end`: the label's right edge sits at `left`; `center`: it's centred there. Either way it stays inside its margin.
      style={{ left, top, background: color, transform: end ? "translateX(-100%)" : center ? "translateX(-50%)" : undefined }}
    >
      {children}
    </span>
  );
}
