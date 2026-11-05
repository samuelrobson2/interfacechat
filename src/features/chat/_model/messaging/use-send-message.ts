import { useParams } from "react-router-dom";

import { fetchClient } from "@/shared/api/instance";
import { useChatContext } from "../store/chat-store";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import type { ApiSchemas } from "@/shared/api/schema";
import { useInputStore } from "../store/input-store";
import { useUploadChatAttachments } from "./use-upload-chat-attachments";
import { userMessageSentEvent } from "../use-chat-scroll";
import { useProcessSseStream } from "./use-read-sse-stream";
import { useChatSelectionUtils } from "../use-chat-selection";
import {
  clearCurrentChatRequestController,
  createChatRequestController,
} from "./use-stop-generation";

export const useSendMessage = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const addMessage = useChatContext((state) => state.addMessage);
  const startGeneration = useChatContext((state) => state.startGeneration);
  const finishGeneration = useChatContext((state) => state.finishGeneration);

  const files = useInputStore((state) => state.files);
  const setFiles = useInputStore((state) => state.setFiles);
  const setUploadedAttachments = useInputStore(
    (state) => state.setUploadedAttachments,
  );

  const { uploadFiles } = useUploadChatAttachments(false);
  const { processSseStream } = useProcessSseStream();
  const { clearSelection } = useChatSelectionUtils();

  const sendUserMessage = async (
    message: ApiSchemas["CreateUserMessageDto"],
  ) => {
    if (!chat_id) return;

    clearSelection();

    const userMessageId = crypto.randomUUID();
    addMessage({
      message_id: userMessageId,
      session_id: chat_id,
      role: "user",
      content: message.content ?? "",
      created_at: new Date().toISOString(),
      attachments: [],
    });

    const agentMessageId = crypto.randomUUID();
    addMessage({
      message_id: agentMessageId,
      session_id: chat_id,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      attachments: [],
    });

    userMessageSentEvent.emit(userMessageId);

    // Show spinner immediately — it covers both upload time and response generation
    startGeneration();

    // Upload pending files if not yet uploaded (new chat flow)
    let attachments = message.attachments ?? [];
    if (attachments.length === 0 && files.size > 0) {
      try {
        attachments = await uploadFiles(chat_id, files);
      } catch (err) {
        console.error("Failed to upload attachments:", err);
      } finally {
        setFiles(new Map());
        setUploadedAttachments(new Map());
      }
    }

    const controller = createChatRequestController();

    try {
      const { response } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/messages",
        {
          params: { path: { sessionId: chat_id } },
          body: { ...message, attachments },
          parseAs: "stream",
          signal: controller.signal,
        },
      );

      if (!response.ok || !response.body) {
        finishGeneration();
        return;
      }

      await processSseStream(response.body, agentMessageId, controller.signal);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error(error);
      }
      finishGeneration();
    } finally {
      clearCurrentChatRequestController(controller);
    }
  };

  return { sendUserMessage };
};
