import { useFinetuneStepSuspenseQuery } from "@/services/dataset";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";

export function useTrainingMethodData() {
  const { dataset_id } = useParams();
  if (!dataset_id) {
    throw new Error("Dataset id is unavailable.");
  }

  const { data } = useFinetuneStepSuspenseQuery(
    dataset_id,
    FINETUNE_STEP_KEYS.trainingMethod,
  );
  const step = data.step;

  const questions = useMemo(
    () =>
      step.fields
        .filter((field) => field.options.length > 0)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((field) => ({
          key: field.key,
          title: field.title,
          description: field.description,
          options: [...field.options].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
          ),
          response_values:
            typeof field.value === "string" ? [{ value: field.value }] : [],
        })),
    [step.fields],
  );

  return {
    stepKey: step.key,
    title: step.title ?? "",
    questions,
  };
}
