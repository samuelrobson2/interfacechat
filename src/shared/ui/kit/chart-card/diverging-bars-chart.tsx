import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { resolveColor } from "@/shared/lib/css";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "../chart";
import { AXIS_TICK_STYLE, ChartPlot, GRID_COLOR } from "./shared";

interface DivergingBarsChartProps {
  data: Array<{ name: string | number; left: number; right: number }>;
  leftColor: string;
  rightColor: string;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  height?: number;
  className?: string;
}

function DivergingBarsChart({
  data,
  leftColor,
  rightColor,
  leftLabel = "Left",
  rightLabel = "Right",
  xLabel,
  yLabel,
  height = 480,
  className,
}: DivergingBarsChartProps) {
  const config: ChartConfig = React.useMemo(
    () => ({
      left: { label: leftLabel, color: resolveColor(leftColor) },
      right: { label: rightLabel, color: resolveColor(rightColor) },
    }),
    [leftColor, rightColor, leftLabel, rightLabel],
  );

  const maxAbs = React.useMemo(() => {
    const values = data.flatMap((d) => [Math.abs(d.left), Math.abs(d.right)]);
    const max = Math.max(...values);
    return Math.ceil(max / 10) * 10;
  }, [data]);

  // Left side is rendered as negative so bars grow towards the negative x-axis.
  const chartData = React.useMemo(
    () => data.map((d) => ({ ...d, left: -Math.abs(d.left), right: Math.abs(d.right) })),
    [data],
  );

  return (
    <ChartPlot
      height={height}
      className={className}
      xLabel={xLabel}
      yLabel={yLabel}
    >
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          stackOffset="sign"
          margin={{ top: 8, right: 16, bottom: 8, left: 4 }}
          barCategoryGap={3}
        >
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="2 4" />
          <XAxis
            type="number"
            domain={[-maxAbs, maxAbs]}
            tickFormatter={(v: number) => `${Math.abs(v)}`}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            width={40}
          />
          <ReferenceLine x={0} stroke="var(--color-red-5)" strokeWidth={1} />
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {Math.abs(Number(value))} ({String(name)})
                  </span>
                )}
              />
            }
            cursor={false}
          />
          <Bar dataKey="left" stackId="a" fill={resolveColor(leftColor)} radius={[0, 4, 4, 0]} barSize={14} />
          <Bar dataKey="right" stackId="a" fill={resolveColor(rightColor)} radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ChartContainer>
    </ChartPlot>
  );
}

export { DivergingBarsChart };
export type { DivergingBarsChartProps };
