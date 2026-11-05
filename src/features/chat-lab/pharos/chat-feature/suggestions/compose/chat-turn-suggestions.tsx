import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChatBubbleSuggestions,
  type BubbleSuggestionsVariant,
} from "../../../chat";
import { chatLabQueryOptions } from "../../../../model/chat-lab-api";
import { useChatLabSession } from "../../../../model/chat-lab-session";

/** Follow-up cards for the latest assistant turn, applied as a new message. */
export function ChatTurnSuggestions({
  anchorMessageId,
  ...props
}: React.ComponentProps<"div"> & {
  anchorMessageId: string;
  variant?: BubbleSuggestionsVariant;
}) {
  const { sessionId, messages, sendText } = useChatLabSession();
  const { data: suggestions } = useSuspenseQuery(
    chatLabQueryOptions.followups(sessionId, anchorMessageId, messages),
  );

  return (
    <ChatBubbleSuggestions
      suggestions={suggestions}
      onApply={(suggestion) => void sendText(suggestion.text)}
      {...props}
    />
  );
}
