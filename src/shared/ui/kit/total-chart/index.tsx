import * as React from "react";

import { cn, resolveColor } from "@/shared/lib/css";
import { Card } from "../card";
import { Progress, ProgressRow } from "../progress";
import { Text } from "../text";

interface TotalChartSegment {
  label: string;
  value: number;
  /** Tailwind color token (e.g. "blue-4") or raw CSS color ("#46a5d8", "var(--color-blue-4)") */
  color: string;
}

interface TotalChartProps extends React.ComponentProps<"div"> {
  title?: string;
  totalMax: number;
  unit?: string;
  centerLabel?: string;
  segments: TotalChartSegment[];
}

const CIRCLE_DIM = 120;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_DIM - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function TotalChart({
  title,
  totalMax,
  unit = "",
  centerLabel = "Used",
  segments,
  className,
  ...props
}: TotalChartProps) {
  const sortedSegments = [...segments].sort((a, b) => b.value - a.value);
  const totalUsed = sortedSegments.reduce((sum, s) => sum + s.value, 0);
  const percentage =
    totalMax > 0 ? Math.min(100, (totalUsed / totalMax) * 100) : 0;

  const arcs = React.useMemo(() => {
    let offset = 0;
    return sortedSegments
      .filter((s) => s.value > 0)
      .map((segment) => {
        const ratio = totalMax > 0 ? segment.value / totalMax : 0;
        const arcLength = CIRCUMFERENCE * Math.min(1, ratio);
        const result = { ...segment, arcLength, offset };
        offset += arcLength;
        return result;
      });
  }, [sortedSegments, totalMax]);

  return (
    <Card
      shape="rounded"
      spacing="none"
      className={cn("p-8", className)}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {title && <Text variant="title">{title}</Text>}

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline">
              <Text as="span" variant="h2">
                {totalUsed.toFixed(2)}
              </Text>
              <Text as="span" variant="title" color="secondary">
                {unit}
              </Text>
            </div>

            <Text variant="label" color="secondary">
              of {totalMax}
              {unit}
            </Text>
          </div>
        </div>

        <div
          className="relative size-[120px] shrink-0"
          role="img"
          aria-label={`${percentage.toFixed(1)}% ${centerLabel}`}
        >
          <svg
            className="size-full -rotate-90"
            viewBox={`0 0 ${CIRCLE_DIM} ${CIRCLE_DIM}`}
            aria-hidden
          >
            <circle
              cx={CIRCLE_DIM / 2}
              cy={CIRCLE_DIM / 2}
              r={RADIUS}
              fill="none"
              className="stroke-gray-2"
              strokeWidth={STROKE_WIDTH}
            />

            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={CIRCLE_DIM / 2}
                cy={CIRCLE_DIM / 2}
                r={RADIUS}
                fill="none"
                stroke={resolveColor(arc.color)}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${arc.arcLength} ${CIRCUMFERENCE - arc.arcLength}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Text variant="body">{percentage.toFixed(1)}%</Text>
            <Text variant="label" color="secondary">
              {centerLabel}
            </Text>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedSegments.map((segment, i) => (
          <ProgressRow
            key={i}
            label={segment.label}
            value={segment.value}
            sign={` ${unit}`}
          >
            <Progress
              value={totalMax > 0 ? (segment.value / totalMax) * 100 : 0}
              style={
                {
                  "--_tc-bar": resolveColor(segment.color),
                } as React.CSSProperties
              }
              className="h-2 *:data-[slot=progress-indicator]:bg-(--_tc-bar)"
            />
          </ProgressRow>
        ))}
      </div>
    </Card>
  );
}

export { TotalChart };
export type { TotalChartProps, TotalChartSegment };
