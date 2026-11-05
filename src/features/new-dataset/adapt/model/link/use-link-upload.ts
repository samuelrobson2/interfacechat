import type { ImportSourceProvider } from "@/services/settings";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useTransition } from "react";
import { useAdaptReturn } from "../use-adapt-return";
import { useLinkImportStore } from "./link-import-store";
import { useDatasetUploadProgress } from "./use-dataset-upload-progress";

export function useLinkUpload() {
  const { navigateAfterUpload } = useAdaptReturn();
  const setDatasetId = useLinkImportStore((state) => state.setDatasetId);
  const resetDatasetsDialog = useLinkImportStore(
    (state) => state.resetDatasetsDialog,
  );

  const [isUploadPending, startTransition] = useTransition();

  const {
    mutateAsync: uploadHuggingface,
    error: errorHuggingface,
    reset: resetHuggingface,
  } = rqClient.useMutation("post", "/datasets/upload/huggingface");
  const {
    mutateAsync: uploadKaggle,
    error: errorKaggle,
    reset: resetKaggle,
  } = rqClient.useMutation("post", "/datasets/upload/kaggle");

  const {
    handleDatasetUploadProgress,
    isLoading: isDatasetUploadingProgress,
    filesProgress: datasetFilesProgress,
    error: errorProgress,
    reset: resetDatasetUploadProgress,
  } = useDatasetUploadProgress();

  function resetUpload() {
    resetHuggingface();
    resetKaggle();
    resetDatasetUploadProgress();
  }

  async function onUploadSuccess() {
    const datasetId = useLinkImportStore.getState().datasetId;
    navigateAfterUpload(datasetId!);
    resetUpload();
    resetDatasetsDialog();
  }

  async function uploadDatasets(
    body: ApiSchemas["initiateProviderDownloadDto"],
    provider: ImportSourceProvider,
  ) {
    setDatasetId(null);
    switch (provider) {
      case "huggingface": {
        startTransition(async () => {
          const huggingfaceData = await uploadHuggingface({
            body,
          });
          setDatasetId(huggingfaceData.dataset_id);
          await handleDatasetUploadProgress(
            huggingfaceData.dataset_id,
            onUploadSuccess,
          );
        });
        return;
      }
      case "kaggle": {
        startTransition(async () => {
          const kaggleData = await uploadKaggle({
            body,
          });
          setDatasetId(kaggleData.dataset_id);
          await handleDatasetUploadProgress(
            kaggleData.dataset_id,
            onUploadSuccess,
          );
        });
        return;
      }
    }
  }

  return {
    uploadDatasets,
    isUploadPending,
    isDatasetUploadingProgress,
    datasetFilesProgress,
    errorProgress,
    errorUpload: errorHuggingface?.message || errorKaggle?.message,
    resetUpload,
  };
}
