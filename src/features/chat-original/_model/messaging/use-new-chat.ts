import type { ApiSchemas } from "@/shared/api/schema";
import { useSendMessage } from "./use-send-message";

const PENDING_CHAT_MESSAGE_KEY = "pendingChatMessage";

export const getPendingChatMessage = () => {
  try {
    const pendingRaw = sessionStorage.getItem(PENDING_CHAT_MESSAGE_KEY);
    if (!pendingRaw) return null;

    return JSON.parse(pendingRaw) as ApiSchemas["CreateUserMessageDto"];
  } catch {
    console.error("Failed to parse pending chat message from sessionStorage");
    return null;
  }
};

export const useNewChat = () => {
  const { sendUserMessage } = useSendMessage();

  const saveMessage = (message: ApiSchemas["CreateUserMessageDto"]) => {
    sessionStorage.setItem(PENDING_CHAT_MESSAGE_KEY, JSON.stringify(message));
  };

  const checkPendingMessage = () => {
    const message = getPendingChatMessage();
    if (!message) return;

    sessionStorage.removeItem(PENDING_CHAT_MESSAGE_KEY);
    sendUserMessage(message);
  };

  return { checkPendingMessage, saveMessage };
};
