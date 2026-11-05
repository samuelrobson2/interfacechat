import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { AiStarsIcon } from "@/shared/assets/icons/general/AiStars";
import { ChatGradientFrame } from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { useProximityBorder } from "@/shared/lib/react/use-proximity-border";
import { Text } from "@/shared/ui/kit/text";

export function ChatSuggestionCard({
  suggestion,
  size = "m",
  icon,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  suggestion: string;
  size?: "m" | "s";
  /** Leading topic icon; defaults to a generic sparkle. */
  icon?: React.ReactNode;
}) {
  const isSmall = size === "s";
  const borderRef = useProximityBorder<HTMLButtonElement>({
    baseOpacity: 0.6,
    cornerRadius: 16,
  });

  // Small: compact single row (icon · text · arrow). Medium: taller card with
  // the icon on top and the arrow in the bottom corner.
  if (isSmall) {
    return (
      <ChatGradientFrame
        asChild
        overlay
        blurAmount={0}
        frameThickness={0}
        className={cn("min-h-[48px]", "shadow-none", className)}
      >
        <button
          ref={borderRef}
          type="button"
          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-left"
          title={suggestion}
          {...props}
        >
          <span className="shrink-0 text-icon-primary">
            {icon ?? <AiStarsIcon svgClasses="size-4" />}
          </span>
          <Text
            variant="caption"
            className="line-clamp-2 min-w-0 flex-1 wrap-break-word"
          >
            {suggestion}
          </Text>
          <ArrowUpIcon
            svgClasses="size-3 shrink-0"
            pathClasses="stroke-icon-primary"
          />
        </button>
      </ChatGradientFrame>
    );
  }

  return (
    <ChatGradientFrame
      asChild
      overlay
      blurAmount={0}
      frameThickness={0}
      className={cn("min-h-[100px]", "shadow-none", className)}
    >
      <button
        ref={borderRef}
        type="button"
        className={cn(
          "flex cursor-pointer flex-col justify-between gap-3 text-left px-3.5 py-3"
        )}
        title={suggestion}
        {...props}
      >
        <div className="flex flex-col gap-2">
          <span className="text-icon-primary">
            {icon ?? <AiStarsIcon svgClasses="size-5" />}
          </span>
          <Text
            className="self-start text-left whitespace-normal wrap-break-word overflow-hidden text-ellipsis line-clamp-3"
            variant="label"
          >
            {suggestion}
          </Text>
        </div>
        <div className="flex justify-end">
          <ArrowUpIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
        </div>
      </button>
    </ChatGradientFrame>
  );
}
