import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useState } from "react";
import { useHighlightFollowupSuggestions } from "../model/use-followup-suggestions";
import {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
} from "../ui/chat-followup-suggestions";

export function ChatFollowupSuggestions({
  anchorMessageId,
}: {
  anchorMessageId: string;
}) {
  const {
    suggestions,
    isFetching,
    isEnabled,
    applySuggestion,
    applyCustomPrompt,
  } = useHighlightFollowupSuggestions(anchorMessageId);
  const [isCustomContextMode, setIsCustomContextMode] = useState(false);
  const [customContext, setCustomContext] = useState("");

  if (!isEnabled) return null;

  const handleCustomContextSubmit = () => {
    if (!applyCustomPrompt(customContext)) return;
    setIsCustomContextMode(false);
    setCustomContext("");
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {isFetching ? (
        Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={`followup-skeleton-${index}`}
            className="h-[48px] w-full rounded-[16px] border border-gray-3/20 bg-(--chat-selection-highlight)/35"
          />
        ))
      ) : isCustomContextMode ? (
        <div className="flex w-full flex-col items-start gap-2">
          <FollowupBackButton
            aria-label="Back to followup suggestions"
            onClick={() => {
              setIsCustomContextMode(false);
              setCustomContext("");
            }}
          />
          <CustomFollowupTextarea
            value={customContext}
            onChange={(event) => setCustomContext(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleCustomContextSubmit();
              }
            }}
            rows={3}
            placeholder="Describe what to ask next"
            actions={
              <button
                type="button"
                onClick={handleCustomContextSubmit}
                disabled={!customContext.trim()}
                aria-label="Submit custom followup"
                className={cn(
                  "inline-flex size-4 cursor-pointer items-center justify-center transition-opacity",
                  !customContext.trim() && "cursor-not-allowed opacity-50",
                )}
              >
                <ArrowUpIcon svgClasses="size-4" />
              </button>
            }
          />
        </div>
      ) : (
        suggestions.map((suggestion) => (
          <FollowupSuggestionButton
            key={suggestion.id}
            label={suggestion.text}
            hideEndIconUntilHover
            endIcon={<ArrowRightIcon />}
            onClick={() => applySuggestion(suggestion)}
          />
        ))
      )}

      {!isFetching && !isCustomContextMode && (
        <FollowupSuggestionButton
          label="Ask something else"
          endIcon={<PlusSmallIcon svgClasses="size-3" />}
          onClick={() => {
            setIsCustomContextMode(true);
            setCustomContext("");
          }}
        />
      )}
    </div>
  );
}
