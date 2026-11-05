import { ChatPillButton } from "@/services/chat";
import { useDeleteDisplayedChart } from "@/services/dataset";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import { Fragment } from "react";
import { useDatasetDataSuspense } from "../model/use-dataset-data-suspense";
import { useDatasetDisplayedCharts } from "../model/use-dataset-displayed-charts";
import { DatasetAddVisualization } from "../ui/dataset-add-visualization";
import { DatasetCustomChartCard } from "../ui/dataset-custom-chart-card";
import { DatasetCustomChartInviteCard } from "../ui/dataset-custom-chart-invite-card";

const gridClasses =
  "grid w-full min-w-0 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]";

const COLUMNS_PER_ROW = 3;

export function DatasetCustomCharts() {
  const { dataset } = useDatasetDataSuspense();
  const datasetId = dataset.dataset_id;
  const { charts, hasMore, loadMore } = useDatasetDisplayedCharts(datasetId);
  const { deleteChart } = useDeleteDisplayedChart(datasetId);

  if (charts.length === 0) return <DatasetAddVisualization />;

  return (
    <section className="flex w-full min-w-0 flex-col gap-8">
      {/* The empty state carries its own rules around the button instead. */}
      <Separator color="secondary" />

      <Text variant="h2" as="h2">
        Your custom charts
      </Text>

      <div className={gridClasses}>
        <DatasetCustomChartInviteCard datasetId={datasetId} />

        {charts.map((chart, index) => (
          <Fragment key={chart.chartId}>
            {/* The invite card holds the first cell, so charts start at 1. */}
            {(index + 1) % COLUMNS_PER_ROW !== 0 && (
              <Separator
                orientation="vertical"
                color="secondary"
                className="hidden xl:block"
              />
            )}

            <DatasetCustomChartCard
              chart={chart}
              onDelete={() => deleteChart(chart.chartId)}
            />
          </Fragment>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <ChatPillButton
            shape="pill-text"
            className="w-[95px]"
            onClick={loadMore}
            lottieClassName="size-5"
          >
            <Text variant="label" color="primary">
              Load more
            </Text>
          </ChatPillButton>
        </div>
      )}

      <Separator color="secondary" />
    </section>
  );
}
