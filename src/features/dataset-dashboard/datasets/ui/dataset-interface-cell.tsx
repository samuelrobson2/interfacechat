import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { href, Link } from "react-router-dom";
import type { DatasetListRow } from "../model/use-datasets-table";

// A generated interface is offered once autoscientist has produced a training
// experiment, or once one already exists for the dataset.
function isInterfaceCapable(row: DatasetListRow) {
  return Boolean(row.latest_finetune?.training_experiment_id);
}

// "View" mirrors the Adaptive data / Autoscientist cells: a link + arrow. It
// opens the dataset's Interfaces tab, where the generated interfaces live.
export function DatasetInterfaceCell({ row }: { row: DatasetListRow }) {
  const interfacesTabLink = `${href(ROUTES.DASHBOARD_DATASET, {
    dataset_id: row.dataset_id,
  })}?tab=interfaces`;

  if (row.latest_interface) {
    return (
      <Button variant="link" asChild>
        <Link to={interfacesTabLink}>
          View <ArrowRightIcon pathClasses="stroke-current" />
        </Link>
      </Button>
    );
  }

  if (!isInterfaceCapable(row)) return null;

  return (
    <Button variant="link" asChild>
      <Link to={interfacesTabLink}>
        Create <ArrowRightIcon pathClasses="stroke-current" />
      </Link>
    </Button>
  );
}
