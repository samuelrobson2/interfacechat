import { useTransition } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { createFinetuneConfigResponse } from "../../_lib/create-finetune-config-response";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { useFinetuneStepOrderNavigation } from "../../_model/use-finetune-step-order-navigation";
import { updateFinetuneStepCache } from "../../_model/update-finetune-step-cache";

type SubmitColumnsArgs = {
  datasetId: string;
  stepKey: string;
  fields: ApiSchemas["FinetuneFieldDto"][];
  selections: Record<string, string | null>;
};

function resolveColumnsNextValues(
  fields: ApiSchemas["FinetuneFieldDto"][],
  selections: Record<string, string | null>,
) {
  const nextValues: Record<string, ApiSchemas["FinetuneFieldDto"]["value"]> = {};

  const roleMap = Object.fromEntries(
    Object.entries(selections).filter(
      ([, val]) => typeof val === "string" && val.length > 0,
    ),
  ) as Record<string, string>;

  const selectionsField =
    fields.find((field) => field.key.includes("column_selections"))
    ?? fields[0];

  if (selectionsField) {
    nextValues[selectionsField.key] = roleMap;
  }

  return nextValues;
}

export function useFinetuneColumnsContinue() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isPending, startTransition] = useTransition();
  const { nextStepRoute } = useFinetuneStepOrderNavigation(FINETUNE_STEP_KEYS.columns);
  const { mutateAsync: saveFinetuneConfig } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/config",
  );

  const submit = (args: SubmitColumnsArgs) => {
    startTransition(async () => {
      try {
        const nextValues = resolveColumnsNextValues(args.fields, args.selections);
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
        if (nextStepRoute) navigate(nextStepRoute);
        revalidator.revalidate();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save columns mapping"));
      }
    });
  };

  return {
    submit,
    isPending,
  };
}
