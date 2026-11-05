import type { ApiSchemas } from "@/shared/api/schema";

export function createDatasetConfigResponse(
  stepKey: string,
  stepFields: ApiSchemas["Step"]["fields"],
  values: Record<string, string>
): ApiSchemas["SaveDatasetConfigDto"] {
  // Create step config object dynamically based on available fields
  const stepConfig: Record<string, { value: string }> = {};

  Object.keys(stepFields).forEach((fieldKey) => {
    const fieldValue = values[fieldKey];

    // Only include fields that have values and exist in the step fields
    if (fieldValue && fieldValue.trim() !== "") {
      stepConfig[fieldKey] = {
        value: fieldValue,
      };
    }
  });

  return {
    [stepKey]: stepConfig,
  };
}
