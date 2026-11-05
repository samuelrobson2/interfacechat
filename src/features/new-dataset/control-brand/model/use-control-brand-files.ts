import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { useParams } from "react-router-dom";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useControlBrandContext } from "./control-brand-store";

export function useControlBrandFiles(brand_files: Map<string, File>) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isFilesPending, startFilesTransition] = useTransition();
  const [isGeneratePending, startGenerateTransition] = useTransition();

  const setBrandSettings = useControlBrandContext(
    (state) => state.setBrandSettings,
  );

  const { mutateAsync: uploadFilesMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/brand-files",
  );
  const { mutateAsync: generateSystemPromptMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/generate-system-prompt",
  );
  const { mutateAsync: deleteFileMutation } = rqClient.useMutation(
    "delete",
    "/datasets/{dataset_id}/brand-files/{file_name}",
  );

  const invalidateBrandStep = async () => {
    await queryClient.invalidateQueries({
      queryKey: datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.brand)
        .queryKey,
    });
  };

  const uploadFiles = (files: Map<string, File>) => {
    const filesToUpload = Array.from(files.entries()).filter(
      ([fileKey]) => !brand_files.has(fileKey),
    );

    if (!filesToUpload.length) return;

    startFilesTransition(async () => {
      try {
        await Promise.all(
          filesToUpload.map(([, file]) =>
            uploadFilesMutation({
              params: {
                path: {
                  dataset_id: dataset_id!,
                },
              },
              body: {
                file: "",
              },
              bodySerializer: () => {
                const formData = new FormData();
                formData.append("file", file);
                return formData;
              },
            }),
          ),
        );

        await invalidateBrandStep();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to upload files"));
      }
    });
  };

  const removeFile = (fileKey: string) => {
    if (isFilesPending || isGeneratePending) return;

    const file = brand_files.get(fileKey);

    if (!file) return;

    startFilesTransition(async () => {
      try {
        await deleteFileMutation({
          params: {
            path: {
              dataset_id: dataset_id!,
              file_name: file.name,
            },
          },
        });

        await invalidateBrandStep();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to remove file"));
      }
    });
  };

  const generateSystemPrompt = async (brand_guidelines: string) => {
    startGenerateTransition(async () => {
      try {
        const response = await generateSystemPromptMutation({
          params: {
            path: {
              dataset_id: dataset_id!,
            },
          },
          body: {
            brand_guidelines,
          },
        });

        const systemPrompt = response?.system_prompt;

        if (systemPrompt) {
          setBrandSettings(systemPrompt);
        }
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to generate system prompt"),
        );
      }
    });
  };

  return {
    isFilesPending,
    isGeneratePending,
    uploadFiles,
    removeFile,
    generateSystemPrompt,
  };
}
