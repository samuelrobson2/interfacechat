import { useEffect, useEffectEvent } from "react";

import {
  ChatLayout,
  ChatPillButton,
  ChatProvider,
  useChatScroll,
} from "@/services/chat";
import { ArrowDownIcon } from "@/shared/assets/icons/outlined/ArrowDown";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { VisualizeChatHeading } from "./_compose/visualize-chat-heading";
import { VisualizeComposerBar } from "./_compose/visualize-composer-bar";
import { VisualizeConversation } from "./_compose/visualize-conversation";
import {
  ensureVisualizeSession,
  useVisualizeStore,
} from "./_lib/visualize-session-store";
import { useChartSessionId } from "./_model/use-chart-session";
import { useNewVisualization } from "./_model/use-new-visualization";
import { useVisualizeHighlightStore } from "./highlight/model/visualize-highlight-store";
import { VisualizeChatSkeleton } from "./_ui/visualize-chat-skeleton";

function VisualizeChatPageContent() {
  const isMobile = useIsMobile();
  const { checkPendingVisualization } = useNewVisualization();
  const {
    inputLayoutRef,
    conversationRef,
    conversationScrollRef,
    inputLayoutHeight,
    totalBottomPadding,
    showScrollToBottom,
    handleScrollToBottom,
  } = useChatScroll();

  const checkPendingVisualizationEffect = useEffectEvent(() => {
    checkPendingVisualization();
  });

  useEffect(() => {
    checkPendingVisualizationEffect();
    return () => useVisualizeHighlightStore.getState().reset();
  }, []);

  return (
    <ChatLayout className="relative h-dvh max-w-7xl overflow-hidden">
      <VisualizeChatHeading />
      <VisualizeConversation
        className="w-full"
        conversationRef={conversationRef}
        ref={conversationScrollRef}
        style={{
          paddingTop: isMobile ? 88 : 75,
          paddingBottom: totalBottomPadding,
        }}
      />
      <VisualizeComposerBar inputLayoutRef={inputLayoutRef} />
      {showScrollToBottom && (
        <div
          style={{ bottom: inputLayoutHeight }}
          className="absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <ChatPillButton
            shape="icon-round"
            onClick={handleScrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ArrowDownIcon svgClasses="size-6" />
          </ChatPillButton>
        </div>
      )}
    </ChatLayout>
  );
}

function VisualizeChatPage() {
  const sessionId = useChartSessionId();
  const stored = useVisualizeStore((state) => state.sessions[sessionId]);

  useEffect(() => {
    ensureVisualizeSession(sessionId);
  }, [sessionId]);

  if (!stored) return <VisualizeChatSkeleton />;

  return (
    <ChatProvider key={sessionId} messages={stored.messages}>
      <VisualizeChatPageContent />
    </ChatProvider>
  );
}

export const Component = VisualizeChatPage;
