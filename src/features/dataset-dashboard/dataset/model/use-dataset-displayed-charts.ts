import { datasetQueryOptions } from "@/services/dataset";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ApiSchemas } from "@/shared/api/schema";
import { readSpecHeading, toVegaPayload, withoutSpecHeading, type VegaPayload } from "@/services/plot";

const INITIAL_LIMIT = 5;
const LOAD_MORE_LIMIT = 6;

type DisplayedChartDto = ApiSchemas["DatasetDisplayedChartDto"];

export type DisplayedChart = VegaPayload & {
  chartId: string;
  sessionId: string;
  title: string;
  subtitle?: string;
  summary?: string;
};

const FALLBACK_TITLE = "Custom chart";

export const parseDisplayedChart = (
  chart: DisplayedChartDto,
): DisplayedChart | undefined => {
  const spec = chart.block?.spec;
  if (!spec) return undefined;

  const heading = readSpecHeading(spec);

  return {
    chartId: chart.chart_id,
    sessionId: chart.session_id,
    title: chart.title?.trim() || heading.text || FALLBACK_TITLE,
    subtitle: heading.subtitle || undefined,
    summary: chart.summary?.trim() || undefined,
    ...toVegaPayload(withoutSpecHeading(spec), chart.block?.data),
  };
};

export function useDatasetDisplayedCharts(datasetId: string) {
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const { data } = useSuspenseQuery(
    datasetQueryOptions.displayedCharts(datasetId),
  );

  const charts = useMemo(
    () => data.charts.flatMap((chart) => parseDisplayedChart(chart) ?? []),
    [data.charts],
  );

  return {
    charts: charts.slice(0, limit),
    hasMore: charts.length > limit,
    loadMore: () => setLimit((prev) => prev + LOAD_MORE_LIMIT),
  };
}
