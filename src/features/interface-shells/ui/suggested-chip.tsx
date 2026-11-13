import { Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { fieldEvents, stopFieldEvent } from "./shell-surface";

/** The AI stroke, as an even 1px ring that never shifts layout. */
export function SuggestedRing({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("gradient-ring bg-gradient-ai-stroke pointer-events-none absolute inset-0 rounded-[inherit] p-px", className)}
    />
  );
}

/**
 * A value the model suggests, sitting among the real ones: the same chip,
 * with the AI outline and a plus. Click to add it; × to dismiss it.
 */
export function SuggestedChip({
  label,
  size = "md",
  onAccept,
  onDismiss,
  className,
}: {
  label: string;
  size?: "sm" | "md";
  onAccept?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group/suggested relative inline-flex shrink-0 items-center rounded-full bg-white font-bureau whitespace-nowrap text-typography-secondary transition-colors hover:text-typography-primary",
        size === "sm" ? "h-6 text-[11px]" : "h-7 text-[13px]",
        className,
      )}
    >
      <SuggestedRing />
      <button
        type="button"
        title={`Suggested: add ${label}`}
        aria-label={`Add suggested ${label}`}
        disabled={!onAccept}
        {...fieldEvents}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          stopFieldEvent(event);
          onAccept?.();
        }}
        className={cn("flex h-full items-center gap-1", size === "sm" ? "pl-1.5" : "pl-2", onDismiss ? "pr-0.5" : size === "sm" ? "pr-2" : "pr-2.5")}
      >
        <Plus className={size === "sm" ? "size-3" : "size-3.5"} />
        {label}
      </button>
      {onDismiss && (
        <button
          type="button"
          aria-label={`Dismiss suggested ${label}`}
          title="Dismiss"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            onDismiss();
          }}
          className={cn(
            "grid place-items-center rounded-full text-typography-secondary opacity-0 transition-opacity group-hover/suggested:opacity-100 hover:text-typography-primary focus-visible:opacity-100",
            size === "sm" ? "mr-1 size-4" : "mr-1.5 size-4",
          )}
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

/** The suggested values not already present, ignoring case. */
export function unusedSuggestions(values: string[] | undefined, present: string[]) {
  const have = new Set(present.map((value) => value.trim().toLowerCase()));
  return (values ?? []).filter((value) => value.trim() && !have.has(value.trim().toLowerCase()));
}
