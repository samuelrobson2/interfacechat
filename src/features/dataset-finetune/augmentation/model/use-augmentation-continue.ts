import { useTransition } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { createFinetuneConfigResponse } from "../../_lib/create-finetune-config-response";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { useFinetuneStepOrderNavigation } from "../../_model/use-finetune-step-order-navigation";
import { updateFinetuneStepCache } from "../../_model/update-finetune-step-cache";
import type { ApiSchemas } from "@/shared/api/schema";

type SubmitAugmentationArgs = {
  datasetId: string;
  stepKey: string;
  fields: ApiSchemas["FinetuneFieldDto"][];
  augmentationDomainRows: number;
  augmentationGeneralRows: number;
};

function resolveAugmentationNextValues(
  fields: ApiSchemas["FinetuneFieldDto"][],
  values: { augmentationDomainRows: number; augmentationGeneralRows: number },
) {
  const nextValues: Record<string, ApiSchemas["FinetuneFieldDto"]["value"]> = {};

  const domainField = fields.find(
    (field) =>
      field.key.includes("augmentation_domain_rows")
      || field.key.includes("domain_rows"),
  );
  const generalField = fields.find(
    (field) =>
      field.key.includes("augmentation_general_rows")
      || field.key.includes("general_rows"),
  );

  if (domainField) {
    nextValues[domainField.key] = values.augmentationDomainRows;
  }
  if (generalField) {
    nextValues[generalField.key] = values.augmentationGeneralRows;
  }

  return nextValues;
}

export function useAugmentationContinue() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isPending, startTransition] = useTransition();
  const { nextStepRoute } = useFinetuneStepOrderNavigation(
    FINETUNE_STEP_KEYS.augmentation,
  );
  const { mutateAsync: saveFinetuneConfig } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/config",
  );

  const submit = (args: SubmitAugmentationArgs) => {
    startTransition(async () => {
      try {
        const nextValues = resolveAugmentationNextValues(args.fields, {
          augmentationDomainRows: args.augmentationDomainRows,
          augmentationGeneralRows: args.augmentationGeneralRows,
        });
        const body = createFinetuneConfigResponse(
          args.stepKey,
          args.fields,
          nextValues,
        );
        await saveFinetuneConfig({
          params: { path: { dataset_id: args.datasetId } },
          body,
        });
        updateFinetuneStepCache(args.datasetId, args.stepKey, nextValues);
        if (nextStepRoute) {
          navigate(nextStepRoute, {
            state: { forceRecipeStepRefetch: true },
          });
        }
        revalidator.revalidate();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to save augmentation settings"),
        );
      }
    });
  };

  return {
    submit,
    isPending,
  };
}
