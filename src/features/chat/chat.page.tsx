import { useEffect, useEffectEvent } from "react";
import { useQueries } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { chatQueryOptions, ChatPillButton } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { ArrowDownIcon } from "@/shared/assets/icons/outlined/ArrowDown";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit/text";
import { MockChatThread } from "./_compose/mock-chat-thread";
import { ChatInputComposer } from "./_compose/chat-input-composer";
import { ChatConversation } from "./_compose/chat-conversation";
import { ChatHeading } from "./header/chat-heading";
import { useStopGeneration } from "./_model/messaging/use-stop-generation";
import { ChatProvider, useChatContext } from "./_model/store/chat-store";
import { useChatScroll } from "./_model/use-chat-scroll";
import { useLastAssistantMessage } from "./_model/use-last-message";
import { useLoadMoreMessages } from "./_model/use-load-more-messages";
import {
  getPendingChatMessage,
  useNewChat,
} from "./_model/messaging/use-new-chat";
import { ChatLayout } from "./_ui/chat-layout";
import { ChatPageSkeleton } from "./_ui/chat-page-skeleton";

function ChatPageContent({
  chatId,
  initialNextCursor,
  sessionData,
}: {
  chatId: string;
  initialNextCursor?: string | null;
  sessionData?: ApiSchemas["ChatSessionDto"];
}) {
  const { checkPendingMessage } = useNewChat();
  const isGenerating = useChatContext((state) => state.isGenerating);
  const isTextGenerating = useChatContext((state) => state.isTextGenerating);
  const isPending = useChatContext((state) => state.isPending);
  const isRegenerating = useChatContext((state) => state.isRegenerating);
  const { stopGeneration } = useStopGeneration();
  const latestAssistantMessage = useLastAssistantMessage();
  const {
    inputLayoutRef,
    conversationRef,
    conversationScrollRef,
    inputLayoutHeight,
    totalBottomPadding,
    showScrollToBottom,
    handleScrollToBottom,
  } = useChatScroll();

  const checkPendingMessageEffect = useEffectEvent(() => {
    checkPendingMessage();
  });

  useEffect(() => {
    checkPendingMessageEffect();
  }, []);

  useLoadMoreMessages(chatId, initialNextCursor, conversationScrollRef);

  const shouldHideChatInput = isPending || isTextGenerating || isRegenerating;
  const showStopResponse = isGenerating && !isPending;

  const handleStopResponse = () => {
    stopGeneration();
  };

  // Suggestions rail is anchored to the latest assistant message — its content
  // is driven solely by the message, independent of any highlight selection
  // (the in-message followups handle the selection-driven flow).
  const shouldRenderSuggestions =
    !!latestAssistantMessage &&
    latestAssistantMessage.metadata?.status !== "failed" &&
    !isTextGenerating;

  return (
    <ChatLayout className="relative h-screen max-w-[1280px] overflow-hidden">
      <ChatHeading
        sessionId={chatId}
        title={sessionData?.title}
        category={sessionData?.category}
        isFavorite={sessionData?.is_favorite}
      />
      <ChatConversation
        className="w-full"
        conversationRef={conversationRef}
        ref={conversationScrollRef}
        style={{
          paddingTop: 75,
          paddingBottom: totalBottomPadding,
        }}
      />
      {!shouldHideChatInput && (
        <ChatInputComposer
          inputLayoutRef={inputLayoutRef}
          latestAssistantMessage={latestAssistantMessage}
          shouldRenderSuggestions={shouldRenderSuggestions}
        />
      )}
      {(showStopResponse || showScrollToBottom) && (
        <div
          style={{ bottom: shouldHideChatInput ? 60 : inputLayoutHeight }}
          className="absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          {showScrollToBottom && (
            <ChatPillButton
              shape="icon-round"
              onClick={handleScrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ArrowDownIcon svgClasses="size-6" />
            </ChatPillButton>
          )}
          {showStopResponse && (
            <ChatPillButton shape="pill-text" onClick={handleStopResponse}>
              <CrossLargeIcon svgClasses="size-4" />
              <Text variant="label" color="primary">
                Stop response
              </Text>
            </ChatPillButton>
          )}
        </div>
      )}
    </ChatLayout>
  );
}

function ChatPage() {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();

  const [
    { data, isLoading },
    { data: sessionData },
  ] = useQueries({
    queries: [
      {
        ...chatQueryOptions.messages(chat_id!),
        enabled: !getPendingChatMessage(),
      },
      {
        ...chatQueryOptions.session(chat_id!),
        enabled: Boolean(chat_id),
      },
    ],
  });

  if (isLoading) return <ChatPageSkeleton />;

  return (
    <ChatProvider messages={data?.messages ?? []}>
      <ChatPageContent
        chatId={chat_id!}
        initialNextCursor={data?.next_cursor}
        sessionData={sessionData}
      />
    </ChatProvider>
  );
}

// In dev there's no backend, so the real message/session queries error. Render
// a mock thread instead so the in-chat layouts can be developed locally.
export function Component() {
  return DEV_AUTH_BYPASS ? <MockChatThread /> : <ChatPage />;
}
