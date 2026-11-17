import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { primitives, resolveToken, tokenAt, type Part, type TokenGroup, type TokenValue } from "./shell-tokens";

/**
 * Inspect and change spacing with the mouse, on the Design System page.
 * Hovering a part of an interface (anything marked `data-shell-part`) shows
 * its padding (green) and margins (orange), as a browser's inspector does,
 * each labelled with its size and the token behind it. Dragging a side
 * changes that token, snapping to the spacing scale; clicking a part opens
 * its controls in the menu.
 */

type Side = "top" | "right" | "bottom" | "left";
type Box = "padding" | "margin";

/** Which token sets each side of each part. Sides with none are shown, not draggable. */
const SIDE_TOKENS: Partial<Record<Part, Partial<Record<`${Box}-${Side}`, string>>>> = {
  title: {
    "padding-left": "layout.edge",
    "padding-right": "layout.edge",
    "padding-top": "title.padding-top",
    "padding-bottom": "title.padding-bottom",
  },
  body: {
    "padding-left": "body.padding-x",
    "padding-right": "body.padding-x",
    "padding-top": "body.padding-top",
    "padding-bottom": "body.padding-bottom",
    "margin-left": "body.inset-x",
    "margin-right": "body.inset-x",
    "margin-top": "body.inset-top",
    "margin-bottom": "body.inset-bottom",
  },
  tools: { "padding-left": "tools.padding-x", "padding-right": "tools.padding-x" },
  meta: { "margin-left": "layout.edge", "margin-right": "layout.edge", "margin-bottom": "meta.padding-bottom" },
};

type Target = { element: HTMLElement; part: Part; size: string };
type Measure = {
  rect: DOMRect;
  padding: Record<Side, number>;
  margin: Record<Side, number>;
};

function measure(element: HTMLElement): Measure {
  const style = getComputedStyle(element);
  const read = (prefix: Box): Record<Side, number> => ({
    top: Number.parseFloat(style.getPropertyValue(`${prefix}-top`)) || 0,
    right: Number.parseFloat(style.getPropertyValue(`${prefix}-right`)) || 0,
    bottom: Number.parseFloat(style.getPropertyValue(`${prefix}-bottom`)) || 0,
    left: Number.parseFloat(style.getPropertyValue(`${prefix}-left`)) || 0,
  });
  return { rect: element.getBoundingClientRect(), padding: read("padding"), margin: read("margin") };
}

/** The nearest step on the spacing scale within 2px, else the value itself. */
function snap(tokens: TokenGroup, px: number): TokenValue {
  const value = Math.max(0, Math.round(px));
  let best: { name: string; distance: number } | null = null;
  for (const step of primitives(tokens, "space")) {
    const distance = Math.abs(Number.parseFloat(String(step.value)) - value);
    if (distance <= 2 && (!best || distance < best.distance)) best = { name: step.name, distance };
  }
  return best ? `{space.${best.name}}` : `${value}px`;
}

const REMOVABLE: Part[] = ["title", "tools", "body", "meta", "suggest"];

const PADDING = "rgba(118, 186, 120, 0.32)";
const MARGIN = "rgba(240, 170, 90, 0.30)";

export function PaddingInspector({
  container,
  tokens,
  enabled,
  onSet,
  onSelect,
  onRemove,
}: {
  /** Where the interfaces are: only parts inside it are inspected. */
  container: React.RefObject<HTMLElement | null>;
  tokens: TokenGroup;
  enabled: boolean;
  onSet: (path: string, value: TokenValue) => void;
  onSelect: (part: Part, size: string) => void;
  /** Remove this part at this size (the menu's Restore brings it back). */
  onRemove?: (part: Part, size: string) => void;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const [box, setBox] = useState<Measure | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });
  const drag = useRef<{ path: string; side: Side; kind: Box; start: number; from: number } | null>(null);

  // Hover picks the part under the pointer; while dragging, the part stays put.
  useEffect(() => {
    const root = container.current;
    if (!enabled || !root) return;
    const onMove = (event: PointerEvent) => {
      if (drag.current) return;
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-shell-part]");
      if (!element || !root.contains(element)) return setTarget(null);
      const size = element.closest<HTMLElement>("[data-shell-size]")?.dataset.shellSize ?? "";
      setTarget((current) => (current?.element === element ? current : { element, part: element.dataset.shellPart as Part, size }));
    };
    // Moving onto the overlay's handles leaves the preview area (they're drawn on the body): that isn't leaving the part.
    const onLeave = (event: PointerEvent) => {
      if (drag.current || (event.relatedTarget as HTMLElement | null)?.closest?.("[data-inspector]")) return;
      setTarget(null);
    };
    // While inspecting, a click picks the part rather than editing the interface.
    const onClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-shell-part]");
      if (!element || !root.contains(element)) return;
      event.preventDefault();
      event.stopPropagation();
      const size = element.closest<HTMLElement>("[data-shell-size]")?.dataset.shellSize ?? "";
      onSelectRef.current(element.dataset.shellPart as Part, size);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick, true);
    };
  }, [container, enabled]);

  // Follow the part as tokens change, the page scrolls or the window resizes.
  useEffect(() => {
    if (!target) return;
    let frame = 0;
    const tick = () => {
      if (target.element.isConnected) setBox(measure(target.element));
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (!enabled || !target || !box) return null;
  const { rect, padding, margin } = box;
  const sides = SIDE_TOKENS[target.part] ?? {};
  const tokenPath = (key: `${Box}-${Side}`) => (sides[key] ? `shell.${target.size}.${sides[key]}` : null);

  const startDrag = (event: React.PointerEvent, kind: Box, side: Side, path: string) => {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const horizontal = side === "left" || side === "right";
    drag.current = { path, side, kind, start: horizontal ? event.clientX : event.clientY, from: (kind === "padding" ? padding : margin)[side] };
  };
  const onDrag = (event: React.PointerEvent) => {
    const active = drag.current;
    if (!active) return;
    const horizontal = active.side === "left" || active.side === "right";
    const delta = (horizontal ? event.clientX : event.clientY) - active.start;
    // Padding grows inward (left padding grows as you drag right); margin grows outward.
    const inward = active.side === "left" || active.side === "top" ? delta : -delta;
    onSet(active.path, snap(tokens, active.from + (active.kind === "padding" ? inward : -inward)));
  };
  const endDrag = () => {
    drag.current = null;
  };

  // The regions, as rectangles on the page.
  const inner = {
    left: rect.left + padding.left,
    top: rect.top + padding.top,
    right: rect.right - padding.right,
    bottom: rect.bottom - padding.bottom,
  };
  const outer = {
    left: rect.left - margin.left,
    top: rect.top - margin.top,
    right: rect.right + margin.right,
    bottom: rect.bottom + margin.bottom,
  };
  const regions: { kind: Box; side: Side; style: React.CSSProperties; value: number }[] = [
    { kind: "padding", side: "top", value: padding.top, style: { left: rect.left, top: rect.top, width: rect.width, height: padding.top } },
    { kind: "padding", side: "bottom", value: padding.bottom, style: { left: rect.left, top: inner.bottom, width: rect.width, height: padding.bottom } },
    { kind: "padding", side: "left", value: padding.left, style: { left: rect.left, top: inner.top, width: padding.left, height: inner.bottom - inner.top } },
    { kind: "padding", side: "right", value: padding.right, style: { left: inner.right, top: inner.top, width: padding.right, height: inner.bottom - inner.top } },
    { kind: "margin", side: "top", value: margin.top, style: { left: outer.left, top: outer.top, width: outer.right - outer.left, height: margin.top } },
    { kind: "margin", side: "bottom", value: margin.bottom, style: { left: outer.left, top: rect.bottom, width: outer.right - outer.left, height: margin.bottom } },
    { kind: "margin", side: "left", value: margin.left, style: { left: outer.left, top: rect.top, width: margin.left, height: rect.height } },
    { kind: "margin", side: "right", value: margin.right, style: { left: rect.right, top: rect.top, width: margin.right, height: rect.height } },
  ];

  return createPortal(
    <div data-inspector className="pointer-events-none fixed inset-0 z-[60]" onPointerMove={onDrag} onPointerUp={endDrag} onPointerLeave={() => !drag.current && setTarget(null)}>
      <div className="fixed outline outline-1 outline-[#4986b4]" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />
      {regions.map(({ kind, side, style, value }) => {
        if (value < 0.5 && !tokenPath(`${kind}-${side}`)) return null;
        const path = tokenPath(`${kind}-${side}`);
        const token = path ? tokenAt(tokens, path) : undefined;
        const horizontal = side === "left" || side === "right";
        return (
          <div
            key={`${kind}-${side}`}
            onPointerDown={path ? (event) => startDrag(event, kind, side, path) : undefined}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            title={path ? `${path.split(".").slice(2).join(".")}: drag to change` : `${kind} ${side}`}
            className={`fixed flex items-center justify-center ${path ? "pointer-events-auto" : ""} ${path ? (horizontal ? "cursor-ew-resize" : "cursor-ns-resize") : ""}`}
            style={{ ...style, minWidth: horizontal ? 6 : undefined, minHeight: horizontal ? undefined : 6, background: kind === "padding" ? PADDING : MARGIN }}
          >
            {(horizontal ? (style.width as number) : (style.height as number)) >= 10 && (
              <span className="rounded-[4px] bg-gray-5/85 px-1 font-mono text-[9px] leading-[1.4] whitespace-nowrap text-white">
                {Math.round(value)}
                {token && typeof token.$value === "string" && token.$value.startsWith("{") ? ` ${token.$value.slice(1, -1)}` : ""}
              </span>
            )}
          </div>
        );
      })}
      <div
        className="pointer-events-auto fixed flex items-center gap-1.5 rounded-[6px] bg-gray-5 py-0.5 pr-0.5 pl-1.5 font-bureau text-[11px] whitespace-nowrap text-white"
        style={{ left: rect.left, top: Math.max(4, outer.top - 24) }}
      >
        {target.part} · {target.size} · {Math.round(rect.width)}×{Math.round(rect.height)}
        {sides["padding-left"] ? ` · ${sides["padding-left"]} ${String(resolveToken(tokens, `{shell.${target.size}.${sides["padding-left"]}}`))}` : ""}
        {onRemove && REMOVABLE.includes(target.part) && (
          <button
            type="button"
            onClick={() => {
              onRemove(target.part, target.size);
              setTarget(null);
            }}
            title={`Remove the ${target.part} from every interface at ${target.size}`}
            className="cursor-pointer rounded-[4px] bg-white/15 px-1.5 hover:bg-white/25"
          >
            Remove
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
