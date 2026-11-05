import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage, isApiError } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { type DatasetRoutes, type PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { useParams } from "react-router-dom";
import { useLaunchEstimateStore } from "./launch-estimate-store";

/** POST body: mutually exclusive limits (must match dataset preprocessing_mode). */
export type LaunchPreprocessingRequestBody =
  | { pages_to_process: number }
  | { documents_to_process: number };

export function useLaunchDataset({
  onOpenPlans,
}: {
  onOpenPlans?: () => void;
} = {}) {
  const [isPending, startTransition] = useTransition();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { mutateAsync, error } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/launch",
  );

  const postLaunchDataset = async (samples_to_process: number) => {
    const data = await mutateAsync({
      params: {
        path: { dataset_id: dataset_id! },
      },
      body: {
        samples_to_process,
      },
    });
    useLaunchEstimateStore.getState().setEstimatedMinutes(data.estimatedMinutes);
  };

  const launchDataset = (samples_to_process: number) => {
    startTransition(async () => {
      try {
        await postLaunchDataset(samples_to_process);
        await queryClient.invalidateQueries({
          queryKey: datasetQueryOptions.dataset(dataset_id!).queryKey,
        });
      } catch (error) {
        if (isApiError(error) && error.code === "PLAN_UPGRADE_REQUIRED") {
          toast.error(getApiErrorMessage(error, "Failed to launch dataset"), {
            button: {
              label: "Go to Plans",
              onClick: onOpenPlans,
              variant: "secondary",
            },
          });
          return;
        }

        toast.error(getApiErrorMessage(error, "Failed to launch dataset"));
      }
    });
  };

  return { launchDataset, isPending, error: error };
}

export function useLaunchPreprocessingDataset() {
  const [isPending, startTransition] = useTransition();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { mutateAsync, error } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/launch-preprocessing",
  );

  const launchDataset = (body: LaunchPreprocessingRequestBody) => {
    startTransition(async () => {
      try {
        await mutateAsync({
          params: {
            path: { dataset_id: dataset_id! },
          },
          body,
        });
        await queryClient.invalidateQueries({
          queryKey: datasetQueryOptions.dataset(dataset_id!).queryKey,
        });
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to launch document preprocessing"),
        );
      }
    });
  };

  return { launchDataset, isPending, error };
}
