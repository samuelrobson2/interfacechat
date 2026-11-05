import { useChatContext, useChatStoreApi, userMessageSentEvent } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import type { PlotTarget } from "@/services/plot";
import { requestVisualizeTurn } from "../_lib/visualize-api";
import { useVisualizeStore } from "../_lib/visualize-session-store";
import { useChartSession, useChartSessionId } from "./use-chart-session";

type ChatMessage = ApiSchemas["ChatMessageDto"];

const buildUserMessage = (
  sessionId: string,
  content: string,
): ChatMessage => ({
  message_id: crypto.randomUUID(),
  session_id: sessionId,
  role: "user",
  content,
  created_at: new Date().toISOString(),
  attachments: [],
});

const lastChart = (messages: ChatMessage[]) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const chart = messages[index]?.chart;
    if (chart?.spec) return chart;
  }
  return undefined;
};

const chartById = (messages: ChatMessage[], chartId: string) =>
  messages.find((message) => message.chart?.chart_id === chartId)?.chart;

export function useSendMessage() {
  const sessionId = useChartSessionId();
  const { data: session } = useChartSession();
  const storeApi = useChatStoreApi();
  const addMessage = useChatContext((state) => state.addMessage);
  const setIsGenerating = useChatContext((state) => state.setIsGenerating);
  const isGenerating = useChatContext((state) => state.isGenerating);
  const appendMessage = useVisualizeStore((state) => state.appendMessage);
  const patchSession = useVisualizeStore((state) => state.patchSession);

  const runTurn = async ({
    text,
    instruction,
    chartId,
    target,
  }: {
    text: string;
    instruction?: string;
    chartId?: string;
    target?: PlotTarget;
  }) => {
    const userMessage = buildUserMessage(sessionId, text);
    addMessage(userMessage);
    appendMessage(sessionId, userMessage);
    userMessageSentEvent.emit(userMessage.message_id);

    setIsGenerating(true);
    patchSession(sessionId, { generation_status: "generating" });

    try {
      const messages = storeApi.getState().messages;
      const focus = chartId ? chartById(messages, chartId) : lastChart(messages);
      const result = await requestVisualizeTurn({
        prompt: instruction ?? text,
        messages,
        currentSpec: (focus?.spec as Record<string, unknown> | undefined) ?? null,
        currentData: (focus?.plot_data as Record<string, unknown>[] | undefined) ?? null,
        target,
        datasetName: session?.dataset?.name,
      });

      const assistantMessage: ChatMessage = {
        message_id: crypto.randomUUID(),
        session_id: sessionId,
        role: "assistant",
        content: result.text_before,
        created_at: new Date().toISOString(),
        attachments: [],
        orchestrator_kind: result.kind === "discuss" ? "discuss" : "chart",
        text_before: result.text_before,
        text_after: result.text_after,
        chart:
          result.spec && result.kind === "chart"
            ? {
                chart_id: crypto.randomUUID(),
                status: "ready",
                spec: result.spec,
                plot_data: result.plot_data,
                show_on_dataset: false,
              }
            : null,
        followups: {
          followup_set_id: crypto.randomUUID(),
          suggestions: result.followups.map((followup) => ({
            id: crypto.randomUUID(),
            text: followup,
          })),
        },
      };

      addMessage(assistantMessage);
      appendMessage(sessionId, assistantMessage);
      patchSession(sessionId, {
        generation_status: "idle",
        title: result.title || session?.title,
      });
    } catch (error) {
      patchSession(sessionId, { generation_status: "failed" });
      toast.error(
        error instanceof Error
          ? error.message
          : "The chart could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChartTurn = async ({
    instruction,
    text,
  }: {
    instruction?: string;
    text: string;
    followupSuggestionId?: string;
    quickInsightSuggestionId?: string;
  }) => runTurn({ text, instruction });

  const sendChartEdit = async ({
    chartId,
    target,
    instruction,
  }: {
    chartId: string;
    target: PlotTarget;
    instruction: string;
  }) => runTurn({ text: instruction, instruction, chartId, target });

  return {
    sendChartTurn,
    sendChartEdit,
    isSendingGenerate: isGenerating,
    isSendingEdit: isGenerating,
  };
}
