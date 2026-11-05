import { Button } from "@/shared/ui/kit/button";
import {
  NEW_DATASET_ROUTES_MAP,
  type NewDatasetKeys,
} from "../../_lib/new-dataset-routes";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { href, Link, useParams } from "react-router-dom";
import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";

export function SummaryEditButton({
  stepKey,
  ...props
}: React.ComponentProps<typeof Button> & {
  stepKey: NewDatasetKeys;
}) {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <Button {...props} variant="link" asChild>
      <Link
        to={{
          pathname: href(NEW_DATASET_ROUTES_MAP[stepKey], {
            dataset_id: dataset_id!,
          }),
          search: "?from_summary=true",
        }}
      >
        <PencilEditIcon className="size-5" pathClasses="stroke-current" />
        Edit
      </Link>
    </Button>
  );
}
