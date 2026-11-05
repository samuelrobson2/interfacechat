import { useQueryClient } from "@tanstack/react-query";

import {
  chatQueryOptions,
  useChatContext,
  useChatStoreApi,
} from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { useChartSessionId } from "./use-chart-session";

type ChatMessage = ApiSchemas["ChatMessageDto"];

const withRefreshedTail = (current: ChatMessage[], fresh: ChatMessage[]) => {
  const oldestFresh = fresh[0]?.created_at;
  if (!oldestFresh) return current;

  return [
    ...current.filter((message) => message.created_at < oldestFresh),
    ...fresh,
  ];
};

export function useRefreshChartTranscript() {
  const sessionId = useChartSessionId();
  const queryClient = useQueryClient();
  const storeApi = useChatStoreApi();
  const setMessages = useChatContext((state) => state.setMessages);

  return async () => {
    const fresh = await queryClient.fetchQuery(
      chatQueryOptions.chartSessionMessages(sessionId),
    );

    setMessages(
      withRefreshedTail(storeApi.getState().messages, fresh.messages),
    );
    queryClient.invalidateQueries({
      queryKey: chatQueryOptions.chartSession(sessionId).queryKey,
    });
  };
}
