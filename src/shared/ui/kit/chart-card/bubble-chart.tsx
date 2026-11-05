import * as React from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { cn, resolveColor } from "@/shared/lib/css";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "../chart";
import { Text } from "../text";
import { AXIS_TICK_STYLE, ChartPlot, GRID_COLOR } from "./shared";

interface BubbleSeries {
  key: string;
  label?: React.ReactNode;
  color: string;
  data: Array<{ x: number; y: number; z: number }>;
}

interface BubbleChartProps {
  series: BubbleSeries[];
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  sizeRange?: [number, number];
  fillOpacity?: number;
  height?: number;
  xTickFormatter?: (value: number) => string;
  yTickFormatter?: (value: number) => string;
  className?: string;
}

function BubbleChart({
  series,
  xLabel,
  yLabel,
  sizeRange = [60, 2400],
  fillOpacity = 0.45,
  height = 420,
  xTickFormatter,
  yTickFormatter,
  className,
}: BubbleChartProps) {
  const config: ChartConfig = React.useMemo(
    () =>
      series.reduce<ChartConfig>((acc, s) => {
        acc[s.key] = { label: s.label ?? s.key, color: resolveColor(s.color) };
        return acc;
      }, {}),
    [series],
  );

  const zDomain = React.useMemo(() => {
    const zs = series.flatMap((s) => s.data.map((d) => d.z));
    return [Math.min(...zs), Math.max(...zs)] as [number, number];
  }, [series]);

  return (
    <ChartPlot
      height={height}
      className={className}
      xLabel={xLabel}
      yLabel={yLabel}
    >
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="x"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            type="number"
            dataKey="y"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={yTickFormatter}
          />
          <ZAxis type="number" dataKey="z" range={sizeRange} domain={zDomain} />
          <Tooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
          {series.map((s) => {
            const color = resolveColor(s.color);
            return (
              <Scatter
                key={s.key}
                name={typeof s.label === "string" ? s.label : s.key}
                data={s.data}
                fill={color}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth={1}
                shape="circle"
                isAnimationActive={false}
              >
                {s.data.map((_, i) => (
                  <Cell key={i} fill={color} fillOpacity={fillOpacity} stroke={color} />
                ))}
              </Scatter>
            );
          })}
          <Legend content={() => null} />
        </ScatterChart>
      </ChartContainer>
    </ChartPlot>
  );
}

interface BubbleSizeLegendProps extends React.ComponentProps<"div"> {
  items: Array<{ label: React.ReactNode; size: number }>;
  color?: string;
}

// Vertical legend that visually encodes the Z-axis (bubble radius).
function BubbleSizeLegend({
  items,
  color = "gray-3",
  className,
  ...props
}: BubbleSizeLegendProps) {
  const maxSize = Math.max(...items.map((i) => i.size));
  const fill = resolveColor(color);

  return (
    <div
      data-slot="bubble-size-legend"
      className={cn("flex flex-col items-start gap-3 px-6", className)}
      {...props}
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="inline-flex shrink-0 items-center justify-center"
            style={{ width: maxSize, height: maxSize }}
          >
            <span
              aria-hidden
              className="rounded-full"
              style={{
                width: item.size,
                height: item.size,
                backgroundColor: fill,
                opacity: 0.45,
                border: `1px solid ${fill}`,
              }}
            />
          </span>
          <Text as="span" variant="label">
            {item.label}
          </Text>
        </div>
      ))}
    </div>
  );
}

export { BubbleChart, BubbleSizeLegend };
export type { BubbleSeries, BubbleChartProps, BubbleSizeLegendProps };
