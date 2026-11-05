import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { ChartContainer, type ChartConfig } from "@/shared/ui/kit/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

export interface DatasetChartData {
  name: string;
  value: string;
  labelText: string;
  color: string;
  fill?: string;
  borderColor?: string;
}

const chartConfig = {
  value: {
    label: "value",
  },
} satisfies ChartConfig;

const QUALITY_SCALE_MAX = 10;
const Y_TICK_COUNT = 5;

function yAxisUpperBound(values: number[]): number {
  const hi = Math.max(0, ...values);
  return Math.max(QUALITY_SCALE_MAX, Math.ceil(hi * 10) / 10);
}

function evenTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    Number((min + step * i).toFixed(1)),
  );
}

type BarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: DatasetChartData;
};

function DatasetBarShape({ x, y, width, height, fill, payload }: BarShapeProps) {
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return null;
  }

  const borderColor = payload?.borderColor;
  const borderWidth = 0.5;
  const halfStroke = borderWidth / 2;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {borderColor ? (
        <>
          <line
            x1={x + halfStroke}
            y1={y + halfStroke}
            x2={x + width - halfStroke}
            y2={y + halfStroke}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
          <line
            x1={x + halfStroke}
            y1={y + halfStroke}
            x2={x + halfStroke}
            y2={y + height}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
          <line
            x1={x + width - halfStroke}
            y1={y + halfStroke}
            x2={x + width - halfStroke}
            y2={y + height}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        </>
      ) : null}
    </g>
  );
}

export function DatasetChart({
  chartData,
  isAnimationActive = true,
}: {
  chartData: DatasetChartData[];
  isAnimationActive?: boolean;
}) {
  const yMax = yAxisUpperBound(chartData.map((d) => Number(d.value)));
  const yTicks = evenTicks(0, yMax, Y_TICK_COUNT);

  return (
    <ChartContainer
      className="pt-3 h-[280px] w-full min-w-0 overflow-hidden"
      config={chartConfig}
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        className="[&_svg]:overflow-visible"
        margin={{ left: -24, right: 16 }}
      >
        <CartesianGrid
          strokeDasharray="6 6"
          stroke="var(--color-gray-2)"
          vertical={false}
          horizontalValues={yTicks.slice(1)}
        />

        <defs>
          <linearGradient
            id="quality-original-text-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#D9D9D9" stopOpacity={1} />
            <stop offset="90%" stopColor="#D9D9D9" stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id="quality-adaptive-text-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="27.4%" stopColor="#85C9EE" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(231, 247, 255, 0)" stopOpacity={1} />
          </linearGradient>
          <marker
            id="arrowhead-right"
            markerWidth="16"
            markerHeight="16"
            refX="14"
            refY="8"
          >
            <ArrowRightIcon
              width={16}
              height={16}
              pathClasses="stroke-gray-3"
            />
          </marker>
          <marker
            id="arrowhead-up"
            markerWidth="16"
            markerHeight="16"
            refX="8"
            refY="14"
          >
            <ArrowUpIcon width={16} height={16} />
          </marker>
        </defs>

        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={{
            stroke: "var(--color-gray-3)",
            strokeWidth: 1,
            markerEnd: "url(#arrowhead-right)",
          }}
          tick={{
            fontSize: 14,
            fill: "var(--color-typography-secondary)",
            fontWeight: 300,
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={{
            stroke: "var(--color-gray-3)",
            strokeWidth: 1,
            markerStart: "url(#arrowhead-up)",
          }}
          tick={{
            fontSize: 14,
            fill: "var(--color-typography-secondary)",
            fontWeight: 300,
          }}
          ticks={yTicks}
          domain={[0, yMax]}
        />

        <Bar
          dataKey="value"
          maxBarSize={60}
          isAnimationActive={isAnimationActive}
          shape={(props: BarShapeProps) => <DatasetBarShape {...props} />}
          label={({ x, y, width, name }) => {
            const row = chartData.find((d) => d.name === name);
            return (
              <text
                x={x + width / 2}
                y={y - 4}
                fontSize="16"
                fontWeight="300"
                textAnchor="middle"
              >
                {row?.labelText ?? ""}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill ?? entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
