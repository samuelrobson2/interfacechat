import { datasetQueryOptions } from "@/services/dataset";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";

/**
 * Mint a fresh wizard session ("run attempt") on the backend, closing any
 * currently-open one for this dataset. Use on explicit "start new run"
 * entry points: the AutoScientist Continue button, the datasets-table
 * Configure button, and the dataset-detail Train button.
 *
 * Do NOT use on the launch-failed "Try again" path — that resumes the
 * existing open session by design.
 *
 * After minting we invalidate the wizard's cached step/steps queries so
 * the wizard loader re-fetches against the fresh empty session and the
 * loader's getCurrentStep returns the first step instead of jumping past
 * pre-existing completed-step marks from the previous attempt.
 */
export function useStartNewWizardSession() {
  const { mutateAsync, isPending } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/sessions/new",
  );

  const startNewSession = async (datasetId: string) => {
    await mutateAsync({
      params: { path: { dataset_id: datasetId } },
    });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: datasetQueryOptions.finetuneSteps(datasetId).queryKey,
      }),
      queryClient.invalidateQueries({
        // Catch any cached per-step queries too; the wizard loader fetches
        // these on demand and we don't want stale step.completed marks
        // from the closed session leaking into the new draft's UI.
        queryKey: ["get", "/datasets/{dataset_id}/finetune/steps/{key}"],
      }),
    ]);
  };

  return { startNewSession, isPending };
}
