import { useState } from "react";

import {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
  type SuggestionItem,
} from "@/services/chat";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";

export function VisualizeHighlightSuggestions({
  side,
  offsetY,
  suggestions,
  onSubmit,
  onAskSomethingElse,
}: {
  side: "left" | "right";
  offsetY: number;
  suggestions: SuggestionItem[];
  onSubmit: (instruction: string) => void;
  /** When set, skips the inline textarea and hands off to the composer. */
  onAskSomethingElse?: () => void;
}) {
  const [customText, setCustomText] = useState<string | null>(null);

  const handleCustomSubmit = () => {
    const trimmed = customText?.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 z-30 flex w-[212px] flex-col py-4",
        side === "right" ? "left-full ml-4" : "right-full mr-4",
      )}
    >
      <div className="min-h-0 shrink" style={{ height: offsetY }} />
      <div className="pointer-events-auto flex w-full shrink-0 flex-col items-start gap-2">
        {customText === null ? (
          <>
            {suggestions.map((suggestion) => (
              <FollowupSuggestionButton
                key={suggestion.id}
                label={suggestion.text}
                className="w-full"
                hideEndIconUntilHover
                endIcon={<ArrowRightIcon svgClasses="size-5" />}
                onClick={() => onSubmit(suggestion.text)}
              />
            ))}
            <FollowupSuggestionButton
              label="Ask something else"
              className="w-full"
              endIcon={<PlusSmallIcon svgClasses="size-3" />}
              onClick={() =>
                onAskSomethingElse
                  ? onAskSomethingElse()
                  : setCustomText("")
              }
            />
          </>
        ) : (
          <>
            <FollowupBackButton
              aria-label="Back to chart suggestions"
              onClick={() => setCustomText(null)}
            />
            <CustomFollowupTextarea
              autoFocus
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleCustomSubmit();
                }
              }}
              rows={3}
              placeholder="Describe the change"
              actions={
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim()}
                  aria-label="Submit chart edit"
                  className={cn(
                    "inline-flex size-4 cursor-pointer items-center justify-center transition-opacity",
                    !customText.trim() && "cursor-not-allowed opacity-50",
                  )}
                >
                  <ArrowUpIcon svgClasses="size-4" />
                </button>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
