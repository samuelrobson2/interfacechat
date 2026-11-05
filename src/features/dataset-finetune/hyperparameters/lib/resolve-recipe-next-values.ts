import type { ApiSchemas } from "@/shared/api/schema";
import type {
  FinetuneHyperparamDraft,
  FinetuneHyperparamDraftKey,
} from "./finetune-hyperparam-cards";

type FieldValue = ApiSchemas["FinetuneFieldDto"]["value"];

const RECIPE_FIELD_PREFIX = "finetune_recipe_";
export const FINETUNE_BASE_MODEL_FIELD = "finetune_base_model";

const NUMERIC_DRAFT_KEYS = [
  "n_epochs",
  "lora_r",
  "lora_alpha",
  "warmup_ratio",
  "max_grad_norm",
  "weight_decay",
] as const satisfies readonly FinetuneHyperparamDraftKey[];

const STRING_DRAFT_KEYS = [
  "lora_trainable_modules",
  "lr_scheduler_type",
] as const satisfies readonly FinetuneHyperparamDraftKey[];

function setIfFieldExists(
  fieldKeys: Set<string>,
  nextValues: Record<string, FieldValue>,
  fieldKey: string,
  value: FieldValue,
) {
  if (fieldKeys.has(fieldKey)) {
    nextValues[fieldKey] = value;
  }
}

export function resolveRecipeNextValues(
  fields: ApiSchemas["FinetuneFieldDto"][],
  draft: FinetuneHyperparamDraft,
): Record<string, FieldValue> {
  const nextValues: Record<string, FieldValue> = {};
  const fieldKeys = new Set(fields.map((f) => f.key));

  if (draft.algorithm) {
    setIfFieldExists(
      fieldKeys,
      nextValues,
      `${RECIPE_FIELD_PREFIX}algorithm`,
      draft.algorithm,
    );

    setIfFieldExists(
      fieldKeys,
      nextValues,
      `${RECIPE_FIELD_PREFIX}lora`,
      draft.algorithm === "lora",
    );
  }

  for (const draftKey of NUMERIC_DRAFT_KEYS) {
    const raw = draft[draftKey];
    if (raw === "" || raw === undefined) continue;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) continue;
    setIfFieldExists(
      fieldKeys,
      nextValues,
      `${RECIPE_FIELD_PREFIX}${draftKey}`,
      parsed,
    );
  }

  for (const draftKey of STRING_DRAFT_KEYS) {
    const raw = draft[draftKey];
    if (raw === "" || raw === undefined) continue;
    setIfFieldExists(
      fieldKeys,
      nextValues,
      `${RECIPE_FIELD_PREFIX}${draftKey}`,
      raw,
    );
  }

  if (draft.base_model) {
    setIfFieldExists(
      fieldKeys,
      nextValues,
      FINETUNE_BASE_MODEL_FIELD,
      draft.base_model,
    );
  }

  return nextValues;
}
