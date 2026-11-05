import { fetchClient } from "@/shared/api/instance";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useCreateChat } from "../../_model/messaging/use-create-session";
import { useSendMessage } from "../../_model/messaging/use-send-message";
import {
  FOLLOWUP_NOT_READY_RETRY_LIMIT,
  followupNotReadyRetryDelay,
  getSuggestionQueryKey,
  isFollowupNotReadyError,
  MAX_VISIBLE_SUGGESTIONS,
  starterSuggestionsQueryKey,
  takeVisible,
  type SuggestionItem,
} from "../lib/suggestions-cache";

export const useInitialSuggestions = (anchorMessageId: string) => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const { sendUserMessage } = useSendMessage();

  const { data } = useSuspenseQuery({
    queryKey: getSuggestionQueryKey(chat_id, undefined, anchorMessageId),
    queryFn: async () => {
      const { data } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/followups",
        {
          params: { path: { sessionId: chat_id! } },
          body: {},
        },
      );
      return data!;
    },
    // After the user stops generation the assistant reply may not be
    // persisted yet, so the first followups call can 400. Retry that
    // transient case so suggestions still appear once the reply lands.
    retry: (failureCount, error) =>
      isFollowupNotReadyError(error) &&
      failureCount < FOLLOWUP_NOT_READY_RETRY_LIMIT,
    retryDelay: followupNotReadyRetryDelay,
    staleTime: Infinity,
  });

  const suggestions = takeVisible(data?.suggestions);

  const applySuggestion = (suggestion: SuggestionItem) => {
    sendUserMessage({
      input_source: "followup_suggestion",
      followup_suggestion_id: suggestion.id,
      content: suggestion.text,
    });
  };

  return { suggestions, applySuggestion };
};

// Starter suggestions shown on the empty new-chat page — each one creates a
// brand-new session when applied.
export const useStarterSuggestions = () => {
  const { createChat, isPending } = useCreateChat();

  const { data } = useSuspenseQuery({
    queryKey: starterSuggestionsQueryKey,
    queryFn: async () => {
      const { data } = await fetchClient.POST("/chat/suggestions", {
        body: { count: MAX_VISIBLE_SUGGESTIONS },
      });
      return data!;
    },
    retry: false,
    staleTime: Infinity,
  });

  const suggestions = takeVisible(data?.suggestions);

  const applySuggestion = (suggestion: SuggestionItem) => {
    createChat({
      input_source: "starter_suggestion",
      starter_suggestion_id: suggestion.id,
      content: suggestion.text,
    });
  };

  return { suggestions, applySuggestion, isPending };
};
