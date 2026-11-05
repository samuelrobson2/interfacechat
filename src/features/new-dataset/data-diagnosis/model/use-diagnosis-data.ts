import { datasetQueryOptions } from "@/services/dataset";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";

export function useDiagnosisData() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [{ data: stepData }, { data: statusData }] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.diagnosis),
      datasetQueryOptions.dataset(dataset_id!),
    ],
  });

  return {
    stepData,
    statusData,
  };
}
