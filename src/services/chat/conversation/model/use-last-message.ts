import type { ApiSchemas } from "@/shared/api/schema";
import { useChatContext } from "./chat-store";

type ChatMessage = ApiSchemas["ChatMessageDto"];

// Latest active assistant reply. Skips app build/edit summary (reasoning) rows —
// the recap reply is the real "last assistant message" they group into. Shared
// (also imported by the generation-reconnect flow) so this stays single-sourced.
export const findLastAssistantMessage = (
  messages: ChatMessage[],
): ChatMessage | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (
      message?.role === "assistant" &&
      !message.superseded_at &&
      !message.is_app_summary
    ) {
      return message;
    }
  }
  return undefined;
};

// Single source of truth for the latest assistant message. Returns both the
// message object and its id so consumers can pick whichever they need without
// redefining the lookup logic.
export const useLastAssistantMessage = (): {
  lastAssistantMessage: ChatMessage | undefined;
  lastAssistantMessageId: string | undefined;
} => {
  const lastAssistantMessage = useChatContext((state) =>
    findLastAssistantMessage(state.messages),
  );
  return {
    lastAssistantMessage,
    lastAssistantMessageId: lastAssistantMessage?.message_id,
  };
};

// Boolean-only check so consumers that just need "is this the latest answer"
// don't subscribe to the whole message object (avoids per-token re-renders).
export const useIsLatestAssistantMessage = (messageId: string): boolean =>
  useChatContext(
    (state) =>
      findLastAssistantMessage(state.messages)?.message_id === messageId,
  );

const findLastInterfaceMessage = (
  messages: ChatMessage[],
): ChatMessage | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (
      message?.role === "assistant" &&
      !message.superseded_at &&
      message.api_preview_url
    ) {
      return message;
    }
  }
  return undefined;
};

// Latest assistant message that actually carries a generated preview. Used by
// the interface canvas so the *previous* interface stays on screen while a new
// edit/build turn streams in (instead of collapsing to a skeleton).
export const useLastInterfaceMessage = (): ChatMessage | undefined =>
  useChatContext((state) => findLastInterfaceMessage(state.messages));
