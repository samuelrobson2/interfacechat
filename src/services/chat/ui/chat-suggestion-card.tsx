import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { ChatGradientFrame } from "./chat-gradient-frame";

export function ChatSuggestionCard({
  suggestion,
  label,
  sublabel,
  fullDescription = false,
  size = "m",
  variant = "gradient",
  showArrow = true,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  suggestion: string;
  label?: string;
  /** A secondary line under the suggestion — the mirror of `label`, which sits
   *  above. Use this when the suggestion itself is the headline (primary,
   *  prominent) and this is the explanatory line underneath it (secondary). */
  sublabel?: string;
  /** Show the whole suggestion instead of clamping it to 2–3 lines. */
  fullDescription?: boolean;
  size?: "m" | "s";
  /** "gradient" (default) is the thick blurred-glow gradient ring used for
   *  exploratory prompts. "plain" is a gray-1 card with a hairline gradient
   *  ring and a plain elevation shadow, used for the "For you" row. */
  variant?: "gradient" | "plain";
  /** The send-arrow in the bottom-right corner. Off for cards that aren't
   *  prompts to send verbatim — an offer to take an action instead. */
  showArrow?: boolean;
}) {
  const isSmall = size === "s";

  const content = (
    <>
      <div className="flex flex-col gap-1 self-stretch">
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
            "self-start text-left whitespace-normal wrap-break-word overflow-hidden text-ellipsis",
            !fullDescription &&
              !label &&
              (isSmall ? "line-clamp-2" : "line-clamp-3"),
          )}
          variant={isSmall ? "caption" : "label"}
        >
          {suggestion}
        </Text>
        {sublabel && (
          <Text
            className="self-start text-left leading-snug"
            variant={isSmall ? "caption" : "label"}
            color="secondary"
          >
            {sublabel}
          </Text>
        )}
      </div>
      {showArrow && (
        <div className="flex justify-end">
          <ArrowUpIcon
            svgClasses={isSmall ? "size-3" : "size-4"}
            pathClasses="stroke-icon-primary"
          />
        </div>
      )}
    </>
  );

  if (variant === "plain") {
    return (
      <button
        type="button"
        className={cn(
          "relative isolate flex cursor-pointer flex-col justify-between gap-2 rounded-[16px] bg-gray-1 px-3 py-2.5 text-left shadow-[0_4px_6px_rgba(26,23,24,0.15)]",
          isSmall ? "min-h-[66px]" : "min-h-[82px] md:min-h-[100px]",
          className,
        )}
        title={suggestion}
        {...props}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-gradient-ai-frame p-px gradient-ring"
        />
        {content}
      </button>
    );
  }

  return (
    <ChatGradientFrame
      asChild
      overlay
      blurAmount={2}
      className={cn(
        isSmall ? "min-h-[66px]" : "min-h-[82px] md:min-h-[100px]",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex cursor-pointer flex-col justify-between gap-2 text-left px-3 py-2.5",
        )}
        title={suggestion}
        {...props}
      >
        {content}
      </button>
    </ChatGradientFrame>
  );
}
