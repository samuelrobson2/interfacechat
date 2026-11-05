import { ChartContainer } from "@/shared/ui/kit/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK_TEXT_STYLE } from "../../lib/metrics-chart-config";
import type { ChartGradient } from "../../lib/metrics-chart-helpers";
import type { ChartMetricKey, ChartPoint } from "../../model/metrics-types";

type ChartSeries = {
  dataKey: ChartMetricKey;
  stroke: string;
  fillGradientId: string;
  isFilled: boolean;
  label?: string;
};

function DotMarker({
  cx,
  cy,
  color,
}: {
  cx?: number;
  cy?: number;
  color: string;
}) {
  if (cx === undefined || cy === undefined) return null;

  return <circle cx={cx} cy={cy} r={2} fill={color} stroke="none" />;
}

export function MetricsAreaChart({
  data,
  gradients,
  series,
  xAxisTicks,
  yAxisDomain,
  tooltipTitle,
}: {
  data: ChartPoint[];
  gradients: ChartGradient[];
  series: ChartSeries[];
  xAxisTicks: number[];
  yAxisDomain?: [number, number];
  tooltipTitle?: string;
}) {
  return (
    <ChartContainer className="h-[260px] w-full aspect-auto mt-2" config={{}}>
      <AreaChart data={data} margin={{ top: 0, right: 8, bottom: 0 }}>
        <defs>
          {gradients.map((gradient) => (
            <linearGradient
              key={gradient.id}
              id={gradient.id}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              {gradient.stops.map((stop) => (
                <stop
                  key={`${gradient.id}-${stop.offset}-${stop.stopColor}`}
                  offset={stop.offset}
                  stopColor={stop.stopColor}
                  stopOpacity={stop.stopOpacity}
                />
              ))}
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="4 4"
          stroke="var(--color-gray-2)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="step"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={xAxisTicks}
          allowDecimals={false}
          tickLine={true}
          axisLine={true}
          tick={AXIS_TICK_TEXT_STYLE}
          label={{
            value: "train/global_step",
            position: "insideBottomRight",
            dy: -30,
            fill: "var(--color-typography-secondary)",
            fontSize: 12,
            fontWeight: 300,
          }}
        />
        <YAxis
          domain={yAxisDomain ?? ["auto", "auto"]}
          tickCount={6}
          padding={{ top: 0, bottom: 0 }}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK_TEXT_STYLE}
        />
        <Tooltip
          cursor={{
            stroke: "var(--color-gray-3)",
            strokeDasharray: "4 4",
            strokeWidth: 1,
          }}
          isAnimationActive={false}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;

            const visibleValues = payload.filter(
              (entry) => entry.value !== null && entry.value !== undefined,
            );
            if (visibleValues.length === 0) return null;

            return (
              <div className="rounded-xl border-[0.5px] border-border bg-background px-4 py-3 shadow-md">
                <p className="text-sm font-bold">{tooltipTitle}</p>
                <p className="text-sm">
                  global_step:{" "}
                  {typeof label === "number" ? label : String(label)}
                </p>
                <div className="mt-1 flex flex-col gap-0.5">
                  {visibleValues.map((entry) => (
                    <div
                      key={String(entry.dataKey)}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <span
                        className="inline-block h-[8px] w-[8px] rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>
                        {entry.name}: {Number(entry.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        {series.map((line) => {
          const isSecondarySeries = !line.isFilled;
          const dotRenderer = isSecondarySeries
            ? (props: {
                cx?: number;
                cy?: number;
                payload?: Partial<ChartPoint>;
              }) => {
                const rawValue = props.payload?.[line.dataKey];
                if (rawValue === null || rawValue === undefined) return <g />;

                return (
                  <DotMarker cx={props.cx} cy={props.cy} color={line.stroke} />
                );
              }
            : false;

          return (
            <Area
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={1}
              connectNulls={isSecondarySeries}
              fill={line.isFilled ? `url(#${line.fillGradientId})` : "none"}
              baseValue={line.isFilled ? "dataMin" : undefined}
              name={line.label ?? line.dataKey}
              dot={dotRenderer}
              activeDot={(props) => {
                const rawValue = props.payload?.[line.dataKey];
                if (rawValue === null || rawValue === undefined) return <g />;

                return (
                  <DotMarker cx={props.cx} cy={props.cy} color={line.stroke} />
                );
              }}
              isAnimationActive={false}
            />
          );
        })}
      </AreaChart>
    </ChartContainer>
  );
}
