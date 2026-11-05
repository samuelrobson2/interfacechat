import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHeldValue } from "@/shared/lib/react/use-held-value";
import {
  ChatBubbleSuggestions,
  ChatComposerInput,
  ChatComposerShell,
  ChatSuggestionsBoundary,
  type BubbleSuggestionsVariant,
} from "../pharos/chat";
import { ChatTurnSuggestions } from "../pharos/chat-feature/suggestions/compose/chat-turn-suggestions";
import { chatLabQueryOptions } from "../model/chat-lab-api";
import { useChatLabSession } from "../model/chat-lab-session";
import { findLatestMessage } from "../model/chat-lab-store";

/**
 * Ported from pharos `ChatInputComposer`: the suggestion cards fold into the
 * input bar, anchored to the latest assistant answer.
 */
export function ChatLabComposer({
  inputLayoutRef,
}: {
  inputLayoutRef: (element: HTMLDivElement | null) => void;
}) {
  const {
    sessionId,
    messages,
    status,
    isGenerating,
    isTextGenerating,
    sendText,
    stop,
  } = useChatLabSession();
  const [failedSuggestionsMessageId, setFailedSuggestionsMessageId] = useState<
    string | null
  >(null);

  const latestAssistantMessage = findLatestMessage(messages, "assistant");
  const shouldRenderSuggestions =
    !!latestAssistantMessage && status !== "error" && !isTextGenerating;

  // The streaming reply becomes the latest message as soon as a turn starts,
  // so the rail stays on the answer it was showing until the turn settles.
  const anchorMessageId = useHeldValue(
    shouldRenderSuggestions ? latestAssistantMessage?.id : undefined,
    isGenerating,
  );
  const { data: cachedSuggestions = [] } = useQuery({
    ...chatLabQueryOptions.followups(sessionId, anchorMessageId, messages),
    enabled: false,
  });
  const canRenderSuggestions =
    !!anchorMessageId && failedSuggestionsMessageId !== anchorMessageId;

  const renderBusySuggestions = (variant: BubbleSuggestionsVariant) => (
    <ChatBubbleSuggestions
      suggestions={cachedSuggestions}
      variant={variant}
      disabled
    />
  );

  const renderLiveSuggestions = (variant: BubbleSuggestionsVariant) => (
    <ChatSuggestionsBoundary
      resetKey={anchorMessageId!}
      onFailed={setFailedSuggestionsMessageId}
      variant={variant}
    >
      <ChatTurnSuggestions anchorMessageId={anchorMessageId!} variant={variant} />
    </ChatSuggestionsBoundary>
  );

  const getSuggestionsSlot = () => {
    if (isGenerating) {
      return cachedSuggestions.length ? renderBusySuggestions : undefined;
    }
    return canRenderSuggestions ? renderLiveSuggestions : undefined;
  };

  const suggestionsSlot = getSuggestionsSlot();

  return (
    <ChatComposerShell
      ref={inputLayoutRef}
      input={(slotProps) => (
        <ChatComposerInput
          {...slotProps}
          onSubmit={(text) => void sendText(text)}
          onStop={() => void stop()}
          isStoppable={isGenerating}
          isSubmitDisabled={isGenerating}
        />
      )}
      suggestions={suggestionsSlot}
      hasNoSuggestions={!suggestionsSlot}
    />
  );
}
