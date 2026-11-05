import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { ChatSurfaceFrame } from "./chat-surface-frame";

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
  size = "m",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  suggestion: string;
  label?: string;
  /** Slot rendered between the suggestion text and the arrow row (e.g. a source badge). */
  footer?: React.ReactNode;
  fullDescription?: boolean;
  size?: "m" | "s";
}) {
  const isSmall = size === "s";

  return (
    <ChatSurfaceFrame
      asChild
      gradientStroke="always"
      className={cn(
        "min-w-0 hover:shadow-elevated-hover",
        isSmall ? "min-h-[66px]" : "min-h-[82px] md:min-h-[100px]",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex min-w-0 cursor-pointer flex-col justify-between gap-2 px-3 py-[9px] text-left",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        title={suggestion}
        {...props}
      >
        <div className="flex min-w-0 w-full flex-col gap-1">
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
              !fullDescription && (isSmall ? "line-clamp-2" : "line-clamp-3"),
            )}
            variant={isSmall ? "caption" : "label"}
          >
            {suggestion}
          </Text>
        </div>
        {footer ? <div className="min-w-0 w-full">{footer}</div> : null}
        <div className="flex justify-end">
          <ArrowUpIcon
            svgClasses={isSmall ? "size-3" : "size-4"}
            pathClasses="stroke-icon-primary"
          />
        </div>
      </button>
    </ChatSurfaceFrame>
  );
}
