import { cn } from "@/shared/lib/css";

/** The bottom line of a medium-plus shell: the interface's key detail (length, rows) on the right. */
export function ShellFooter({
  detail,
  compact,
  className,
}: {
  detail?: React.ReactNode;
  /** Medium cards: nothing. */
  compact?: boolean;
  className?: string;
}) {
  if (compact || !detail) return null;
  return (
    <div className={cn("flex h-5 shrink-0 items-center justify-end gap-2", className)}>
      <span className="flex shrink-0 items-center gap-1 font-bureau text-[11px] text-typography-secondary tabular-nums">
        {detail}
      </span>
    </div>
  );
}
