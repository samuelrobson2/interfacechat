import { ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/lib/css";
import type { ShellData, ShellDataByKind, ShellKind } from "../model/shell-types";
import { ShellGlyph } from "../ui/shell-icons";
import { InlineRing } from "./inline-kit";
import { inlineDetail, inlineTitle, progressOf } from "./inline-summary";
import { INLINE_META } from "./inline-styles";

/**
 * Inline small: one line in a reply. The glyph, the title and the detail
 * that matters, with a ring of progress or a few colours where the interface
 * has them. It points at work that lives elsewhere: an interface open in its
 * own window, or one the reply only mentions.
 */
export function InlineSmall({
  kind,
  data,
  ordinal,
  action,
  onClick,
  className,
}: {
  kind: ShellKind;
  data: ShellData;
  /** Which one, when several of its kind are open. */
  ordinal?: number;
  /** What clicking does, shown on hover ("Open in Tracker"). */
  action?: string;
  onClick?: () => void;
  className?: string;
}) {
  const title = inlineTitle(kind, data);
  const detail = inlineDetail(kind, data);
  const progress = progressOf(kind, data);
  const palette = kind === "moodboard" ? (data as ShellDataByKind["moodboard"]).palette.slice(0, 3) : [];

  const body = (
    <>
      <span className="relative shrink-0">
        <ShellGlyph kind={kind} className="size-5" />
        {ordinal && (
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-4 px-1 font-bureau text-[9px] leading-none font-medium text-white ring-2 ring-background-primary">
            {ordinal}
          </span>
        )}
      </span>
      <span className="min-w-0 truncate font-bureau text-[14px] text-typography-primary">{title}</span>
      {progress && <InlineRing done={progress.done} total={progress.total} className="text-typography-primary" />}
      {palette.length > 0 && (
        <span aria-hidden className="flex shrink-0 -space-x-1">
          {palette.map((colour) => (
            <span key={colour} className="size-3.5 rounded-full ring-2 ring-background-primary" style={{ backgroundColor: colour }} />
          ))}
        </span>
      )}
      <span className={cn(INLINE_META, "min-w-0 shrink truncate")}>{detail}</span>
      {action && (
        <span className={cn(INLINE_META, "ml-auto flex shrink-0 items-center gap-1 pl-2 opacity-0 transition-opacity group-hover/small:opacity-100 group-focus-visible/small:opacity-100")}>
          {action}
          <ArrowUpRight className="size-3.5" />
        </span>
      )}
    </>
  );

  const classes = cn(
    "group/small flex h-10 w-full min-w-0 items-center gap-2.5 rounded-[12px] px-2.5 text-left",
    onClick && "cursor-pointer transition-colors hover:bg-gray-6/70",
    className,
  );

  return onClick ? (
    <button type="button" onClick={onClick} aria-label={`${title}. ${action ?? "Open"}`} className={classes}>
      {body}
    </button>
  ) : (
    <div className={classes}>{body}</div>
  );
}
