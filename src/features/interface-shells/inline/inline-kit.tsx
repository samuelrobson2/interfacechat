import { cn } from "@/shared/lib/css";
import type { ShellKind } from "../model/shell-types";
import { ShellGlyph } from "../ui/shell-icons";
import { InlineText } from "./inline-edit";
import { INLINE_META } from "./inline-styles";

/**
 * The parts inline designs share. Inline has no background or box: type,
 * hairlines and the content's own colours do the work, so it sits in a chat
 * reply like part of the message.
 */

/** Glyph, title and the one detail: how every inline interface opens. */
export function InlineHead({
  kind,
  title,
  detail,
  aside,
  onTitleChange,
  titlePlaceholder,
}: {
  kind: ShellKind;
  title: string;
  detail?: string;
  /** Shown at the end of the line (Pin, on hover). */
  aside?: React.ReactNode;
  /** The title can be edited where it stands. */
  onTitleChange?: (title: string) => void;
  titlePlaceholder?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <ShellGlyph kind={kind} className="size-4 shrink-0" />
      <InlineText
        value={title}
        onChange={onTitleChange}
        placeholder={titlePlaceholder}
        className="min-w-0 truncate font-bureau text-[15px] leading-[1.3] text-typography-primary"
      />
      {detail && <span className={cn(INLINE_META, "shrink-0")}>{detail}</span>}
      {aside && <span className="ml-auto flex shrink-0 items-center">{aside}</span>}
    </div>
  );
}

/** A soft pill: filters, tags, keywords. */
export function InlineChip({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn("inline-flex max-w-full items-center truncate rounded-full bg-gray-6 px-2 py-0.5 font-bureau text-[12px] text-typography-primary", className)}
      style={style}
    >
      {children}
    </span>
  );
}

/** "+3 more" under a list cut short. */
export function InlineMore({ count, noun }: { count: number; noun?: string }) {
  if (count <= 0) return null;
  return <span className={INLINE_META}>+{count} more{noun ? ` ${noun}` : ""}</span>;
}

/** A thin bar of how much is done. */
export function InlineProgress({ done, total }: { done: number; total: number }) {
  const share = total ? done / total : 0;
  return (
    <span aria-hidden className="block h-1 w-full overflow-hidden rounded-full bg-gray-6">
      <span className="block h-full rounded-full bg-green-5 transition-[width]" style={{ width: `${share * 100}%` }} />
    </span>
  );
}

/** A ring of how much is done, for the one-line small size. */
export function InlineRing({ done, total, className }: { done: number; total: number; className?: string }) {
  const r = 6;
  const c = 2 * Math.PI * r;
  const share = total ? done / total : 0;
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 shrink-0 -rotate-90", className)} aria-hidden>
      <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={2} />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="var(--color-green-5)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={`${share * c} ${c}`}
      />
    </svg>
  );
}

/** Grey bars standing in for content that isn't there yet. */
export function InlineGhostLines({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-2 py-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-2 rounded-full bg-gray-6" style={{ width: `${[92, 78, 64, 84][i % 4]}%` }} />
      ))}
    </div>
  );
}
