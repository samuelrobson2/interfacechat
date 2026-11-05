import { datasetQueryOptions } from "@/services/dataset";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useOptimistic, useTransition } from "react";
import { useParams } from "react-router-dom";
import { useDatasetDataSuspense } from "./use-dataset-data-suspense";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function useDatasetInfoPatch() {
  const { dataset } = useDatasetDataSuspense();
  const [isPending, startTransition] = useTransition();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  const [optimisticDataset, setOptimisticDataset] = useOptimistic(
    {
      name: dataset?.name || "",
      description: dataset?.metadata?.dataset_description || "",
    },
    (state, update: ApiSchemas["PatchDatasetDto"]) => ({
      name: update.name ?? state.name,
      description: update.description ?? state.description,
    }),
  );

  const { mutateAsync } = rqClient.useMutation(
    "patch",
    "/datasets/{dataset_id}",
  );

  const patchDatasetInfo = (data: ApiSchemas["PatchDatasetDto"]) => {
    if (
      dataset?.name === data.name ||
      dataset?.metadata?.dataset_description === data.description
    ) {
      return;
    }

    startTransition(async () => {
      setOptimisticDataset(data);

      await mutateAsync({
        params: {
          path: { dataset_id: dataset_id! },
        },
        body: data,
      }, {
        onSuccess: () => {
          toast.success("Successfully updated.");
        },
      });
      await queryClient.invalidateQueries(
        datasetQueryOptions.dataset(dataset_id!),
      );
    });
  };

  return { patchDatasetInfo, isPending, optimisticDataset };
}
