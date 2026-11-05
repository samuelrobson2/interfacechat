import { CONFIG } from "@/shared/model/config";
import { useState } from "react";

const DATASET_FILE_FORMATS = {
  csv: "csv",
  json: "json",
  jsonl: "jsonl",
  parquet: "parquet",
} as const;

export type DatasetFileFormat =
  (typeof DATASET_FILE_FORMATS)[keyof typeof DATASET_FILE_FORMATS];

interface DatasetDownloadOption {
  title: string;
  value: DatasetFileFormat;
}

const downloadOptions: DatasetDownloadOption[] = [
  { title: ".csv", value: DATASET_FILE_FORMATS.csv },
  { title: ".json", value: DATASET_FILE_FORMATS.json },
  { title: ".jsonl", value: DATASET_FILE_FORMATS.jsonl },
  { title: ".parquet", value: DATASET_FILE_FORMATS.parquet },
];

export function useDatasetDownload() {
  const [isPending, setIsPending] = useState(false);
  const error = null;

  const downloadDataset = ({
    datasetId,
    fileFormat,
    datasetName = "export",
  }: {
    datasetId?: string;
    fileFormat: DatasetFileFormat;
    datasetName?: string;
  }) => {
    if (!datasetId) return;
    void datasetName;

    const url =
      `${CONFIG.API_BASE_URL}/datasets/${encodeURIComponent(datasetId)}/download` +
      `?fileFormat=${encodeURIComponent(fileFormat)}`;

    setIsPending(true);
    window.location.href = url;
    window.setTimeout(() => setIsPending(false), 800);
  };

  return { downloadOptions, downloadDataset, isPending, error };
}
