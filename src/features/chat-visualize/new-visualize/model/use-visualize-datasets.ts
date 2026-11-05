import { datasetQueryOptions } from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { SAMPLE_DATASET } from "./sample-visualize";

/** The picker shows three rows at a time, so pages stay small and scroll pulls more. */
const VISUALIZE_DATASETS_PAGE_SIZE = 20;

export type VisualizeDataset = {
  id: string;
  name: string;
  domain: string;
};

const toVisualizeDataset = (
  dataset: Pick<
    ApiSchemas["DatasetListItemDto"],
    "dataset_id" | "name" | "metadata"
  >,
): VisualizeDataset => ({
  id: dataset.dataset_id,
  name: dataset.name,
  domain: dataset.metadata?.dataset_top_domain ?? "",
});

const datasetsPageOptions = (page: number) =>
  datasetQueryOptions.datasets({
    page,
    perPage: VISUALIZE_DATASETS_PAGE_SIZE,
    forChart: true,
  });

export const visualizeDatasetsOptions = infiniteQueryOptions({
  queryKey: [...datasetsPageOptions(1).queryKey, "infinite"] as const,
  initialPageParam: 1,
  queryFn: (context) => {
    const { queryKey, queryFn } = datasetsPageOptions(context.pageParam);
    return queryFn({ ...context, queryKey });
  },
  getNextPageParam: (lastPage, allPages) => {
    const loaded = allPages.reduce(
      (count, page) => count + page.datasets.length,
      0,
    );
    return loaded < lastPage.total ? allPages.length + 1 : undefined;
  },
  select: (data) =>
    data.pages
      .flatMap((page) => page.datasets)
      .filter((dataset) => !dataset.has_pinned_charts)
      .map(toVisualizeDataset),
});

export function useVisualizeDatasets() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...visualizeDatasetsOptions,
      retry: false,
      throwOnError: false,
    });

  const remote = data ?? [];

  return {
    datasets: [
      SAMPLE_DATASET,
      ...remote.filter((dataset) => dataset.id !== SAMPLE_DATASET.id),
    ],
    hasMore: Boolean(hasNextPage),
    isLoadingMore: isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
