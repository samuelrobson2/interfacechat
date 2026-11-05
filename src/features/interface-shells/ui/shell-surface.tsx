import { useLayoutEffect, useRef } from "react";
import { cn } from "@/shared/lib/css";
import type { ShellSize } from "../model/shell-types";

const SURFACE: Record<ShellSize, string> = {
  small: "rounded-[15px] shadow-[0_1px_3px_rgba(26,23,24,0.18)]",
  medium: "rounded-[18px] shadow-[0_2px_10px_rgba(26,23,24,0.08)]",
  "medium-plus": "rounded-[20px] shadow-[0_8px_28px_rgba(26,23,24,0.14)]",
  large: cn(
    "rounded-[20px] shadow-elevated",
    "hairline [--hairline-radius:20px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.35]",
  ),
};

/** The one surface every shell sits on, so sizes read as the same object. */
export function ShellSurface({
  size,
  surface = true,
  className,
  children,
}: {
  size: ShellSize;
  surface?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex size-full min-h-0 flex-col overflow-hidden font-bureau",
        surface && ["bg-background-primary", SURFACE[size]],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Keeps pointer and key events inside a field from reaching a clickable card. */
export function stopFieldEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export const fieldEvents = {
  onClick: stopFieldEvent,
  onPointerDown: stopFieldEvent,
};

export function isSubmitShortcut(event: React.KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key === "Enter";
}

/** A textarea that grows with its content instead of scrolling. */
export function AutoTextarea({
  value,
  className,
  textareaRef,
  ...props
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
  value: string;
  textareaRef?: (node: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  // Re-fit when the width changes (a shell morphing between sizes rewraps).
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    let width = node.clientWidth;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === width) return;
      width = node.clientWidth;
      node.style.height = "0px";
      node.style.height = `${node.scrollHeight}px`;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <textarea
      ref={(node) => {
        ref.current = node;
        textareaRef?.(node);
      }}
      rows={1}
      value={value}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent p-0 outline-none",
        className,
      )}
      {...props}
    />
  );
}

/** Placeholder ink for content that hasn't arrived yet. */
export function Bar({
  width,
  className,
  style,
}: {
  width: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={cn("block h-1 shrink-0 rounded-full bg-gray-3/20", className)}
      style={{ width: typeof width === "number" ? `${width}%` : width, ...style }}
    />
  );
}

/** Varied but stable bar widths from a piece of text, so previews track content. */
export function barWidths(text: string, lines: number, base = 92) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Array.from({ length: lines }, (_, i) => {
    const jitter = Math.abs((hash >> (i * 3)) % 22);
    const last = i === lines - 1 && lines > 1;
    return last ? 38 + (jitter % 24) : base - jitter;
  });
}
