import { useTransition } from "react";
import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import {
  useLocation,
  useNavigate,
  useParams,
  useRevalidator,
} from "react-router-dom";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { resolveFinetuneStepRoute } from "../../_lib/resolve-finetune-step-route";
import { getFinetuneStepsData } from "../../_model/get-finetune-steps-data";
import { useFinetuneStepOrderNavigation } from "../../_model/use-finetune-step-order-navigation";
import { updateFinetuneStepCache } from "../../_model/update-finetune-step-cache";

type FinetuneFieldValue = ApiSchemas["FinetuneFieldDto"]["value"];

export function useTrainingMethodPost() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const revalidator = useRevalidator();
  const { dataset_id } = useParams();
  const [isPending, startTransition] = useTransition();
  const { nextStepRoute } = useFinetuneStepOrderNavigation(
    FINETUNE_STEP_KEYS.trainingMethod,
  );
  const { mutateAsync: saveFinetuneConfig } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/config",
  );

  const submitForm = async (data: ApiSchemas["FinetuneSaveConfigDto"]) => {
    if (!dataset_id) return;

    startTransition(async () => {
      try {
        await saveFinetuneConfig({
          params: { path: { dataset_id } },
          body: data,
        });

        for (const [stepKey, stepConfig] of Object.entries(data)) {
          const fieldValues: Record<string, FinetuneFieldValue> = {};
          for (const [fieldKey, entry] of Object.entries(stepConfig)) {
            fieldValues[fieldKey] = (entry?.value ?? null) as FinetuneFieldValue;
          }
          updateFinetuneStepCache(dataset_id, stepKey, fieldValues);
        }

        const currentStepKey = FINETUNE_STEP_KEYS.trainingMethod;
        const stepsData = await getFinetuneStepsData(dataset_id, false);
        const orderedSteps = (stepsData?.steps ?? [])
          .slice()
          .sort((a, b) => a.order - b.order);
        const currentStepIndex = orderedSteps.findIndex(
          (step) => step.key === currentStepKey,
        );
        const nextStep =
          currentStepIndex >= 0 && currentStepIndex + 1 < orderedSteps.length
            ? orderedSteps[currentStepIndex + 1]
            : null;
        const resolvedNextRoute = nextStep?.key
          ? `${resolveFinetuneStepRoute(dataset_id, nextStep.key)}${search}`
          : nextStepRoute;

        if (nextStep?.key) {
          queryClient.removeQueries({
            queryKey: datasetQueryOptions.finetuneStep(
              dataset_id,
              nextStep.key,
            ).queryKey,
          });
        }

        if (resolvedNextRoute) navigate(resolvedNextRoute);
        revalidator.revalidate();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save training method"));
      }
    });
  };

  return {
    submitForm,
    isPending,
  };
}
