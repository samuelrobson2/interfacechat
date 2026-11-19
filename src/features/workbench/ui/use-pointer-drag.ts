import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Movement before a press becomes a drag. Anything less is a click. */
export const DRAG_THRESHOLD = 6;

export type DragPoint = { x: number; y: number };

type DragHandlers = {
  onStart?: (point: DragPoint) => void;
  onMove: (point: DragPoint) => void;
  onEnd: (point: DragPoint) => void;
  onCancel?: () => void;
};

/**
 * While dragging (a window, or the bar between them), nothing on the page is
 * selected: the text the pointer passes over would otherwise highlight, and
 * the highlight-to-edit tool would offer itself.
 */
function holdSelection() {
  window.getSelection()?.removeAllRanges();
  const root = document.documentElement.style;
  const before = { userSelect: root.userSelect, webkitUserSelect: root.webkitUserSelect };
  root.userSelect = "none";
  root.webkitUserSelect = "none";
  return () => {
    root.userSelect = before.userSelect;
    root.webkitUserSelect = before.webkitUserSelect;
  };
}

/** Fields keep their own pointer behaviour: selecting text never drags a frame. */
function startsInField(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest("input, textarea, select, [contenteditable='true'], [data-no-drag]")
  );
}

/**
 * Click or drag from one press. Past the threshold it's a drag, and the click
 * that follows is swallowed, so dropping an icon never also opens it.
 * Spread `onPointerDown` and `onClickCapture` on the handle.
 */
export function usePointerDrag(handlers: DragHandlers) {
  const handlersRef = useRef(handlers);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });
  const suppressClick = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0 || startsInField(event.target)) return;
    const origin = { x: event.clientX, y: event.clientY };
    let dragging = false;
    let releaseSelection: (() => void) | null = null;
    suppressClick.current = false;

    const move = (moveEvent: PointerEvent) => {
      const point = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!dragging) {
        if (Math.hypot(point.x - origin.x, point.y - origin.y) < DRAG_THRESHOLD) return;
        dragging = true;
        suppressClick.current = true;
        releaseSelection = holdSelection();
        handlersRef.current.onStart?.(origin);
      }
      moveEvent.preventDefault();
      handlersRef.current.onMove(point);
    };
    const finish = (endEvent: PointerEvent, cancelled: boolean) => {
      cleanup.current?.();
      if (!dragging) return;
      if (cancelled) handlersRef.current.onCancel?.();
      else handlersRef.current.onEnd({ x: endEvent.clientX, y: endEvent.clientY });
      // Some browsers send no click after a drag; don't swallow the next real one.
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };
    const up = (upEvent: PointerEvent) => finish(upEvent, false);
    const cancel = (cancelEvent: PointerEvent) => finish(cancelEvent, true);
    const key = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Escape" || !dragging) return;
      cleanup.current?.();
      handlersRef.current.onCancel?.();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", key);
    cleanup.current = () => {
      releaseSelection?.();
      releaseSelection = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", key);
      cleanup.current = null;
    };
  }, []);

  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return { onPointerDown, onClickCapture };
}
