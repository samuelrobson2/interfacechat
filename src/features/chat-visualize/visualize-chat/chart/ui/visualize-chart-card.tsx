import { VegaChart, type PlotTarget } from "@/services/plot";
import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import { FullScreenIcon } from "@/shared/assets/icons/general/FullScreen";
import { cn } from "@/shared/lib/css";
import { useChartDownload } from "@/shared/ui/kit/chart-download/chart-download";
import { Text } from "@/shared/ui/kit/text";
import { toChartFileName } from "../../_lib/chart-file-name";
import type { ChartBlock } from "../../_lib/chart-turn";

// Icons sit on the title, so they stay flat — no hover fill.
const toolbarButtonClasses =
  "flex size-4 shrink-0 cursor-pointer items-center justify-center text-icon-primary disabled:opacity-50";

export function VisualizeChartFrame({
  className,
  ...props
}: React.ComponentProps<"figure">) {
  return (
    <figure
      className={cn(
        "relative flex min-w-0 flex-col gap-6 rounded-[16px] bg-gray-0 p-6 hairline",
        "[--hairline-color:var(--color-gray-2)] [--hairline-radius:16px]",
        className,
      )}
      {...props}
    />
  );
}

export function VisualizeChartCard({
  block,
  className,
  showToolbar = true,
  onOpenFullscreen,
  onSelect,
  selection,
  plotRef,
  children,
}: {
  block: ChartBlock;
  className?: string;
  showToolbar?: boolean;
  onOpenFullscreen?: () => void;
  onSelect?: (target: PlotTarget | null) => void;
  selection?: PlotTarget | null;
  plotRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  const { ref, handleDownloadImage, isDownloading } = useChartDownload(
    toChartFileName(block.title),
  );

  return (
    <VisualizeChartFrame className={className}>
      {showToolbar && (
        <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadImage()}
            disabled={isDownloading}
            className={toolbarButtonClasses}
            aria-label="Download chart as image"
            title="Download chart"
          >
            <DownloadIconThin pathClasses="stroke-current" />
          </button>
          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              className={toolbarButtonClasses}
              aria-label="Open chart in fullscreen"
              title="Fullscreen"
            >
              <FullScreenIcon
                pathProps={{ strokeWidth: "1.5", strokeLinejoin: "round" }}
              />
            </button>
          )}
        </div>
      )}

      {/* Only this subtree is captured, so the toolbar stays out of the image. */}
      <div ref={ref} className="flex min-w-0 flex-col gap-6">
        {(block.title || block.subtitle) && (
          <div
            className={cn(
              "flex min-w-0 flex-col gap-0.5",
              showToolbar && "pr-12",
            )}
          >
            {block.title && (
              <Text variant="title" className="wrap-anywhere">
                {block.title}
              </Text>
            )}
            {block.subtitle && (
              <Text
                variant="caption"
                color="secondary"
                className="wrap-anywhere"
              >
                {block.subtitle}
              </Text>
            )}
          </div>
        )}
        <div ref={plotRef} className="relative w-full min-w-0">
          <VegaChart
            spec={block.spec}
            datasets={block.datasets}
            onSelect={onSelect}
            selection={selection}
          />
        </div>
      </div>
      {children}
    </VisualizeChartFrame>
  );
}

export function VisualizeChartError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-red-5/40 bg-red-1/40 px-6 py-6",
        className,
      )}
    >
      <Text variant="label" className="text-red-5">
        {message || "This chart could not be generated."}
      </Text>
    </div>
  );
}
