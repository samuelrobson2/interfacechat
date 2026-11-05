import { useParams } from "react-router-dom";

import { fetchClient } from "@/shared/api/instance";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { removeSuggestionCache } from "../../suggestions/lib/suggestions-cache";
import { useChatContext } from "../../_model/store/chat-store";
import {
  clearCurrentChatRequestController,
  createChatRequestController,
} from "../../_model/messaging/use-stop-generation";
import { useProcessSseStream } from "../../_model/messaging/use-read-sse-stream";

export const useRegenerateMessage = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const setMessageContent = useChatContext((state) => state.setMessageContent);
  const clearMessageAttachments = useChatContext(
    (state) => state.clearMessageAttachments,
  );
  const clearMessageImagePlan = useChatContext(
    (state) => state.clearMessageImagePlan,
  );
  const clearMessageQuote = useChatContext(
    (state) => state.clearMessageQuote,
  );
  const startGeneration = useChatContext((state) => state.startGeneration);
  const finishGeneration = useChatContext((state) => state.finishGeneration);
  const { processSseStream } = useProcessSseStream();

  const regenerate = async (messageId: string) => {
    if (!chat_id) return;

    setMessageContent(messageId, "");
    clearMessageAttachments(messageId);
    clearMessageImagePlan(messageId);
    clearMessageQuote(messageId);
    startGeneration();

    removeSuggestionCache(chat_id);
    const controller = createChatRequestController();

    try {
      const { response } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/messages/regenerate" as never,
        {
          params: { path: { sessionId: chat_id } },
          parseAs: "stream",
          signal: controller.signal,
        } as never,
      );

      if (!response.ok || !response.body) {
        finishGeneration();
        return;
      }

      await processSseStream(response.body, messageId, controller.signal);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Regenerate failed:", error);
      }
      finishGeneration();
    } finally {
      clearCurrentChatRequestController(controller);
    }
  };

  return { regenerate };
};
