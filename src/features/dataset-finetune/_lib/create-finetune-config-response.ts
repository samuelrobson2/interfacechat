import type { ApiSchemas } from "@/shared/api/schema";

type FinetuneFieldValue = ApiSchemas["FinetuneFieldDto"]["value"];

export function createFinetuneConfigResponse(
  stepKey: string,
  fields: ApiSchemas["FinetuneFieldDto"][],
  nextValues: Record<string, FinetuneFieldValue>,
): ApiSchemas["FinetuneSaveConfigDto"] {
  const stepConfig: Record<string, { value: FinetuneFieldValue }> = {};

  for (const field of fields) {
    const value =
      field.key in nextValues
        ? (nextValues[field.key] ?? null)
        : (field.value ?? null);
    stepConfig[field.key] = { value };
  }

  return {
    [stepKey]: stepConfig,
  };
}
