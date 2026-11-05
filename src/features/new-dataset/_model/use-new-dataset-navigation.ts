import { useMemo } from "react";
import {
  href,
  useParams,
  useRevalidator,
  useRouteLoaderData,
  useSearchParams,
} from "react-router-dom";
import type { newDatasetStepsLoader } from "./new-dataset-steps-loader";
import {
  NEW_DATASET_ROUTES_MAP,
  type NewDatasetKeys,
} from "../_lib/new-dataset-routes";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { queryClient } from "@/shared/api/query-client";
import { datasetQueryOptions } from "@/services/dataset";

export function useNewDatasetNavigation({
  stepKey,
}: {
  stepKey: NewDatasetKeys;
}) {
  const revalidator = useRevalidator();
  const [searchParams] = useSearchParams();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const steps =
    useRouteLoaderData<typeof newDatasetStepsLoader>("dataset-steps");
  const currentStepIndex = steps?.findIndex((s) => s.key === stepKey) ?? 0;
  const isFromSummary = searchParams.get("from_summary") === "true";

  const previousStepRoute = useMemo(() => {
    if (!steps) return null;

    const newStepIndex = currentStepIndex - 1;
    if (newStepIndex < 0) return null;

    const previousStep = steps[newStepIndex];
    if (!previousStep) return null;

    return href(NEW_DATASET_ROUTES_MAP[previousStep.key as NewDatasetKeys], {
      dataset_id,
    });
  }, [steps, currentStepIndex, dataset_id]);

  const nextStepRoute = useMemo(() => {
    if (!steps) return null;

    if (isFromSummary)
      return href(NEW_DATASET_ROUTES_MAP.summary, {
        dataset_id,
      });

    const newStepIndex = currentStepIndex + 1;
    if (newStepIndex >= steps.length) return null;

    const nextStep = steps[newStepIndex];
    if (!nextStep) return null;

    return href(NEW_DATASET_ROUTES_MAP[nextStep.key as NewDatasetKeys], {
      dataset_id,
    });
  }, [steps, currentStepIndex, dataset_id, isFromSummary]);

  const isNextStepLast = useMemo(() => {
    if (!steps) return false;
    return currentStepIndex + 1 === steps.length - 1;
  }, [steps, currentStepIndex]);

  const lastStepDataReload = async () => {
    if (!isNextStepLast) return;
    await Promise.all([
      queryClient.refetchQueries({
        queryKey: datasetQueryOptions.steps(dataset_id!).queryKey,
      }),
      revalidator.revalidate(),
    ]);
  };

  return {
    previousStepRoute,
    nextStepRoute,
    isFromSummary,
    isNextStepLast,
    lastStepDataReload,
  };
}
