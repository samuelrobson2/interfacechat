import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useRevalidator } from "react-router-dom";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { updateFinetuneStepCache } from "../../_model/update-finetune-step-cache";

const RECIPE_FIELD_PREFIX = "finetune_recipe_";

type FinetuneFieldValue = ApiSchemas["FinetuneFieldDto"]["value"];

function buildRecipeStepBody(
  hyperparams: Record<string, unknown>,
): ApiSchemas["FinetuneSaveConfigDto"] {
  const recipeFields: Record<string, { value: FinetuneFieldValue }> = {};
  // Persist all hyperparams provided by the edited confirmation JSON so
  // fields added by backend (e.g. dpo_beta) are not dropped by FE.
  for (const [key, value] of Object.entries(hyperparams)) {
    if (value === undefined) continue;
    recipeFields[`${RECIPE_FIELD_PREFIX}${key}`] = {
      value: value as FinetuneFieldValue,
    };
  }
  return {
    [FINETUNE_STEP_KEYS.recipe]: recipeFields,
  };
}

export function useSaveConfirmHyperparams(dataset_id: string | undefined) {
  const revalidator = useRevalidator();
  const { mutateAsync: saveFinetuneConfig, isPending } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/config",
  );

  const save = async (
    launchBody: ApiSchemas["LaunchFinetuneJobDto"] | null,
  ) => {
    if (!dataset_id || !launchBody?.hyperparams) return true;
    const hyperparams = launchBody.hyperparams as Record<string, unknown>;
    const body = buildRecipeStepBody(hyperparams);
    if (Object.keys(body[FINETUNE_STEP_KEYS.recipe] ?? {}).length === 0) return true;
    const recipeValues = Object.fromEntries(
      Object.entries(body[FINETUNE_STEP_KEYS.recipe] ?? {}).map(([fieldKey, value]) => [
        fieldKey,
        value?.value ?? null,
      ]),
    ) as Record<string, ApiSchemas["FinetuneFieldDto"]["value"]>;

    try {
      await saveFinetuneConfig({
        params: { path: { dataset_id } },
        body,
      });
      updateFinetuneStepCache(dataset_id, FINETUNE_STEP_KEYS.recipe, recipeValues);
      queryClient.invalidateQueries({
        queryKey: datasetQueryOptions.finetuneSteps(dataset_id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: datasetQueryOptions.finetuneStep(
          dataset_id,
          FINETUNE_STEP_KEYS.recipe,
        ).queryKey,
      });
      revalidator.revalidate();
      return true;
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not save hyperparameter edits."),
      );
      return false;
    }
  };

  return { save, isSaving: isPending };
}
