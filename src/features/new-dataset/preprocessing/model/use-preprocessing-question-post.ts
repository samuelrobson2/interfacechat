import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useNewDatasetNavigation } from "../../_model/use-new-dataset-navigation";

export function usePreprocessingQuestionPost() {
  const [isPending, startTransition] = useTransition();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { dataset_id } = useParams();

  const { nextStepRoute } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.preprocessing,
  });

  const { mutateAsync } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postPreprocessingAnswers = async (
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
        await postPreprocessingAnswers(data);
        const steps = await queryClient.fetchQuery(
          datasetQueryOptions.steps(dataset_id!),
        );

        if (steps.steps?.some((step) => step.key === NEW_DATASET_KEYS.expansion)) {
          await queryClient.prefetchQuery(
            datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.expansion),
          );
        }

        await revalidator.revalidate();
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to submit preprocessing answers"),
        );
      }
    });
  };

  return {
    submitForm,
    isPending,
  };
}
