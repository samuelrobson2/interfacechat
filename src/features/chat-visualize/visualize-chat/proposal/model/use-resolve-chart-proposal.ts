import { useQueryClient } from "@tanstack/react-query";

import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useChartSessionId } from "../../_model/use-chart-session";
import { useRefreshChartTranscript } from "../../_model/use-refresh-chart-transcript";

const CHART_JOB_PATH = "/chart-sessions/{sessionId}/jobs/{jobId}";

export function useResolveChartProposal() {
  const sessionId = useChartSessionId();
  const queryClient = useQueryClient();
  const refreshTranscript = useRefreshChartTranscript();

  const { mutateAsync, isPending } = rqClient.useMutation(
    "post",
    "/chart-sessions/{sessionId}/proposals/{proposalId}/resolve",
  );

  const resolveProposal = async ({
    proposalId,
    choice,
  }: {
    proposalId: string;
    choice: ApiSchemas["ResolveChartEditProposalDto"]["choice"];
  }) => {
    await mutateAsync({
      params: { path: { sessionId, proposalId } },
      body: { choice },
    });

    await refreshTranscript();
    // The settled job would keep answering `awaiting_choice` from the cache.
    queryClient.removeQueries({ queryKey: ["get", CHART_JOB_PATH] });
  };

  return { resolveProposal, isResolving: isPending };
}
