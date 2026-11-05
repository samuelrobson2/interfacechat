import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
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
  Scatter,
  ScatterChart,
} from "recharts";
import { colorForSeries, FALLBACK_COLOR } from "../lib/plot-palette";
import type { PlotSpec } from "../model/plot-schema";
import {
  axesForCartesianChart,
  sharedLegend,
  sharedTooltip,
  shouldRenderLegend,
} from "./plot-primitives";
import {
  AXIS_LINE_STROKE,
  AXIS_TICK_PROPS,
  cartesianMargin,
  FONT_FAMILY,
  GRID_STROKE,
  LABEL_FILL,
} from "../lib/plot-theme";

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
export const renderChartFor = (spec: PlotSpec, palette: readonly string[]) => {
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

