import { useChat } from "@ai-sdk/react";
import { createContext, useContext, useEffect, useEffectEvent, useRef } from "react";
import { userMessageSentEvent } from "../pharos/chat";
import { getChatLabChat, useChatLabActivity } from "./chat-lab-runtime";
import {
  findLatestMessage,
  useChatLabStore,
} from "./chat-lab-store";

const ChatLabSessionIdContext = createContext<string>("");

/** Provides the open thread id so hooks don't depend on the route remounting. */
export function ChatLabSessionProvider({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) {
  return (
    <ChatLabSessionIdContext.Provider value={sessionId}>
      {children}
    </ChatLabSessionIdContext.Provider>
  );
}

/** The open thread. Prefer this inside `ChatLabSessionProvider`. */
export function useChatLabSession() {
  const sessionId = useContext(ChatLabSessionIdContext);
  const chat = useChat({ chat: getChatLabChat(sessionId) });
  const { status, sendMessage } = chat;
  const evaluateArtefactForTurn = useChatLabStore(
    (state) => state.evaluateArtefactForTurn,
  );

  return {
    ...chat,
    sessionId,
    sendText: (text: string) => {
      evaluateArtefactForTurn(sessionId, text);
      return sendMessage({ text });
    },
    isPending: status === "submitted",
    isTextGenerating: status === "streaming",
    isGenerating: status === "submitted" || status === "streaming",
  };
}

/** Page-level effects for the open thread. Mount once while a session is open. */
export function useChatLabSessionEffects(sessionId: string) {
  const { messages, status, sendMessage } = useChat({
    chat: getChatLabChat(sessionId),
  });
  const setViewing = useChatLabActivity((state) => state.setViewing);

  useEffect(() => {
    setViewing(sessionId);
    return () => setViewing(null);
  }, [sessionId, setViewing]);

  // Pin each newly sent user message to the top, as pharos does.
  const lastUserMessageId = findLatestMessage(messages, "user")?.id;
  const pinnedMessageId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status !== "submitted" || !lastUserMessageId) return;
    if (pinnedMessageId.current === lastUserMessageId) return;
    pinnedMessageId.current = lastUserMessageId;
    userMessageSentEvent.emit(lastUserMessageId);
  }, [status, lastUserMessageId]);

  const sendPendingMessage = useEffectEvent(() => {
    const pending = useChatLabStore.getState().takePendingMessage(sessionId);
    if (pending) void sendMessage({ text: pending });
  });
  useEffect(() => {
    sendPendingMessage();
  }, [sessionId]);
}
