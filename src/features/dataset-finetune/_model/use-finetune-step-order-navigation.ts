import type { ApiSchemas } from "@/shared/api/schema";
import { useLoaderData, useLocation, useParams } from "react-router-dom";
import type { FinetuneStepKey } from "../_lib/finetune-routes";
import { resolveFinetuneStepRoute } from "../_lib/resolve-finetune-step-route";

export function useFinetuneStepOrderNavigation(stepKey: FinetuneStepKey) {
  const { dataset_id } = useParams();
  const { search } = useLocation();
  const steps = useLoaderData() as ApiSchemas["FinetuneStepDto"][] | undefined;

  if (!dataset_id || !steps?.length) {
    return { previousStepRoute: null, nextStepRoute: null };
  }

  const currentStepIndex = steps.findIndex(
    (step) => step.key === stepKey,
  );
  if (currentStepIndex < 0) {
    return { previousStepRoute: null, nextStepRoute: null };
  }

  const previousStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  return {
    previousStepRoute: previousStep
      ? `${resolveFinetuneStepRoute(dataset_id, previousStep.key)}${search}`
      : null,
    nextStepRoute: nextStep
      ? `${resolveFinetuneStepRoute(dataset_id, nextStep.key)}${search}`
      : null,
  };
}
