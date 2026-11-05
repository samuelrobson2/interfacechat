import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { SHELL_META } from "../model/shell-meta";
import type { ShellKind, ShellSize } from "../model/shell-types";
import { AddChip, SoftChip } from "./shell-fields";
import { ShellGlyph } from "./shell-icons";
import { ShellFooter } from "./shell-meta";
import { fieldEvents, isSubmitShortcut, stopFieldEvent } from "./shell-surface";

/** Medium: glyph and title on one line, the way every idle card opens. */
export function PreviewHead({
  kind,
  title,
  fallback,
}: {
  kind: ShellKind;
  title: string;
  fallback?: string;
}) {
  const has = Boolean(title.trim());
  return (
    <div className="flex shrink-0 items-center gap-1.5 px-2.5 pt-2">
      <ShellGlyph kind={kind} className="size-3.5" />
      <div
        className={cn(
          "min-w-0 flex-1 truncate font-bureau text-[12px] leading-[1.3]",
          has ? "font-normal text-typography-primary" : "font-light text-typography-secondary",
        )}
      >
        {has ? title : (fallback ?? SHELL_META[kind].label)}
      </div>
    </div>
  );
}

/** Medium: the body under the head. */
export function PreviewBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-2.5 mt-1.5 mb-2.5 flex min-h-0 flex-1 flex-col overflow-hidden", className)}>{children}</div>
  );
}

/** Medium plus and large: an editable title beside the glyph. */
export function ShellTitle({
  kind,
  size,
  value,
  placeholder,
  onChange,
  onSubmit,
  aside,
}: {
  kind: ShellKind;
  size: ShellSize;
  value: string;
  /** Blank, a title shows the interface's own name. */
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  aside?: React.ReactNode;
}) {
  const large = size === "large";
  placeholder ??= SHELL_META[kind].label;
  return (
    <div className={cn("flex shrink-0 items-center", large ? "gap-3 px-6 pt-5" : "gap-2 px-4 pt-3.5")}>
      <ShellGlyph kind={kind} className={large ? "size-7" : "size-4"} />
      {onChange ? (
        <input
          value={value}
          placeholder={placeholder}
          aria-label="Title"
          {...fieldEvents}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (isSubmitShortcut(event)) onSubmit?.();
          }}
          className={cn(
            "min-w-0 flex-1 bg-transparent font-bureau text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary",
            large ? "text-[22px]" : "text-[14px]",
          )}
        />
      ) : (
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-bureau",
            value ? "text-typography-primary" : "font-light text-typography-secondary",
            large ? "text-[22px]" : "text-[14px]",
          )}
        >
          {value || placeholder}
        </span>
      )}
      {aside}
    </div>
  );
}

/** Chips that can be removed, plus a dashed chip to add one. */
export function ChipList({
  items,
  onChange,
  addLabel,
  size,
  render,
}: {
  items: string[];
  onChange?: (items: string[]) => void;
  addLabel: string;
  size: ShellSize;
  render?: (item: string) => React.ReactNode;
}) {
  const chip = size === "large" ? "md" : "sm";
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <SoftChip
          key={item}
          size={chip}
          removeLabel={`Remove ${item}`}
          onRemove={onChange ? () => onChange(items.filter((other) => other !== item)) : undefined}
        >
          {render ? render(item) : item}
        </SoftChip>
      ))}
      {(onChange || items.length === 0) && (
        <AddChip
          size={chip}
          placeholder={addLabel}
          onSubmitValue={
            onChange
              ? (value) => {
                  if (!items.includes(value)) onChange([...items, value]);
                }
              : undefined
          }
        >
          {addLabel}
        </AddChip>
      )}
    </div>
  );
}

/** Medium plus and large: the scrolling area under the title. */
export function ShellBody({
  size,
  className,
  children,
}: {
  size: ShellSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto",
        size === "large" ? "gap-4 px-6 pt-4 pb-6" : "gap-3 px-4 pt-3 pb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The quiet count or detail in the bottom right of medium plus. */
export function ShellDetail({ children }: { children?: React.ReactNode }) {
  return <ShellFooter detail={children} className="mx-4 mb-3" />;
}



/** A quiet inline field that looks like text until focused. */
export function InlineInput({
  value,
  placeholder,
  label,
  onChange,
  className,
  size,
}: {
  value: string;
  placeholder: string;
  label: string;
  onChange?: (value: string) => void;
  className?: string;
  /** Width in characters; grows with the value. */
  size?: number;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      aria-label={label}
      readOnly={!onChange}
      size={size ? Math.max(size, value.length + 1) : undefined}
      {...fieldEvents}
      onKeyDown={stopFieldEvent}
      onChange={(event) => onChange?.(event.target.value)}
      className={cn(
        "min-w-0 rounded-[6px] bg-transparent font-bureau text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary focus:bg-gray-6",
        className,
      )}
    />
  );
}

/** − 3 days + */
export function Stepper({
  value,
  min = 1,
  max = 14,
  unit,
  label,
  size,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  unit: [string, string];
  label: string;
  size: ShellSize;
  onChange?: (value: number) => void;
}) {
  const large = size === "large";
  const button = (delta: number, text: string) => (
    <button
      type="button"
      aria-label={`${delta > 0 ? "More" : "Fewer"} ${unit[1]}`}
      disabled={!onChange || value + delta < min || value + delta > max}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onChange?.(value + delta);
      }}
      className="grid size-5 place-items-center rounded-full text-typography-secondary hover:bg-gray-3/20 hover:text-typography-primary disabled:opacity-30"
    >
      {text}
    </button>
  );
  return (
    <span
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gray-6 px-1 font-bureau text-typography-primary tabular-nums",
        large ? "h-8 text-[13px]" : "h-6 text-[11px]",
      )}
    >
      {onChange && button(-1, "−")}
      <span className="px-1">
        {value} {value === 1 ? unit[0] : unit[1]}
      </span>
      {onChange && button(1, "+")}
    </span>
  );
}

/** A labelled pill holding one small field: "Starts Thu 10 Dec". */
export function FieldPill({
  label,
  size,
  children,
}: {
  label: string;
  size: ShellSize;
  children: React.ReactNode;
}) {
  const large = size === "large";
  return (
    <label
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center gap-1.5 rounded-full bg-gray-6 font-bureau",
        large ? "h-8 px-3 text-[13px]" : "h-6 px-2 text-[11px]",
      )}
    >
      <span className="shrink-0 text-typography-secondary">{label}</span>
      {children}
    </label>
  );
}

/** A document mark: a page with a folded corner and a red PDF band. */
export function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 30" className={cn("shrink-0", className)} aria-hidden>
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0H16l8 8v19.5a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 2 27.5Z" fill="#fff" stroke="#d9d6d2" />
      <path d="M16 0v5.5A2.5 2.5 0 0 0 18.5 8H24" fill="#efede9" stroke="#d9d6d2" />
      <rect x="0" y="15" width="17" height="8" rx="2" fill="#e5484d" />
      <text x="8.5" y="21.2" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        PDF
      </text>
    </svg>
  );
}

/**
 * Scale a diagram drawn at its natural size down to fit the box it sits in,
 * centred, never up. Diagrams lay themselves out once and look the same at
 * every size.
 */
export function FitBox({
  width,
  height,
  fit = "both",
  className,
  children,
}: {
  width: number;
  height: number;
  /** "width": fill the width and let a tall diagram scroll, for large where text must stay readable. */
  fit?: "both" | "width";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const scale = fit === "width" ? (box.w ? Math.min(1, box.w / width) : 0) : box.w && box.h ? Math.min(1, box.w / width, box.h / height) : 0;
  if (fit === "width") {
    return (
      <div ref={ref} className={cn("no-scrollbar relative min-h-0 overflow-y-auto", className)}>
        <div className="relative mx-auto" style={{ width: width * scale, height: height * scale, opacity: scale ? 1 : 0 }}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} className={cn("relative min-h-0 overflow-hidden", className)}>
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: scale ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
