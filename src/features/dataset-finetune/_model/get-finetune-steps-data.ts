import { datasetQueryOptions } from "@/services/dataset";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";

export async function getFinetuneStepsData(
  datasetId: string,
  withCache = false,
) {
  if (withCache) {
    const cachedData =
      queryClient.getQueryData<ApiSchemas["FinetuneStepsResponseDto"]>(
        datasetQueryOptions.finetuneSteps(datasetId).queryKey,
      );
    if (cachedData) return cachedData;
  }

  return queryClient.fetchQuery({
    ...datasetQueryOptions.finetuneSteps(datasetId),
    // Force a network read when caller asks for fresh steps.
    // Otherwise fetchQuery can reuse "fresh" cached data due staleTime.
    staleTime: 0,
  });
}
