import { href } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import {
  FINETUNE_ROUTES_BY_STEP_KEY,
  type FinetuneStepKey,
} from "./finetune-routes";

export function resolveFinetuneStepRoute(datasetId: string, backendStepKey: string) {
  const matchedRoute =
    FINETUNE_ROUTES_BY_STEP_KEY[backendStepKey as FinetuneStepKey];
  if (matchedRoute) {
    return href(matchedRoute, {
      dataset_id: datasetId,
    });
  }

  return ROUTES.DATASET_FINETUNE_STEP
    .replace(":dataset_id", datasetId)
    .replace(":step_key", encodeURIComponent(backendStepKey));
}
