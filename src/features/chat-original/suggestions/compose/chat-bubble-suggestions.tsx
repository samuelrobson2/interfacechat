import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit";
import { type SuggestionsVariant } from "../lib/suggestions-cache";
import { ChatSuggestionCard } from "../ui/chat-suggestion-card";
import { useInitialSuggestions } from "../model/use-suggestions";

export function ChatBubbleSuggestionsSkeleton({
  variant = "row",
}: {
  variant?: SuggestionsVariant;
}) {
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
    <div className="pointer-events-none flex flex-1 items-stretch gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[100px] flex-1 rounded-[16px]" />
      ))}
    </div>
  );
}

export function ChatBubbleSuggestions({
  anchorMessageId,
  variant = "row",
}: {
  anchorMessageId: string;
  variant?: SuggestionsVariant;
}) {
  const { suggestions, applySuggestion } =
    useInitialSuggestions(anchorMessageId);

  if (!suggestions.length) return null;

  const isColumn = variant === "column";

  return (
    <div
      className={cn(
        "pointer-events-auto flex gap-4",
        isColumn
          ? "w-[204px] shrink-0 flex-col gap-2"
          : "flex-1 items-stretch",
      )}
    >
      {suggestions.map((suggestion) => (
        <ChatSuggestionCard
          key={suggestion.id}
          className={cn(!isColumn && "flex-1")}
          size={isColumn ? "s" : "m"}
          suggestion={suggestion.text}
          onClick={() => applySuggestion(suggestion)}
        />
      ))}
    </div>
  );
}
