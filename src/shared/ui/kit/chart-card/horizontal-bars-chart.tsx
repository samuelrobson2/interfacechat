import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { resolveColor } from "@/shared/lib/css";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "../chart";
import { AXIS_TICK_STYLE, ChartPlot, GRID_COLOR } from "./shared";

interface HorizontalBarsSeries {
  key: string;
  label?: React.ReactNode;
  color: string;
}

interface HorizontalBarsChartProps {
  data: Array<Record<string, string | number>>;
  categoryKey: string;
  series: HorizontalBarsSeries[];
  /** Optional per-row color key. If provided, each bar takes color from `row[colorKey]` (Tailwind token or CSS color). */
  colorKey?: string;
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  height?: number;
  className?: string;
}

function HorizontalBarsChart({
  data,
  categoryKey,
  series,
  colorKey,
  xLabel,
  yLabel,
  height = 320,
  className,
}: HorizontalBarsChartProps) {
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
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          barCategoryGap={6}
        >
          <CartesianGrid
            horizontal={false}
            stroke={GRID_COLOR}
            strokeDasharray="2 4"
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            width={72}
          />
          <Tooltip content={<ChartTooltipContent />} cursor={false} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={resolveColor(s.color)}
              radius={[0, 6, 6, 0]}
              barSize={18}
            >
              {colorKey
                ? data.map((row, i) => (
                    <Cell key={i} fill={resolveColor(String(row[colorKey]))} />
                  ))
                : null}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
    </ChartPlot>
  );
}

export { HorizontalBarsChart };
export type { HorizontalBarsSeries, HorizontalBarsChartProps };
