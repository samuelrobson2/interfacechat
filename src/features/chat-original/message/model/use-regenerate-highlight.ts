import { fetchClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { removeSuggestionCache } from "../../suggestions/lib/suggestions-cache";
import { readSseStream } from "../../_lib/read-sse-stream";
import {
  clearCurrentChatRequestController,
  createChatRequestController,
} from "../../_model/messaging/use-stop-generation";
import { useChatContext } from "../../_model/store/chat-store";
import { useChatSelectionUtils } from "../../_model/use-chat-selection";
import { useLastAssistantMessageId } from "../../_model/use-last-message";

export const useRegenerateHighlight = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  // Highlight always targets the last assistant message — compute it here
  // rather than reading the (image-only) `highlightMessageId` from the store.
  const lastAssistantId = useLastAssistantMessageId();
  const selectedText = useChatContext((state) => state.selectedText);
  const highlightRange = useChatContext((state) => state.highlightRange);
  const setMessageContent = useChatContext((state) => state.setMessageContent);
  const replaceMessageRange = useChatContext(
    (state) => state.replaceMessageRange,
  );
  const insertInMessage = useChatContext((state) => state.insertInMessage);
  const setIsRegenerating = useChatContext((state) => state.setIsRegenerating);
  const markMessageAsFailed = useChatContext(
    (state) => state.markMessageAsFailed,
  );
  const { clearSelection } = useChatSelectionUtils();

  const canRegenerateHighlight = Boolean(
    lastAssistantId && selectedText && chat_id,
  );

  const regenerateHighlight = async (action: ApiSchemas["HighlightRegenerateActionDto"]) => {
    if (!chat_id || !lastAssistantId || !selectedText) return;

    setIsRegenerating(true);

    // Streaming cursor — the absolute offset inside message.content where the
    // next token should be inserted. Initialised from the server-provided
    // highlight_regen_start event, falling back to locally resolved offsets.
    let insertCursor: number | undefined;

    // Share the singleton controller so the global stop action can cancel this
    // highlight stream too (abort + backend /stream/stop).
    const controller = createChatRequestController();

    try {
      const { response } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/messages/highlight-regenerate" as never,
        {
          params: { path: { sessionId: chat_id } },
          body: {
            action,
            ...(highlightRange && {
              highlight_range_start: highlightRange.start,
              highlight_range_end: highlightRange.end,
            }),
            highlighted: selectedText,
          },
          parseAs: "stream",
          signal: controller.signal,
        } as never,
      );

      if (!response.ok || !response.body) {
        setIsRegenerating(false);
        return;
      }

      await readSseStream<ApiSchemas["ChatSseEventDto"]>(
        response.body,
        (event) => {
          if (event.type === "highlight_regen_start") {
            // Server is the source of truth for the replacement range —
            // fall back to our locally computed offsets if it omitted them.
            const start = event.range_start ?? highlightRange?.start;
            const end = event.range_end ?? highlightRange?.end;
            if (start === undefined || end === undefined) return;

            replaceMessageRange(lastAssistantId, start, end, "");
            insertCursor = start;

            // Drop the DOM selection now that the highlighted slice is gone.
            // Keep the suggestion cache — it will be invalidated once at the
            // end of the stream ("done") to avoid a duplicated refetch.
            clearSelection({ keepSuggestionCache: true });
          } else if (event.type === "token") {
            if (insertCursor === undefined) return;
            insertInMessage(lastAssistantId, insertCursor, event.text);
            insertCursor += event.text.length;
          } else if (event.type === "done") {
            setIsRegenerating(false);

            // Reconcile with the backend's final content to heal any drift
            // accumulated during incremental token insertion.
            if ("content" in event && typeof event.content === "string") {
              setMessageContent(lastAssistantId, event.content);
            }

            removeSuggestionCache(chat_id);
            insertCursor = undefined;
          } else if (event.type === "error") {
            markMessageAsFailed(lastAssistantId, event.message);
            setIsRegenerating(false);
            insertCursor = undefined;
          }
        },
        controller.signal,
      );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Highlight regenerate failed:", error);
      }
      setIsRegenerating(false);
    } finally {
      clearCurrentChatRequestController(controller);
    }
  };

  return { regenerateHighlight, canRegenerateHighlight };
};
