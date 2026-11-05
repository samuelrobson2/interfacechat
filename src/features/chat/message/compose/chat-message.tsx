import { useCallback, useState } from "react";

import {
  ChatDropdownMenu,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuTrigger,
} from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { DownloadIconNormal } from "@/shared/assets/icons/outlined/DownloadNormal";
import { cn } from "@/shared/lib/css";
import { useChatContext } from "../../_model/store/chat-store";
import { useChatSelectionUtils } from "../../_model/use-chat-selection";
import { useIsLastAssistantMessage } from "../../_model/use-last-message";
import {
  ChatAssistantClearSelectionButton,
  ChatAssistantHighlightIndicator,
} from "../../_ui/chat-highlight-buttons";
import { ChatAiAvatar } from "../../_ui/chat-ai-avatar";
import { ChatQuoteBlock } from "../../_ui/chat-layout";
import { ChatMessageImages } from "../../images/compose/chat-message-images";
import { ChatFollowupSuggestions } from "../../suggestions/compose/chat-followup-suggestions";
import { useDownloadMessagePdf } from "../model/use-download-message-pdf";
import { useRegenerateMessage } from "../model/use-regenerate-message";
import {
  ChatAssistantActionsButton,
  ChatAssistantButtonsLayout,
  ChatAssistantMessage,
  ChatAssistantMessageLayout,
  ChatAssistantRefreshButton
} from "../ui/chat-assistant-message";
import {
  ChatUserMessage,
  ChatUserMessageLayout,
} from "../ui/chat-user-message";

const SIDE_PANEL_GAP = 16;
const AVATAR_HEIGHT = 36;

export function ChatMessage({
  message,
}: {
  message: ApiSchemas["ChatMessageDto"];
}) {
  const isGenerating = useChatContext((state) => state.isGenerating);
  const isTextGenerating = useChatContext((state) => state.isTextGenerating);
  const selectedText = useChatContext((state) => state.selectedText);
  const isRegenerating = useChatContext((state) => state.isRegenerating);
  const isHighlightModeActive = useChatContext(
    (state) => state.isHighlightModeActive,
  );
  const setIsHighlightModeActive = useChatContext(
    (state) => state.setIsHighlightModeActive,
  );
  const highlightSuggestionSide = useChatContext(
    (state) => state.highlightSuggestionSide,
  );
  const highlightSuggestionPlacement = useChatContext(
    (state) => state.highlightSuggestionPlacement,
  );
  const highlightSelectionOffsetY = useChatContext(
    (state) => state.highlightSelectionOffsetY,
  );
  const { regenerate } = useRegenerateMessage();
  const { clearSelection, selectCodeBlock } = useChatSelectionUtils();
  const { downloadMessagePdf, isDownloadingPdf } = useDownloadMessagePdf();

  const handleDownloadPdf = (event: Event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
      void downloadMessagePdf(message.message_id);
    });
  };

  const isLastAssistantMessage = useIsLastAssistantMessage(message.message_id);
  const hasActiveHighlight = isLastAssistantMessage && Boolean(selectedText);
  const isHighlightIndicatorActive = hasActiveHighlight || isHighlightModeActive;
  const isFailed = message.metadata?.status === "failed";

  const handleToggleHighlight = () => {
    if (isHighlightIndicatorActive) {
      setIsHighlightModeActive(false);
      clearSelection();
      return;
    }

    setIsHighlightModeActive(true);
  };

  // Measure quote block to push the right-side suggestions below it when the
  // highlight starts near the top of the message and would overlap.
  const [quoteBlockHeight, setQuoteBlockHeight] = useState(0);
  const handleQuoteBlockRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    setQuoteBlockHeight(el.offsetHeight);
    const observer = new ResizeObserver(() => {
      setQuoteBlockHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleRefresh = () => {
    clearSelection();
    regenerate(message.message_id);
  };

  if (message.role === "user") {
    return (
      <ChatUserMessageLayout
        key={message.message_id}
        data-message-id={message.message_id}
        data-role={message.role}
      >
        <ChatUserMessage text={message.content} />
      </ChatUserMessageLayout>
    );
  }

  const showLeftSuggestions =
    hasActiveHighlight && highlightSuggestionSide === "left";
  const showRightSuggestions =
    hasActiveHighlight && highlightSuggestionSide === "right";

  // When there's not enough room below the selection we flip suggestions to
  // sit above the selection line via a translate (no clamping needed since
  // the suggestions grow upward from the offset).
  const isAbovePlacement = highlightSuggestionPlacement === "above";
  const suggestionsPositionClass = isAbovePlacement
    ? "absolute inset-x-0 -translate-y-full -mt-2"
    : "absolute inset-x-0";
  const leftSuggestionsTop = isAbovePlacement
    ? (highlightSelectionOffsetY ?? 0)
    : Math.max(highlightSelectionOffsetY ?? 0, AVATAR_HEIGHT + SIDE_PANEL_GAP);
  const rightSuggestionsTop = isAbovePlacement
    ? (highlightSelectionOffsetY ?? 0)
    : Math.max(
        highlightSelectionOffsetY ?? 0,
        quoteBlockHeight + SIDE_PANEL_GAP,
      );

  return (
    <ChatAssistantMessageLayout
      key={message.message_id}
      data-message-id={message.message_id}
      data-role={message.role}
    >
      <div
        data-slot={`chat-message-export-${message.message_id}`}
        className="relative flex flex-col gap-4"
      >
        <aside className="absolute right-full top-0 mr-4 w-[292px]">
          <ChatAiAvatar
            active={isLastAssistantMessage && isGenerating}
            preload={isLastAssistantMessage}
            className="pointer-events-none absolute right-0 top-0 w-[50px] select-none"
          />
          {showLeftSuggestions && (
            <div
              className={suggestionsPositionClass}
              style={{ top: leftSuggestionsTop }}
            >
              <ChatFollowupSuggestions
                key={`${message.message_id}-${selectedText ?? ""}`}
                anchorMessageId={message.message_id}
              />
            </div>
          )}
        </aside>
        <aside className="absolute left-full top-0 ml-4 w-[292px]">
          <ChatQuoteBlock
            ref={handleQuoteBlockRef}
            quote={message.metadata?.quote?.quote}
            author={message.metadata?.quote?.author}
          />
          {showRightSuggestions && (
            <div
              className={suggestionsPositionClass}
              style={{ top: rightSuggestionsTop }}
            >
              <ChatFollowupSuggestions
                key={`${message.message_id}-${selectedText ?? ""}`}
                anchorMessageId={message.message_id}
              />
            </div>
          )}
        </aside>
        <ChatAssistantMessage
          className={cn(
            isLastAssistantMessage &&
              "selection:bg-(--chat-selection-highlight) selection:text-typography-primary",
          )}
          messageId={message.message_id}
          answer={message.content}
          selectCodeBlock={selectCodeBlock}
          isHighlightActive={isLastAssistantMessage}
          isStreaming={isLastAssistantMessage && isTextGenerating}
          imageAnchor={message.metadata?.image_plan?.text_anchor}
          imagesSlot={<ChatMessageImages message={message} />}
        />
      </div>
      {message.api_preview_url && (
        <iframe
          src={message.api_preview_url}
          title="Generated app preview"
          className="w-full min-h-[600px] h-full rounded-[16px]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          loading="lazy"
        />
      )}

      {isLastAssistantMessage && !isTextGenerating && !isFailed && (
        <div
          className={cn(
            "flex flex-col gap-6",
            isRegenerating && "opacity-50 pointer-events-none",
          )}
        >
          <ChatAssistantButtonsLayout>
            <div className="flex items-center gap-3">
              <ChatAssistantHighlightIndicator
                active={isHighlightIndicatorActive}
                onClick={handleToggleHighlight}
              />
              {hasActiveHighlight && (
                <ChatAssistantClearSelectionButton
                  onClick={() => clearSelection()}
                />
              )}
              <ChatAssistantRefreshButton onClick={handleRefresh} />
              <ChatDropdownMenu>
                <ChatDropdownMenuTrigger asChild>
                  <ChatAssistantActionsButton disabled={isDownloadingPdf} />
                </ChatDropdownMenuTrigger>
                <ChatDropdownMenuContent align="start" side="top">
                  <ChatDropdownMenuItem
                    onSelect={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                  >
                    <DownloadIconNormal
                      svgClasses="size-4"
                      pathClasses="stroke-icon-primary"
                    />
                    Download as PDF
                  </ChatDropdownMenuItem>
                </ChatDropdownMenuContent>
              </ChatDropdownMenu>
            </div>
          </ChatAssistantButtonsLayout>
        </div>
      )}
    </ChatAssistantMessageLayout>
  );
}
