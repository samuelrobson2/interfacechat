import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Customized,
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

interface HistogramSeriesDatum {
  x: number;
  count: number;
}

interface HistogramSeries {
  key: string;
  label?: React.ReactNode;
  color: string;
  data: HistogramSeriesDatum[];
}

type HistogramVariant = "bars" | "dots";

interface HistogramChartProps {
  variant?: HistogramVariant;
  series: HistogramSeries[];
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  height?: number;
  className?: string;
  /** Bars variant — fill opacity. Default 0.8 (for overlap visibility). */
  fillOpacity?: number;
  /** Bars variant — gap between adjacent categories (recharts syntax). */
  barCategoryGap?: number | string;
  /** Bars variant — fixed bar width in px. Default 12 — matches Figma. */
  barSize?: number;
  /** Dots variant — dot diameter in px. Default 8 — matches Figma. */
  dotSize?: number;
  /** Dots variant — vertical gap between dots in a column (px). Default 1. */
  dotGapY?: number;
  /** Dots variant — horizontal gap between dot columns (px). Default 4. */
  columnGapX?: number;
  /** Dots variant — render every Nth X-axis label. Default 5. */
  xLabelStep?: number;
  /** Dots variant — count step for Y-axis labels/gridlines. Default 15. */
  yLabelStep?: number;
}

// --- helpers ----------------------------------------------------------------

function useChartConfig(series: HistogramSeries[]): ChartConfig {
  return React.useMemo(
    () =>
      series.reduce<ChartConfig>((acc, s) => {
        acc[s.key] = { label: s.label ?? s.key, color: resolveColor(s.color) };
        return acc;
      }, {}),
    [series],
  );
}

// Merge per-series `{ x, count }[]` into a single wide-format array keyed by x,
// preserving sorted order. Missing values are left undefined so recharts skips
// rendering a bar at that slot (vs. drawing a zero-height rect).
function mergeSeriesToWide(series: HistogramSeries[]) {
  const xs = new Set<number>();
  for (const s of series) for (const d of s.data) xs.add(d.x);
  const sorted = Array.from(xs).sort((a, b) => a - b);
  return sorted.map((x) => {
    const row: Record<string, number> = { x };
    for (const s of series) {
      const hit = s.data.find((d) => d.x === x);
      if (hit) row[s.key] = hit.count;
    }
    return row;
  });
}

// --- variants ---------------------------------------------------------------

function BarsVariant({
  series,
  fillOpacity,
  barCategoryGap,
  barSize,
}: {
  series: HistogramSeries[];
  fillOpacity: number;
  barCategoryGap: number | string;
  barSize: number;
}) {
  const config = useChartConfig(series);
  const data = React.useMemo(() => mergeSeriesToWide(series), [series]);

  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 8, left: 4 }}
        barCategoryGap={barCategoryGap}
        // Negative barGap equal to barSize stacks sibling bars at the same
        // category position — overlapping bins from different series render
        // on top of each other and blend via fillOpacity (matches Figma).
        barGap={-barSize}
      >
        <CartesianGrid
          stroke={GRID_COLOR}
          strokeDasharray="2 4"
          vertical={false}
        />
        <XAxis
          dataKey="x"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK_STYLE}
        />
        <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={resolveColor(s.color)}
            fillOpacity={fillOpacity}
            radius={[2, 2, 0, 0]}
            barSize={barSize}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

// Props passed to the Customized renderer for the dot layer. Recharts forwards
// every own prop on <Customized> to the component plus its own `offset` /
// `xAxisMap` / `yAxisMap` properties.
interface DotsCustomizedProps {
  offset?: { left: number; top: number; width: number; height: number };
  series: HistogramSeries[];
  xValues: number[];
  yMax: number;
  dotSize: number;
  dotGapY: number;
  columnGapX: number;
  xLabelStep: number;
  yLabelStep: number;
}

const DOTS_TICK_STYLE: React.CSSProperties = {
  fill: "var(--color-gray-5)",
  fontSize: 14,
  fontFamily: "var(--font-bureau, STK Bureau Sans, sans-serif)",
  fontWeight: 300,
};

const DotsShapes: React.FC<Record<string, unknown>> = (props) => {
  const {
    offset,
    series,
    xValues,
    yMax,
    dotSize,
    dotGapY,
    columnGapX,
    xLabelStep,
    yLabelStep,
  } = props as unknown as DotsCustomizedProps;

  if (!offset) return null;

  const radius = dotSize / 2;
  const strideX = dotSize + columnGapX;
  const strideY = dotSize + dotGapY;
  const bottomY = offset.top + offset.height;
  const rightX = offset.left + offset.width;

  // Pixel Y for a given count value — gridline for `g` sits at the top edge
  // of the `g`-th dot (so e.g. label "15" is flush with the top of the 15th
  // dot in a column).
  const countCy = (count: number) => bottomY - count * strideY;

  // Map each x value to its column center in pixels. Columns are laid out at
  // a fixed stride so both `columnGapX` and `dotSize` are honored exactly.
  const xIndex = new Map(xValues.map((x, i) => [x, i]));
  const columnCx = (x: number) => {
    const i = xIndex.get(x);
    if (i === undefined) return -9999;
    return offset.left + radius + i * strideX;
  };

  // Y-axis tick values in domain units — 0, step, 2*step, …, up to the top
  // of the visible stack. Drawn manually so their pixel positions match the
  // fixed-stride dot layout exactly.
  const yTicks: number[] = [];
  for (let g = 0; g <= yMax; g += yLabelStep) yTicks.push(g);

  return (
    <g data-slot="histogram-dots">
      {/* Horizontal gridlines at every yLabelStep — aligned with dot stack. */}
      {yTicks.map((g) => (
        <line
          key={`ygrid-${g}`}
          x1={offset.left}
          x2={rightX}
          y1={countCy(g)}
          y2={countCy(g)}
          stroke={GRID_COLOR}
          strokeDasharray="2 4"
        />
      ))}

      {/* Y-axis labels. */}
      {yTicks.map((g) => (
        <text
          key={`ytick-${g}`}
          x={offset.left - 8}
          y={countCy(g) + 5}
          textAnchor="end"
          style={DOTS_TICK_STYLE}
        >
          {g}
        </text>
      ))}

      {/* Dots per series — each dot sits directly above the previous with
          a fixed `dotGapY` between them. */}
      {series.map((s) => {
        const color = resolveColor(s.color);
        return s.data.map((d) => {
          const cx = columnCx(d.x);
          const n = Math.max(0, d.count);
          return Array.from({ length: n }, (_, i) => (
            <circle
              key={`dot-${s.key}-${d.x}-${i}`}
              cx={cx}
              cy={bottomY - radius - i * strideY}
              r={radius}
              fill={color}
            />
          ));
        });
      })}

      {/* X-axis labels — render every Nth value to avoid clutter. */}
      {xValues.map((x, i) => {
        if (i % xLabelStep !== 0) return null;
        return (
          <text
            key={`xtick-${x}`}
            x={columnCx(x)}
            y={bottomY + 18}
            textAnchor="middle"
            style={DOTS_TICK_STYLE}
          >
            {x}
          </text>
        );
      })}
    </g>
  );
};

function DotsVariant({
  series,
  xValues,
  yMax,
  dotSize,
  dotGapY,
  columnGapX,
  xLabelStep,
  yLabelStep,
}: {
  series: HistogramSeries[];
  xValues: number[];
  yMax: number;
  dotSize: number;
  dotGapY: number;
  columnGapX: number;
  xLabelStep: number;
  yLabelStep: number;
}) {
  const config = useChartConfig(series);

  // ComposedChart needs a `data` prop (even a minimal one) — otherwise its
  // axis pipeline tries to compute ticks against an empty scale and throws
  // `DecimalError: Invalid argument: NaN`. Pass one row per x value so the
  // x-axis has a valid numeric domain.
  const chartData = React.useMemo(
    () => xValues.map((x) => ({ x })),
    [xValues],
  );
  const xDomain: [number, number] =
    xValues.length > 0 ? [xValues[0]!, xValues[xValues.length - 1]!] : [0, 1];

  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <ComposedChart
        data={chartData}
        // Left margin reserves space for manually-drawn Y-axis labels;
        // bottom margin reserves space for manually-drawn X-axis labels.
        margin={{ top: 8, right: 16, bottom: 24, left: 32 }}
      >
        {/* Both axes are hidden — gridlines, Y labels and X labels are all
            rendered manually in <DotsShapes> so they line up exactly with
            the fixed-pixel dot stack. */}
        <XAxis type="number" dataKey="x" domain={xDomain} hide />
        <YAxis type="number" domain={[0, yMax]} hide />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
        <Customized
          component={DotsShapes}
          series={series}
          xValues={xValues}
          yMax={yMax}
          dotSize={dotSize}
          dotGapY={dotGapY}
          columnGapX={columnGapX}
          xLabelStep={xLabelStep}
          yLabelStep={yLabelStep}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

// --- public component -------------------------------------------------------

// Vertical padding around the dot stack: 8px top margin + 24px bottom
// margin (x labels) + small buffer to avoid clipping the topmost dot.
const DOTS_VERTICAL_PADDING = 8 + 24 + 8;

function HistogramChart({
  variant = "bars",
  series,
  xLabel,
  yLabel,
  height = 360,
  className,
  fillOpacity = 0.8,
  barCategoryGap = "10%",
  barSize = 8,
  dotSize = 8,
  dotGapY = 1,
  columnGapX = 4,
  xLabelStep = 5,
  yLabelStep = 15,
}: HistogramChartProps) {
  // For dots variant we also need xValues/yMax to auto-size the container.
  const xValues = React.useMemo(() => {
    if (variant !== "dots") return [];
    const xs = new Set<number>();
    for (const s of series) for (const d of s.data) xs.add(d.x);
    return Array.from(xs).sort((a, b) => a - b);
  }, [series, variant]);
  const yMax = React.useMemo(() => {
    if (variant !== "dots") return 0;
    let max = 0;
    for (const s of series) {
      for (const d of s.data) if (d.count > max) max = d.count;
    }
    return max;
  }, [series, variant]);

  // Dots have a fixed pixel stride, so the plot area must be tall enough to
  // fit the entire stack — otherwise the topmost dots overflow the chart.
  // Grow the container when the requested height is not enough.
  const effectiveHeight =
    variant === "dots"
      ? Math.max(height, yMax * (dotSize + dotGapY) + DOTS_VERTICAL_PADDING)
      : height;

  return (
    <ChartPlot
      height={effectiveHeight}
      className={className}
      xLabel={xLabel}
      yLabel={yLabel}
    >
      {variant === "bars" ? (
        <BarsVariant
          series={series}
          fillOpacity={fillOpacity}
          barCategoryGap={barCategoryGap}
          barSize={barSize}
        />
      ) : (
        <DotsVariant
          series={series}
          xValues={xValues}
          yMax={yMax}
          dotSize={dotSize}
          dotGapY={dotGapY}
          columnGapX={columnGapX}
          xLabelStep={xLabelStep}
          yLabelStep={yLabelStep}
        />
      )}
    </ChartPlot>
  );
}

export { HistogramChart };
export type {
  HistogramChartProps,
  HistogramSeries,
  HistogramSeriesDatum,
  HistogramVariant,
};
