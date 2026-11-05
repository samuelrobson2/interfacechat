import * as React from "react";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  XAxis,
  YAxis,
} from "recharts";

import { resolveColor } from "@/shared/lib/css";
import { ChartContainer, type ChartConfig } from "../chart";
import { AXIS_TICK_STYLE, ChartPlot, GRID_COLOR } from "./shared";

interface BoxPlotDatum {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  color?: string;
}

interface BoxPlotChartProps {
  data: BoxPlotDatum[];
  defaultColor?: string;
  fillOpacity?: number;
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  height?: number;
  className?: string;
}

// Props shape that Recharts passes to <Customized> content.
interface RechartsAxisTick {
  value: string | number;
  coordinate: number;
}

interface CustomizedBoxPlotProps {
  offset?: { left: number; width: number };
  xAxisMap?: Record<
    string,
    { scale: (v: string | number) => number; ticks?: RechartsAxisTick[] }
  >;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  data?: BoxPlotDatum[];
  defaultColor: string;
  fillOpacity: number;
  onPlotWidth?: (width: number) => void;
}

const BoxPlotShapes: React.FC<Record<string, unknown>> = (props) => {
  const {
    offset,
    xAxisMap,
    yAxisMap,
    data,
    defaultColor,
    fillOpacity,
    onPlotWidth,
  } = props as unknown as CustomizedBoxPlotProps;

  React.useEffect(() => {
    if (offset?.width && onPlotWidth) onPlotWidth(offset.width);
  }, [offset?.width, onPlotWidth]);

  if (!xAxisMap || !yAxisMap || !data) return null;

  const xAxis = Object.values(xAxisMap)[0];
  const yAxis = Object.values(yAxisMap)[0];
  if (!xAxis || !yAxis) return null;

  const xTicks = xAxis.ticks ?? [];
  const tickByValue = new Map(
    xTicks.map((t) => [String(t.value), t.coordinate]),
  );

  const bandwidth =
    xTicks.length > 1
      ? Math.abs((xTicks[1]?.coordinate ?? 0) - (xTicks[0]?.coordinate ?? 0))
      : 64;
  const boxWidth = bandwidth * 0.55;

  return (
    <g data-slot="box-plot-shapes">
      {data.map((d, i) => {
        const strokeWidth = 3;
        const cx =
          tickByValue.get(String(d.name)) ??
          xAxis.scale(d.name) + strokeWidth / 2;
        const yMin = yAxis.scale(d.min);
        const yMax = yAxis.scale(d.max);
        const yQ1 = yAxis.scale(d.q1);
        const yQ3 = yAxis.scale(d.q3);
        const yMedian = yAxis.scale(d.median);
        const color = resolveColor(d.color ?? defaultColor);
        const left = cx - boxWidth / 2;
        const right = cx + boxWidth / 2;

        return (
          <g key={i}>
            {/* Vertical whisker lines */}
            <line
              x1={cx}
              x2={cx}
              y1={Math.min(yQ1, yQ3)}
              y2={yMax}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <line
              x1={cx}
              x2={cx}
              y1={Math.max(yQ1, yQ3)}
              y2={yMin}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Top cap — spans the full box width */}
            <line
              x1={left}
              x2={right}
              y1={yMax}
              y2={yMax}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Bottom cap — spans the full box width */}
            <line
              x1={left}
              x2={right}
              y1={yMin}
              y2={yMin}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Box (Q1 → Q3) */}
            <rect
              x={left}
              y={Math.min(yQ1, yQ3)}
              width={boxWidth}
              height={Math.abs(yQ1 - yQ3)}
              fill={color}
              fillOpacity={fillOpacity}
              stroke={color}
              strokeWidth={strokeWidth}
              rx={4}
              ry={4}
            />
            {/* Median line */}
            <line
              x1={left}
              x2={right}
              y1={yMedian}
              y2={yMedian}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Outliers */}
            {d.outliers?.map((v, oi) => (
              <circle
                key={oi}
                cx={cx}
                cy={yAxis.scale(v)}
                r={strokeWidth}
                fill={color}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};

function BoxPlotChart({
  data,
  defaultColor = "gray-3",
  fillOpacity = 0.3,
  yLabel,
  xLabel,
  height = 360,
  className,
}: BoxPlotChartProps) {
  const config: ChartConfig = {};

  const [yMin, yMax, yTicks] = React.useMemo(() => {
    const all = data.flatMap((d) => [d.min, d.max, ...(d.outliers ?? [])]);
    const lo = Math.floor(Math.min(...all) / 10) * 10;
    const hi = Math.ceil(Math.max(...all) / 10) * 10;
    const ticks: number[] = [];
    for (let v = Math.min(0, lo); v <= hi; v += 10) ticks.push(v);
    return [Math.min(0, lo), hi, ticks];
  }, [data]);

  const [plotWidth, setPlotWidth] = React.useState(0);
  const handlePlotWidth = React.useCallback((w: number) => {
    setPlotWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
  }, []);

  const n = Math.max(1, data.length);
  const xPadding = plotWidth > 0 ? Math.max(12, plotWidth / (n + 2)) : 12;

  return (
    <ChartPlot
      height={height}
      className={className}
      xLabel={xLabel}
      yLabel={yLabel}
    >
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 4 }}
        >
          {/* Both axes render dashed grid — matches Figma (horizontal + vertical). */}
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="2 4" />
          <XAxis
            dataKey="name"
            type="category"
            scale="band"
            padding={{ left: xPadding }}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            interval={0}
          />
          <YAxis
            type="number"
            domain={[yMin, yMax]}
            ticks={yTicks}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
          />
          <Customized
            component={BoxPlotShapes}
            data={data}
            defaultColor={defaultColor}
            fillOpacity={fillOpacity}
            onPlotWidth={handlePlotWidth}
          />
        </ComposedChart>
      </ChartContainer>
    </ChartPlot>
  );
}

export { BoxPlotChart };
export type { BoxPlotDatum, BoxPlotChartProps };
