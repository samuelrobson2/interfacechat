import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApiSchemas } from "@/shared/api/schema";
import {
  buildFinetuneHyperparamDraft,
  type FinetuneHyperparamDraft,
  type FinetuneHyperparamDraftKey,
} from "../lib/finetune-hyperparam-cards";
import { FINETUNE_BASE_MODEL_FIELD } from "../lib/resolve-recipe-next-values";

const EMPTY_HYPERPARAMS = {} as ApiSchemas["FinetuneSftHyperparamsDto"];
const RECIPE_PREFIX = "finetune_recipe_";

type RecipeInline = {
  model?: string;
  models?: { id: string; display_name: string }[];
  recipe_suggestion?: Record<string, unknown>;
};

function parseRecipeStep(
  recipeStepData: ApiSchemas["FinetuneStepDetailResponseDto"] | undefined,
) {
  if (!recipeStepData) return null;

  const inline = recipeStepData.step.inline_data as RecipeInline | null | undefined;
  const suggestion = inline?.recipe_suggestion ?? {};

  const savedHyperparams: Record<string, unknown> = {};
  for (const field of recipeStepData.step.fields) {
    if (!field.key.startsWith(RECIPE_PREFIX)) continue;
    if (field.value == null) continue;
    savedHyperparams[field.key.slice(RECIPE_PREFIX.length)] = field.value;
  }

  // recipe_suggestion is freshly computed for the current model + algorithm;
  // saved fields may be stale from a prior selection. Let the server
  // suggestion win so hyperparams update when model/algorithm changes.
  const hyperparams = { ...savedHyperparams, ...suggestion } as Record<
    string,
    unknown
  >;

  const typedHyperparams = hyperparams as ApiSchemas["FinetuneSftHyperparamsDto"];
  const modelOptions = (inline?.models ?? []).map((m) => ({
    id: m.id,
    displayName: m.display_name,
  }));

  const savedModel = recipeStepData.step.fields.find(
    (f) => f.key === FINETUNE_BASE_MODEL_FIELD,
  )?.value;
  const baseModel =
    (typeof savedModel === "string" && savedModel) ||
    inline?.model ||
    modelOptions[0]?.id ||
    "";

  return {
    hyperparams: typedHyperparams,
    modelOptions,
    serverDraft: {
      ...buildFinetuneHyperparamDraft(typedHyperparams),
      base_model: baseModel,
    },
  };
}

export type UseFinetuneRecipeDraftResult = {
  draft: FinetuneHyperparamDraft;
  setDraftField: (
    key: FinetuneHyperparamDraftKey,
    value: string,
  ) => FinetuneHyperparamDraft;
  acceptServerState: () => void;
  hyperparams: ApiSchemas["FinetuneSftHyperparamsDto"] | undefined;
  modelOptions: { id: string; displayName: string }[];
};

export function useFinetuneRecipeDraft(
  recipeStepData: ApiSchemas["FinetuneStepDetailResponseDto"] | undefined,
): UseFinetuneRecipeDraftResult {
  const step = useMemo(() => parseRecipeStep(recipeStepData), [recipeStepData]);

  const [localDraft, setLocalDraft] = useState(() =>
    buildFinetuneHyperparamDraft(EMPTY_HYPERPARAMS),
  );
  const [isDirty, setIsDirty] = useState(false);
  const draftRef = useRef(localDraft);

  // Plain selection between two existing objects — no memo needed.
  const draft =
    !isDirty && step?.serverDraft ? step.serverDraft : localDraft;

  useEffect(() => {
    if (!step?.serverDraft || isDirty) return;
    draftRef.current = step.serverDraft;
  }, [isDirty, step?.serverDraft]);

  const acceptServerState = useCallback(() => setIsDirty(false), []);

  const setDraftField = useCallback(
    (key: FinetuneHyperparamDraftKey, value: string) => {
      setIsDirty(true);
      const next = { ...draftRef.current, [key]: value };
      draftRef.current = next;
      setLocalDraft(next);
      return next;
    },
    [],
  );

  return {
    draft,
    setDraftField,
    acceptServerState,
    hyperparams: step?.hyperparams,
    modelOptions: step?.modelOptions ?? [],
  };
}
