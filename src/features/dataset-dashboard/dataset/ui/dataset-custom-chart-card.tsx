import { VegaChart } from "@/services/plot";
import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import { OpenIcon } from "@/shared/assets/icons/outlined/Open";
import { cn } from "@/shared/lib/css";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import { ROUTES } from "@/shared/model/routes";
import { useChartDownload } from "@/shared/ui/kit/chart-download/chart-download";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import Markdown from "react-markdown";
import { Link, href } from "react-router-dom";
import type { DisplayedChart } from "../model/use-dataset-displayed-charts";

/** A chart title is free text, so path separators have to go. */
const toFileName = (title: string) =>
  `${title.replace(/[\\/:*?"<>|]/g, "-")}.png`;

// The actions sit on top of the chart, so they stay flat — no hover fill.
const actionClasses =
  "flex size-6 shrink-0 items-center justify-center text-icon-primary disabled:opacity-50 cursor-pointer";

function ChartSummaryTooltip({ summary }: { summary: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Chart summary"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-icon-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CircleInfoIcon />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[420px] py-2 text-left [&_p]:m-0 [&_p+_p]:mt-2 [&_ul]:my-1 [&_ol]:my-1 [&_li]:m-0">
        <Markdown>{summary}</Markdown>
      </TooltipContent>
    </Tooltip>
  );
}

export function DatasetCustomChartCard({
  chart,
  onDelete,
  className,
}: {
  chart: DisplayedChart;
  onDelete: () => void;
  className?: string;
}) {
  const { ref, handleDownloadImage, isDownloading } = useChartDownload(
    toFileName(chart.title),
  );

  return (
    <div className={cn("relative flex min-w-0 flex-col", className)}>
      <div className="absolute right-0 top-0 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className={actionClasses}
          aria-label="Remove chart from the dataset"
          title="Remove chart"
        >
          <TrashIcon svgClasses="size-6" pathClasses="fill-red-5" />
        </button>

        {isChatVisualizeEnabled() && (
          <Link
            to={href(ROUTES.CHAT_VISUALIZE_SESSION, {
              chat_id: chart.sessionId,
            })}
            className={actionClasses}
            aria-label="Open the chat this chart came from"
            title="Open in chat"
          >
            <OpenIcon svgClasses="size-6" pathClasses="stroke-current" />
          </Link>
        )}

        <button
          type="button"
          onClick={() => handleDownloadImage()}
          disabled={isDownloading}
          className={actionClasses}
          aria-label="Download chart as image"
          title="Download chart"
        >
          <DownloadIconThin className="size-6" pathClasses="stroke-current" />
        </button>
      </div>

      {/* Only this subtree is captured, so the actions stay out of the image. */}
      <div ref={ref} className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-2 pr-[104px]">
          <div className="flex min-w-0 items-center gap-2">
            <Text variant="title" className="min-w-0 line-clamp-2">
              {chart.title}
            </Text>
            {chart.summary && <ChartSummaryTooltip summary={chart.summary} />}
          </div>
          {chart.subtitle && (
            <Text
              variant="label"
              color="secondary"
              className="line-clamp-2"
              title={chart.subtitle}
            >
              {chart.subtitle}
            </Text>
          )}
        </div>
        <VegaChart spec={chart.spec} datasets={chart.datasets} />
      </div>
    </div>
  );
}
