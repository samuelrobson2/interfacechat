import { useParams } from "react-router-dom";

import { fetchClient } from "@/shared/api/instance";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useChatContext } from "../store/chat-store";

// Module-level singleton AbortController shared across the chat streaming flows
// (send message, regenerate, highlight regenerate). Only one assistant stream
// runs per session at a time, so a single controller is enough to abort
// whichever is in flight.
let currentChatRequestController: AbortController | null = null;

export const createChatRequestController = (): AbortController => {
  if (currentChatRequestController) {
    currentChatRequestController.abort();
  }

  currentChatRequestController = new AbortController();
  return currentChatRequestController;
};

// Abort whatever stream is currently running (used by the stop action).
export const abortCurrentChatRequest = () => {
  currentChatRequestController?.abort();
  currentChatRequestController = null;
};


export const clearCurrentChatRequestController = (
  controller: AbortController,
) => {
  if (currentChatRequestController === controller) {
    currentChatRequestController = null;
  }
};

export const requestStopChatStream = async (sessionId: string) => {
  try {
    await fetchClient.POST("/chat/sessions/{sessionId}/stream/stop", {
      params: { path: { sessionId } },
    });
  } catch {
    // A 404 just means there was no active stream to cancel — ignore it.
  }
};

export const useStopGeneration = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const resetGenerationState = useChatContext((state) => state.stopGeneration);

  const stopGeneration = async () => {
    resetGenerationState();

    if (chat_id) {
      await requestStopChatStream(chat_id);
    }
    abortCurrentChatRequest();
  };

  return { stopGeneration };
};
