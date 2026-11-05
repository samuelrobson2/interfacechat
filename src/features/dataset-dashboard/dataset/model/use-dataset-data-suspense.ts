import {
  DATASET_STATUSES,
  useDatasetSuspenseQuery,
} from "@/services/dataset";

export function useDatasetDataSuspense() {
  const { data: dataset } = useDatasetSuspenseQuery();

  const isPreprocessingFailed = dataset.status === DATASET_STATUSES.preprocessing_failed;
  const isFailed =
    dataset.status === DATASET_STATUSES.failed ||
    isPreprocessingFailed
  const failedErrorMessage =
    dataset?.error_data?.message ||
    dataset?.error_message ||
    "Something went wrong while processing your dataset. Please verify the data and try again.";

  return {
    dataset,
    isFailed,
    isPreprocessingFailed,
    failedErrorMessage,
  };
}
