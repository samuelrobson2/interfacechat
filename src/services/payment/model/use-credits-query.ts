import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  paymentQueryOptions,
  type PreprocessingCreditsQueryOpts,
} from "./payment-query-options";
import { useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";

export function useCreditsCalculationQuery(samples_to_process?: number) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useQuery(
    paymentQueryOptions.creditsCalculation(dataset_id!, samples_to_process),
  );

  return query;
}

export function useCreditsCalculationSuspenseQuery(
  samples_to_process?: number,
) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useSuspenseQuery(
    paymentQueryOptions.creditsCalculation(dataset_id!, samples_to_process),
  );

  return query;
}

export function usePreprocessingCreditsSuspenseQuery(
  opts?: PreprocessingCreditsQueryOpts,
) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const query = useSuspenseQuery(
    paymentQueryOptions.preprocessingCredits(dataset_id!, opts),
  );

  return query;
}

export function useCreditsCalculationCache(samples_to_process?: number) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const credits = queryClient.getQueryData<
    ApiSchemas["CreditsCalculationResponseDto"]
  >(
    paymentQueryOptions.creditsCalculation(dataset_id!, samples_to_process)
      .queryKey,
  );

  return credits;
}
