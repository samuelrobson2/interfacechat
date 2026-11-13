import {
  VisualizeSuggestionCard as ChatSuggestionCard,
  ChatSuggestionsSection,
} from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useStarterSuggestions } from "../model/use-suggestions";

const STARTER_SUGGESTIONS_COUNT = 3;

export type SuggestionsOrientation = "grid" | "row";

const gridContainerClassName = cn(
  "flex w-full max-w-[1024px] gap-1 overflow-x-auto snap-x snap-mandatory max-md:pb-2",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
);

const suggestionItemClassName = "w-[156px] shrink-0 snap-start md:w-auto";

export function suggestionsContainerClass(orientation: SuggestionsOrientation) {
  return orientation === "row"
    ? "flex w-full flex-row gap-3"
    : gridContainerClassName;
}

export function ChatStarterSuggestionsSkeleton({
  orientation = "grid",
}: {
  orientation?: SuggestionsOrientation;
}) {
  const isRow = orientation === "row";
  return (
    <ChatSuggestionsSection className={orientation === "grid" ? "md:mt-6" : undefined}>
      <div className={suggestionsContainerClass(orientation)}>
        {Array.from({ length: STARTER_SUGGESTIONS_COUNT }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "rounded-[16px]",
              isRow ? "h-[84px] flex-1" : `h-[100px] ${suggestionItemClassName}`,
            )}
          />
        ))}
      </div>
    </ChatSuggestionsSection>
  );
}

export function ChatStarterSuggestions({
  orientation = "grid",
}: {
  orientation?: SuggestionsOrientation;
}) {
  const { suggestions, applySuggestion, isPending } = useStarterSuggestions();
  const isRow = orientation === "row";

  if (!suggestions.length) return null;

  return (
    <ChatSuggestionsSection className={orientation === "grid" ? "md:mt-6" : undefined}>
      <div className={suggestionsContainerClass(orientation)}>
        {suggestions.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.id}
            suggestion={suggestion.text}
            className={isRow ? "min-h-[84px]! flex-1" : suggestionItemClassName}
            onClick={() => applySuggestion(suggestion)}
            disabled={isPending}
          />
        ))}
      </div>
    </ChatSuggestionsSection>
  );
}
