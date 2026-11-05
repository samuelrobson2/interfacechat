import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { cn } from "@/shared/lib/css";

export const COMBINED_METRICS_TOOLTIP_COPY =
  "Metrics for this combined dataset are estimated by weighting each source dataset's scores by row count. Adaptive Data was not re-run on the merged file.";

/**
 * Info icon + tooltip displayed next to the Quality card title when viewing a
 * dataset where `kind === 'combined'`. Communicates that the metrics are
 * row-weighted aggregates from the source datasets rather than fresh
 * evaluation results.
 */
export function DatasetCombinedMetricsTooltip({
  className,
}: {
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="About combined dataset metrics"
          className={cn(
            "inline-flex items-center justify-center text-icon-secondary",
            "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <CircleInfoIcon svgClasses="size-4" pathClasses="stroke-current" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px] text-left">
        {COMBINED_METRICS_TOOLTIP_COPY}
      </TooltipContent>
    </Tooltip>
  );
}
