import gradeImage from "@/shared/assets/images/dataset-grade.png";
import percentileImage from "@/shared/assets/images/percentile.png";
import { useDatasetCache } from "@/services/dataset";
import { useDatasetMeasure } from "../model/use-dataset-measure";
import { DatasetChart } from "../ui/dataset-chart";
import { DatasetChartCard } from "../ui/dataset-chart-card";
import { DatasetChartLegend } from "../ui/dataset-chart-legend";
import { DatasetNotReadyCard } from "../ui/dataset-not-ready-card";
import {
  DatasetQualityCard,
  DatasetQualityCardContent,
  DatasetQualityCardItem,
} from "../ui/dataset-quality-card";
import { DatasetCombinedMetricsTooltip } from "../ui/dataset-combined-metrics-tooltip";

export function DatasetMeasure() {
  const measures = useDatasetMeasure();
  const datasetData = useDatasetCache();

  if (!measures) return <DatasetNotReadyCard />;

  const {
    gains,
    grade_before,
    grade_after,
    percentile_after,
    percentile_before,
    qualityChartData,
  } = measures;

  const isCombined = datasetData?.kind === "combined";

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 xl:flex-row xl:items-stretch">
      <DatasetChartCard
        title="Quality"
        improvementPercent={gains}
        titleAccessory={isCombined ? <DatasetCombinedMetricsTooltip /> : null}
        className="min-w-0 xl:flex-1"
      >
        <DatasetChartLegend chartData={qualityChartData} />
        <DatasetChart chartData={qualityChartData} />
      </DatasetChartCard>

      {/* Horizontal while Quality is stacked above (< xl), vertical on one row. */}
      <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary xl:h-auto xl:w-px" />

      {/* Grade + Percentile: stacked on mobile, side by side from md, and at
          xl `contents` dissolves the group so all three cards share one row. */}
      <div className="flex min-w-0 flex-col gap-8 md:flex-row md:items-stretch xl:contents">
        <DatasetQualityCard
          className="min-w-0 flex-1"
          icon={<img src={gradeImage} alt="grade" />}
        >
          <DatasetQualityCardContent title="Grade" contentClassName="gap-19">
            <DatasetQualityCardItem title="Before" value={grade_before} />
            <DatasetQualityCardItem title="After" value={grade_after} />
          </DatasetQualityCardContent>
        </DatasetQualityCard>

        {/* Horizontal while Grade/Percentile stack (< md), vertical side by side. */}
        <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary md:h-auto md:w-px" />

        <DatasetQualityCard
          className="min-w-0 flex-1"
          icon={<img src={percentileImage} alt="percentile" />}
        >
          <DatasetQualityCardContent title="Percentile" contentClassName="gap-19">
            <DatasetQualityCardItem title="Before" value={percentile_before} />
            <DatasetQualityCardItem title="After" value={percentile_after} />
          </DatasetQualityCardContent>
        </DatasetQualityCard>
      </div>
    </div>
  );
}
