import { useMemo, useState } from "react";
import { Text } from "@/shared/ui/kit/text";
import { createGradient } from "../../lib/metrics-chart-helpers";
import type {
  ChartMetricKey,
  ChartPoint,
  MetricCard,
} from "../../model/metrics-types";
import { MetricsAreaChart } from "./metrics-area-chart";
import { MetricsLegend } from "./metrics-legend";

export function MetricCardView({
  data,
  xAxisTicks,
  card,
}: {
  data: ChartPoint[];
  xAxisTicks: number[];
  card: MetricCard;
}) {
  const gradientId = `${card.id}-fill-gradient`;
  const [hoveredLegendDataKey, setHoveredLegendDataKey] =
    useState<ChartMetricKey | null>(null);
  const yAxisDomain = useMemo<[number, number] | undefined>(() => {
    const values = card.series.flatMap((series) =>
      data
        .map((point) => point[series.dataKey])
        .filter((value): value is number => typeof value === "number"),
    );

    if (values.length === 0) return undefined;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const paddedMax = max === 0 ? 1 : max + max * 0.1;

    if (min === max) {
      const delta = min === 0 ? 1 : Math.abs(min) * 0.05;
      return [min - delta, paddedMax];
    }

    return [min, paddedMax];
  }, [card.series, data]);
  const visibleSeries = useMemo(() => {
    if (!hoveredLegendDataKey) return card.series;
    return card.series.filter(
      (series) => series.dataKey === hoveredLegendDataKey,
    );
  }, [card.series, hoveredLegendDataKey]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-6">
        <Text variant="title">{card.title}</Text>
        {card.legendItems && card.legendItems.length > 0 ? (
          <MetricsLegend
            items={card.legendItems}
            hoveredDataKey={hoveredLegendDataKey}
            onHoverChange={setHoveredLegendDataKey}
          />
        ) : null}
      </div>
      <MetricsAreaChart
        data={data}
        xAxisTicks={xAxisTicks}
        yAxisDomain={yAxisDomain}
        gradients={createGradient(
          gradientId,
          card.gradientColor,
          card.gradientOpacity,
        )}
        series={visibleSeries.map((series) => ({
          dataKey: series.dataKey,
          stroke: series.stroke,
          fillGradientId: gradientId,
          isFilled: series.isFilled ?? true,
          label: series.label,
        }))}
        tooltipTitle={card.tooltipTitle}
      />
    </div>
  );
}
