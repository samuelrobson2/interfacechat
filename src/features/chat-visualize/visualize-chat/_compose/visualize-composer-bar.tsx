import { useState } from "react";

import {
  ChatComposerInput,
  ChatComposerShell,
  ChatSuggestionsBoundary,
  useLastAssistantMessage,
} from "@/services/chat";
import { useChartSessionId } from "../_model/use-chart-session";
import { useChartTurns } from "../_model/use-chart-turns";
import { useSendMessage } from "../_model/use-send-message";
import { VisualizeTurnSuggestions } from "../suggestions/compose/visualize-turn-suggestions";

export function VisualizeComposerBar({
  inputLayoutRef,
}: {
  inputLayoutRef: (element: HTMLDivElement | null) => void;
}) {
  const sessionId = useChartSessionId();
  const { sendChartTurn, isSendingGenerate } = useSendMessage();
  const { pendingProposal, isGenerating } = useChartTurns();
  const { lastAssistantMessageId: anchorMessageId } = useLastAssistantMessage();
  const [failedSuggestionsKey, setFailedSuggestionsKey] = useState<
    string | null
  >(null);

  const isBusy = isGenerating || Boolean(pendingProposal) || isSendingGenerate;
  const suggestionsKey = anchorMessageId ?? sessionId;
  const canRenderSuggestions =
    !isBusy && failedSuggestionsKey !== suggestionsKey;

  return (
    <ChatComposerShell
      ref={inputLayoutRef}
      input={(slotProps) => (
        <ChatComposerInput
          {...slotProps}
          placeholder="Ask something else"
          isSubmitDisabled={isBusy}
          isSubmitLoading={isSendingGenerate}
          onSubmit={(instruction) =>
            void sendChartTurn({ instruction, text: instruction })
          }
        />
      )}
      suggestions={
        canRenderSuggestions
          ? (variant) => (
              <ChatSuggestionsBoundary
                resetKey={suggestionsKey}
                onFailed={setFailedSuggestionsKey}
                variant={variant}
              >
                <VisualizeTurnSuggestions
                  variant={variant}
                  onApply={(suggestion) =>
                    void sendChartTurn({
                      text: suggestion.text,
                      followupSuggestionId: suggestion.id,
                    })
                  }
                />
              </ChatSuggestionsBoundary>
            )
          : undefined
      }
    />
  );
}
