import { useCallback, useTransition } from "react";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useNavigate, useRevalidator } from "react-router-dom";
import { createFinetuneConfigResponse } from "../../_lib/create-finetune-config-response";
import { updateFinetuneStepCache } from "../../_model/update-finetune-step-cache";

export type SaveRecipeStepArgs = {
  dataset_id: string;
  recipeStepData: ApiSchemas["FinetuneStepDetailResponseDto"];
  nextValues: Record<string, ApiSchemas["FinetuneFieldDto"]["value"]>;
};

type ContinueArgs = SaveRecipeStepArgs & {
  nextStepRoute: string;
};

export function useRecipeContinue() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: saveFinetuneConfig } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/config",
  );

  const save = useCallback(
    async (args: SaveRecipeStepArgs) => {
      await saveFinetuneConfig({
        params: { path: { dataset_id: args.dataset_id } },
        body: createFinetuneConfigResponse(
          args.recipeStepData.step.key,
          args.recipeStepData.step.fields,
          args.nextValues,
        ),
      });
      updateFinetuneStepCache(
        args.dataset_id,
        args.recipeStepData.step.key,
        args.nextValues,
      );
    },
    [saveFinetuneConfig],
  );

  const submit = (args: ContinueArgs) => {
    startTransition(async () => {
      try {
        await save(args);
        navigate(args.nextStepRoute);
        revalidator.revalidate();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save recipe step"));
      }
    });
  };

  return {
    save,
    submit,
    isPending,
  };
}
