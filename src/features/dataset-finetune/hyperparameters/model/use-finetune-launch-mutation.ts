import { rqClient } from "@/shared/api/instance";

export function useFinetuneLaunchMutation() {
  return rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/launch",
  );
}
