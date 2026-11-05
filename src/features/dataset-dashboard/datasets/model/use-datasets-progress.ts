import { datasetQueryOptions } from "@/services/dataset";
import { DEMO_MODE, DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { useQuery } from "@tanstack/react-query";

// Live progress polling is a nice-to-have on top of the dataset list's own
// progress_percentage — it must never crash the page (the QueryClient default
// is throwOnError: true), and it's pointless against mock dataset ids anyway.
const SKIP_PROGRESS_POLLING = DEMO_MODE || DEV_AUTH_BYPASS;

export function useDatasetsProgress(dataset_ids: string[]) {
  const { data } = useQuery({
    ...datasetQueryOptions.datasetProgress(dataset_ids),
    refetchInterval: (query) =>
      query.state.data?.datasets.every(
        (dataset) => dataset.progress_percentage === 100,
      )
        ? false
        : 10000,
    enabled: dataset_ids.length > 0 && !SKIP_PROGRESS_POLLING,
    throwOnError: false,
  });
  const datasetsProgressMap = useOptionsMap(data?.datasets, "dataset_id");

  return datasetsProgressMap;
}
