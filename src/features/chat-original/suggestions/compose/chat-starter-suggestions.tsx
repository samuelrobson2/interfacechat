import {
  ChatSuggestionCard,
  ChatSuggestionsSection,
} from "../ui/chat-suggestion-card";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useStarterSuggestions } from "../model/use-suggestions";

const STARTER_SUGGESTIONS_COUNT = 3;

const suggestionsContainerClassName = cn(
  "flex w-full max-w-[1024px] gap-1 overflow-x-auto snap-x snap-mandatory max-md:pb-2",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
);

const suggestionItemClassName = "w-[156px] shrink-0 snap-start md:w-auto";

export function ChatStarterSuggestionsSkeleton() {
  return (
    <ChatSuggestionsSection className="md:mt-6">
      <div className={suggestionsContainerClassName}>
        {Array.from({ length: STARTER_SUGGESTIONS_COUNT }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-[100px] rounded-[16px] ${suggestionItemClassName}`}
          />
        ))}
      </div>
    </ChatSuggestionsSection>
  );
}

export function ChatStarterSuggestions() {
  const { suggestions, applySuggestion, isPending } = useStarterSuggestions();

  if (!suggestions.length) return null;

  return (
    <ChatSuggestionsSection className="md:mt-6">
      <div className={suggestionsContainerClassName}>
        {suggestions.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.id}
            suggestion={suggestion.text}
            onClick={() => applySuggestion(suggestion)}
            disabled={isPending}
            className={suggestionItemClassName}
          />
        ))}
      </div>
    </ChatSuggestionsSection>
  );
}
