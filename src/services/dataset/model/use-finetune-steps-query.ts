import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { datasetQueryOptions } from "./dataset-query-options";

export function useFinetuneStepsQuery(datasetId?: string) {
  return useQuery({
    ...datasetQueryOptions.finetuneSteps(datasetId ?? ""),
    enabled: Boolean(datasetId),
  });
}

export function useFinetuneStepsSuspenseQuery(datasetId: string) {
  return useSuspenseQuery(datasetQueryOptions.finetuneSteps(datasetId));
}

export function useFinetuneStepQuery(
  datasetId: string | undefined,
  stepKey: string,
) {
  return useQuery({
    ...datasetQueryOptions.finetuneStep(datasetId ?? "", stepKey),
    enabled: Boolean(datasetId && stepKey),
  });
}

export function useFinetuneStepSuspenseQuery(datasetId: string, stepKey: string) {
  return useSuspenseQuery(datasetQueryOptions.finetuneStep(datasetId, stepKey));
}

export function getFinetuneStepCache(datasetId: string, stepKey: string) {
  return queryClient.getQueryData(
    datasetQueryOptions.finetuneStep(datasetId, stepKey).queryKey,
  );
}

const FINETUNE_JOB_TERMINAL_STATUSES = new Set([
  "succeeded",
  "failed",
  "eval_failed",
  "cancelled",
  "canceled",
  "error",
]);

export function isFinetuneJobTerminal(status: string | null | undefined) {
  return Boolean(status && FINETUNE_JOB_TERMINAL_STATUSES.has(status));
}

const EXPERIMENT_TERMINAL_STATUSES = new Set([
  "succeeded",
  "completed",
  "failed",
  "cancelled",
]);

export function isExperimentTerminal(status: string | null | undefined) {
  return Boolean(status && EXPERIMENT_TERMINAL_STATUSES.has(status));
}

const EXPERIMENT_POLL_INTERVAL_MS = 10_000;

export function useExperimentStatusQuery(
  datasetId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    ...datasetQueryOptions.experimentStatus(datasetId ?? ""),
    enabled: Boolean(datasetId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (isExperimentTerminal(status)) {
        return false;
      }
      return EXPERIMENT_POLL_INTERVAL_MS;
    },
  });
}

const METRICS_POLL_INTERVAL_MS = 30_000;

export function useFinetuneJobMetricsQuery(
  datasetId: string | undefined,
  jobId: string | undefined,
  jobStatus: string | undefined,
) {
  const jobTerminal = isFinetuneJobTerminal(jobStatus);
  return useQuery({
    ...datasetQueryOptions.finetuneJobMetrics(datasetId ?? "", jobId ?? ""),
    enabled: Boolean(datasetId && jobId),
    refetchInterval: (query) => {
      const evalStatus = query.state.data?.evaluation_status;
      if (
        jobTerminal &&
        (!evalStatus || evalStatus === "completed" || evalStatus === "failed" || evalStatus === "skipped")
      ) {
        return false;
      }
      return METRICS_POLL_INTERVAL_MS;
    },
  });
}

export function useFinetuneJobMetricsSuspenseQuery(
  datasetId: string,
  jobId: string,
  jobStatus: string | undefined,
) {
  const jobTerminal = isFinetuneJobTerminal(jobStatus);
  return useSuspenseQuery({
    ...datasetQueryOptions.finetuneJobMetrics(datasetId, jobId),
    refetchInterval: (query) => {
      const evalStatus = query.state.data?.evaluation_status;
      if (
        jobTerminal &&
        (!evalStatus || evalStatus === "completed" || evalStatus === "failed" || evalStatus === "skipped")
      ) {
        return false;
      }
      return METRICS_POLL_INTERVAL_MS;
    },
  });
}

export function useFinetuneJobQuery(
  datasetId: string | undefined,
  jobId: string | undefined,
) {
  return useQuery({
    ...datasetQueryOptions.finetuneJob(datasetId ?? "", jobId ?? ""),
    enabled: Boolean(datasetId && jobId),
  });
}

export function useFinetuneJobConfigQuery(
  datasetId: string | undefined,
  jobId: string | undefined,
  enabled = true,
) {
  return useQuery({
    ...datasetQueryOptions.finetuneJobConfig(datasetId ?? "", jobId ?? ""),
    enabled: Boolean(datasetId && jobId) && enabled,
  });
}
