import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { datasetQueryOptions } from "./dataset-query-options";

export function useFinetuneModelsQuery(datasetId: string) {
  return useQuery(datasetQueryOptions.finetuneModels(datasetId));
}

export function useFinetuneModelsSuspenseQuery(datasetId: string) {
  return useSuspenseQuery(datasetQueryOptions.finetuneModels(datasetId));
}
