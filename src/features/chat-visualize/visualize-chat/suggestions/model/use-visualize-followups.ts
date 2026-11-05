import { useSuspenseQuery } from "@tanstack/react-query";

import {
  getSuggestionQueryKey,
  takeVisible,
  useChatContext,
} from "@/services/chat";
import { SAMPLE_FOLLOWUP_SUGGESTIONS } from "@/features/chat-visualize/new-visualize/model/sample-visualize";
import { useChartSessionId } from "../../_model/use-chart-session";

/** Follow-ups arrive on the assistant message from /api/visualize. */
export function useVisualizeFollowups(anchorMessageId?: string) {
  const sessionId = useChartSessionId();
  const messages = useChatContext((state) => state.messages);

  const { data: suggestions } = useSuspenseQuery({
    queryKey: getSuggestionQueryKey(sessionId, undefined, anchorMessageId),
    queryFn: async () => {
      const message =
        messages.find((item) => item.message_id === anchorMessageId) ??
        [...messages].reverse().find((item) => item.role === "assistant");
      const next = takeVisible(message?.followups?.suggestions);
      const tooShort =
        next.length > 0 &&
        next.every((item) => item.text.trim().split(/\s+/).length < 8);
      if (!next.length || tooShort) return [...SAMPLE_FOLLOWUP_SUGGESTIONS];
      return next;
    },
    staleTime: Infinity,
  });

  return { suggestions };
}
