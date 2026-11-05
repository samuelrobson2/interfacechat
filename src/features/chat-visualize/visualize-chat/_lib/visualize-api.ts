import { toTargetPayload, type PlotTarget } from "@/services/plot";
import type { ApiSchemas } from "@/shared/api/schema";

type ChatMessage = ApiSchemas["ChatMessageDto"];

export type VisualizeTurnResult = {
  kind: "chart" | "discuss";
  title: string;
  text_before: string;
  text_after: string;
  spec: Record<string, unknown> | null;
  plot_data: Record<string, unknown>[];
  followups: string[];
};

export async function requestVisualizeTurn({
  prompt,
  messages,
  currentSpec,
  currentData,
  target,
  datasetName,
}: {
  prompt: string;
  messages: ChatMessage[];
  currentSpec?: Record<string, unknown> | null;
  currentData?: Record<string, unknown>[] | null;
  target?: PlotTarget | null;
  datasetName?: string | null;
}): Promise<VisualizeTurnResult> {
  const res = await fetch("/api/visualize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prompt,
      datasetName,
      history: messages.slice(-10).map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content:
          message.content || message.text_before || message.text_after || "",
      })),
      currentSpec: currentSpec ?? null,
      currentData: currentData ?? null,
      target: target ? toTargetPayload(target) : null,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return (await res.json()) as VisualizeTurnResult;
}
