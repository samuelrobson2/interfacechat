import { SAMPLE_VISUALIZE_SUGGESTIONS } from "./sample-visualize";
import { useCreateVisualization } from "./use-create-visualization";
import { useSelectedDatasetId } from "./use-selected-dataset";

export type VisualizeSuggestion =
  (typeof SAMPLE_VISUALIZE_SUGGESTIONS)[number];

export function useVisualizeSuggestions() {
  const { selectDataset } = useSelectedDatasetId();
  const { createVisualization } = useCreateVisualization();

  const applySuggestion = (suggestion: VisualizeSuggestion) => {
    selectDataset(suggestion.dataset_id);
    createVisualization({
      prompt: suggestion.text,
      datasetId: suggestion.dataset_id,
      quickInsightSuggestionId: suggestion.id,
    });
  };

  return {
    suggestions: SAMPLE_VISUALIZE_SUGGESTIONS,
    applySuggestion,
    showDatasetBadge: false,
    isPending: false,
    isError: false,
  };
}
