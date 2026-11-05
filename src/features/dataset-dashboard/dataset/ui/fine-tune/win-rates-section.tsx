import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { ChartContainer } from "@/shared/ui/kit/chart";
import { Text } from "@/shared/ui/kit/text";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  AXIS_TICK_TEXT_STYLE,
  WIN_RATE_CHART_CONFIG,
  WIN_RATE_Y_MAX,
  WIN_RATE_Y_TICKS,
} from "../../lib/metrics-chart-config";
import type { WinRateBar } from "../../model/metrics-types";
import {
  WinRateBarShape,
  type WinRateBarShapeProps,
} from "./win-rate-bar-shape";
import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function WinRatesSection({
  winRateData,
}: {
  winRateData: WinRateBar[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Text variant="h2">Training Winrates</Text>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Text variant="title">Win Rates</Text>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleInfoIcon />
              </TooltipTrigger>
              <TooltipContent className="max-w-[420px] left-[150px]">
                Win rates are computed on a held out sample of 200 datapoints.
                The judge model is Gemini 3.1 pro for all models except for
                Gemma.
              </TooltipContent>
            </Tooltip>
          </div>
          <ChartContainer
            className="pt-3 h-[330px] w-full aspect-auto"
            config={WIN_RATE_CHART_CONFIG}
          >
            <BarChart
              data={winRateData}
              className="[&_svg]:overflow-visible"
              margin={{ left: -24, right: 16 }}
            >
              <CartesianGrid
                strokeDasharray="6 6"
                stroke="var(--color-gray-2)"
                vertical={false}
                horizontalValues={WIN_RATE_Y_TICKS.slice(1)}
              />
              <defs>
                <linearGradient
                  id="finetune-win-rate-base-fill-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#D9D9D9" stopOpacity={1} />
                  <stop offset="90%" stopColor="#D9D9D9" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="finetune-win-rate-adapted-fill-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="27.4%"
                    stopColor="var(--color-blue-3)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-blue-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <marker
                  id="finetune-win-rates-arrowhead-right"
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
                  id="finetune-win-rates-arrowhead-up"
                  markerWidth="16"
                  markerHeight="16"
                  refX="8"
                  refY="14"
                >
                  <ArrowUpIcon width={16} height={16} />
                </marker>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{
                  stroke: "var(--color-gray-3)",
                  strokeWidth: 1,
                  markerEnd: "url(#finetune-win-rates-arrowhead-right)",
                }}
                tick={AXIS_TICK_TEXT_STYLE}
              />
              <YAxis
                domain={[0, WIN_RATE_Y_MAX]}
                ticks={WIN_RATE_Y_TICKS}
                tickLine={false}
                axisLine={{
                  stroke: "var(--color-gray-3)",
                  strokeWidth: 1,
                  markerStart: "url(#finetune-win-rates-arrowhead-up)",
                }}
                tick={AXIS_TICK_TEXT_STYLE}
              />
              <Bar
                dataKey="value"
                maxBarSize={60}
                radius={[0, 0, 0, 0]}
                isAnimationActive={false}
                shape={(props: WinRateBarShapeProps) => (
                  <WinRateBarShape {...props} />
                )}
                label={({ x, y, width, value }) => (
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) - 4}
                    fontSize="16"
                    fontWeight="300"
                    textAnchor="middle"
                  >
                    {value}
                  </text>
                )}
              >
                {winRateData.map((item) => (
                  <Cell key={item.label} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <Text variant="label" color="secondary" className="text-center">
            Model Wins
          </Text>
        </div>
      </div>
    </div>
  );
}
