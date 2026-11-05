import { LightbulbIcon } from "@/shared/assets/icons/outlined/Lightbulb";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { Text } from "@/shared/ui/kit/text";

import { ChatSuggestionCard } from "../../_ui/chat-suggestion-card";
import {
  COMPOSER_MOTION_MS,
  FOLD_TARGET_X,
  FOLD_TARGET_Y,
  SUGGESTION_CARD_GAP,
  SUGGESTION_CARD_HEIGHT,
  SUGGESTION_CARD_WIDTH,
  SUGGESTION_PILL_SIZE,
  VISIBLE_SUGGESTION_COUNT,
} from "../../_lib/composer-metrics";
import type {
  SuggestionItem,
  SuggestionsVariant,
} from "../lib/suggestions-cache";

/**
 * - `row` — cards spread across the collapsed bar.
 * - `column` — cards folded away into the pill while the field is expanded.
 * - `pill` — the compact button the cards fold into.
 * - `carousel` — mobile.
 */
export type BubbleSuggestionsVariant =
  | SuggestionsVariant
  | "carousel"
  | "pill";

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
        {Array.from({ length: VISIBLE_SUGGESTION_COUNT }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-[100px] rounded-[16px]", carouselItemClassName)}
          />
        ))}
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <Skeleton
        className="rounded-[8px]"
        style={{ width: SUGGESTION_PILL_SIZE, height: SUGGESTION_PILL_SIZE }}
      />
    );
  }

  // Folded away, the cards are invisible anyway, so there is nothing to stand in for.
  if (variant === "column") return null;

  return (
    <div className="pointer-events-none relative h-full">
      {Array.from({ length: VISIBLE_SUGGESTION_COUNT }).map((_, i) => (
        <Skeleton
          key={i}
          className="absolute bottom-0 left-0 rounded-[16px]"
          style={{
            width: SUGGESTION_CARD_WIDTH,
            height: SUGGESTION_CARD_HEIGHT,
            ...getCardOffset(i, variant),
          }}
        />
      ))}
    </div>
  );
}

/**
 * The suggestion rail that sits beside (or above) the composer. Presentational:
 * where the suggestions come from and what applying one does is the caller's.
 */
export function ChatBubbleSuggestions({
  suggestions,
  onApply,
  variant = "row",
  disabled = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  suggestions: readonly SuggestionItem[];
  onApply?: (suggestion: SuggestionItem) => void;
  variant?: BubbleSuggestionsVariant;
  disabled?: boolean;
}) {
  if (!suggestions.length) return null;

  if (variant === "pill") {
    return (
      <ChatSuggestionsPill count={suggestions.length} className={className} />
    );
  }

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
            suggestion={suggestion.text}
            disabled={disabled}
            onClick={() => onApply?.(suggestion)}
          />
        ))}
      </div>
    );
  }

  const isFolded = variant === "column";

  return (
    <div
      {...props}
      className={cn("pointer-events-none relative h-full", className)}
    >
      {suggestions.map((suggestion, index) => (
        <ChatSuggestionCard
          key={suggestion.id}
          suggestion={suggestion.text}
          disabled={disabled}
          onClick={() => onApply?.(suggestion)}
          aria-hidden={isFolded}
          tabIndex={isFolded ? -1 : undefined}
          className={cn(
            "absolute bottom-0 left-0 origin-center",
            "ease-out motion-reduce:transition-none",
            isFolded ? "pointer-events-none" : "pointer-events-auto",
          )}
          style={{
            width: SUGGESTION_CARD_WIDTH,
            height: SUGGESTION_CARD_HEIGHT,
            zIndex: suggestions.length - index,
            transitionProperty: "transform, opacity",
            ...getCardOffset(index, variant),
          }}
        />
      ))}
    </div>
  );
}

// The fade only covers the last stretch of the fold, so the card is still
// visibly travelling and shrinking — it just isn't a readable thumbnail by the
// time it reaches the button.
const FOLD_FADE_MS = 90;

/**
 * Cards keep a fixed footprint and only transform. Folding drives them into
 * the button at FOLD_TARGET, shrinking past it to nothing so they disappear on
 * arrival; expanding plays the same thing in reverse.
 */
function getCardOffset(
  index: number,
  variant: Exclude<BubbleSuggestionsVariant, "carousel" | "pill">,
): React.CSSProperties {
  if (variant === "column") {
    return {
      transform: [
        `translate(${FOLD_TARGET_X - SUGGESTION_CARD_WIDTH / 2}px, ${FOLD_TARGET_Y + SUGGESTION_CARD_HEIGHT / 2}px)`,
        `scale(${SUGGESTION_PILL_SIZE / SUGGESTION_CARD_WIDTH})`,
      ].join(" "),
      opacity: 0,
      transitionDuration: `${COMPOSER_MOTION_MS}ms, ${FOLD_FADE_MS}ms`,
      transitionDelay: `0ms, ${COMPOSER_MOTION_MS - FOLD_FADE_MS}ms`,
    };
  }

  return {
    transform: `translate(${index * (SUGGESTION_CARD_WIDTH + SUGGESTION_CARD_GAP)}px, 0) scale(1)`,
    opacity: 1,
    transitionDuration: `${COMPOSER_MOTION_MS}ms, ${FOLD_FADE_MS}ms`,
    transitionDelay: "0ms, 0ms",
  };
}

/**
 * The button the cards fold into: a lightbulb with a notification-style count.
 * Hover only explains the control — click returns to the card row. Without a
 * count it stands in for suggestions that don't exist yet.
 */
export function ChatSuggestionsPill({
  count,
  className,
  ...props
}: React.ComponentProps<"button"> & { count?: number }) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Show suggestions"
          data-suggestions-pill=""
          className={cn(
            "relative grid cursor-pointer place-items-center rounded-[8px]",
            "transition-colors duration-150 ease-out hover:bg-gray-6",
            "active:scale-[0.97]",
            "disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          style={{
            width: SUGGESTION_PILL_SIZE,
            height: SUGGESTION_PILL_SIZE,
          }}
          {...props}
        >
          <LightbulbIcon
            svgClasses="size-4"
            pathClasses="stroke-icon-primary"
          />
          {count ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-gray-5 text-[10px] leading-none font-medium text-typography-inverse">
              {count}
            </span>
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <Text variant="caption">Show suggestions</Text>
      </TooltipContent>
    </Tooltip>
  );
}
