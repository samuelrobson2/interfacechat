import { useFinetuneLaunchMutation } from "@/features/dataset-finetune";
import { refetchDatasetsAfterLaunch } from "@/services/dataset";
import { RelaunchIcon } from "@/shared/assets/icons/outlined/Relaunch";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { Button } from "@/shared/ui/kit/button";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function RetryFinetuneButton({ dataset_id }: { dataset_id: string }) {
  const { mutateAsync: launchFinetune, isPending } =
    useFinetuneLaunchMutation();

  const handleRetry = async () => {
    try {
      const launchRequestBody = {
        idempotency_key: crypto.randomUUID(),
      } as unknown as ApiSchemas["LaunchFinetuneJobDto"];

      await launchFinetune({
        params: { path: { dataset_id } },
        body: launchRequestBody,
      });

      await refetchDatasetsAfterLaunch(queryClient);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not relaunch training."));
    }
  };

  return (
    <Button variant="link" disabled={isPending} onClick={handleRetry}>
      <RelaunchIcon pathClasses="stroke-current" />
      Retry
    </Button>
  );
}
