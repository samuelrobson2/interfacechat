import { useCallback, useRef, useState } from "react";
import { getApiErrorMessage } from "@/shared/api/api-error";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import type { FinetuneHyperparamDraft, FinetuneHyperparamDraftKey } from "../lib/finetune-hyperparam-cards";
import { resolveRecipeNextValues } from "../lib/resolve-recipe-next-values";
import type { SaveRecipeStepArgs } from "./use-recipe-continue";

export const RECIPE_DEPENDENT_DRAFT_KEYS = new Set<FinetuneHyperparamDraftKey>([
  "algorithm",
  "base_model",
]);

type UseRecipeDependentFieldSyncArgs = {
  dataset_id: string;
  recipeStepData: ApiSchemas["FinetuneStepDetailResponseDto"] | undefined;
  save: (args: SaveRecipeStepArgs) => Promise<void>;
  acceptServerState: () => void;
  refetch: () => Promise<unknown>;
};

export function useRecipeDependentFieldSync({
  dataset_id,
  recipeStepData,
  save,
  acceptServerState,
  refetch,
}: UseRecipeDependentFieldSyncArgs) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [recipeKey, setRecipeKey] = useState(0);
  const syncGenerationRef = useRef(0);
  const lastSavedValuesKeyRef = useRef<string | null>(null);

  const syncFromDraft = useCallback(
    async (draft: FinetuneHyperparamDraft) => {
      if (!recipeStepData) return;

      const nextValues = resolveRecipeNextValues(
        recipeStepData.step.fields,
        draft,
      );
      const valuesKey = JSON.stringify(nextValues);
      if (valuesKey === lastSavedValuesKeyRef.current) return;
      lastSavedValuesKeyRef.current = valuesKey;

      const generation = ++syncGenerationRef.current;
      setIsSyncing(true);

      try {
        await save({ dataset_id, recipeStepData, nextValues });
        if (generation !== syncGenerationRef.current) return;

        acceptServerState();
        await refetch();
        setRecipeKey((key) => key + 1);
      } catch (error) {
        if (generation !== syncGenerationRef.current) return;

        lastSavedValuesKeyRef.current = null;
        toast.error(
          getApiErrorMessage(error, "Failed to update recipe from server"),
        );
      } finally {
        if (generation === syncGenerationRef.current) {
          setIsSyncing(false);
        }
      }
    },
    [acceptServerState, dataset_id, recipeStepData, refetch, save],
  );

  const onDraftFieldUpdated = useCallback(
    (key: FinetuneHyperparamDraftKey, draft: FinetuneHyperparamDraft) => {
      if (!RECIPE_DEPENDENT_DRAFT_KEYS.has(key)) return;
      void syncFromDraft(draft);
    },
    [syncFromDraft],
  );

  return { isSyncing, onDraftFieldUpdated, recipeKey };
}
