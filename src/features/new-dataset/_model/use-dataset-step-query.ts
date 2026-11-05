import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { datasetQueryOptions } from "@/services/dataset";
import type { NewDatasetKeys } from "../_lib/new-dataset-routes";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";

export type DatasetStepResponse<T extends NewDatasetKeys> = T extends "summary"
  ? ApiSchemas["Step"][]
  : ApiSchemas["DatasetStepResponseDto"];

export function useDatasetStepQuery<T extends NewDatasetKeys>(stepKey: T) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useQuery(datasetQueryOptions.step(dataset_id!, stepKey));

  return query as Omit<typeof query, "data"> & {
    data: DatasetStepResponse<T> | undefined;
  };
}

export function useDatasetStepSuspenseQuery<T extends NewDatasetKeys>(
  stepKey: T,
) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useSuspenseQuery(
    datasetQueryOptions.step(dataset_id!, stepKey),
  );

  return query as Omit<typeof query, "data"> & {
    data: DatasetStepResponse<T>;
  };
}

export function useDatasetStepCache<T extends NewDatasetKeys>(stepKey: T) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const data = queryClient.getQueryData<DatasetStepResponse<T>>(
    datasetQueryOptions.step(dataset_id!, stepKey).queryKey,
  );

  return data;
}
