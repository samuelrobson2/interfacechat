import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHeldValue } from "@/shared/lib/react/use-held-value";
import {
  ChatBubbleSuggestions,
  ChatComposerInput,
  ChatComposerShell,
  ChatInputLayout,
  ChatSuggestionsBoundary,
  type BubbleSuggestionsVariant,
} from "../pharos/chat";
import { ChatComposerTools } from "@/shared/ui/kit-additions";
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
  mode = "full",
}: {
  inputLayoutRef?: (element: HTMLDivElement | null) => void;
  /**
   * "full" has the suggestion cards, and needs a wide Chat. "compact" is the
   * input alone at the bottom of a narrower Chat. "floating" is the input on
   * the page, while Chat is minimized.
   */
  mode?: "full" | "compact" | "floating";
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

  if (mode !== "full") {
    const field = (
      <ChatInputLayout className="pointer-events-auto shadow-[0_4px_16px_rgba(26,23,24,0.06)]">
        <ChatComposerInput
          leftActions={<ChatComposerTools />}
          onSubmit={(text) => void sendText(text)}
          onStop={() => void stop()}
          isStoppable={isGenerating}
          isSubmitDisabled={isGenerating}
        />
      </ChatInputLayout>
    );
    if (mode === "floating") return field;
    return (
      <div ref={inputLayoutRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pt-4 pb-2">
        <div className="mx-auto w-full max-w-[660px]">{field}</div>
      </div>
    );
  }

  return (
    <ChatComposerShell
      ref={inputLayoutRef}
      input={(slotProps) => (
        <ChatComposerInput
          {...slotProps}
          leftActions={<ChatComposerTools />}
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
