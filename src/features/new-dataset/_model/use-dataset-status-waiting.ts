import {
  DATASET_STATUSES,
  datasetQueryOptions,
  type DatasetStatus,
} from "@/services/dataset";
import { ApiError } from "@/shared/api/api-error";
import type { ApiSchemas } from "@/shared/api/schema";
import { type DatasetRoutes, type PathParams } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { NewDatasetKeys } from "../_lib/new-dataset-routes";

export type WaitingStepKeys = Extract<NewDatasetKeys, "mapping" | "diagnosis">;

const validMappingStatuses: DatasetStatus[] = [
  DATASET_STATUSES.awaiting_column_selection,
  DATASET_STATUSES.processing_metadata,
  DATASET_STATUSES.preprocessing_completed,
  DATASET_STATUSES.configuring,
  DATASET_STATUSES.launching,
  DATASET_STATUSES.ready,
];
const validDiagnosisStatuses: DatasetStatus[] = [
  DATASET_STATUSES.configuring,
  DATASET_STATUSES.launching,
  DATASET_STATUSES.ready,
];

const mapStepKeyToStatuses: Record<WaitingStepKeys, DatasetStatus[]> = {
  mapping: validMappingStatuses,
  diagnosis: validDiagnosisStatuses,
};

function getStatusValidity(
  stepKey: WaitingStepKeys,
  data?: ApiSchemas["DatasetDto"],
) {
  if (!data) return false;
  if (
    data.status === DATASET_STATUSES.failed ||
    data.status === DATASET_STATUSES.preprocessing_failed
  ) {
    return false;
  }
  return mapStepKeyToStatuses[stepKey].includes(data.status);
}

export const DATASET_UPLOAD_FAILED_CODE = "DATASET_UPLOAD_FAILED";
const DATASET_UPLOAD_FAILED_FALLBACK =
  "We're sorry, but something unexpected happened. Please try upload dataset again.";

function getUploadErrorMessage(data?: ApiSchemas["DatasetDto"]) {
  return (
    data?.error_data?.message ||
    data?.error_message ||
    DATASET_UPLOAD_FAILED_FALLBACK
  );
}

export function checkDatasetStatus(data?: ApiSchemas["DatasetDto"]) {
  if (
    data?.status === DATASET_STATUSES.failed ||
    data?.status === DATASET_STATUSES.preprocessing_failed
  ) {
    throw new ApiError(new Response(), {
      statusCode: 500,
      code: DATASET_UPLOAD_FAILED_CODE,
      message: getUploadErrorMessage(data),
      error: "Dataset upload failed",
    });
  }
}

export function useDatasetStatusWaiting(stepKey: WaitingStepKeys) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { data } = useSuspenseQuery({
    ...datasetQueryOptions.dataset(dataset_id!),
    refetchInterval: (query) =>
      getStatusValidity(stepKey, query.state.data) ? false : 3000,
  });

  checkDatasetStatus(data);

  return {
    isStatusValid: getStatusValidity(stepKey, data),
  };
}
