import type { ApiSchemas } from "@/shared/api/schema";

// A chat turn stashed on the entry screen (new chat / create interface) so it can
// be replayed after we create the session and navigate to its page. The payload
// shape differs per flow (CreateUserMessageDto for base chat, AppTurnRequestDto
// for the interface), so the helpers stay generic over it.
const PENDING_CHAT_MESSAGE_KEY = "pendingChatMessage";

export const savePendingChatMessage = <T>(message: T) => {
  sessionStorage.setItem(PENDING_CHAT_MESSAGE_KEY, JSON.stringify(message));
};

export const getPendingChatMessage = <
  T = ApiSchemas["CreateUserMessageDto"],
>(): T | null => {
  try {
    const pendingRaw = sessionStorage.getItem(PENDING_CHAT_MESSAGE_KEY);
    if (!pendingRaw) return null;

    return JSON.parse(pendingRaw) as T;
  } catch {
    console.error("Failed to parse pending chat message from sessionStorage");
    return null;
  }
};

export const clearPendingChatMessage = () => {
  sessionStorage.removeItem(PENDING_CHAT_MESSAGE_KEY);
};
