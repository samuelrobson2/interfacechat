import { useQuery } from "@tanstack/react-query";
import {
  ChatSuggestionCard,
  ChatSuggestionsSection,
  ChatSuggestionsTransition,
} from "../../../chat";
import { cn } from "@/shared/lib/css";
import { chatLabQueryOptions } from "../../../../model/chat-lab-api";

const STARTER_SUGGESTIONS_COUNT = 3;

// The mobile carousel clips overflow, so it keeps room for the card shadows itself.
const suggestionsContainerClassName = cn(
  "flex w-full max-w-[1024px] gap-1 overflow-x-auto snap-x snap-mandatory max-md:pb-2",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
);

const suggestionItemClassName = "w-[156px] shrink-0 snap-start md:w-auto";

export function ChatStarterSuggestions({
  onApply,
  disabled = false,
}: {
  onApply: (text: string) => void;
  disabled?: boolean;
}) {
  const { data: suggestions = [], isPending: isLoadingSuggestions } = useQuery(
    chatLabQueryOptions.starterSuggestions(),
  );

  if (!isLoadingSuggestions && !suggestions.length) return null;

  return (
    <ChatSuggestionsSection className="md:mt-6">
      <ChatSuggestionsTransition
        isLoading={isLoadingSuggestions}
        count={STARTER_SUGGESTIONS_COUNT}
        containerClassName={suggestionsContainerClassName}
        itemClassName={suggestionItemClassName}
        revealSpeed={2}
      >
        {suggestions.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.id}
            suggestion={suggestion.text}
            onClick={() => onApply(suggestion.text)}
            disabled={disabled}
            className={suggestionItemClassName}
          />
        ))}
      </ChatSuggestionsTransition>
    </ChatSuggestionsSection>
  );
}
