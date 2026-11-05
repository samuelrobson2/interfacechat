import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { SurfaceFrame } from "@/shared/ui/surface-frame";

export function ChatSuggestionsSection({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("flex w-full flex-col gap-3", className)} {...props}>
      {children}
    </section>
  );
}

export function ChatSuggestionCard({
  suggestion,
  label,
  footer,
  fullDescription = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  suggestion: string;
  label?: string;
  /** Slot rendered between the suggestion text and the arrow row (e.g. a source badge). */
  footer?: React.ReactNode;
  fullDescription?: boolean;
}) {
  return (
    <SurfaceFrame
      asChild
      gradientStroke="always"
      className={cn(
        "min-h-20.5 min-w-0 hover:shadow-elevated-hover md:min-h-25",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex min-w-0 cursor-pointer flex-col gap-2 px-3 py-2.5 text-left",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        title={suggestion}
        {...props}
      >
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-1 overflow-hidden">
          {label && (
            <Text
              className="self-start text-left"
              variant="label"
              color="secondary"
            >
              {label}
            </Text>
          )}
          <Text
            className={cn(
              "w-full min-w-0 text-left wrap-anywhere overflow-hidden",
              !fullDescription && "line-clamp-3",
            )}
            variant="label"
          >
            {suggestion}
          </Text>
        </div>
        {footer ? <div className="min-w-0 w-full">{footer}</div> : null}
        <ArrowUpIcon
          svgClasses="pointer-events-none size-4 shrink-0 self-end"
          pathClasses="stroke-icon-primary"
        />
      </button>
    </SurfaceFrame>
  );
}
