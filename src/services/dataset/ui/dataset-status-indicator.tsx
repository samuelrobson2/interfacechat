import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import {
  DATASET_STATUSES,
  mapDatasetStatusToLabel,
  type DatasetStatus,
} from "../model/dataset-statuses";

const mapStateToColor: Record<DatasetStatus, string> = {
  [DATASET_STATUSES.uploading]: "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.awaiting_preprocessing]: "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.preprocessing_completed]: "bg-gradient-blue text-blue-5",
  [DATASET_STATUSES.preprocessing_failed]: "bg-gradient-red text-red-5",
  [DATASET_STATUSES.extracting_documents]: "bg-gradient-blue text-blue-5",
  [DATASET_STATUSES.processing]: "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.awaiting_column_selection]:
    "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.processing_metadata]: "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.configuring]: "bg-gradient-yellow text-yellow-5",
  [DATASET_STATUSES.launching]: "bg-gradient-orange text-orange-5",
  [DATASET_STATUSES.ready]: "bg-gradient-green text-green-5",
  [DATASET_STATUSES.failed]: "bg-gradient-red text-red-5",
};

export function DatasetStatusIndicatorBadge({
  state = DATASET_STATUSES.uploading,
  className,
}: {
  state?: DatasetStatus;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        mapStateToColor[state],
        "py-1.5",
        className,
      )}
    >
      <span className="size-1.5 rounded-full shrink-0 bg-current" />
      <span className="text-typography-primary">
        {mapDatasetStatusToLabel[state]}
      </span>
    </Badge>
  );
}
