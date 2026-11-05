import * as React from "react";

import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { type ImageBbox } from "@/shared/lib/react/use-image-selection";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import { type SuggestionItem } from "../../suggestions/lib/suggestions-cache";
import { FollowupSuggestionButton } from "../../suggestions/ui/chat-followup-suggestions";

const SUGGESTION_SKELETON_COUNT = 3;

export function ImageHighlightOverlay({
  selectionBbox,
  selectionPreviewBbox,
  showSuggestions,
  suggestions,
  isLoadingSuggestions,
  onSuggestionClick,
  onAskSomethingElse,
}: {
  selectionBbox: ImageBbox | null;
  selectionPreviewBbox: ImageBbox | null;
  showSuggestions: boolean;
  suggestions: SuggestionItem[];
  isLoadingSuggestions: boolean;
  onSuggestionClick: (suggestion: SuggestionItem) => void;
  onAskSomethingElse: () => void;
}) {
  const renderBbox = selectionPreviewBbox ?? selectionBbox;
  // Suggestions are anchored next to the selection itself, not the image edge.
  // Default to the right of the selection; flip to the left only when the
  // selection sits too close to the image's right edge to leave room.
  const suggestionsOnLeft = selectionBbox
    ? selectionBbox.x + selectionBbox.width >= 0.85
    : false;

  const suggestionsStyle: React.CSSProperties | undefined = selectionBbox
    ? {
        top: `${selectionBbox.y * 100}%`,
        ...(suggestionsOnLeft
          ? { right: `calc(${(1 - selectionBbox.x) * 100}% + 30px)` }
          : {
              left: `calc(${(selectionBbox.x + selectionBbox.width) * 100}% + 30px)`,
            }),
      }
    : undefined;

  return (
    <>
      {renderBbox && (
        <div
          className="pointer-events-none absolute border-[0.5px] border-dashed border-[#DCB500] bg-[rgba(242,229,170,0.5)]"
          style={{
            left: `${renderBbox.x * 100}%`,
            top: `${renderBbox.y * 100}%`,
            width: `${renderBbox.width * 100}%`,
            height: `${renderBbox.height * 100}%`,
          }}
        />
      )}
      <div
        className={cn(
          "pointer-events-auto absolute z-9999 flex w-[212px] flex-col items-start gap-2 transition-opacity duration-200",
          showSuggestions ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={suggestionsStyle}
      >
        {isLoadingSuggestions
          ? Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
              <Skeleton
                key={`image-suggestion-skeleton-${index}`}
                className="h-[48px] w-full rounded-[16px] border border-gray-3/20 bg-(--chat-selection-highlight)/35"
              />
            ))
          : suggestions.map((suggestion) => (
              <FollowupSuggestionButton
                key={suggestion.id}
                label={suggestion.text}
                className="w-full"
                hideEndIconUntilHover
                endIcon={<ArrowRightIcon svgClasses="size-5" />}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
        <FollowupSuggestionButton
          label="Ask something else"
          className="whitespace-nowrap"
          endIcon={<PlusSmallIcon svgClasses="size-3" />}
          onClick={onAskSomethingElse}
        />
      </div>
    </>
  );
}
