import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import { cn } from "@/shared/lib/css";
import { captureElementAsBlob } from "@/shared/lib/html-to-image-webkit";
import { downloadFile } from "@/shared/lib/js";
import { Button } from "@/shared/ui/kit/button";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { Text } from "@/shared/ui/kit/text";
import { useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type {
  PlotPalette,
  PlotSeries,
  PlotSpec,
} from "./plot-schema";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Text as RechartsText,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Default series color cycle, sourced from design tokens. Ordered for
 * maximum hue separation on light backgrounds — see `colors.css` for the
 * underlying hex values.
 */
const DEFAULT_PALETTE = [
  "var(--color-blue-4)",
  "var(--color-mint-2)",
  "var(--color-rose-2)",
  "var(--color-orange-5)",
  "var(--color-green-5)",
  "var(--color-blue-6)",
  "var(--color-gray-3)",
] as const;

const PALETTE_PRESETS: Record<string, readonly string[]> = {
  default: DEFAULT_PALETTE,
  blue: [
    "var(--color-blue-3)",
    "var(--color-blue-4)",
    "var(--color-blue-5)",
    "var(--color-blue-6)",
  ],
  mint: [
    "var(--color-mint-1)",
    "var(--color-mint-2)",
    "var(--color-mint-3)",
    "var(--color-blue-4)",
  ],
  rose: [
    "var(--color-rose-1)",
    "var(--color-rose-2)",
    "var(--color-rose-3)",
    "var(--color-blue-4)",
  ],
  warm: [
    "var(--color-orange-5)",
    "var(--color-red-5)",
    "var(--color-yellow-5)",
    "var(--color-rose-2)",
  ],
  cool: [
    "var(--color-blue-4)",
    "var(--color-mint-2)",
    "var(--color-blue-6)",
    "var(--color-mint-3)",
  ],
};

const resolvePalette = (
  palette: PlotPalette | undefined,
): readonly string[] => {
  if (!palette) return DEFAULT_PALETTE;
  if (Array.isArray(palette)) {
    return palette.length > 0 ? palette : DEFAULT_PALETTE;
  }
  return PALETTE_PRESETS[palette] ?? DEFAULT_PALETTE;
};

const FALLBACK_COLOR = "var(--color-blue-4)";

const colorForSeries = (
  series: PlotSeries,
  index: number,
  palette: readonly string[],
): string =>
  series.color ??
  palette[index % palette.length] ??
  palette[0] ??
  FALLBACK_COLOR;

/** Visual constants shared by every chart variant. */
const CHART_HEIGHT_PX = 320;
const FONT_FAMILY = "var(--font-bureau, 'STK Bureau Sans', sans-serif)";
const TICK_FILL = "var(--color-gray-3)";
const LABEL_FILL = "var(--color-gray-3)";
const GRID_STROKE = "var(--color-gray-2)";
const AXIS_LINE_STROKE = "var(--color-gray-2)";
const AXIS_TICK_PROPS = {
  fill: TICK_FILL,
  fontSize: 11,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
} as const;
const TOOLTIP_WRAPPER_STYLE = { outline: "none" } as const;
const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--color-background-primary, #fafafa)",
  border: "1px solid var(--color-gray-2)",
  borderRadius: 0,
  fontSize: 12,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
  color: "var(--color-gray-5)",
  padding: "8px 10px",
} as const;
const TOOLTIP_LABEL_STYLE = {
  color: "var(--color-gray-3)",
  fontSize: 11,
  fontWeight: 400,
  fontFamily: FONT_FAMILY,
  marginBottom: 4,
} as const;
const LEGEND_WRAPPER_STYLE = {
  fontSize: 12,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
  color: "var(--color-gray-3)",
} as const;

const MAX_TICK_LINES = 2;
const TICK_BAND_GAP = 2;

interface CategoryTickProps {
  x?: number;
  y?: number;
  width?: number;
  visibleTicksCount?: number;
  payload?: { value?: string | number };
}

/**
 * X-axis category tick. Delegates wrapping + ellipsis truncation to recharts'
 * own `<Text>`, which measures real glyph widths: passing `width` wraps the
 * label on word boundaries and `maxLines` truncates the overflow with `…`.
 */
const CategoryTick = ({
  x = 0,
  y = 0,
  width = 0,
  visibleTicksCount = 0,
  payload,
}: CategoryTickProps) => {
  const raw = payload?.value;
  const label = raw === undefined || raw === null ? "" : String(raw);
  const band = visibleTicksCount > 0 ? width / visibleTicksCount : width;
  return (
    <RechartsText
      x={x}
      y={y}
      width={Math.max(band - TICK_BAND_GAP, 0)}
      maxLines={MAX_TICK_LINES}
      textAnchor="middle"
      verticalAnchor="start"
      fill={TICK_FILL}
      fontSize={11}
      fontWeight={300}
      fontFamily={FONT_FAMILY}
    >
      {label}
    </RechartsText>
  );
};

const xLabelProps = (value: string) => ({
  value,
  position: "insideBottom" as const,
  offset: -4,
  fill: LABEL_FILL,
  fontSize: 12,
  fontFamily: FONT_FAMILY,
});
const yLabelProps = (value: string) => ({
  value,
  angle: -90,
  position: "insideLeft" as const,
  offset: 10,
  fill: LABEL_FILL,
  fontSize: 12,
  fontFamily: FONT_FAMILY,
  style: { textAnchor: "middle" as const },
});

const shouldRenderLegend = (spec: PlotSpec): boolean => {
  // Default: legend ON for every chart. The system prompt instructs the
  // model to opt out (`showLegend: false`) only when the user explicitly
  // asks for a minimal / unlabelled chart.
  return typeof spec.showLegend === "boolean" ? spec.showLegend : true;
};

const cartesianMargin = () => ({
  top: 12,
  right: 24,
  left: 8,
  bottom: 8,
});

/**
 * Recharts uses `findAllByType()` on its DIRECT children to locate
 * axes, grid, tooltip, etc. — it does NOT recurse into React Fragments.
 * The helpers below return arrays of JSX nodes (with stable keys) so
 * they flatten into the chart's children when spread.
 */
const axesForCartesianChart = (
  spec: PlotSpec,
  // `forScatter` switches both axes to numeric mode AND binds YAxis to
  // `dataKey="y"`. Line/bar/area each declare `dataKey` on their own
  // series components, so for those types the YAxis just inherits the
  // numeric domain from whatever series are mounted alongside it. A
  // ScatterChart, by contrast, gets its data only through the children
  // <Scatter>s, and recharts can't infer the Y dimension without the
  // YAxis itself naming the field.
  opts: { forScatter?: boolean } = {},
) => [
  <CartesianGrid
    key="grid"
    stroke={GRID_STROKE}
    strokeDasharray="2 4"
    strokeOpacity={0.6}
  />,
  <XAxis
    key="x"
    dataKey="x"
    type={opts.forScatter ? "number" : "category"}
    domain={opts.forScatter ? ["auto", "auto"] : undefined}
    stroke={AXIS_LINE_STROKE}
    tick={opts.forScatter ? AXIS_TICK_PROPS : <CategoryTick />}
    interval={opts.forScatter ? undefined : 0}
    tickLine={false}
    tickMargin={8}
    axisLine={{ stroke: AXIS_LINE_STROKE, strokeOpacity: 0.8 }}
    height={spec.xLabel ? 64 : 44}
    label={spec.xLabel ? xLabelProps(spec.xLabel) : undefined}
  />,
  <YAxis
    key="y"
    dataKey={opts.forScatter ? "y" : undefined}
    type="number"
    domain={opts.forScatter ? ["auto", "auto"] : undefined}
    stroke={AXIS_LINE_STROKE}
    tick={AXIS_TICK_PROPS}
    tickLine={false}
    tickMargin={8}
    axisLine={{ stroke: AXIS_LINE_STROKE, strokeOpacity: 0.8 }}
    width={spec.yLabel ? 64 : 40}
    label={spec.yLabel ? yLabelProps(spec.yLabel) : undefined}
  />,
];

const sharedTooltip = (
  <Tooltip
    wrapperStyle={TOOLTIP_WRAPPER_STYLE}
    contentStyle={TOOLTIP_CONTENT_STYLE}
    labelStyle={TOOLTIP_LABEL_STYLE}
    cursor={{ stroke: GRID_STROKE, strokeWidth: 1, strokeDasharray: "2 4" }}
  />
);

interface LegendEntry {
  value?: string | number;
  color?: string;
  inactive?: boolean;
}

const LegendContent = ({ payload }: { payload?: LegendEntry[] }) => {
  if (!payload || payload.length === 0) return null;
  return (
    <ul
      className="m-0 flex list-none flex-wrap justify-end gap-x-3 gap-y-1 p-0"
      style={LEGEND_WRAPPER_STYLE}
    >
      {payload.map((entry, index) => (
        <li
          key={`${entry.value}-${index}`}
          className="flex items-center gap-1.5"
        >
          <span
            aria-hidden="true"
            className="inline-block size-2.5 shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const sharedLegend = (
  <Legend
    wrapperStyle={LEGEND_WRAPPER_STYLE}
    verticalAlign="top"
    align="right"
    content={<LegendContent />}
  />
);

const renderLine = (spec: PlotSpec, palette: readonly string[]) => (
  <LineChart data={spec.data} margin={cartesianMargin()}>
    {axesForCartesianChart(spec)}
    {sharedTooltip}
    {shouldRenderLegend(spec) && sharedLegend}
    {spec.series.map((s, idx) => (
      <Line
        key={s.key}
        type={spec.curve ?? "monotone"}
        dataKey={s.key}
        name={s.label ?? s.key}
        stroke={colorForSeries(s, idx, palette)}
        strokeWidth={1.5}
        dot={{ r: 2, strokeWidth: 0, fill: colorForSeries(s, idx, palette) }}
        activeDot={{ r: 4, strokeWidth: 0 }}
        isAnimationActive={false}
      />
    ))}
  </LineChart>
);

const renderArea = (spec: PlotSpec, palette: readonly string[]) => (
  <AreaChart data={spec.data} margin={cartesianMargin()}>
    {axesForCartesianChart(spec)}
    {sharedTooltip}
    {shouldRenderLegend(spec) && sharedLegend}
    {spec.series.map((s, idx) => {
      const color = colorForSeries(s, idx, palette);
      return (
        <Area
          key={s.key}
          type={spec.curve ?? "monotone"}
          dataKey={s.key}
          name={s.label ?? s.key}
          stroke={color}
          strokeWidth={1.5}
          fill={color}
          fillOpacity={0.18}
          stackId={spec.stacked ? "stack" : undefined}
          isAnimationActive={false}
        />
      );
    })}
  </AreaChart>
);

const renderBar = (spec: PlotSpec, palette: readonly string[]) => (
  <BarChart data={spec.data} margin={cartesianMargin()}>
    {axesForCartesianChart(spec)}
    {sharedTooltip}
    {shouldRenderLegend(spec) && sharedLegend}
    {spec.series.map((s, idx) => (
      <Bar
        key={s.key}
        dataKey={s.key}
        name={s.label ?? s.key}
        fill={colorForSeries(s, idx, palette)}
        stackId={spec.stacked ? "stack" : undefined}
        radius={0}
        isAnimationActive={false}
      />
    ))}
  </BarChart>
);

const renderComposed = (spec: PlotSpec, palette: readonly string[]) => (
  <ComposedChart data={spec.data} margin={cartesianMargin()}>
    {axesForCartesianChart(spec)}
    {sharedTooltip}
    {shouldRenderLegend(spec) && sharedLegend}
    {spec.series.map((s, idx) => {
      const color = colorForSeries(s, idx, palette);
      const kind = s.kind ?? (idx === 0 ? "bar" : "line");
      const name = s.label ?? s.key;
      if (kind === "bar") {
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={name}
            fill={color}
            radius={0}
            stackId={spec.stacked ? "stack" : undefined}
            isAnimationActive={false}
          />
        );
      }
      if (kind === "area") {
        return (
          <Area
            key={s.key}
            type={spec.curve ?? "monotone"}
            dataKey={s.key}
            name={name}
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.18}
            isAnimationActive={false}
          />
        );
      }
      return (
        <Line
          key={s.key}
          type={spec.curve ?? "monotone"}
          dataKey={s.key}
          name={name}
          stroke={color}
          strokeWidth={1.5}
          dot={{ r: 2, strokeWidth: 0, fill: color }}
          activeDot={{ r: 4, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      );
    })}
  </ComposedChart>
);

const renderScatter = (spec: PlotSpec, palette: readonly string[]) => {
  const buildPoints = (key: string) =>
    spec.data
      .map((row) => {
        const rawX = row.x;
        const rawY = row[key];
        // Reject explicit nulls outright. `typeof null === "object"`, so
        // the previous `typeof rawY === "number"` check fell through to
        // `Number(null)` → 0, which then passed `Number.isFinite(0)` and
        // produced phantom points at y=0 for every null entry. The
        // schema lets nulls into datum values to mean "missing here";
        // scatter renders those as absences, not as origin dots.
        if (rawX === null || rawY === null) return null;
        const xNum = typeof rawX === "number" ? rawX : Number(rawX);
        const yNum = typeof rawY === "number" ? rawY : Number(rawY);
        if (!Number.isFinite(xNum) || !Number.isFinite(yNum)) return null;
        return { x: xNum, y: yNum };
      })
      .filter((p): p is { x: number; y: number } => p !== null);

  return (
    <ScatterChart margin={cartesianMargin()}>
      {axesForCartesianChart(spec, { forScatter: true })}
      {sharedTooltip}
      {shouldRenderLegend(spec) && sharedLegend}
      {spec.series.map((s, idx) => (
        <Scatter
          key={s.key}
          name={s.label ?? s.key}
          data={buildPoints(s.key)}
          fill={colorForSeries(s, idx, palette)}
          line={false}
          shape="circle"
          isAnimationActive={false}
        />
      ))}
    </ScatterChart>
  );
};

const renderPieOrDonut = (
  spec: PlotSpec,
  palette: readonly string[],
  variant: "pie" | "donut",
) => {
  const sliceSeries = spec.series[0] ?? { key: "" };
  const pieData = spec.data.map((row, index) => {
    const rawValue = row[sliceSeries.key];
    const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
    return {
      name: String(row.x),
      value: Number.isFinite(value) ? value : 0,
      fill: palette[index % palette.length] ?? FALLBACK_COLOR,
    };
  });

  return (
    <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
      {sharedTooltip}
      {shouldRenderLegend(spec) && sharedLegend}
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius="75%"
        innerRadius={variant === "donut" ? "45%" : 0}
        stroke="var(--color-background-primary, #fafafa)"
        strokeWidth={1}
        isAnimationActive={false}
        label={{
          fill: LABEL_FILL,
          fontSize: 11,
          fontFamily: FONT_FAMILY,
          fontWeight: 300,
        }}
      >
        {pieData.map((entry, index) => (
          <Cell
            key={entry.name}
            fill={palette[index % palette.length] ?? FALLBACK_COLOR}
          />
        ))}
      </Pie>
    </PieChart>
  );
};

const renderRadar = (spec: PlotSpec, palette: readonly string[]) => (
  <RadarChart
    data={spec.data}
    outerRadius="75%"
    margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
  >
    <PolarGrid stroke={GRID_STROKE} strokeOpacity={0.6} />
    <PolarAngleAxis
      dataKey="x"
      tick={AXIS_TICK_PROPS}
      stroke={AXIS_LINE_STROKE}
    />
    <PolarRadiusAxis
      tick={AXIS_TICK_PROPS}
      stroke={AXIS_LINE_STROKE}
      tickFormatter={(v: number) => String(v)}
    />
    {sharedTooltip}
    {shouldRenderLegend(spec) && sharedLegend}
    {spec.series.map((s, idx) => {
      const color = colorForSeries(s, idx, palette);
      return (
        <Radar
          key={s.key}
          dataKey={s.key}
          name={s.label ?? s.key}
          stroke={color}
          strokeWidth={1.5}
          fill={color}
          fillOpacity={0.18}
          isAnimationActive={false}
        />
      );
    })}
  </RadarChart>
);

const renderRadialBar = (spec: PlotSpec, palette: readonly string[]) => {
  const sliceSeries = spec.series[0] ?? { key: "" };
  const data = spec.data.map((row, index) => {
    const raw = row[sliceSeries.key];
    const value = typeof raw === "number" ? raw : Number(raw);
    return {
      name: String(row.x),
      value: Number.isFinite(value) ? value : 0,
      fill: palette[index % palette.length] ?? FALLBACK_COLOR,
    };
  });
  return (
    <RadialBarChart
      data={data}
      cx="50%"
      cy="50%"
      innerRadius="20%"
      outerRadius="90%"
      startAngle={90}
      endAngle={-270}
    >
      {sharedTooltip}
      {shouldRenderLegend(spec) && sharedLegend}
      <RadialBar
        dataKey="value"
        cornerRadius={0}
        background={{ fill: "var(--color-gray-1)" }}
        isAnimationActive={false}
      />
    </RadialBarChart>
  );
};

const renderChartFor = (spec: PlotSpec, palette: readonly string[]) => {
  switch (spec.type) {
    case "line":
      return renderLine(spec, palette);
    case "area":
      return renderArea(spec, palette);
    case "bar":
      return renderBar(spec, palette);
    case "composed":
      return renderComposed(spec, palette);
    case "scatter":
      return renderScatter(spec, palette);
    case "pie":
      return renderPieOrDonut(spec, palette, "pie");
    case "donut":
      return renderPieOrDonut(spec, palette, "donut");
    case "radar":
      return renderRadar(spec, palette);
    case "radial-bar":
      return renderRadialBar(spec, palette);
  }
};

/** Builds a safe PNG file name from the chart title, falling back to its type. */
const plotFileName = (spec: PlotSpec): string => {
  const base = (spec.title ?? spec.type)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "chart"}.png`;
};

const PlotChart = ({
  spec,
  className,
}: {
  spec: PlotSpec;
  className?: string;
}) => {
  const palette = resolvePalette(spec.palette);
  const figureRef = useRef<HTMLElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Snapshots the chart figure to a PNG, excluding the download button itself.
  const handleDownload = async () => {
    const element = figureRef.current;
    if (!element || isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await captureElementAsBlob(element, {
        pixelRatio: 2,
        filter: (node) =>
          !(node instanceof HTMLElement && node.dataset.plotDownload !== undefined),
      });
      downloadFile(blob, plotFileName(spec));
    } catch (error) {
      console.error("Failed to download chart as image:", error);
      toast.error("Failed to download chart");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <figure
      ref={figureRef}
      data-slot="plot"
      data-chart-type={spec.type}
      className={cn(
        "group relative my-3 flex flex-col gap-2 border border-stroke-secondary bg-transparent p-4 font-bureau",
        className,
      )}
    >
      <Button
        type="button"
        variant="icon-button"
        size="icon-sm"
        data-plot-download
        isLoading={isDownloading}
        onClick={() => void handleDownload()}
        aria-label="Download chart as image"
        title="Download chart"
        className="absolute right-2 top-2 z-10"
        lottieClassName="size-4"
      >
        <DownloadIconThin svgClasses="size-4" />
      </Button>
      {(spec.title || spec.subtitle) && (
        <figcaption className="flex flex-col gap-0.5">
          {spec.title && (
            <Text variant="subtitle" color="primary">
              {spec.title}
            </Text>
          )}
          {spec.subtitle && (
            <Text variant="label" color="secondary">
              {spec.subtitle}
            </Text>
          )}
        </figcaption>
      )}
      <div
        className="w-full"
        style={{
          height: CHART_HEIGHT_PX,
          fontFamily: FONT_FAMILY,
        }}
        role="img"
        aria-label={spec.title ?? `${spec.type} chart`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChartFor(spec, palette)}
        </ResponsiveContainer>
      </div>
    </figure>
  );
};

/**
 * Renders a themed chart from a validated plot spec. Drops into the
 * assistant message stream wherever the model emits a ```` ```numi-plot ````
 * code fence with valid JSON inside.
 *
 * Wrapped in a local error boundary so that any transient rendering crash
 * inside recharts (e.g. a DOM mutation race triggered by surrounding chat
 * components re-rendering during streaming) replaces just the chart with an
 * inline error block instead of bubbling up to the route-level boundary and
 * unmounting the entire chat surface.
 */
export const Plot = ({
  spec,
  className,
}: {
  spec: PlotSpec;
  className?: string;
}) => (
  <ErrorBoundary
    resetKeys={[spec]}
    fallbackRender={({ error }) => (
      <PlotErrorBlock
        error={
          error instanceof Error
            ? `Chart rendering failed: ${error.message}`
            : "Chart rendering failed"
        }
        className={className}
      />
    )}
  >
    <PlotChart spec={spec} className={className} />
  </ErrorBoundary>
);

export const PlotSkeleton = ({ className }: { className?: string }) => (
  <div
    data-slot="plot-skeleton"
    className={cn(
      "my-3 flex flex-col gap-3 border border-stroke-secondary bg-transparent p-4",
      className,
    )}
  >
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="w-full" style={{ height: CHART_HEIGHT_PX }} />
  </div>
);

export const PlotErrorBlock = ({
  error,
  className,
}: {
  error: string;
  className?: string;
}) => (
  <div
    data-slot="plot-error"
    className={cn(
      "my-3 flex flex-col gap-2 border border-stroke-secondary bg-transparent p-4 font-bureau",
      className,
    )}
  >
    <Text variant="label" color="primary">
      Chart could not be rendered
    </Text>
    <Text variant="label" color="secondary">
      {error}
    </Text>
  </div>
);
