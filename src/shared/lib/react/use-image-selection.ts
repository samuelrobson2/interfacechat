import * as React from "react";

export type ImageBbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UseImageSelectionOptions = {
  enabled: boolean;
  // Allow consumers (like a lightbox) to share their own image element ref.
  // When omitted, the hook creates and returns its own ref.
  externalImageRef?: React.RefObject<HTMLImageElement | null>;
};

export type UseImageSelectionReturn = {
  imageRef: React.RefObject<HTMLImageElement | null>;
  selectionBbox: ImageBbox | null;
  selectionPreviewBbox: ImageBbox | null;
  isSelecting: boolean;
  beginSelection: (e: React.MouseEvent) => void;
  updateSelection: (e: React.MouseEvent) => void;
  commitSelection: (e: React.MouseEvent) => void;
  reset: () => void;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const getBboxFromPoints = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): ImageBbox | null => {
  const x0 = Math.min(a.x, b.x);
  const y0 = Math.min(a.y, b.y);
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const width = x1 - x0;
  const height = y1 - y0;
  if (width <= 0 || height <= 0) return null;
  return { x: x0, y: y0, width, height };
};

export const useImageSelection = ({
  enabled,
  externalImageRef,
}: UseImageSelectionOptions): UseImageSelectionReturn => {
  const internalImageRef = React.useRef<HTMLImageElement | null>(null);
  const imageRef = externalImageRef ?? internalImageRef;

  const [isSelecting, setIsSelecting] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragCurrent, setDragCurrent] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionBbox, setSelectionBbox] = React.useState<ImageBbox | null>(
    null,
  );

  const toRelativePoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = imageRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const x = clamp01((clientX - rect.left) / rect.width);
      const y = clamp01((clientY - rect.top) / rect.height);
      return { x, y };
    },
    [imageRef],
  );

  const reset = React.useCallback(() => {
    setIsSelecting(false);
    setDragStart(null);
    setDragCurrent(null);
    setSelectionBbox(null);
  }, []);

  // Reset selection state when disabled
  React.useEffect(() => {
    if (enabled) return;
    reset();
  }, [enabled, reset]);

  const beginSelection = React.useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const p = toRelativePoint(e.clientX, e.clientY);
      if (!p) return;
      setIsSelecting(true);
      setDragStart(p);
      setDragCurrent(p);
    },
    [enabled, toRelativePoint],
  );

  const updateSelection = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting) return;
      e.preventDefault();
      e.stopPropagation();
      const p = toRelativePoint(e.clientX, e.clientY);
      if (!p) return;
      setDragCurrent(p);
    },
    [isSelecting, toRelativePoint],
  );

  const finalizeSelection = React.useCallback(
    (endPoint?: { x: number; y: number } | null) => {
      const start = dragStart;
      const end = endPoint ?? dragCurrent;
      if (!start || !end) {
        setIsSelecting(false);
        setDragStart(null);
        setDragCurrent(null);
        return;
      }

      const bbox = getBboxFromPoints(start, end);
      if (!bbox) {
        setSelectionBbox(null);
        setIsSelecting(false);
        setDragStart(null);
        setDragCurrent(null);
        return;
      }

      setSelectionBbox(bbox);
      setIsSelecting(false);
      setDragStart(null);
      setDragCurrent(null);
    },
    [dragStart, dragCurrent],
  );

  const commitSelection = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting) return;
      e.preventDefault();
      e.stopPropagation();
      finalizeSelection();
    },
    [isSelecting, finalizeSelection],
  );

  // Track drag past the source element using window listeners
  React.useEffect(() => {
    if (!isSelecting) return;

    const handleWindowMouseMove = (event: MouseEvent) => {
      const p = toRelativePoint(event.clientX, event.clientY);
      if (!p) return;
      setDragCurrent(p);
    };

    const handleWindowMouseUp = (event: MouseEvent) => {
      const p = toRelativePoint(event.clientX, event.clientY);
      finalizeSelection(p);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isSelecting, finalizeSelection, toRelativePoint]);

  const selectionPreviewBbox = React.useMemo(() => {
    if (!isSelecting || !dragStart || !dragCurrent) return null;
    return getBboxFromPoints(dragStart, dragCurrent);
  }, [isSelecting, dragStart, dragCurrent]);

  return {
    imageRef,
    selectionBbox,
    selectionPreviewBbox,
    isSelecting,
    beginSelection,
    updateSelection,
    commitSelection,
    reset,
  };
};
