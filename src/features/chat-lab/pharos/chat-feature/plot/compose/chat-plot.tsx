import { ChartDataTable } from "../../../chat";
import { DownloadIconNormal } from "@/shared/assets/icons/outlined/DownloadNormal";
import { LineChartUpIcon } from "@/shared/assets/icons/outlined/LineChartUp";
import { TableIcon } from "@/shared/assets/icons/outlined/Table";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { ErrorBoundary } from "react-error-boundary";
import { ResponsiveContainer } from "recharts";
import { dataColumns, xColumnHeader } from "../lib/plot-data";
import { resolvePalette } from "../lib/plot-palette";
import { CHART_HEIGHT_PX, FONT_FAMILY } from "../lib/plot-theme";
import type { PlotSpec } from "../model/plot-schema";
import { usePlotView } from "../model/use-plot-view";
import { renderChartFor } from "../ui/plot-charts";
import { PlotErrorBlock } from "../ui/plot-feedback";

export { PlotErrorBlock, PlotSkeleton } from "../ui/plot-feedback";

const PlotChart = ({
  spec,
  className,
}: {
  spec: PlotSpec;
  className?: string;
}) => {
  const palette = resolvePalette(spec.palette);
  const { figureRef, isDataView, toggleView, isDownloading, handleDownload } =
    usePlotView(spec);

  return (
    <figure
      data-slot="plot"
      data-chart-type={spec.type}
      className={cn(
        "group relative my-3 md:my-6 flex flex-col gap-2 bg-transparent p-4 md:p-7 font-bureau",
        "hairline [--hairline-radius:14px] [--hairline-color:var(--color-gray-2)]",
        className,
      )}
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        <Button
          type="button"
          variant="icon-button"
          size="icon-sm"
          onClick={toggleView}
          aria-pressed={isDataView}
          aria-label={isDataView ? "Show chart" : "Show data table"}
          title={isDataView ? "Show chart" : "Show data"}
        >
          {isDataView ? (
            <LineChartUpIcon svgClasses="size-4" pathClasses="stroke-current" />
          ) : (
            <TableIcon svgClasses="size-4" pathClasses="stroke-current" />
          )}
        </Button>
        <Button
          type="button"
          variant="icon-button"
          size="icon-sm"
          isLoading={isDownloading}
          onClick={handleDownload}
          aria-label={
            isDataView ? "Download data as CSV" : "Download chart as image"
          }
          title={isDataView ? "Download data (CSV)" : "Download chart"}
        >
          <DownloadIconNormal
            svgClasses="size-4"
            pathClasses="stroke-current"
          />
        </Button>
      </div>
      <div ref={figureRef}>
        {(spec.title || spec.subtitle) && (
          <figcaption className="flex flex-col gap-0.5">
            {spec.title && (
              <Text
                variant="subtitle"
                color="primary"
                className="truncate pr-20"
              >
                {spec.title}
              </Text>
            )}
            {spec.subtitle && (
              <Text variant="label" color="secondary">
                {spec.subtitle}
              </Text>
            )}
          </figcaption>
        )}
        <div
          className="w-full"
          style={
            isDataView
              ? undefined
              : {
                  height: CHART_HEIGHT_PX,
                  fontFamily: FONT_FAMILY,
                }
          }
          role={isDataView ? undefined : "img"}
          aria-label={
            isDataView ? undefined : (spec.title ?? `${spec.type} chart`)
          }
        >
          {isDataView ? (
            <ChartDataTable
              className="max-h-100"
              columns={[
                { key: "x", label: xColumnHeader(spec) },
                ...dataColumns(spec),
              ]}
              rows={spec.data}
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChartFor(spec, palette)}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </figure>
  );
};

/**
 * Renders a themed chart from a validated plot spec. Drops into the
 * assistant message stream wherever the model emits a ```` ```numi-plot ````
 * code fence with valid JSON inside.
 *
 * Wrapped in a local error boundary so that any transient rendering crash
 * inside recharts (e.g. a DOM mutation race triggered by surrounding chat
 * components re-rendering during streaming) replaces just the chart with an
 * inline error block instead of bubbling up to the route-level boundary and
 * unmounting the entire chat surface.
 */
export const Plot = ({
  spec,
  className,
}: {
  spec: PlotSpec;
  className?: string;
}) => (
  <ErrorBoundary
    resetKeys={[spec]}
    fallbackRender={({ error }) => (
      <PlotErrorBlock
        error={
          error instanceof Error
            ? `Chart rendering failed: ${error.message}`
            : "Chart rendering failed"
        }
        className={className}
      />
    )}
  >
    <PlotChart spec={spec} className={className} />
  </ErrorBoundary>
);
