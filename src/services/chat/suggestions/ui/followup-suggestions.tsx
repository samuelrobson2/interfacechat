import { useState } from "react";

import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
} from "../../_ui/chat-followup-buttons";
import type { SuggestionItem } from "../lib/suggestions-cache";

export function ChatFollowupSuggestions({
  suggestions,
  isFetching = false,
  onApply,
  onSubmitCustom,
  onClose,
  suggestionsClassName,
  className,
  align = "right",
  customPromptPlaceholder = "Describe what to ask next",
  ...props
}: React.ComponentProps<"div"> & {
  suggestions: readonly SuggestionItem[];
  isFetching?: boolean;
  onApply: (suggestion: SuggestionItem) => void;
  /** Returns whether the prompt was accepted, so the field only clears on success. */
  onSubmitCustom: (prompt: string) => boolean;
  onClose?: () => void;
  suggestionsClassName?: string;
  align?: "left" | "right";
  customPromptPlaceholder?: string;
}) {
  const [isCustomContextMode, setIsCustomContextMode] = useState(false);
  const [customContext, setCustomContext] = useState("");

  const desktopAlignClass =
    align === "left" ? "md:items-start" : "md:items-end";

  const handleCustomContextSubmit = () => {
    if (!onSubmitCustom(customContext)) return;
    setIsCustomContextMode(false);
    setCustomContext("");
  };

  const handleExitCustomMode = () => {
    setIsCustomContextMode(false);
    setCustomContext("");
  };

  const showTopBackButton = !!onClose && !isCustomContextMode;

  const renderContent = () => {
    if (isCustomContextMode) {
      return (
        <div className="flex w-full flex-col items-start gap-2">
          <FollowupBackButton
            aria-label="Back to followup suggestions"
            onClick={handleExitCustomMode}
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
            placeholder={customPromptPlaceholder}
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
      );
    }

    if (isFetching) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton
          key={`followup-skeleton-${index}`}
          className="h-[48px] w-full rounded-[16px] border border-gray-3/20 bg-(--chat-highlight-glow)/35"
        />
      ));
    }

    return (
      <div
        className={cn(
          "flex w-full flex-col items-start gap-2",
          desktopAlignClass,
          suggestionsClassName,
        )}
      >
        {suggestions.map((suggestion) => (
          <FollowupSuggestionButton
            key={suggestion.id}
            label={suggestion.text}
            hideEndIconUntilHover
            endIcon={<ArrowRightIcon />}
            onClick={() => onApply(suggestion)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2",
        desktopAlignClass,
        className,
      )}
      {...props}
    >
      {showTopBackButton && (
        <FollowupBackButton
          aria-label="Exit highlight mode"
          onClick={onClose}
        />
      )}
      {renderContent()}

      {!isCustomContextMode && (
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
