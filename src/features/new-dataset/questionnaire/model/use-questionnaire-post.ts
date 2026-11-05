import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams, useRevalidator } from "react-router-dom";
import {
  NEW_DATASET_KEYS,
  NEW_DATASET_ROUTES_MAP,
  type NewDatasetKeys,
} from "../../_lib/new-dataset-routes";

export function useQuestionnairePost() {
  const [isPending, startTransition] = useTransition();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  const { mutateAsync } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postQuestionnaire = async (
    data: ApiSchemas["SaveDatasetConfigDto"],
  ) => {
    await mutateAsync({
      params: {
        path: { dataset_id: dataset_id! },
      },
      body: data,
    });
  };

  const submitForm = async (data: ApiSchemas["SaveDatasetConfigDto"]) => {
    startTransition(async () => {
      try {
        await postQuestionnaire(data);

        const stepsQueryKey = datasetQueryOptions.steps(dataset_id!).queryKey;
        await queryClient.invalidateQueries({ queryKey: stepsQueryKey });

        const { steps } = await queryClient.fetchQuery(
          datasetQueryOptions.steps(dataset_id!),
        );

        if (steps?.some((step) => step.key === NEW_DATASET_KEYS.expansion)) {
          await queryClient.prefetchQuery(
            datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.expansion),
          );
        }

        await revalidator.revalidate();

        const sorted = (steps ?? [])
          .filter((step) => step.key in NEW_DATASET_ROUTES_MAP)
          .sort((a, b) => a.order - b.order);
        const nextStep =
          sorted[
            sorted.findIndex(
              (step) => step.key === NEW_DATASET_KEYS.questionnaire,
            ) + 1
          ];

        if (nextStep) {
          await navigate(
            href(NEW_DATASET_ROUTES_MAP[nextStep.key as NewDatasetKeys], {
              dataset_id,
            }),
          );
        }
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to submit questionnaire"),
        );
      }
    });
  };

  return {
    submitForm,
    isPending,
  };
}
