import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { resolveColor } from "@/shared/lib/css";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "../chart";
import { AXIS_TICK_STYLE, ChartPlot, GRID_COLOR } from "./shared";

interface DensityCurveSeries {
  key: string;
  label?: React.ReactNode;
  color: string;
}

interface DensityCurveChartProps {
  data: Array<Record<string, number>>;
  xKey: string;
  series: DensityCurveSeries[];
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  height?: number;
  fillOpacity?: number;
  className?: string;
}

function DensityCurveChart({
  data,
  xKey,
  series,
  xLabel,
  yLabel,
  height = 360,
  fillOpacity = 0.35,
  className,
}: DensityCurveChartProps) {
  const config: ChartConfig = React.useMemo(
    () =>
      series.reduce<ChartConfig>((acc, s) => {
        acc[s.key] = { label: s.label ?? s.key, color: resolveColor(s.color) };
        return acc;
      }, {}),
    [series],
  );

  return (
    <ChartPlot
      height={height}
      className={className}
      xLabel={xLabel}
      yLabel={yLabel}
    >
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid
            stroke={GRID_COLOR}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            type="number"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
          />
          <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} />
          <Tooltip content={<ChartTooltipContent indicator="line" />} />
          {series.map((s) => {
            const color = resolveColor(s.color);
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={fillOpacity}
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, stroke: color, fill: "var(--color-background-primary)" }}
              />
            );
          })}
        </AreaChart>
      </ChartContainer>
    </ChartPlot>
  );
}

export { DensityCurveChart };
export type { DensityCurveSeries, DensityCurveChartProps };
