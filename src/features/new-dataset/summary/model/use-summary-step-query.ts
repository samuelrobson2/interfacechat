import type { ApiSchemas } from "@/shared/api/schema";
import { useMemo } from "react";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepSuspenseQuery } from "../../_model/use-dataset-step-query";

const checkFieldResponseValues = (field: ApiSchemas["Field"]) => {
  const parsedValue = JSON.parse(field.response_values?.[0]?.value || "null");
  if (Array.isArray(parsedValue)) {
    return parsedValue.length > 0;
  }
  return !!parsedValue;
};

export function useSummaryStepQuery() {
  const { data: stepData } = useDatasetStepSuspenseQuery(
    NEW_DATASET_KEYS.summary,
  );

  const summaryData = useMemo(() => {
    const result: { key: string; value: (number | string)[] }[] = [];

    if (!stepData) return result;

    if (
      stepData.length === 0 ||
      !stepData.find((step) => step.key === NEW_DATASET_KEYS.recipes)
    )
      result.push({ key: NEW_DATASET_KEYS.recipes, value: [0] });

    stepData.forEach((step) => {
      if (step.key === NEW_DATASET_KEYS.recipes) {
        const sortedQuestions = Object.values(step.fields).sort(
          (a, b) => (a.id ?? 0) - (b.id ?? 0),
        );
        const recipesCount = sortedQuestions
          .slice(-3)
          .reduce((acc, question) => {
            return (
              acc + (question.response_values?.[0]?.value === "true" ? 1 : 0)
            );
          }, 0);
        result.push({ key: step.key, value: [recipesCount] });
      }

      if (
        step.key === NEW_DATASET_KEYS.brand ||
        step.key === NEW_DATASET_KEYS.expansion
      ) {
        const filteredFields = Object.values(step.fields)
          // Filter for percentage data.
          // TODO: Remove this filter when backend will be updated.
          .filter((field) =>
            ["expansion_countries", "expansion_languages"].includes(field.key),
          )
          .filter(checkFieldResponseValues)
          .map((field) => field.title);
        const uniqueTitles = [...new Set(filteredFields)];
        result.push({ key: step.key, value: uniqueTitles });
      }
    });

    return result;
  }, [stepData]);

  const showSummaryCards = summaryData.length >= 2;

  return { summaryData, showSummaryCards };
}
