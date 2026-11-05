import {
  CartesianGrid,
  Legend,
  Text as RechartsText,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlotSpec } from "../model/plot-schema";
import {
  AXIS_LINE_STROKE,
  AXIS_TICK_PROPS,
  FONT_FAMILY,
  GRID_STROKE,
  LABEL_FILL,
  LEGEND_WRAPPER_STYLE,
  MAX_TICK_LINES,
  TICK_BAND_GAP,
  TICK_FILL,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_WRAPPER_STYLE,
} from "../lib/plot-theme";

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

export const shouldRenderLegend = (spec: PlotSpec): boolean => {
  // Default: legend ON for every chart. The system prompt instructs the
  // model to opt out (`showLegend: false`) only when the user explicitly
  // asks for a minimal / unlabelled chart.
  return typeof spec.showLegend === "boolean" ? spec.showLegend : true;
};

/**
 * Recharts uses `findAllByType()` on its DIRECT children to locate
 * axes, grid, tooltip, etc. — it does NOT recurse into React Fragments.
 * The helpers below return arrays of JSX nodes (with stable keys) so
 * they flatten into the chart's children when spread.
 */
export const axesForCartesianChart = (
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

export const sharedTooltip = (
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

export const sharedLegend = (
  <Legend
    wrapperStyle={LEGEND_WRAPPER_STYLE}
    verticalAlign="top"
    align="right"
    content={<LegendContent />}
  />
);
