import { Hand, Maximize, Minus, MousePointer2, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { SHELL_COLOURS, type ShellColour } from "../model/shell-types";
import { fieldEvents, stopFieldEvent } from "./shell-surface";

/**
 * A FigJam-style board for the large canvas interfaces (mind map, flowchart,
 * timeline): drag empty space to pan, ⌘/Ctrl + scroll or pinch to zoom, a tool
 * bar along the bottom, zoom controls in the corner, and a small bar of
 * options floating above whatever is selected.
 *
 * Shortcuts follow FigJam: V select, H hand, hold Space to pan, ⇧1 fit,
 * + / − zoom, Delete removes the selection, Esc clears it.
 */

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const FIT_PADDING = 32;
/** Room the bottom tool bar takes, so fitting leaves the scene clear of it. */
const TOOLBAR_ROOM = 56;

/** A design-system colour token as a CSS value. */
export const canvasColour = (token: ShellColour) => `var(--color-${token})`;
/** A tint of any colour, hex or variable, for fills behind text. */
export const tint = (colour: string, percent: number) => `color-mix(in srgb, ${colour} ${percent}%, transparent)`;

export type CanvasTool = {
  id: string;
  icon: LucideIcon | ((props: { className?: string }) => React.ReactNode);
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type View = { x: number; y: number; zoom: number };

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function IconButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  className,
}: {
  icon: CanvasTool["icon"];
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onClick();
      }}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[10px] text-typography-primary transition-colors active:scale-[0.94] disabled:pointer-events-none disabled:opacity-30",
        active ? "bg-blue-4 text-gray-0" : "hover:bg-gray-6",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-gray-3/25" />;

/** The bar that floats above a selection. Compose it from the pieces below. */
export function SelectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      {...fieldEvents}
      className="flex items-center gap-0.5 rounded-[12px] border border-gray-3/20 bg-gray-0 p-1 shadow-[0_6px_20px_-8px_rgba(26,23,24,0.3)]"
    >
      {children}
    </div>
  );
}

SelectionBar.Divider = Divider;

SelectionBar.Button = function SelectionButton(props: {
  icon: CanvasTool["icon"];
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return <IconButton {...props} className="size-7 rounded-[8px]" />;
};

SelectionBar.Delete = function SelectionDelete({ onClick }: { onClick: () => void }) {
  return <IconButton icon={Trash2} label="Delete" onClick={onClick} className="size-7 rounded-[8px] hover:text-red-5" />;
};

/** A row of colour dots; the current one is ringed. */
SelectionBar.Colours = function SelectionColours({
  value,
  onChange,
}: {
  value?: ShellColour;
  onChange: (colour: ShellColour) => void;
}) {
  return (
    <span className="flex items-center gap-1 px-1">
      {SHELL_COLOURS.map((token) => (
        <button
          key={token}
          type="button"
          aria-label={`Colour ${token}`}
          aria-pressed={value === token}
          title={token}
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            onChange(token);
          }}
          className={cn(
            "size-4 rounded-full transition-transform hover:scale-110 active:scale-95",
            value === token && "ring-2 ring-gray-5 ring-offset-1",
          )}
          style={{ backgroundColor: canvasColour(token) }}
        />
      ))}
    </span>
  );
};

export function CanvasBoard({
  width,
  height,
  tools = [],
  editable,
  selection,
  onClearSelection,
  onDelete,
  suggestions,
  className,
  children,
}: {
  /** The scene's own size; it's drawn at this size and zoomed. */
  width: number;
  height: number;
  /** The interface's add tools, after Select and Hand. */
  tools?: CanvasTool[];
  editable: boolean;
  /**
   * Where to float the selection bar. Either a point in scene coordinates (the top
   * centre of the item), or `anchor`: the item's data-canvas-id, measured on the
   * page, with the bar above its top or, with placement "below", under its bottom.
   */
  selection?: {
    x?: number;
    y?: number;
    anchor?: string;
    placement?: "above" | "below";
    bar: React.ReactNode;
  } | null;
  onClearSelection?: () => void;
  onDelete?: () => void;
  /** Suggested tools about what's on the board, floating top left, out of the work's way. */
  suggestions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [anchorBox, setAnchorBox] = useState<{ x: number; top: number; bottom: number } | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View | null>(null);
  const [tool, setTool] = useState<"select" | "hand">("select");
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null);
  const hand = tool === "hand" || spaceHeld;

  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fitView = useCallback((): View | null => {
    if (!box.w || !box.h) return null;
    const room = { w: box.w - FIT_PADDING * 2, h: box.h - FIT_PADDING * 2 - TOOLBAR_ROOM };
    const zoom = clampZoom(Math.min(1, room.w / width, room.h / height));
    return {
      zoom,
      x: (box.w - width * zoom) / 2,
      y: (box.h - TOOLBAR_ROOM - height * zoom) / 2,
    };
  }, [box.w, box.h, width, height]);

  // Start fitted, and refit while the person hasn't moved the view.
  const touched = useRef(false);
  useLayoutEffect(() => {
    if (!touched.current || !view) setView(fitView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView]);

  const zoomAt = useCallback((factor: number, at?: { x: number; y: number }) => {
    touched.current = true;
    setView((current) => {
      if (!current) return current;
      const zoom = clampZoom(current.zoom * factor);
      const point = at ?? { x: box.w / 2, y: box.h / 2 };
      // Keep the point under the cursor still.
      const ratio = zoom / current.zoom;
      return { zoom, x: point.x - (point.x - current.x) * ratio, y: point.y - (point.y - current.y) * ratio };
    });
  }, [box.w, box.h]);

  const fit = () => {
    touched.current = false;
    setView(fitView());
  };

  // ⌘/Ctrl + wheel and trackpad pinch zoom; needs a non-passive listener to stop the page zooming.
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * 0.01), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (event: React.PointerEvent) => {
    stopFieldEvent(event);
    if (!view || event.button !== 0) return;
    // In select mode only empty board pans; items handle their own clicks.
    const onItem = (event.target as HTMLElement).closest("[data-canvas-item]");
    if (!hand && onItem) return;
    drag.current = { x: event.clientX, y: event.clientY, view, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setPanning(true);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true;
    if (!start.moved) return;
    touched.current = true;
    setView({ ...start.view, x: start.view.x + dx, y: start.view.y + dy });
  };
  const onPointerUp = () => {
    const start = drag.current;
    drag.current = null;
    setPanning(false);
    // A click on empty board, not a pan, clears the selection.
    if (start && !start.moved && !hand) onClearSelection?.();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isTyping(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      setSpaceHeld(true);
    } else if (key === "v") setTool("select");
    else if (key === "h") setTool("hand");
    else if (event.shiftKey && (event.code === "Digit1" || key === "!")) fit();
    else if (key === "=" || key === "+") zoomAt(1.25);
    else if (key === "-" || key === "_") zoomAt(0.8);
    else if ((key === "delete" || key === "backspace") && editable && selection) {
      event.preventDefault();
      onDelete?.();
    } else if (key === "escape") onClearSelection?.();
    else return;
    stopFieldEvent(event);
  };
  const onKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === " ") setSpaceHeld(false);
  };

  // Measure an anchored item in scene units, after every render, since edits can resize it.
  const anchor = selection?.anchor;
  useLayoutEffect(() => {
    const element = anchor && scene.current?.querySelector<HTMLElement>(`[data-canvas-id="${CSS.escape(anchor)}"]`);
    if (!element || !scene.current || !view) {
      if (anchorBox) setAnchorBox(null);
      return;
    }
    const outer = scene.current.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const next = {
      x: (rect.left + rect.width / 2 - outer.left) / view.zoom,
      top: (rect.top - outer.top) / view.zoom,
      bottom: (rect.bottom - outer.top) / view.zoom,
    };
    if (!anchorBox || Math.abs(anchorBox.x - next.x) + Math.abs(anchorBox.top - next.top) + Math.abs(anchorBox.bottom - next.bottom) > 0.5) {
      setAnchorBox(next);
    }
  });

  const point =
    selection && anchor
      ? anchorBox && { x: anchorBox.x, y: selection.placement === "below" ? anchorBox.bottom : anchorBox.top }
      : selection && selection.x !== undefined && selection.y !== undefined
        ? { x: selection.x, y: selection.y }
        : null;
  const barAt = view && point ? { left: view.x + point.x * view.zoom, top: view.y + point.y * view.zoom } : null;

  return (
    <div
      ref={frame}
      tabIndex={0}
      aria-label="Board. Drag to pan, ⌘ scroll to zoom."
      {...fieldEvents}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={cn(
        "relative min-h-0 flex-1 touch-none overflow-hidden bg-gray-1 outline-none select-none",
        hand ? (panning ? "cursor-grabbing" : "cursor-grab") : panning && "cursor-grabbing",
        className,
      )}
      style={{
        // The dot grid moves and scales with the scene, as in FigJam.
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,23,24,0.10) 1px, transparent 0)",
        backgroundSize: view ? `${24 * view.zoom}px ${24 * view.zoom}px` : "24px 24px",
        backgroundPosition: view ? `${view.x}px ${view.y}px` : undefined,
      }}
    >
      <div
        ref={scene}
        className={cn("absolute top-0 left-0 origin-top-left", hand && "pointer-events-none")}
        style={{
          width,
          height,
          transform: view ? `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` : undefined,
          opacity: view ? 1 : 0,
        }}
      >
        {children}
      </div>

      {barAt && editable && !hand && (
        <div
          className={cn(
            "absolute z-10 -translate-x-1/2",
            selection!.placement === "below" ? "pt-2" : "-translate-y-full pb-2",
          )}
          style={{ left: barAt.left, top: barAt.top }}
        >
          {selection!.bar}
        </div>
      )}

      {suggestions && (
        <div {...fieldEvents} className="absolute top-3 left-3 z-10 max-w-[calc(100%-24px)]">
          {suggestions}
        </div>
      )}

      {/* Tools, bottom centre. */}
      <div
        {...fieldEvents}
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-[14px] border border-gray-3/20 bg-gray-0 p-1 shadow-[0_6px_20px_-8px_rgba(26,23,24,0.3)]"
      >
        <IconButton icon={MousePointer2} label="Select (V)" active={!hand} onClick={() => setTool("select")} />
        <IconButton icon={Hand} label="Hand (H, or hold Space)" active={hand} onClick={() => setTool("hand")} />
        {tools.length > 0 && <Divider />}
        {tools.map((item) => (
          <IconButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            disabled={!editable || item.disabled}
            onClick={() => {
              setTool("select");
              item.onClick();
            }}
          />
        ))}
      </div>

      {/* Zoom, bottom right. */}
      <div
        {...fieldEvents}
        className="absolute right-3 bottom-3 z-10 flex items-center gap-0.5 rounded-[12px] border border-gray-3/20 bg-gray-0 p-1 shadow-[0_6px_20px_-8px_rgba(26,23,24,0.3)]"
      >
        <IconButton icon={Minus} label="Zoom out (−)" onClick={() => zoomAt(0.8)} className="size-7" />
        <button
          type="button"
          title="Zoom to fit (⇧1)"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            fit();
          }}
          className="h-7 w-11 rounded-[8px] font-bureau text-[11px] text-typography-primary tabular-nums hover:bg-gray-6"
        >
          {view ? `${Math.round(view.zoom * 100)}%` : "–"}
        </button>
        <IconButton icon={Plus} label="Zoom in (+)" onClick={() => zoomAt(1.25)} className="size-7" />
        <IconButton icon={Maximize} label="Zoom to fit (⇧1)" onClick={fit} className="size-7" />
      </div>
    </div>
  );
}
