import { datasetQueryOptions } from "@/services/dataset";
import { paymentQueryOptions } from "@/services/payment";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";

export function useQuestionnaireDataSuspense() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [
    { data: stepData },
    { data: statusData },
    { data: subscriptions },
    { data: activeGrantedPlan },
  ] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.questionnaire),
      datasetQueryOptions.dataset(dataset_id!),
      paymentQueryOptions.subscription(),
      paymentQueryOptions.activeGrantedPlan(),
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
    subscriptions,
    activeGrantedPlan,
  };
}
