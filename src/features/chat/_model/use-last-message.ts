import type { ApiSchemas } from "@/shared/api/schema";
import { useChatContext } from "./store/chat-store";

type ChatMessage = ApiSchemas["ChatMessageDto"];

const findLastAssistantMessage = (
  messages: ChatMessage[],
): ChatMessage | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role === "assistant" && !message.superseded_at) {
      return message;
    }
  }
  return undefined;
};

export const useLastMessageId = (): string | undefined =>
  useChatContext((state) => state.messages.at(-1)?.message_id);

export const useLastAssistantMessageId = (): string | undefined =>
  useChatContext((state) => findLastAssistantMessage(state.messages)?.message_id);

export const useLastAssistantMessage = (): ChatMessage | undefined =>
  useChatContext((state) => findLastAssistantMessage(state.messages));

export const useIsLastMessage = (messageId: string): boolean =>
  useChatContext((state) => state.messages.at(-1)?.message_id === messageId);

export const useIsLastAssistantMessage = (messageId: string): boolean =>
  useChatContext(
    (state) => findLastAssistantMessage(state.messages)?.message_id === messageId,
  );
