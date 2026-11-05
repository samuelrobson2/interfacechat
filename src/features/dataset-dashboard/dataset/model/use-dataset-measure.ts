import { useDatasetCache } from "@/services/dataset";

export type DatasetMeasureData = {
  gains?: string;
  grade_before: string;
  grade_after: string;
  quality_before: string;
  quality_after: string;
  percentile_after: string;
  percentile_before: string;
  qualityChartData: {
    name: string;
    value: string;
    labelText: string;
    color: string;
    fill?: string;
    borderColor?: string;
  }[];
};

export function useDatasetMeasure(): DatasetMeasureData | null {
  const dataset = useDatasetCache();

  const evaluationResults = dataset?.evaluation_results;

  if (!evaluationResults || !dataset?.metadata) return null;

  const metadata = dataset.metadata;
  const quality_before = (metadata?.quality_score ?? 0).toFixed(1);
  const grade_before = metadata?.dataset_grade ?? "";
  const percentile_before = (metadata?.percentile_score ?? 0).toFixed(1);

  const quality_percentile_after =
    evaluationResults?.metrics?.quality_percentile_after;
  const quality_after = (quality_percentile_after?.quality_score ?? 0).toFixed(
    1,
  );
  const grade_after = quality_percentile_after?.quality_grade ?? "";
  const percentile_after = (
    quality_percentile_after?.percentile_score ?? 0
  ).toFixed(1);

  const gains = (
    ((Number(quality_after) - Number(quality_before)) /
      Number(quality_before)) *
    100
  ).toFixed(1);

  const qualityChartData = [
    {
      name: "original text",
      value: quality_before,
      labelText: "Before",
      color: "var(--color-blue-2)",
      fill: "url(#quality-original-text-gradient)",
      borderColor: "var(--color-gray-2)",
    },
    {
      name: "adaptive text",
      value: quality_after,
      labelText: "After",
      color: "var(--color-blue-3)",
      fill: "url(#quality-adaptive-text-gradient)",
      borderColor: "var(--color-blue-3)",
    },
  ];

  return {
    gains,
    grade_before,
    grade_after,
    quality_before,
    quality_after,
    percentile_after,
    percentile_before,
    qualityChartData,
  };
}
