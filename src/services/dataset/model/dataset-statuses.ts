export const DATASET_STATUSES = {
  uploading: "uploading",
  processing: "processing",
  awaiting_preprocessing: "awaiting_preprocessing",
  extracting_documents: "extracting_documents",
  preprocessing_completed: "preprocessing_completed",
  preprocessing_failed: "preprocessing_failed",
  awaiting_column_selection: "awaiting_column_selection",
  processing_metadata: "processing_metadata",
  configuring: "configuring",
  launching: "launching",
  ready: "ready",
  failed: "failed",
} as const;

export type DatasetStatus =
  (typeof DATASET_STATUSES)[keyof typeof DATASET_STATUSES];

export const mapDatasetStatusToLabel: Record<DatasetStatus, string> = {
  [DATASET_STATUSES.uploading]: "Data Uploading",
  [DATASET_STATUSES.processing]: "Data Uploaded",
  [DATASET_STATUSES.extracting_documents]: "Extracting documents",
  [DATASET_STATUSES.awaiting_preprocessing]: "Awaiting preprocessing",
  [DATASET_STATUSES.preprocessing_completed]: "Preprocessing complete",
  [DATASET_STATUSES.preprocessing_failed]: "Preprocessing failed",
  [DATASET_STATUSES.awaiting_column_selection]: "Data Configuration",
  [DATASET_STATUSES.processing_metadata]: "Recipe Selection",
  [DATASET_STATUSES.configuring]: "Recipe Selection",
  [DATASET_STATUSES.launching]: "Job Launched",
  [DATASET_STATUSES.ready]: "Job Completed",
  [DATASET_STATUSES.failed]: "Job Failed",
};

const datasetStatusesList = Object.entries(DATASET_STATUSES)
  .filter(([, value]) => value !== DATASET_STATUSES.configuring)
  .map(([key, value]) => ({
    label: mapDatasetStatusToLabel[value],
    value: key,
  }));

export const datasetStatuses = [
  {
    label: "All",
    value: "",
  },
  ...datasetStatusesList,
];
