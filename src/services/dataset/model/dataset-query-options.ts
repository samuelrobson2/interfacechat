import {
  keepPreviousData,
  type QueryClient,
} from "@tanstack/react-query";
import { rqClient } from "../../../shared/api/instance";

export const datasetsListQueryKeyPrefix = ["get", "/datasets"] as const;
export const datasetsProgressQueryKeyPrefix = [
  "post",
  "/datasets/progress",
] as const;

/** Model catalog changes rarely; avoids 429 from remount / focus / Strict Mode refetch bursts. */
const FINETUNE_MODELS_STALE_MS = 5 * 60_000;
const FINETUNE_STEPS_STALE_MS = 10_000;

export const datasetQueryOptions = {
  steps: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/config/steps", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
  step: (dataset_id: string, key: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/config/steps/{key}", {
      params: {
        path: {
          dataset_id,
          key,
        },
      },
    }),
  dataset_status: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/status", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
  datasets: ({
    page,
    perPage,
    period,
    recent,
    status,
    forAutoscientist,
    forChart,
  }: {
    page?: number;
    perPage?: number;
    period?: string;
    recent?: boolean;
    status?: string;
    forAutoscientist?: boolean;
    forChart?: boolean;
  } = {}) => {
    return rqClient.queryOptions("get", "/datasets", {
      params: {
        query: {
          page: page ?? 1,
          perPage: perPage ?? 10,
          period: period,
          recent: recent ?? false,
          status: status,
          ...(forAutoscientist && { for_autoscientist: true }),
          ...(forChart && { for_chart: true }),
        },
      },
      placeholderData: keepPreviousData,
    });
  },
  dataset: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
  datasetProgress: (dataset_ids: string[]) =>
    rqClient.queryOptions("post", "/datasets/progress", {
      body: {
        dataset_ids,
      },
    }),
  datasetView: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/view", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
  finetuneModels: (dataset_id: string) => ({
    ...rqClient.queryOptions("get", "/datasets/{dataset_id}/finetune/models", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
    staleTime: FINETUNE_MODELS_STALE_MS,
  }),
  finetuneSteps: (dataset_id: string) =>
  ({
    ...rqClient.queryOptions("get", "/datasets/{dataset_id}/finetune/steps", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
    staleTime: FINETUNE_STEPS_STALE_MS,
  }),
  finetuneStep: (dataset_id: string, key: string) =>
  ({
    ...rqClient.queryOptions("get", "/datasets/{dataset_id}/finetune/steps/{key}", {
      params: {
        path: {
          dataset_id,
          key,
        },
      },
    }),
    staleTime: FINETUNE_STEPS_STALE_MS,
  }),
  finetuneCalculate: (
    dataset_id: string,
    augmentation?: {
      augmentation_domain_rows?: number;
      augmentation_general_rows?: number;
    },
  ) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/finetune/calculate", {
      params: {
        path: {
          dataset_id,
        },
        query: augmentation,
      },
    }),
  finetuneJobs: (dataset_id: string) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/finetune/jobs",
      {
        params: {
          path: {
            dataset_id,
          },
        },
      },
    ),
  finetuneJob: (dataset_id: string, job_id: string) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/finetune/jobs/{job_id}",
      {
        params: {
          path: {
            dataset_id,
            job_id,
          },
        },
      },
    ),
  finetuneJobMetrics: (dataset_id: string, job_id: string) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/finetune/jobs/{job_id}/metrics",
      {
        params: {
          path: {
            dataset_id,
            job_id,
          },
        },
      },
    ),
  finetuneJobConfig: (dataset_id: string, job_id: string) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/finetune/jobs/{job_id}/config",
      {
        params: {
          path: {
            dataset_id,
            job_id,
          },
        },
      },
    ),
  experimentStatus: (dataset_id: string) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/finetune/experiment-status",
      {
        params: {
          path: {
            dataset_id,
          },
        },
      },
    ),
  finetuneHyperparams: (dataset_id: string) => ({
    ...rqClient.queryOptions("post", "/datasets/{dataset_id}/finetune/hyperparams", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
    staleTime: 60_000,
  }),
  datasetExportLinks: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/export-links", {
      params: {
        path: {
          dataset_id,
        },
      },
      throwOnError: false,
    }),
  huggingfaceFiles: (url: string) =>
    rqClient.queryOptions("get", "/datasets/huggingface/files", {
      params: {
        query: {
          huggingfaceUrl: url,
        },
      },
    }),
  brandFiles: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/brand-files", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
  datasetSnippet: (datasetId: string) =>
    rqClient.queryOptions("get", "/snippets/dataset/{datasetId}", {
      params: {
        path: {
          datasetId
        }
      },
      throwOnError: false,
    }),
  displayedCharts: (dataset_id: string) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/charts/displayed", {
      params: {
        path: {
          dataset_id,
        },
      },
    }),
} as const;

/** Refetch dashboard list + progress after launch/relaunch (any page/filter). */
export async function refetchDatasetsAfterLaunch(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: datasetsListQueryKeyPrefix }),
  ]);

  await Promise.all([
    queryClient.refetchQueries({ queryKey: datasetsListQueryKeyPrefix }),
  ]);
}
