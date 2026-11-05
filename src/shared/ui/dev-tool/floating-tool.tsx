import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type FloatingToolPosition = { x: number; y: number };

const EDGE = 8;
const DRAG_THRESHOLD = 4;

const storageKey = (id: string) => `adaption.dev-tool.${id}`;

const clamp = (
  position: FloatingToolPosition,
  width: number,
  height: number,
): FloatingToolPosition => {
  const maxX = Math.max(EDGE, window.innerWidth - width - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - height - EDGE);
  return {
    x: Math.min(maxX, Math.max(EDGE, position.x)),
    y: Math.min(maxY, Math.max(EDGE, position.y)),
  };
};

const readStored = (
  id: string,
): { open?: boolean; position?: FloatingToolPosition } => {
  try {
    const raw = sessionStorage.getItem(storageKey(id));
    return raw ? (JSON.parse(raw) as { open?: boolean; position?: FloatingToolPosition }) : {};
  } catch {
    return {};
  }
};

const writeStored = (
  id: string,
  value: { open: boolean; position: FloatingToolPosition },
) => {
  try {
    sessionStorage.setItem(storageKey(id), JSON.stringify(value));
  } catch {
    // Ignore private-mode storage failures.
  }
};

/**
 * Viewport-level floating panel for personal / DEV tools.
 * Portals to `document.body` so parent transforms cannot trap it.
 */
export function FloatingTool({
  id,
  title,
  subtitle,
  collapsedLabel = title,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  collapsedLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const stored = readStored(id);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    stored.open ?? defaultOpen,
  );
  const isOpen = open ?? uncontrolledOpen;
  const panelRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<FloatingToolPosition>(
    () => stored.position ?? { x: 16, y: 96 },
  );
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
      writeStored(id, { open: next, position });
    },
    [id, onOpenChange, open, position],
  );

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const { width, height } = node.getBoundingClientRect();
    setPosition((current) => clamp(current, width, height));
  }, [isOpen]);

  useEffect(() => {
    const onResize = () => {
      const node = panelRef.current;
      if (!node) return;
      const { width, height } = node.getBoundingClientRect();
      setPosition((current) => clamp(current, width, height));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleDragStart = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      originX: event.clientX,
      originY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (
      !drag.moved &&
      (Math.abs(event.clientX - drag.originX) > DRAG_THRESHOLD ||
        Math.abs(event.clientY - drag.originY) > DRAG_THRESHOLD)
    ) {
      drag.moved = true;
    }
    const node = panelRef.current;
    const width = node?.offsetWidth ?? 80;
    const height = node?.offsetHeight ?? 36;
    setPosition(
      clamp(
        {
          x: event.clientX - drag.offsetX,
          y: event.clientY - drag.offsetY,
        },
        width,
        height,
      ),
    );
  };

  const handleDragEnd = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const moved = drag.moved;
    dragRef.current = null;
    const node = panelRef.current;
    const width = node?.offsetWidth ?? 80;
    const height = node?.offsetHeight ?? 36;
    setPosition((current) => {
      const next = clamp(current, width, height);
      writeStored(id, { open: isOpen, position: next });
      return next;
    });
    return moved;
  };

  if (typeof document === "undefined") return null;

  const panel = !isOpen ? (
    <button
      ref={(node) => {
        panelRef.current = node;
      }}
      type="button"
      className="cursor-grab rounded-full border border-white/10 bg-neutral-950/92 px-3 py-1.5 text-[12px] text-white/80 shadow-xl backdrop-blur-md hover:bg-neutral-900 active:cursor-grabbing"
      style={{ position: "fixed", left: position.x, top: position.y, zIndex: 80 }}
      onPointerDown={handleDragStart}
      onPointerMove={handleDragMove}
      onPointerUp={(event) => {
        const moved = handleDragEnd(event);
        if (!moved) setOpen(true);
      }}
      onPointerCancel={handleDragEnd}
    >
      {collapsedLabel}
    </button>
  ) : (
    <aside
      ref={(node) => {
        panelRef.current = node;
      }}
      className="w-[228px] rounded-[12px] border border-white/10 bg-neutral-950/92 text-white shadow-xl backdrop-blur-md"
      style={{ position: "fixed", left: position.x, top: position.y, zIndex: 80 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 rounded-t-[12px] border-b border-white/10 px-3 py-2 active:cursor-grabbing"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="text-[10px] leading-none text-white/35">
            ⋮⋮
          </span>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">
              {title}
            </p>
            {subtitle ? (
              <p className="font-mono text-[11px] text-white/75">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          aria-label={`Close ${title}`}
          className="cursor-pointer rounded-md px-1.5 py-0.5 text-[12px] text-white/50 hover:bg-white/10 hover:text-white"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpen(false)}
        >
          Done
        </button>
      </div>
      <div className="p-3">{children}</div>
    </aside>
  );

  return createPortal(panel, document.body);
}
