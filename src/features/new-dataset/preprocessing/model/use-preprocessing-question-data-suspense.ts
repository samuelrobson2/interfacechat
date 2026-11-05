import { datasetQueryOptions } from "@/services/dataset";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";

export function usePreprocessingQuestionDataSuspense() {
  const { dataset_id } = useParams();
  const [
    { data: stepData },
    { data: statusData },
  ] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.preprocessing),
      datasetQueryOptions.dataset(dataset_id!),
    ],
  });

  const questions = useMemo(
    () =>
      Object.values(stepData.step.fields).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [stepData],
  );

  return {
    questions,
    statusData,
    stepKey: stepData.step.key,
  };
}
