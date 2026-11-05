import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { Progress } from "@/shared/ui/kit/progress";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { Link } from "react-router-dom";
import { DATASET_STATUSES } from "@/services/dataset";
import type { DatasetStatus } from "@/services/dataset";

export function DatasetsDownloadProgress({
  progressPercentage,
  datasetLink,
  onArrowClick,
  arrowAriaLabel,
  className,
  status,
}: {
  progressPercentage?: number | null;
  datasetLink?: string;
  onArrowClick?: () => void;
  arrowAriaLabel?: string;
  className?: string;
  status: DatasetStatus;
}) {
  if (
    !progressPercentage &&
    status !== DATASET_STATUSES.failed &&
    status !== DATASET_STATUSES.preprocessing_failed
  ) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center justify-between w-full">
        <Text>{progressPercentage}%</Text>
        {datasetLink ? (
          <Button variant="link" asChild>
            <Link to={datasetLink}>
              <ArrowRightIcon className="size-5" pathClasses="stroke-current" />
            </Link>
          </Button>
        ) : onArrowClick ? (
          <Button
            variant="link"
            onClick={onArrowClick}
            aria-label={arrowAriaLabel}
          >
            <ArrowRightIcon className="size-5" pathClasses="stroke-current" />
          </Button>
        ) : null}
      </div>

      <Progress value={progressPercentage} className="h-0.5" />
    </div>
  );
}
