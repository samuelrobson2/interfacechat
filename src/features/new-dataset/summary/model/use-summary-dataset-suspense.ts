import {
  datasetQueryOptions,
  isDatasetReady,
  type DatasetStatus,
} from "@/services/dataset";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export function useSummaryDatasetSuspense() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { data: dataset } = useSuspenseQuery(
    datasetQueryOptions.dataset(dataset_id!),
  );

  const isLaunched = isDatasetReady(dataset.status as DatasetStatus);

  return { dataset, isLaunched };
}
