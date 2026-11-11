import { useMemo } from "react";
import { Text } from "@/shared/ui/kit/text";
import { ChatConversationLayout, ChatPillButton } from "../pharos/chat";
import { useChatLabSession } from "../model/chat-lab-session";
import { findLatestMessage, useChatLabStore } from "../model/chat-lab-store";
import { inlineArtefactsByMessage } from "../model/chat-lab-workbench";
import { AgentIsland } from "./agent-island";
import { ChatAssistantFrame, ChatLabMessageItem } from "./chat-lab-message";

export function ChatLabConversation({
  conversationRef,
  contentClassName,
  ...props
}: React.ComponentProps<"div"> & {
  conversationRef?: React.RefObject<HTMLDivElement | null>;
  contentClassName?: string;
}) {
  const { sessionId, messages, status, error, regenerate, clearError } = useChatLabSession();
  const session = useChatLabStore((state) => state.sessions[sessionId]);
  // Interfaces a reply made are shown under it.
  const artefacts = session?.artefacts;
  const inline = useMemo(
    () => inlineArtefactsByMessage(session, messages),
    // Placement doesn't change which reply carries what.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artefacts, messages],
  );
  const latestAssistantId = findLatestMessage(messages, "assistant")?.id;
  const awaitingReply =
    (status === "submitted" || status === "streaming") &&
    messages.at(-1)?.role === "user";

  const handleRetry = () => {
    clearError();
    void regenerate();
  };

  return (
    <ChatConversationLayout
      contentRef={conversationRef}
      contentClassName={contentClassName}
      {...props}
    >
      {messages.map((message) => (
        <ChatLabMessageItem
          key={message.id}
          message={message}
          isLatestAssistantMessage={message.id === latestAssistantId}
          inline={inline[message.id]}
        />
      ))}
      {awaitingReply && (
        <ChatAssistantFrame isActive preload>
          <AgentIsland />
        </ChatAssistantFrame>
      )}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-[12px] border border-red-5/20 bg-red-5/5 px-4 py-3">
          <Text variant="label" color="error" className="min-w-0 break-words">
            {error.message || "Something went wrong."}
          </Text>
          <ChatPillButton shape="pill-text" onClick={handleRetry}>
            <Text variant="label" color="primary">
              Retry
            </Text>
          </ChatPillButton>
        </div>
      )}
    </ChatConversationLayout>
  );
}
