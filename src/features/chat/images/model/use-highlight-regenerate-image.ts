import { useRef } from "react";
import { useParams } from "react-router-dom";

import { chatQueryOptions } from "@/services/chat";
import { fetchClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { type PathParams, ROUTES } from "@/shared/model/routes";

import type { ImageBbox } from "@/shared/lib/react/use-image-selection";

import { readSseStream } from "../../_lib/read-sse-stream";
import { requestStopChatStream } from "../../_model/messaging/use-stop-generation";
import { useChatContext } from "../../_model/store/chat-store";

type ChatMessage = ApiSchemas["ChatMessageDto"];

export type ChatImageHighlightAction = "regenerate" | "prompt";

export type ChatImageHighlightPayload = {
  attachmentId: string;
  // Selection is optional — when omitted, the consumer applies the edit to
  // the whole image (or treats it as a general prompt).
  bbox?: ImageBbox;
  action: ChatImageHighlightAction;
  prompt?: string;
};

export type HighlightEditResult = {
  sourceAttachmentId: string;
  newAttachment: ApiSchemas["ChatAttachmentDto"];
  editedUrl: string;
};

const buildOptimisticAttachment = (
  event: ApiSchemas["ChatSseImageEditDoneEventDto"],
): ApiSchemas["ChatAttachmentDto"] => ({
  attachment_id: event.new_attachment_id,
  message_id: event.message_id,
  s3_key: event.s3_key,
  file_name: event.s3_key.split("/").pop() ?? event.new_attachment_id,
  file_size_bytes: String(event.size_bytes ?? 0),
  content_type: event.mime_type,
  processing_status: "completed",
  created_at: new Date().toISOString(),
});

export const useHighlightRegenerateImage = (message: ChatMessage) => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const supersedeAttachment = useChatContext(
    (state) => state.supersedeAttachment,
  );

  const requestControllerRef = useRef<AbortController | null>(null);

  const cancelHighlightRegenerateImage = async () => {
    const controller = requestControllerRef.current;
    if (!controller) return;

    // Cancel the server-side stream first (while the connection is still open),
    // then tear down the local reader — same ordering as the global stop action.
    if (chat_id) {
      await requestStopChatStream(chat_id);
    }
    controller.abort();

    if (requestControllerRef.current === controller) {
      requestControllerRef.current = null;
    }
  };

  const regenerateHighlightImage = async (
    payload: ChatImageHighlightPayload,
  ): Promise<HighlightEditResult | null> => {
    if (!chat_id) return null;

    // Cancel any in-flight regen before starting a new one.
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      const { response } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/messages/highlight-regenerate-image" as never,
        {
          params: { path: { sessionId: chat_id } },
          body: {
            attachment_id: payload.attachmentId,
            bbox: payload.bbox,
            action:
              payload.action === "prompt"
                ? { type: "prompt", value: payload.prompt ?? "" }
                : { type: "regenerate" },
          },
          parseAs: "stream",
          signal: controller.signal,
        } as never,
      );

      if (!response.ok || !response.body) {
        throw new Error(
          `Highlight regenerate image failed (${response.status})`,
        );
      }

      let result: HighlightEditResult | null = null;

      await readSseStream<ApiSchemas["ChatSseEventDto"]>(
        response.body,
        (event) => {
          if (event.type !== "image_edit_done") return;

          // Prime the download URL cache with the URL we already have,
          // so useMessageImages doesn't trigger an extra GET.
          queryClient.setQueryData(
            chatQueryOptions.attachmentDownloadUrl(
              chat_id,
              event.new_attachment_id,
            ).queryKey,
            { download_url: event.url },
          );

          result = {
            sourceAttachmentId: event.source_attachment_id,
            newAttachment: buildOptimisticAttachment(event),
            editedUrl: event.url,
          };
        },
        controller.signal,
      );

      return result;
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    }
  };

  const commitEditedImage = (result: HighlightEditResult) => {
    supersedeAttachment(
      message.message_id,
      result.sourceAttachmentId,
      result.newAttachment,
    );
  };

  return {
    regenerateHighlightImage,
    cancelHighlightRegenerateImage,
    commitEditedImage,
  };
};
