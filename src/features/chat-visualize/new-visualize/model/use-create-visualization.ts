import { href, useNavigate } from "react-router-dom";

import { savePendingChatMessage } from "@/services/chat";
import { ROUTES } from "@/shared/model/routes";
import type { PendingVisualization } from "../../visualize-chat/_lib/pending-visualization";
import { createVisualizeSession } from "../../visualize-chat/_lib/visualize-session-store";
import { isSampleDatasetId, SAMPLE_DATASET } from "./sample-visualize";
import { useVisualizeDatasets } from "./use-visualize-datasets";

type CreateVisualizationInput = {
  prompt: string;
  datasetId?: string;
  quickInsightSuggestionId?: string;
};

export function useCreateVisualization() {
  const navigate = useNavigate();
  const { datasets } = useVisualizeDatasets();

  const createVisualization = ({
    prompt,
    datasetId,
    quickInsightSuggestionId,
  }: CreateVisualizationInput) => {
    const dataset = datasetId
      ? datasets.find((item) => item.id === datasetId)
      : undefined;

    const record = createVisualizeSession({
      title: prompt.trim().slice(0, 80) || "Untitled chart",
      dataset:
        datasetId && dataset
          ? { dataset_id: dataset.id, name: dataset.name }
          : datasetId && isSampleDatasetId(datasetId)
            ? { dataset_id: SAMPLE_DATASET.id, name: SAMPLE_DATASET.name }
            : null,
    });

    savePendingChatMessage<PendingVisualization>({
      prompt,
      quickInsightSuggestionId,
    });
    navigate(href(ROUTES.CHAT_VISUALIZE_SESSION, { chat_id: record.session.session_id }));
  };

  const startBlankSession = () => {
    const record = createVisualizeSession({ title: "Untitled chart" });
    navigate(href(ROUTES.CHAT_VISUALIZE_SESSION, { chat_id: record.session.session_id }));
  };

  return { createVisualization, startBlankSession, isPending: false };
}
