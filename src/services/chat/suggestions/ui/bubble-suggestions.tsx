import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import { ChatSuggestionCard } from "../../_ui/chat-suggestion-card";
import { useComposerExpandStore } from "../../composer/model/use-composer-expand";
import { composerLayout } from "../../composer/model/composer-motion";
import type { SuggestionItem, SuggestionsVariant } from "../lib/suggestions-cache";

export type BubbleSuggestionsVariant = SuggestionsVariant | "carousel" | "lifted";

// Mobile carousel matches the new-chat starter suggestions: horizontal swipe with snap.
// It clips overflow, so `pb-2` keeps the card shadows visible.
const carouselContainerClassName =
  "flex w-full gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const carouselItemClassName = "w-[156px] shrink-0 snap-start";

export function ChatBubbleSuggestionsSkeleton({
  variant = "row",
}: {
  variant?: BubbleSuggestionsVariant;
}) {
  if (variant === "carousel") {
    return (
      <div className={cn("pointer-events-none", carouselContainerClassName)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-[100px] rounded-[16px]", carouselItemClassName)}
          />
        ))}
      </div>
    );
  }

  if (variant === "column") {
    return (
      <div className="pointer-events-none flex w-[204px] shrink-0 flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[66px] rounded-[16px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="pointer-events-none flex h-full w-full items-stretch gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-full min-w-0 flex-1 rounded-[16px]" />
      ))}
    </div>
  );
}

/**
 * The suggestion rail that sits beside the compact card, then lifts above
 * the composer as a shorter row that fills the bar width. Presentational:
 * where the suggestions come from and what applying one does is the caller's.
 */
export function ChatBubbleSuggestions({
  suggestions,
  onApply,
  variant = "row",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  suggestions: readonly SuggestionItem[];
  onApply: (suggestion: SuggestionItem) => void;
  variant?: BubbleSuggestionsVariant;
}) {
  const progress = useComposerExpandStore((state) => state.progress);
  const { cardHeight } = composerLayout(progress);
  const isSmall = progress > 0.5;

  if (!suggestions.length) return null;

  if (variant === "carousel") {
    return (
      <div
        {...props}
        className={cn(
          "pointer-events-auto",
          carouselContainerClassName,
          className,
        )}
      >
        {suggestions.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.id}
            className={carouselItemClassName}
            size="m"
            suggestion={suggestion.text}
            onClick={() => onApply(suggestion)}
          />
        ))}
      </div>
    );
  }

  const isColumn = variant === "column";

  return (
    <div
      className={cn(
        "pointer-events-auto flex",
        isColumn
          ? "w-[204px] shrink-0 flex-col gap-2"
          : "h-full w-full items-stretch gap-4",
        className,
      )}
      {...props}
    >
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={cn(
            "rounded-[16px]",
            isColumn ? "w-full" : "min-w-0 flex-1",
          )}
          style={
            isColumn
              ? undefined
              : { height: cardHeight, minHeight: cardHeight, maxHeight: cardHeight }
          }
        >
          <ChatSuggestionCard
            className="h-full w-full min-h-0 md:min-h-0"
            size={isColumn || isSmall ? "s" : "m"}
            suggestion={suggestion.text}
            onClick={() => onApply(suggestion)}
          />
        </div>
      ))}
    </div>
  );
}
