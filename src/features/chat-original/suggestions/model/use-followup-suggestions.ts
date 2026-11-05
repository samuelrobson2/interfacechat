import { fetchClient } from "@/shared/api/instance";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useChatContext } from "../../_model/store/chat-store";
import {
  getSuggestionQueryKey,
  takeVisible,
  type SuggestionItem,
} from "../lib/suggestions-cache";
import { useRegenerateHighlight } from "../../message/model/use-regenerate-highlight";
import { useSendMessage } from "../../_model/messaging/use-send-message";

export const useHighlightFollowupSuggestions = (anchorMessageId: string) => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const { canRegenerateHighlight } = useRegenerateHighlight();
  const { sendUserMessage } = useSendMessage();
  const selectedText = useChatContext((state) => state.selectedText);

  const isEnabled = Boolean(selectedText && canRegenerateHighlight);

  const { data, isFetching } = useQuery({
    queryKey: getSuggestionQueryKey(
      chat_id,
      selectedText,
      anchorMessageId,
      "context",
    ),
    queryFn: async () => {
      const { data } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/followups",
        {
          params: { path: { sessionId: chat_id! } },
          body: {
            ...(selectedText && { highlighted: selectedText }),
          },
        },
      );
      return data!;
    },
    retry: false,
    staleTime: Infinity,
    enabled: isEnabled,
  });

  const suggestions = takeVisible(data?.suggestions);

  // Highlight editing is temporarily disabled: clicking a followup just sends
  // it as a brand-new user message instead of rewriting the selection.
  const applySuggestion = (suggestion: SuggestionItem) => {
    sendUserMessage({
      input_source: "followup_suggestion",
      followup_suggestion_id: suggestion.id,
      content: suggestion.text,
    });
  };

  // Returns whether the prompt was accepted so the caller can reset local UI
  // state only on a successful submit. Sends the typed text as a new message.
  const applyCustomPrompt = (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return false;
    sendUserMessage({ input_source: "user_text", content: prompt });
    return true;
  };

  return {
    suggestions,
    isFetching,
    isEnabled,
    applySuggestion,
    applyCustomPrompt,
  };
};
