import { clearPendingChatMessage, getPendingChatMessage } from "@/services/chat";

import type { PendingVisualization } from "../_lib/pending-visualization";
import { useSendMessage } from "./use-send-message";

/** Replays the prompt the landing page stashed before the session existed. */
export function useNewVisualization() {
  const { sendChartTurn } = useSendMessage();

  const checkPendingVisualization = () => {
    const pending = getPendingChatMessage<PendingVisualization>();
    if (!pending?.prompt) return;

    clearPendingChatMessage();
    sendChartTurn({
      text: pending.prompt,
      ...(pending.quickInsightSuggestionId
        ? { quickInsightSuggestionId: pending.quickInsightSuggestionId }
        : { instruction: pending.prompt }),
    });
  };

  return { checkPendingVisualization };
};
