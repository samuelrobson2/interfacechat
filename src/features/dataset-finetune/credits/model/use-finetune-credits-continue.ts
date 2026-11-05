import { useTransition } from "react";
import { href, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

export function useFinetuneCreditsContinue() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [isPending, startTransition] = useTransition();

  const submit = (datasetId: string) => {
    startTransition(async () => {
      navigate(
        `${href(ROUTES.DATASET_FINETUNE_CONFIRM, {
          dataset_id: datasetId,
        })}${search}`,
      );
    });
  };

  return {
    submit,
    isPending,
  };
}
