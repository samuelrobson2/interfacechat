import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";

type BestFinetuneLaunchConfigResponse = {
  best_job_config: Record<string, unknown> | null;
};

type UntypedGetClient = {
  GET: (
    path: string,
    init: unknown,
  ) => Promise<{ data?: BestFinetuneLaunchConfigResponse }>;
};

export function useBestFinetuneLaunchConfigQuery(
  datasetId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["dataset", datasetId, "finetune", "best-launch-config"],
    enabled: Boolean(datasetId) && enabled,
    retry: false,
    queryFn: async () => {
      try {
        const client = fetchClient as unknown as UntypedGetClient;
        const { data } = await client.GET(
          "/datasets/{dataset_id}/finetune/best-launch-config",
          {
            params: {
              path: {
                dataset_id: datasetId as string,
              },
            },
          },
        );
        return data ?? { best_job_config: null };
      } catch {
        // Silent endpoint: absence/errors should not break dataset page.
        return { best_job_config: null };
      }
    },
  });
}
