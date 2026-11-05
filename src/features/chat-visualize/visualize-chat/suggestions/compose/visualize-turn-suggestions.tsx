import {
  ChatBubbleSuggestions,
  type BubbleSuggestionsVariant,
  type SuggestionItem,
  useLastAssistantMessage,
} from "@/services/chat";
import { useVisualizeFollowups } from "../model/use-visualize-followups";

/** Follow-up cards for the latest chart, applied as the next chart turn. */
export function VisualizeTurnSuggestions({
  onApply,
  ...props
}: React.ComponentProps<"div"> & {
  onApply: (suggestion: SuggestionItem) => void;
  variant?: BubbleSuggestionsVariant;
}) {
  const { lastAssistantMessageId: anchorMessageId } = useLastAssistantMessage();
  const { suggestions } = useVisualizeFollowups(anchorMessageId);

  return (
    <ChatBubbleSuggestions
      suggestions={suggestions}
      onApply={onApply}
      {...props}
    />
  );
}
