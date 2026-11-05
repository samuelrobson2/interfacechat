import { href, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/api-error";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useFinetuneLaunchMutation } from "../../hyperparameters/model/use-finetune-launch-mutation";
import { getFinetuneStepsData } from "../../_model/get-finetune-steps-data";

type SubmitArgs = {
  dataset_id: string;
  launchBody: ApiSchemas["LaunchFinetuneJobDto"];
};

export function useConfirmLaunch() {
  const navigate = useNavigate();
  const { mutateAsync: launchFinetune, isPending: isLaunching } =
    useFinetuneLaunchMutation();

  const submit = async ({ dataset_id, launchBody }: SubmitArgs) => {
    try {
      const launchRequestBody: ApiSchemas["LaunchFinetuneJobDto"] = {
        ...launchBody,
        idempotency_key: launchBody.idempotency_key ?? crypto.randomUUID(),
      };

      await launchFinetune({
        params: { path: { dataset_id } },
        body: launchRequestBody,
      });

      await getFinetuneStepsData(dataset_id, false);
      navigate(
        href(ROUTES.DATASET_FINETUNE_LAUNCH_SUCCESS, {
          dataset_id,
        }),
        { replace: true },
      );
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not launch training.");
      navigate(
        href(ROUTES.DATASET_FINETUNE_LAUNCH_FAILED, {
          dataset_id,
        }),
        {
          replace: true,
          state: {
            errorMessage: message,
          },
        },
      );
      toast.error(message);
    }
  };

  return {
    submit,
    isLaunching,
  };
}
