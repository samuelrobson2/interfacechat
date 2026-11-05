import { datasetQueryOptions } from "@/services/dataset";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";

type FinetuneFieldValue = ApiSchemas["FinetuneFieldDto"]["value"];

export function updateFinetuneStepCache(
  datasetId: string,
  stepKey: string,
  nextValues: Record<string, FinetuneFieldValue>,
) {
  queryClient.setQueryData<ApiSchemas["FinetuneStepDetailResponseDto"]>(
    datasetQueryOptions.finetuneStep(datasetId, stepKey).queryKey,
    (currentData) => {
      if (!currentData?.step?.fields?.length) return currentData;

      const updatedFields = currentData.step.fields.map((field) => {
        if (!(field.key in nextValues)) return field;
        return {
          ...field,
          value: nextValues[field.key] ?? null,
        };
      });

      return {
        ...currentData,
        step: {
          ...currentData.step,
          fields: updatedFields,
        },
      };
    },
  );

  // Keep steps-list cache in sync with just-saved step so route guards
  // do not read a stale "current step" right after navigation.
  queryClient.setQueryData<ApiSchemas["FinetuneStepsResponseDto"]>(
    datasetQueryOptions.finetuneSteps(datasetId).queryKey,
    (currentData) => {
      if (!currentData?.steps?.length) return currentData;

      const updatedSteps = currentData.steps.map((step) =>
        step.key === stepKey ? { ...step, completed: true } : step,
      );

      return {
        ...currentData,
        steps: updatedSteps,
      };
    },
  );
}
