import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";

// ── FloatingWindow ──────────────────────────────────────────────────────────
// A free-floating, desktop-style window: drag the title bar to move it, drag any
// edge or corner to resize. Extracted from the auto-interface review tool so it
// can be reused (and browsed in the UI Kit gallery). During a drag we write
// straight to the DOM and only commit to React state on release, so large window
// contents don't re-render every frame.

export type WinRect = { x: number; y: number; w: number; h: number };
export type DragMode = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const WIN_RESIZE: { mode: DragMode; cls: string }[] = [
  { mode: "n", cls: "inset-x-3 top-0 h-1.5 cursor-ns-resize" },
  { mode: "s", cls: "inset-x-3 bottom-0 h-1.5 cursor-ns-resize" },
  { mode: "e", cls: "inset-y-3 right-0 w-1.5 cursor-ew-resize" },
  { mode: "w", cls: "inset-y-3 left-0 w-1.5 cursor-ew-resize" },
  { mode: "ne", cls: "top-0 right-0 size-3 cursor-nesw-resize" },
  { mode: "nw", cls: "top-0 left-0 size-3 cursor-nwse-resize" },
  { mode: "se", cls: "bottom-0 right-0 size-3 cursor-nwse-resize" },
  { mode: "sw", cls: "bottom-0 left-0 size-3 cursor-nesw-resize" },
];

export interface FloatingWindowProps {
  initial: WinRect;
  minW?: number;
  minH?: number;
  z?: number;
  onFocus?: () => void;
  // When set, the window can't be moved or resized (its drag handle and resize
  // edges go inert) — used while a markup tool is active so annotating the
  // canvas never accidentally drags or resizes the window.
  locked?: boolean;
  // When set, the window's height tracks its content (grows downward) instead
  // of being a fixed, vertically-resizable size.
  autoHeight?: boolean;
  // When set, the window renders at this width regardless of its resized rect
  // (used to snap the interface window down to a phone width). The underlying
  // rect is preserved, so clearing the override restores the last desktop width.
  widthOverride?: number;
  // When set, overrides the full rect (used by an "expand" button to maximize
  // the window). The underlying drag rect is preserved underneath, so clearing
  // the override restores exactly where the user left it.
  rectOverride?: WinRect;
  children: (move: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  }) => React.ReactNode;
}

export function FloatingWindow({
  initial,
  minW = 320,
  minH = 240,
  z,
  onFocus,
  autoHeight = false,
  widthOverride,
  rectOverride,
  locked = false,
  children,
}: FloatingWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<WinRect>(initial);
  const noop = () => {};
  const drag = useRef<{
    mode: DragMode;
    sx: number;
    sy: number;
    base: WinRect;
    latest: WinRect;
  } | null>(null);

  const begin = (mode: DragMode) => (e: React.PointerEvent) => {
    drag.current = { mode, sx: e.clientX, sy: e.clientY, base: rect, latest: rect };
    // Drag is 1:1 with the cursor — suppress the width tween while resizing.
    if (ref.current) ref.current.style.transition = "none";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !ref.current) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    let { x, y, w, h } = d.base;
    if (d.mode === "move") {
      x += dx;
      y = Math.max(0, y + dy); // keep the title bar reachable
    } else {
      if (d.mode.includes("e")) w = Math.max(minW, d.base.w + dx);
      if (d.mode.includes("s")) h = Math.max(minH, d.base.h + dy);
      if (d.mode.includes("w")) {
        w = Math.max(minW, d.base.w - dx);
        x = d.base.x + d.base.w - w;
      }
      if (d.mode.includes("n")) {
        h = Math.max(minH, d.base.h - dy);
        y = d.base.y + d.base.h - h;
      }
    }
    d.latest = { x, y, w, h };
    const s = ref.current.style;
    s.left = `${x}px`;
    s.top = `${y}px`;
    s.width = `${w}px`;
    if (!autoHeight) s.height = `${h}px`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (d) setRect(d.latest);
  };

  return (
    <div
      ref={ref}
      onPointerDownCapture={onFocus}
      style={{
        left: rectOverride?.x ?? rect.x,
        top: rectOverride?.y ?? rect.y,
        width: rectOverride?.w ?? widthOverride ?? rect.w,
        height: autoHeight ? undefined : (rectOverride?.h ?? rect.h),
        zIndex: z,
        transition:
          "width 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), top 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
      className="absolute"
    >
      {children(
        locked
          ? { onPointerDown: noop, onPointerMove: noop, onPointerUp: noop }
          : { onPointerDown: begin("move"), onPointerMove, onPointerUp },
      )}
      {!locked &&
        WIN_RESIZE.filter(
          (hdl) => !autoHeight || hdl.mode === "e" || hdl.mode === "w",
        ).map((hdl) => (
          <div
            key={hdl.mode}
            onPointerDown={begin(hdl.mode)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={cn("absolute z-40 touch-none", hdl.cls)}
          />
        ))}
    </div>
  );
}
