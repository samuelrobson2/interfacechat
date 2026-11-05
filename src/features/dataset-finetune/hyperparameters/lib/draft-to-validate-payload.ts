import {
  LORA_ONLY_DRAFT_KEYS,
  type FinetuneHyperparamDraft,
  type FinetuneHyperparamDraftKey,
} from "./finetune-hyperparam-cards";

export type FinetuneHyperparamErrors = Partial<
  Record<FinetuneHyperparamDraftKey, string[]>
>;

const NUMERIC_DRAFT_KEYS: ReadonlySet<FinetuneHyperparamDraftKey> = new Set([
  "n_epochs",
  "lora_r",
  "lora_alpha",
  "warmup_ratio",
  "max_grad_norm",
  "weight_decay",
]);

// Maps the BE DTO field name back to the FE draft key. Mostly 1:1 except
// for `algorithm` (FE) → `lora` boolean (BE).
export function dtoFieldToDraftKey(
  field: string,
): FinetuneHyperparamDraftKey | null {
  if (field === "lora") return "algorithm";
  if (
    field === "n_epochs" ||
    field === "lora_r" ||
    field === "lora_alpha" ||
    field === "lora_trainable_modules" ||
    field === "lr_scheduler_type" ||
    field === "warmup_ratio" ||
    field === "max_grad_norm" ||
    field === "weight_decay"
  ) {
    return field;
  }
  return null;
}

/**
 * Build the validate-endpoint payload from the recipe draft.
 *
 * Returns:
 * - `payload`: the BE-shaped object to send to /finetune/hyperparams/validate
 * - `localErrors`: errors we can detect without a round-trip (e.g. "abc"
 *   typed into a numeric field). Merged with the BE response so the user
 *   sees them inline like any other validation error.
 *
 * Empty draft values are skipped (the field is "not set" → BE treats as
 * @IsOptional). When the algorithm is full-finetuning, LoRA-only fields
 * are skipped too — they're disabled in the editor and their values are
 * stale, so validating them would surface confusing errors.
 */
export function draftToValidatePayload(draft: FinetuneHyperparamDraft): {
  payload: Record<string, unknown>;
  localErrors: FinetuneHyperparamErrors;
} {
  const payload: Record<string, unknown> = {};
  const localErrors: FinetuneHyperparamErrors = {};
  const isFullFinetuning = draft.algorithm === "full";

  for (const [rawKey, value] of Object.entries(draft) as [
    FinetuneHyperparamDraftKey,
    string,
  ][]) {
    if (value.trim() === "") continue;
    if (isFullFinetuning && LORA_ONLY_DRAFT_KEYS.has(rawKey)) continue;

    if (rawKey === "algorithm") {
      payload.lora = value === "lora";
      continue;
    }

    // Saved via finetune_base_model on config, not hyperparams validate DTO.
    if (rawKey === "base_model") continue;

    if (NUMERIC_DRAFT_KEYS.has(rawKey)) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        localErrors[rawKey] = [`${rawKey} must be a number`];
        continue;
      }
      payload[rawKey] = parsed;
      continue;
    }

    payload[rawKey] = value;
  }

  return { payload, localErrors };
}
