import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { createDatasetConfigResponse } from "../../_lib/new-dataset-create-response";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import { useNewDatasetNavigation } from "../../_model/use-new-dataset-navigation";
import { useDiagnosisContext } from "./diagnosis-store";

export function useDiagnosisPost() {
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isPending, startTransition] = useTransition();

  const data = useDatasetStepCache(NEW_DATASET_KEYS.diagnosis);
  const { nextStepRoute } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.diagnosis,
  });

  // Get diagnosis data from store
  const dataset_name = useDiagnosisContext((state) => state.dataset_name);
  const description = useDiagnosisContext((state) => state.description);

  const { mutateAsync: submitDiagnosisMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postDiagnosis = async () => {
    if (!data || !data.step || !data.step.fields) return;

    const storeValues = {
      dataset_name: JSON.stringify(dataset_name),
      description: JSON.stringify(description),
    };

    const body = createDatasetConfigResponse(
      data.step.key,
      data.step.fields,
      storeValues,
    );

    await submitDiagnosisMutation({
      params: {
        path: {
          dataset_id: dataset_id!,
        },
      },
      body,
    });
  };

  const submitForm = () => {
    startTransition(async () => {
      try {
        await postDiagnosis();
        await queryClient.invalidateQueries({
          queryKey: datasetQueryOptions.step(
            dataset_id!,
            NEW_DATASET_KEYS.diagnosis,
          ).queryKey,
        });
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to submit diagnosis"));
      }
    });
  };

  return {
    postDiagnosis,
    submitForm,
    isPending,
  };
}
