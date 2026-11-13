import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Minus } from "lucide-react";
import { useMorphSpring } from "./use-morph-spring";
import "./live-activity.css";

export type ActivityView = "icon" | "activity" | "expanded";

export type LiveStatus = {
  state: "working" | "complete" | "needs-input" | "error";
  message: string;
  detail?: string;
  service?: { name: string };
};

const STATE_LABEL = {
  working: "Working",
  "needs-input": "Needs you",
  complete: "Complete",
  error: "Blocked",
} as const;

/**
 * The three sizes from the live-activity example: icon, activity, and expanded.
 * Light, so it sits on the page. The icon stays anchored while the surface grows.
 */
export function ChatLiveActivity({
  title,
  icon,
  status,
  preview,
  onOpenChat,
  plated = false,
  onViewChange,
}: {
  title: string;
  icon: ReactNode;
  status: LiveStatus;
  preview: ReactNode;
  onOpenChat: () => void;
  /** White circle and suggestion shimmer, for icons sitting in the stack. */
  plated?: boolean;
  onViewChange?: (view: ActivityView) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const iconLayer = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const bodyId = useId();
  const [localView, setLocalView] = useState<ActivityView>("icon");
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState(328);
  const view = localView === "icon" && hovered ? "activity" : localView;
  const open = view === "expanded";

  const setView = useCallback((next: ActivityView, focus = false) => {
    setHovered(false);
    setLocalView(next);
    if (focus) trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!root.current) return;
      const available =
        window.innerWidth - root.current.getBoundingClientRect().left - 16;
      setWidth(Math.max(44, Math.min(328, available)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setView("icon");
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, setView]);

  const shape =
    view === "icon"
      ? { width: 44, height: 44, radius: 22, iconY: 14 }
      : view === "activity"
        ? { width: Math.min(236, width), height: 52, radius: 26, iconY: 18 }
        : { width, height: 236, radius: 24, iconY: 18 };

  // Always calls the latest `onViewChange`, but only fires when `view` changes.
  const emitViewChange = useEffectEvent((next: ActivityView) => {
    onViewChange?.(next);
  });
  useEffect(() => {
    emitViewChange(view);
  }, [view]);

  // The first-render pose seeds the surface's inline style; the spring takes
  // over imperatively from there, so this is captured once and never updated.
  const [initialShape] = useState(shape);
  const initialScaleX = initialShape.width / 328;
  const initialScaleY = initialShape.height / 236;
  useMorphSpring(surface, iconLayer, root, shape);

  return (
    <div
      ref={root}
      className="la-root"
      data-view={view}
      data-plated={plated ? "true" : undefined}
      data-state={status?.state ?? "complete"}
      style={{ "--la-expanded-width": `${width}px` } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "Escape" && view !== "icon") {
          event.preventDefault();
          setView("icon", true);
        }
      }}
    >
      <div
        className="la-surface"
        ref={surface}
        aria-hidden
        style={{
          transform: `scale(${initialScaleX}, ${initialScaleY})`,
          borderRadius: `${initialShape.radius / initialScaleX}px / ${initialShape.radius / initialScaleY}px`,
        }}
      />
      {plated && (
        <span className="la-plate" aria-hidden>
          <span className="la-plate-ring" />
        </span>
      )}
      <button
        className="la-trigger"
        ref={trigger}
        type="button"
        style={{
          width: open ? width - 44 : shape.width,
          height: view === "icon" ? 44 : 52,
        }}
        aria-label={`${title}. ${status?.message ?? ""}. ${open ? "Collapse activity" : "Expand activity"}`}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setView(open ? "icon" : "expanded")}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && localView === "icon") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <span
          ref={iconLayer}
          className="la-task-icon"
          aria-hidden
        >
          {icon}
        </span>
        <span className="la-header-copy">
          <span className="la-title">{title}</span>
          <span className="la-subtitle">{status.message}</span>
        </span>
        {status?.state === "working" && <span className="la-icon-dot" aria-hidden />}
      </button>
      {open && (
        <button
          className="la-close"
          type="button"
          aria-label="Minimise to icon"
          onClick={() => setView("icon", true)}
        >
          <Minus aria-hidden />
        </button>
      )}
      <div className="la-body" id={bodyId} inert={!open} aria-hidden={!open}>
        <div className="la-preview">{preview}</div>
        <div className="la-status" role="status">
          <div className="la-state">
            <span className="la-state-dot" aria-hidden />
            {STATE_LABEL[status.state]}
          </div>
          <div className="la-current">
            <span>{status.message}</span>
            {status.service && (
              <span className="la-service">
                <span>{status.service.name}</span>
              </span>
            )}
          </div>
          {status.detail && <div className="la-detail">{status.detail}</div>}
        </div>
      </div>
      <div className="la-footer" inert={!open} aria-hidden={!open}>
        <button
          className="la-open-chat"
          type="button"
          aria-label="Open chat"
          onClick={() => {
            setView("icon");
            onOpenChat();
          }}
        >
          <ArrowUpRight aria-hidden />
        </button>
      </div>
    </div>
  );
}
