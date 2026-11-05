import { datasetQueryOptions } from "@/services/dataset";
import { VISUALIZE_DATASET_PARAM } from "@/shared/model/routes";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { isSampleDatasetId, SAMPLE_DATASET } from "./sample-visualize";
import type { VisualizeDataset } from "./use-visualize-datasets";
import { useVisualizeDatasets } from "./use-visualize-datasets";

/**
 * The picked dataset lives in the URL so both entry points (homepage and a
 * dataset's Measure tab) render the very same page.
 */
export function useSelectedDatasetId() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectDataset = (datasetId: string) => {
    setSearchParams(
      (params) => {
        params.set(VISUALIZE_DATASET_PARAM, datasetId);
        return params;
      },
      { replace: true },
    );
  };

  return {
    selectedDatasetId: searchParams.get(VISUALIZE_DATASET_PARAM) ?? undefined,
    selectDataset,
  };
}

export function useSelectedDataset(): VisualizeDataset | undefined {
  const { selectedDatasetId } = useSelectedDatasetId();
  const { datasets } = useVisualizeDatasets();

  const datasetFromFeed = datasets.find(
    (dataset) => dataset.id === selectedDatasetId,
  );

  // The picker feed only lists chartable datasets, so a freshly imported one
  // (Adaptive Data still pending) has to be read on its own.
  const { data: dataset } = useQuery({
    ...datasetQueryOptions.dataset(selectedDatasetId!),
    enabled:
      Boolean(selectedDatasetId) &&
      !datasetFromFeed &&
      !isSampleDatasetId(selectedDatasetId),
    retry: false,
    throwOnError: false,
  });

  if (datasetFromFeed) return datasetFromFeed;
  if (isSampleDatasetId(selectedDatasetId)) return SAMPLE_DATASET;
  if (!dataset) return undefined;

  return { id: dataset.dataset_id, name: dataset.name, domain: "" };
}
