import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import type { ApiSchemas } from "@/shared/api/schema";
import { chatQueryOptions } from "@/services/chat";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useChatContext } from "../store/chat-store";
import { readSseStream } from "../../_lib/read-sse-stream";

// Build a synthetic attachment from a streamed image event so generated images
// flow through the same `message.attachments` model as persisted ones. The
// event already carries the attachment id, so no extra messages fetch is needed.
const buildImageAttachment = (
  messageId: string,
  event: ApiSchemas["ChatSseImageEventDto"],
): ApiSchemas["ChatAttachmentDto"] => ({
  attachment_id: event.attachmentId,
  message_id: messageId,
  s3_key: event.s3Key,
  file_name: event.s3Key.split("/").pop() ?? event.attachmentId,
  file_size_bytes: "0",
  content_type: event.mimeType,
  processing_status: "completed",
  created_at: new Date().toISOString(),
});

export const useProcessSseStream = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const queryClient = useQueryClient();
  const setIsPending = useChatContext((state) => state.setIsPending);
  const appendToMessage = useChatContext((state) => state.appendToMessage);
  const addMessageAttachment = useChatContext(
    (state) => state.addMessageAttachment,
  );
  const setMessageApiPreviewUrl = useChatContext(
    (state) => state.setMessageApiPreviewUrl,
  );
  const setMessageImagePlan = useChatContext(
    (state) => state.setMessageImagePlan,
  );
  const clearMessageImagePlan = useChatContext(
    (state) => state.clearMessageImagePlan,
  );
  const setMessageQuote = useChatContext((state) => state.setMessageQuote);
  const markMessageAsFailed = useChatContext(
    (state) => state.markMessageAsFailed,
  );
  const finishGeneration = useChatContext((state) => state.finishGeneration);
  const setIsTextGenerating = useChatContext(
    (state) => state.setIsTextGenerating,
  );

  const updateSession = (patch: Partial<ApiSchemas["ChatSessionDto"]>) => {
    if (!chat_id) return;
    queryClient.setQueryData<ApiSchemas["ChatSessionDto"]>(
      chatQueryOptions.session(chat_id).queryKey,
      (prev) => (prev ? { ...prev, ...patch } : prev),
    );
  };

  const processSseStream = async (
    body: ReadableStream<Uint8Array<ArrayBuffer>>,
    agentMessageId: string,
    signal?: AbortSignal,
  ) => {
    await readSseStream<ApiSchemas["ChatSseEventDto"]>(
      body,
      (event) => {
        if (event.type === "token") {
          setIsPending(false);
          appendToMessage(agentMessageId, event.text);
        } else if (event.type === "title_token") {
          updateSession({ title: event.text });
        } else if (event.type === "title_complete") {
          updateSession({ title: event.title });
        } else if (event.type === "category_assigned") {
          updateSession({ category: event.category });
        } else if (event.type === "image") {
          setIsPending(false);
          // Prime the download-url cache with the presigned URL we already have,
          // so useMessageImages renders instantly without an extra GET.
          if (chat_id) {
            queryClient.setQueryData(
              chatQueryOptions.attachmentDownloadUrl(
                chat_id,
                event.attachmentId,
              ).queryKey,
              { download_url: event.url },
            );
          }
          addMessageAttachment(
            agentMessageId,
            buildImageAttachment(agentMessageId, event),
          );
        } else if (event.type === "image_plan") {
          setIsPending(false);
          setMessageImagePlan(agentMessageId, event);
        } else if (event.type === "image_pending") {
          setIsPending(false);
          setMessageImagePlan(agentMessageId, {
            type: "image_plan",
            unit: "gallery",
            image_count: 1,
            text_anchor: event.text_anchor,
          });
        } else if (event.type === "image_pending_cancel") {
          clearMessageImagePlan(agentMessageId);
        } else if (event.type === "done_text") {
          if (event.quote) {
            setMessageQuote(agentMessageId, event.quote);
          }
          setIsTextGenerating(false);
        } else if (event.type === "done") {
          if (event.frontend_url) {
            setMessageApiPreviewUrl(agentMessageId, event.frontend_url);
          }
          finishGeneration();
        } else if (event.type === "error") {
          markMessageAsFailed(agentMessageId, event.message);
          finishGeneration();
        }
      },
      signal,
    );
  };

  return { processSseStream };
};
