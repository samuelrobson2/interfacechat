import { datasetQueryOptions } from "@/services/dataset";
import { queryClient } from "@/shared/api/query-client";
import { NEW_DATASET_KEYS } from "./new-dataset-routes";

export function invalidateRecipesAndBrandStepQueries(dataset_id: string) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: datasetQueryOptions.step(
        dataset_id,
        NEW_DATASET_KEYS.recipes,
      ).queryKey,
      refetchType: "all",
    }),
    queryClient.invalidateQueries({
      queryKey: datasetQueryOptions.step(dataset_id, NEW_DATASET_KEYS.brand)
        .queryKey,
      refetchType: "all",
    }),
  ]);
}
