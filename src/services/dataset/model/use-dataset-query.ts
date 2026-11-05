import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { datasetQueryOptions } from "./dataset-query-options";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export function useDatasetExportLinksQuery() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return useQuery(datasetQueryOptions.datasetExportLinks(dataset_id!));
}

export function useDatasetQuery() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useQuery(datasetQueryOptions.dataset(dataset_id!));

  return query;
}

export function useDatasetSuspenseQuery() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useSuspenseQuery(datasetQueryOptions.dataset(dataset_id!));

  return query;
}

export function useDatasetCache() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const dataset = queryClient.getQueryData<ApiSchemas["DatasetDto"]>(
    datasetQueryOptions.dataset(dataset_id!).queryKey,
  );

  return dataset;
}

export function useDatasetSnippetQuery(datasetId: string) {
  return useSuspenseQuery(datasetQueryOptions.datasetSnippet(datasetId));
}
