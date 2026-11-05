import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import type { ButtonProps } from "@/shared/ui/kit/button";
import { href, Link, useLocation, useParams } from "react-router-dom";
import { type FinetuneStepKey } from "../_lib/finetune-routes";
import { ROUTES } from "@/shared/model/routes";
import { useFinetuneStepOrderNavigation } from "../_model/use-finetune-step-order-navigation";
import {
  FINETUNE_ENTRY_POINTS,
  FINETUNE_ENTRY_QUERY_PARAM,
  parseFinetuneEntryPoint,
} from "../_lib/finetune-entry-point";

export function DatasetFinetuneBackButton({
  stepKey,
  ...props
}: ButtonProps & { stepKey: FinetuneStepKey }) {
  const { dataset_id } = useParams();
  const { search } = useLocation();
  const { previousStepRoute } = useFinetuneStepOrderNavigation(stepKey);

  const query = new URLSearchParams(search);
  const entryPoint = parseFinetuneEntryPoint(
    query.get(FINETUNE_ENTRY_QUERY_PARAM),
  );

  const firstStepBackRoute = (() => {
    if (!dataset_id) return ROUTES.DATASETS;
    if (entryPoint === FINETUNE_ENTRY_POINTS.autoscientist) {
      return ROUTES.DATASET_AUTOSCIENTIST_DASHBOARD;
    }
    if (entryPoint === FINETUNE_ENTRY_POINTS.dashboard) {
      return ROUTES.DATASETS;
    }
    return `${href(ROUTES.DASHBOARD_DATASET, { dataset_id })}?tab=finetune`;
  })();

  const resolvedRoute = previousStepRoute ?? firstStepBackRoute;

  return (
    <Button className="w-full" variant="secondary" asChild {...props}>
      <Link to={resolvedRoute}>
        <ArrowLeftIcon pathClasses="stroke-current" />
        Back
      </Link>
    </Button>
  );
}
